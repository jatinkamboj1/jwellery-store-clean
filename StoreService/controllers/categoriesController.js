const { uploadToAzure } = require("../utils/s3Helper");
const prisma = require("../prismaClient");

// Helper to handle filtering
const buildFilterQuery = (filters) => {
  const query = {};
  for (const key in filters) {
    if (filters[key]) {
      query[key] = { contains: filters[key], mode: "insensitive" };
    }
  }
  return query;
};

// Helper to validate UUID
const isValidUUID = (id) =>
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
    id
  );

// Get all categories with filtering
const getCategories = async (req, res) => {
  const { offset = 0, limit = 10, images, ...filters } = req.query;

  try {
    const parsedOffset = Math.max(parseInt(offset, 10) || 0, 0);
    const parsedLimit = Math.min(parseInt(limit, 10) || 10, 100);

    const where = {
      ...buildFilterQuery(filters),
      ...(images === "true" && { images: { some: {} } }), // Add filter for images being present
    };

    const categories = await prisma.category.findMany({
      where,
      skip: parsedOffset,
      take: parsedLimit,
      include: {
        products: true,
        images: true,
        subCategories: { include: { images: true, products: true } },
        parent: {
          select: {
            categoryName: true,
            order:true,
          },
        },
      },
    });

    const total = await prisma.category.count({ where });
//console.log(categories);

    res.status(200).json({
      categories,
      pageDetails: {
        total,
        offset: parsedOffset,
        limit: parsedLimit,
        currentPage: Math.floor(parsedOffset / parsedLimit) + 1,
        totalPages: Math.ceil(total / parsedLimit),
      },
    });
  } catch (error) {
    console.error(`Error in getCategories: ${error.message}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getCategoriesName = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        categoryName: true,
        slug: true,
      },
    });

    const total = await prisma.category.count();

    res.status(200).json({
      categories,
      total,
    });
  } catch (error) {
    console.error(`Error in getCategories: ${error.message}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get category by ID
const getCategoryById = async (req, res) => {
  const { id } = req.params;
  if (!isValidUUID(id)) {
    return res.status(400).json({ error: "Invalid category ID format" });
  }

  try {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        products: true,
        images: true,
        subCategories: { include: { images: true, products: true } },
        Tag: true,
      },
    });
    if (!category) return res.status(404).json({ error: "Category not found" });
    res.status(200).json(category);
  } catch (error) {
    console.error(`Error in getCategoryById: ${error.message}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// // Create a new category

const createCategory = async (req, res) => {
  let { subCategories, tags, images, visible_on, order, ...categoryData } =
    req.body;
  //console.log("body: ", req.body);

  try {
    // Convert order from string to integer if it exists
    order = order ? parseInt(order) : null;

    const imageUploadPromises = (images || []).map(async (image) => {
      const { base64, order: imgOrder, type } = image;
      const url = await uploadToAzure(base64, "categories");
      return {
        url,
        order: imgOrder ? parseInt(imgOrder) : null, // also ensure image order is int
        type: type || null,
      };
    });

    const imageUrls = await Promise.all(imageUploadPromises);

    const category = await prisma.category.create({
      data: {
        ...categoryData,
        visible_on,
        order,
        Tag: {
          connect: tags.map((tagId) => ({ id: tagId })),
        },
        images: {
          create: imageUrls,
        },
        subCategories: {
          connect: subCategories.map((subCatId) => ({ id: subCatId })),
        },
      },
      include: {
        images: true,
        subCategories: true,
      },
    });

    res.status(201).json(category);
  } catch (error) {
    console.error(`Error in createCategory: ${error.message}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update a category
const updateCategory = async (req, res) => {
  const { id } = req.params;
  const value = req.body;
  if (!isValidUUID(id)) {
    return res.status(400).json({ error: "Invalid category ID format" });
  }

  const { subCategories, tags, images, visible_on, order, ...categoryData } =
    value;

  try {
    const existingCategory = await prisma.category.findUnique({
      where: { id },
      include: { images: true, subCategories: true },
    });
    const deleteAllImages = deleteImages(id);

    const imagesToProcess =
      Array.isArray(images) && images.length
        ? images
        : Array.isArray(existingCategory.images)
        ? existingCategory.images
        : [];

    const imageUploadPromises = imagesToProcess.map(async (image) => {
      if (image.base64) {
        // If the image is new (contains base64), upload it to S3
        const { base64, order, type } = image;
        const url = await uploadToAzure(base64, "categories");
        return { url, order: order || null, type: type || null };
      } else {
        // If no base64 exists, retain the existing image data
        return {
          url: image.url,
          order: image.order || null,
          type: image.type || null,
        };
      }
    });

    const uploadedImages = await Promise.all(imageUploadPromises);
    const tag = tags ? tags : [];

    // Process the images (either newly uploaded or retained)

    const imageUrls = await Promise.all(imageUploadPromises);

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...categoryData,
        visible_on,
        order: parseInt(order),
        Tag: { connect: tag.map((tag) => ({ id: tag.value })) },
        images: { create: imageUrls },
        subCategories: {
          connect:
            subCategories.map((id) => ({ id })) ||
            existingCategory.subCategories.id, // Convert array of IDs into { id: "someId" } format
        },
      },
      include: { images: true, subCategories: true },
    });

    res.status(200).json(category);
  } catch (error) {
    console.error(`Error in updateCategory: ${error.message}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteImages = async (id) => {
  try {
    const deleteAllImages = await prisma.image.deleteMany({
      where: {
        Category: {
          some: { id: id }, // ✅ Filters images linked to the given category
        },
      },
    });
    //console.log(deleteAllImages);
  } catch (error) {
    console.error("Error deleting images:", error);
  }
};

// Delete a category
const deleteCategory = async (req, res) => {
  const { id } = req.params;
  if (!isValidUUID(id)) {
    return res.status(400).json({ error: "Invalid category ID format" });
  }

  try {
    // await prisma.category.update(
    //   {
    //     where: { id },
    //   },
    //   {data:{ isDisabled: true }}
    // );

    const category = await prisma.category.findUnique({
      where: { id },
    });

    //console.log(category);
    if (category.isDisabled === true) {
      await prisma.category.delete({ where: { id } });
      return res.status(200).json({ message: "Category deleted successfully" });
    }

    await prisma.category.update({
      where: { id }, // Ensure id is a valid unique identifier
      data: { isDisabled: true },
    });

    return res.status(200).json({ message: "Category disabled successfully" });
  } catch (error) {
    console.error(`Error in deleteCategory: ${error.message}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getSubCategoriesName = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: {
        subCategories: {
          none: {},
        },
      },
      select: {
        id: true,
        categoryName: true,
        slug: true,
        subCategories: true,
      },
    });
    const total = await prisma.category.count();

    res.status(200).json({
      categories,
      total,
    });
  } catch (error) {
    console.error(`Error in getsubCategories: ${error.message}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//home page api
const getNavCategory = async (req, res) => {
  try {
    const { limit = "50" } = req.query; // Default limit is 50

    const categories = await prisma.category.findMany({
      where: { isDisabled: false, parentId: null },
      select: {
        categoryName: true,
        slug: true,
        images: { select: { url: true } },
        subCategories: {
          select: {
            categoryName: true,
            slug: true,
            Tag: { select: { name: true } },
            images: { select: { url: true } },
          },
        },
      },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      take: parseInt(limit),
    });
    //console.log("categories: ", categories);

    // Group subcategories by tags
    const formattedCategories = categories.map((category) => {
      const groupedSubCategories = category.subCategories.reduce((acc, sub) => {
        sub.Tag.forEach((tag) => {
          acc[tag.name] = acc[tag.name] || [];
          acc[tag.name].push({
            categoryName: sub.categoryName,
            slug: sub.slug,
            images: sub.images,
          });
        });
        return acc;
      }, {});

      return {
        categoryName: category.categoryName,
        slug: category.slug,
        images: category.images,
        subCategories: groupedSubCategories, // Maintain original column names
      };
    });

    return res.status(200).json({ categories: formattedCategories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getCategoryBanner = async (req, res) => {
  try {
    const { limit = 10, visible_on, all = "false" } = req.query; // Default limit is 10 if not provided

    const filter = { isDisabled: false };
    if (visible_on) {
      filter["visible_on"] = visible_on;
    }
    const pagination =
      all === "true"
        ? {}
        : {
            take: parseInt(limit) || 10,
          };

    const categories = await prisma.category.findMany({
      where: {
        ...filter,
      },
      select: {
        categoryName: true, // Category name
        slug: true, // Category link
        images: { select: { url: true } }, // Fetch image URLs
      },
      orderBy: { createdAt: "desc" },
      ...pagination,
    });

    return res.status(200).json({ categories });
  } catch (error) {
    console.error("Error fetching homepage categories:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get category by ID
const getCategoryBySlug = async (req, res) => {
  const { slug } = req.params;

  try {
    // Fetch the category by slug
    const category = await prisma.category.findUnique({
      where: { slug },
      select: {
        categoryName: true,
        metaTitle: true,
        description: true,
        metaDescription: true,
        slug: true,
        subCategories: {
          select: {
            slug: true,
            categoryName: true,
            Tag: { select: { name: true } },
          },
        },
      },
    });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    const groupedSubCategories = category.subCategories.reduce((acc, sub) => {
      sub.Tag.forEach((tag) => {
        acc[tag.name] = acc[tag.name] || [];
        acc[tag.name].push({
          categoryName: sub.categoryName,
          slug: sub.slug,
          images: sub.images,
        });
      });
      return acc;
    }, {});

    let allSlugs;
    if (category) {
      allSlugs = [
        category.slug,
        ...category.subCategories.map((sub) => sub.slug),
      ];
    }
    const productPrice = await prisma.product.aggregate({
      where: { Category: { some: { slug: { in: allSlugs } } } },
      _max: { price: true },
      _min: { price: true },
    });
    const filterPrice = {
      max: parseInt(productPrice._max.price) + 1 ?? 10000,
      min: parseInt(productPrice._min.price) - 1 ?? 0,
    };
    const data = {
      categoryName: category.categoryName,
      filterPrice,
      slug: category.slug,
      images: category.images,
      metaTitle: category.metaTitle,
      description: category.description,
      metaDescription: category.metaDescription,
      subCategories: groupedSubCategories,
    };

    // Fetch all tags where isCategory is true
    const tags = await prisma.tag.findMany({
      where: { isCategory: true },
      select: {
        name: true,
        isMetal: true,
        isPolish: true,
        isStone: true,
        isOccasion: true,
        isCollection: true,
      },
    });

    // Efficient grouping of tags based on category types
    const groupedTags = {
      isMetal: tags.filter((tag) => tag.isMetal),
      isPolish: tags.filter((tag) => tag.isPolish),
      isStone: tags.filter((tag) => tag.isStone),
      isOccasion: tags.filter((tag) => tag.isOccasion),
      isCollection: tags.filter((tag) => tag.isCollection),
    };

    res.status(200).json({ category: data, groupedTags });
  } catch (error) {
    console.error(`Error in getCategoryBySlug: ${error.message}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getCategoriesName,
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getSubCategoriesName,
  getNavCategory,
  getCategoryBanner,
  getCategoryBySlug,
};
