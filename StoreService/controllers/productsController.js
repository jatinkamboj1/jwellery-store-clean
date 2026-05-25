const { uploadToAzure } = require("../utils/s3Helper");
const prisma = require("../prismaClient");
const { Connect } = require("aws-sdk");

// Get product by ID
const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    // const product = await prisma.product.findUnique({
    //   where: { id },
    //   include: {
    //     images: true,
    //     category: true,
    //     subCategory: true,
    //     ProductVariant: {
    //       where: {
    //         AND: [
    //           variantName
    //             ? { variantAttributes: { some: { name: variantName } } }
    //             : {},
    //           variantValue
    //             ? { variantAttributes: { some: { value: variantValue } } }
    //             : {},
    //         ],
    //       },
    //       include: {
    //         variantAttributes: true,
    //       },
    //     },
    //   },
    // });
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        Category: {
          include: {
            subCategories: true,
          },
        },
        ProductVariant: { include: { variantAttributes: true, images: true } },
        Tag: true,
      },
    });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Get product by Slug
const getProductBySlug = async (req, res) => {
  const { slug } = req.params;
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        metaTitle: true,
        metaDescription: true,
        type: true,
        sku: true,
        price: true,
        discountedPrice: true,
        quantity: true,
        description: true,
        shortDescription: true,
        brandName: true,
        metalType: true,
        polishType: true,
        stoneType: true,
        occasionType: true,
        collectionType: true,
        images: {
          select: {
            url: true,
            description: true,
            // type: true,
            order: true,
          },
          orderBy: {
            order: "asc",
          },
        },
        // Category: {
        //   include: {
        //     subCategories: true,
        //   },
        // },
        ProductVariant: {
          select: {
            id: true,
            description: true,
            shortDescription: true,
            variantName: true,
            price: true,
            discountedPrice: true,
            quantity: true,
            variantAttributes: {
              select: {
                name: true,
                value: true,
              },
            },
          },
        },
        Tag: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!product) return res.status(404).json({ error: "Product not found" });

    const averageRating = await prisma.review.aggregate({
      where: {
        productId: product.id,
      },
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      },
    });

    const reviews = await prisma.review.findMany({
      where: {
        productId: product.id,
      },
      select: {
        id: true,
        userId: true,
        rating: true,
        review: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const groupedVariants = new Map();

    product.ProductVariant.forEach((variant) => {
      variant.variantAttributes.forEach((attribute) => {
        if (!groupedVariants.has(attribute.name)) {
          groupedVariants.set(attribute.name, []);
        }
        groupedVariants
          .get(attribute.name)
          .push({ ...variant, value: attribute.value });
      });
    });

    const groupedVariantsObj = Object.fromEntries(groupedVariants);

    res.status(200).json({
      data: { ...product, groupedVariantsObj, reviews, averageRating },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Utility function to upload base64 images to S3
const processImages = async (images) => {
  const imageUrls = [];
  for (const image of images) {
    const { base64 = "", type, order } = image;
    if (base64.includes("data:image")) {
      const url = await uploadToAzure(base64, "products");
      imageUrls.push({
        url,
        type: type || "general",
        order: order || null,
      });
    } else {
      const { base64, url, order } = image;
      imageUrls.push({
        url: base64 || url,
        type: type || "general",
        order: order || null,
      });
    }
  }
  return imageUrls;
};

// Get all products
const getProducts = async (req, res) => {
  const {
    offset = 0,
    limit = 10,
    vendor,
    name,
    type,
    attributeSet,
    sku,
    categoryId,
    subCategoryId,
    minPrice,
    maxPrice,
    tags,
    visibility,
    statusDescription,
  } = req.query;

  try {
    const parsedOffset = parseInt(offset, 10) || 0;
    const parsedLimit = parseInt(limit, 10) || 10;
    const filters = {};

    if (vendor) filters.vendor = { contains: vendor, mode: "insensitive" };
    if (name) filters.name = { contains: name, mode: "insensitive" };
    if (type) filters.type = { contains: type, mode: "insensitive" };
    if (sku) filters.sku = { contains: sku, mode: "insensitive" };
    if (categoryId) filters.categoryId = categoryId;
    if (subCategoryId) filters.subCategoryId = subCategoryId;
    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.gte = parseFloat(minPrice);
      if (maxPrice) filters.price.lte = parseFloat(maxPrice);
    }
    if (tags) filters.tags = { hasSome: tags.split(",") };
    if (visibility !== undefined) filters.visibility = visibility === "true";

    const products = await prisma.product.findMany({
      where: filters,
      skip: parsedLimit * parsedOffset,
      take: parsedLimit,
      include: {
        images: true,
        Category: {
          include: {
            subCategories: true,
          },
        },
        ProductVariant: {
          include: { variantAttributes: true },
        },
        Tag: true,
      },
    });
    // const products = await prisma.product.findMany({
    //   where: filters,
    //   skip: parsedOffset,
    //   take: parsedLimit,
    //   include: {
    //     images: true,
    //     Category: true,
    //     subCategory: true,
    //     ProductVariant: {
    //       include: { variantAttributes: true },
    //     },
    //   },
    // });

    const total = await prisma.product.count({ where: filters });

    res.status(200).json({
      products,
      pageDetails: {
        total,
        offset: parsedOffset,
        limit: parsedLimit,
        currentPage: Math.floor(parsedOffset / parsedLimit) + 1,
        totalPages: Math.ceil(total / parsedLimit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getProductsCard = async (req, res) => {
  const {
    currentPage = 0,
    limit = 10,
    name,
    vendor,
    type,
    slug,
    categoryId,
    subCategoryId,
    minPrice,
    maxPrice,
    tags,
    visibility,
    visible_on,
    sortBy = "name", // Default sort by 'name'
    sortOrder = "asc", // Default order is 'asc'
  } = req.query;

  try {
    const parsedCurrentPage = parseInt(currentPage, 10) || 0;
    const parsedLimit = parseInt(limit, 10) || 10;
    const filters = {};

    if (vendor) filters.vendor = { contains: vendor, mode: "insensitive" };
    if (name) filters.name = { contains: name, mode: "insensitive" };
    if (type) filters.type = { contains: type, mode: "insensitive" };
    if (slug) filters.slug = { contains: slug, mode: "insensitive" };
    if (visible_on)
      filters.visible_on = { contains: visible_on, mode: "insensitive" };
    if (subCategoryId) filters.subCategoryId = subCategoryId;
    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.gte = parseFloat(minPrice);
      if (maxPrice) filters.price.lte = parseFloat(maxPrice);
    }
    if (tags) filters.tags = { hasSome: tags.split(",") };
    if (visibility !== undefined) filters.visibility = visibility === "true";

    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { slug: categoryId },
        select: {
          slug: true,
          subCategories: {
            select: {
              slug: true,
            },
          },
        },
      });

      let allSlugs;
      if (category) {
        allSlugs = [
          category.slug,
          ...category.subCategories.map((sub) => sub.slug),
        ];
      }

      filters.Category = { some: { slug: { in: allSlugs } } };
    }

    // Determine the sorting field and order
    const orderBy = {};
    if (sortBy === "price") {
      orderBy.price = sortOrder === "asc" ? "asc" : "desc";
    } else {
      orderBy.name = sortOrder === "asc" ? "asc" : "desc";
    }

    // Fetch products with related images, ProductVariants, and tags
    const products = await prisma.product.findMany({
      where: { AND: Array.isArray(filters) ? filters : [filters] },
      skip: parsedCurrentPage * parsedLimit,
      take: parsedLimit,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        discountedPrice: true,
        quantity: true,
        tags: true,
        brandName: true,
        images: {
          select: {
            url: true,
          },
          orderBy: {
            order: "asc",
          },
        },
        ProductVariant: {
          select: {
            id: true,
            variantName: true,
            discountedPrice: true,
            price: true,
            quantity: true,
            variantAttributes: {
              select: {
                name: true,
                value: true,
              },
            },
          },
        },
      },
      orderBy: orderBy,
    });

    const productPrice = await prisma.product.aggregate({
      where: { AND: Array.isArray(filters) ? filters : [filters] },
      _max: { price: true },
      _min: { price: true },
    });

    const filterPrice = {
      max: parseInt(productPrice._max.price) + 1 ?? 10000,
      min: parseInt(productPrice._min.price) - 1 ?? 0,
    };
    const total = await prisma.product.count({ where: filters });

    // Group ProductVariants by variantAttributes.name
    products.forEach((product) => {
      product.ProductVariant = groupVariantsByAttribute(product.ProductVariant);
    });

    res.status(200).json({
      products,
      pageDetails: {
        total,
        filterPrice,
        currentPage: parsedCurrentPage,
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getRelativeProducts = async (req, res) => {
  const {
    offset = 0,
    limit = 10,
    vendor,
    categoryId,
    minPrice,
    maxPrice,
    tags,
    visibility,
    visible_on,
  } = req.query;
  const { slug } = req.params;

  try {
    const parsedOffset = parseInt(offset, 10) || 0;
    const parsedLimit = parseInt(limit, 10) || 10;
    const filters = {};

    // if (vendor) filters.vendor = { contains: vendor, mode: "insensitive" };
    // if (name) filters.name = { contains: name, mode: "insensitive" };
    // if (type) filters.type = { contains: type, mode: "insensitive" };
    // if (slug) filters.slug = { contains: slug, mode: "insensitive" };
    if (visible_on)
      filters.visible_on = { contains: visible_on, mode: "insensitive" };
    if (categoryId) filters.categoryId = { some: { id: categoryId } };
    // if (subCategoryId) filters.subCategoryId = subCategoryId;
    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.gte = parseFloat(minPrice);
      if (maxPrice) filters.price.lte = parseFloat(maxPrice);
    }
    if (tags) filters.tags = { hasSome: tags.split(",") };

    const product = await prisma.product.findUnique({
      where: { slug },
      select: {
        brandName: true,
        metalType: true,
        polishType: true,
        stoneType: true,
        occasionType: true,
        collectionType: true,
        Category: {
          include: {
            subCategories: true,
          },
        },
      },
    });

    if (product) {
      const categoryIds = [];
      product.Category.map((category) => {
        categoryIds.push(category.id);
        category.subCategories.map((sub) => {
          categoryIds.push(sub.id);
        });
      });
      filters.visibility = true;
      filters.Category = { some: { id: { in: categoryIds } } };
    }

    // Fetch products with related images, ProductVariants, and tags
    const products = await prisma.product.findMany({
      where: filters,
      skip: parsedLimit * parsedOffset,
      take: parsedLimit,
      select: {
        name: true,
        slug: true,
        price: true,
        quantity: true,
        tags: true,
        brandName: true,
        images: {
          select: {
            url: true,
            type: true,
            description: true,
          },
        },
        ProductVariant: {
          select: {
            id: true,
            variantName: true,
            price: true,
            quantity: true,
            variantAttributes: {
              select: {
                name: true,
                value: true,
              },
            },
          },
        },
      },
    });

    // Group ProductVariants by variantAttributes.name
    products.forEach((product) => {
      product.ProductVariant = groupVariantsByAttribute(product.ProductVariant);
    });

    res.status(200).json({ products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Optimized grouping function
const groupVariantsByAttribute = (variants) => {
  const groupedVariants = {};

  variants.forEach((variant) => {
    variant.variantAttributes.forEach((attribute) => {
      // If the attribute name doesn't exist in the grouped map, create it
      if (!groupedVariants[attribute.name]) {
        groupedVariants[attribute.name] = [];
      }

      // Push the variant with the attribute value
      groupedVariants[attribute.name].push({
        variantId: variant.id,
        variantName: variant.variantName,
        price: variant.price,
        quantity: variant.quantity,
        value: attribute.value,
      });
    });
  });

  return groupedVariants;
};

// Get product's name by the categories
const getProductNames = async (req, res) => {
  const categories = req.query.categories.val;

  try {
    const products = await prisma.product.findMany({
      where: {
        Category: {
          some: {
            id: {
              in: [categories],
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        quantity: true,
        images: true,
        price: true,
        ProductVariant: true,
      },
    });

    res.status(200).json({
      products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const imagesUrl = async (images) => {
  let imageUrls = [];

  // Process images (if any)
  if (images && images.length > 0) {
    const imageArray = Array.isArray(images) ? images : JSON.parse(images);
    imageUrls = await processImages(imageArray); // Ensure processImages returns valid data
  }
  return imageUrls;
};

// Create a new product
const createProduct = async (req, res) => {
  const {
    vendor,
    name,
    metaTitle,
    metaDescription,
    slug,
    type,
    sku,
    price,
    discountedPrice,
    quantity,
    description,
    shortDescription,
    categoryId,
    tags,
    visibility,
    visible_on,
    productVariants,
    metalType,
    polishType,
    stoneType,
    occasionType,
    collectionType,
    images,
  } = req.body;

  try {
    // Check if categories exist
    const categoriesExist = await prisma.category.findMany({
      where: { id: { in: categoryId } },
    });

    if (categoriesExist.length !== categoryId.length) {
      return res
        .status(400)
        .json({ error: "One or more categories not found" });
    }

    // Check if tags exist
    const tagsExist = await prisma.tag.findMany({
      where: { name: { in: tags } },
    });

    if (tagsExist.length !== tags.length) {
      return res.status(400).json({ error: "One or more tags not found" });
    }

    const tagIds = tagsExist.map((tag) => tag.id);

    // Prepare product variant data
    const variantData = await Promise.all(
      productVariants.map(async (variant) => {
        const varientImageUrls = await imagesUrl(variant.images); // Assuming each variant has its own images
        return {
          description: variant.description,
          shortDescription: variant.shortDescription,
          variantName: variant.variantName,
          sku: variant.sku,
          price: parseFloat(variant.price),
          discountedPrice:
            variant.discountedPrice && parseFloat(variant.discountedPrice) > 0
              ? parseFloat(variant.discountedPrice)
              : null,
          quantity: parseInt(variant.quantity, 10),
          salableQuantity: parseInt(variant.quantity, 10),
          metalType: variant.metalType,
          polishType: variant.polishType,
          stoneType: variant.stoneType,
          occasionType: variant.occasionType,
          collectionType: variant.collectionType,
          images:
            varientImageUrls.length > 0
              ? { create: varientImageUrls }
              : undefined,
          variantAttributes: {
            create: variant.attributes.map((attr) => ({
              name: attr.name,
              value: attr.value,
            })),
          },
        };
      })
    );

    const imageUrls = await imagesUrl(images); // Process images
    // Create the product
    const product = await prisma.product.create({
      data: {
        vendor,
        name,
        metaTitle,
        metaDescription,
        slug,
        type,
        sku,
        price: parseFloat(price),
        discountedPrice:
          discountedPrice && parseFloat(discountedPrice) > 0
            ? parseFloat(discountedPrice)
            : null,
        quantity: parseInt(quantity, 10),
        salableQuantity: parseInt(quantity, 10),
        description,
        shortDescription,
        visibility,
        visible_on,
        Category: { connect: categoryId.map((id) => ({ id })) },
        Tag: { connect: tagIds.map((id) => ({ id })) },
        metalType,
        polishType,
        stoneType,
        occasionType,
        collectionType,
        images: imageUrls.length > 0 ? { create: imageUrls } : undefined,
        ProductVariant:
          variantData.length > 0 ? { create: variantData } : undefined,
      },
      include: { Category: true, images: true, ProductVariant: true },
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("Error while creating product:", error);
    res.status(400).json({ error: error.message });
  }
};

// Update a product
const updateProduct = async (req, res) => {
  const { id } = req.params;
  const {
    vendor,
    name,
    metaTitle,
    metaDescription,
    slug,
    type,
    sku,
    price,
    discountedPrice,
    quantity,
    description,
    shortDescription,
    categoryId,
    subCategoryId,
    visible_on,
    tags,
    metalType,
    polishType,
    stoneType,
    occasionType,
    collectionType,
    extras,
    productVariants,
    images, // Array of image metadata with type and order keys
  } = req.body;

  try {
    // Process new base64 images
    const imageUrls = images ? await processImages(images) : [];

    const variants = req.body.productVariants || null;

    // Prepare product variants data with upsert logic
    const variantData = await Promise.all(
      variants.map(async (variant) => {
        const varientImageUrls = await imagesUrl(variant.images);

        const sharedData = {
          description: variant.description,
          shortDescription: variant.shortDescription,
          variantName: variant.variantName,
          sku: variant.sku,
          price: parseFloat(variant.price),
          discountedPrice:
            variant.discountedPrice && parseFloat(variant.discountedPrice) > 0
              ? parseFloat(variant.discountedPrice)
              : null,
          quantity: parseInt(variant.quantity, 10),
          salableQuantity: parseInt(variant.quantity, 10),
          metalType: variant.metalType || undefined,
          polishType: variant.polishType || undefined,
          stoneType: variant.stoneType || undefined,
          occasionType: variant.occasionType || undefined,
          collectionType: variant.collectionType || undefined,
          images:
            varientImageUrls.length > 0
              ? { create: varientImageUrls }
              : undefined,
          variantAttributes: {
            create: variant.attributes.map((attr) => ({
              name: attr.name,
              value: attr.value,
            })),
          },
        };

        if (variant.id) {
          return {
            where: { id: variant.id },
            update: {
              ...sharedData,
              images:
                varientImageUrls.length > 0
                  ? { deleteMany: {}, create: varientImageUrls }
                  : undefined,
              variantAttributes: {
                deleteMany: {},
                create: sharedData.variantAttributes.create,
              },
            },
            create: sharedData,
          };
        } else {
          return {
            create: sharedData,
          };
        }
      })
    );

    //console.log("variantData:", JSON.stringify(variantData));
    const deleteImages = deleteAllImages(id);
    const deletedVariants = deleteAllProductVarients(id);

    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { Tag: true },
    });
    const existingTagIds = existingProduct.Tag.map((tag) => tag.id);
    // Find tags to disconnect
    const tagsToDisconnect = existingTagIds.filter(
      (tagId) => !tags.includes(tagId)
    );

    // Update product in the database
    const product = await prisma.product.update({
      where: { id },
      data: {
        vendor,
        name,
        metaTitle,
        metaDescription,
        slug,
        type,
        sku,
        price: price ? parseFloat(price) : undefined,
        discountedPrice:
          discountedPrice && parseFloat(discountedPrice) > 0
            ? parseFloat(discountedPrice)
            : null,
        quantity: quantity ? parseInt(quantity, 10) : undefined,
        salableQuantity: quantity ? parseInt(quantity, 10) : undefined,
        description,
        shortDescription,
        categoryId,
        subCategoryId,
        visible_on,
        metalType,
        polishType,
        stoneType,
        occasionType,
        collectionType,
        // Tag: { connect: tags.map((tag) => ({ id: tag })) },
        Tag: {
          disconnect: tagsToDisconnect.map((tagId) => ({ id: tagId })), // Remove unselected tags
          connect: tags.map((tag) => ({ id: tag.id || tag })), // Add new selected tags
        },
        // Tag: {
        //   connect: tags
        //     ?.filter((tag) => tag?.id) // Remove any invalid tag objects
        //     .map((tag) => ({ id: tag.id })), // Map only valid IDs
        // },

        extras: extras ? JSON.parse(extras) : undefined,
        images: imageUrls.length ? { create: imageUrls } : undefined,
        ProductVariant: {
          deleteMany: {}, // Deletes all existing variants
          create: variantData.map((v) => v.create),
        },
      },
      include: { images: true, Category: true, ProductVariant: true },
    });

    res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

const deleteAllProductVarients = async (id) => {
  try {
    const productVarients = await prisma.productVariant.deleteMany({
      where: {
        productId: id,
      },
    });
    //console.log(productVarients);
  } catch (error) {
    throw error;
  }
};

const deleteAllImages = async (id) => {
  try {
    const productImages = await prisma.Image.deleteMany({
      where: {
        productId: id,
      },
    });
    //console.log(productImages);
  } catch (error) {
    throw error;
  }
};

// Delete a product
const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.product.delete({
      where: { id },
    });

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);

    res.status(400).json({ error: error.message });
  }
};

// Get a product variant
const getProductVariantById = async (req, res) => {
  try {
    const productIds = req.query.productIds;

    const variant = await prisma.productVariant.findMany({
      where: {
        productId: {
          in: productIds, // productIds should be an array of product IDs
        },
      },
      include: {
        product: {
          select: {
            images: true, // Fetching images from the Product table
          },
        },
      },
    });

    res.status(200).json(variant);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

// Create a product variant
const createProductVariant = async (req, res) => {
  const { productId } = req.params;
  const {
    variantName,
    sku,
    price,
    quantity,
    salableQuantity,
    color,
    size,
    weight,
  } = req.body;

  try {
    const variant = await prisma.productVariant.create({
      data: {
        productId,
        variantName,
        sku,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        salableQuantity: parseInt(salableQuantity),
        color,
        size,
        weight: parseFloat(weight),
      },
    });

    res.status(201).json(variant);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update a product variant
const updateProductVariant = async (req, res) => {
  const { variantId } = req.params;
  const {
    variantName,
    sku,
    price,
    quantity,
    salableQuantity,
    color,
    size,
    weight,
  } = req.body;

  try {
    const variant = await prisma.productVariant.update({
      where: { id: variantId },
      data: {
        variantName,
        sku,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        salableQuantity: parseInt(salableQuantity),
        color,
        size,
        weight: parseFloat(weight),
      },
    });

    res.status(200).json(variant);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a product variant
const deleteProductVariant = async (req, res) => {
  const { variantId } = req.params;

  try {
    await prisma.productVariant.delete({
      where: { id: variantId },
    });

    res.status(200).json({ message: "Product variant deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Updated toggleWishlist function
const toggleWishlist = async (req, res) => {
  const { userId, productId } = req.body;

  if (!userId || !productId) {
    return res
      .status(400)
      .json({ error: "userId and productId are required." });
  }

  try {
    // Check if the product already exists in the user's wishlist
    const existingWishlist = await prisma.wishlist.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    });

    if (existingWishlist) {
      // If it exists, remove it from the wishlist
      await prisma.wishlist.delete({
        where: {
          userId_productId: { userId, productId },
        },
      });
      return res
        .status(200)
        .json({ message: "Product removed from the wishlist" });
    }

    // If it does not exist, add it to the wishlist
    const wishlist = await prisma.wishlist.create({
      data: {
        userId,
        productId,
      },
    });
    return res.status(201).json({
      message: "Product added to the wishlist",
      wishlist,
    });
  } catch (error) {
    console.error("Error in toggleWishlist:", error);
    res.status(500).json({ error: "An unexpected error occurred." });
  }
};

// Updated getWishlist function
const getWishlist = async (req, res) => {
  const { userId } = req.params;
  const { offset, limit } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "userId is required." });
  }

  try {
    const parsedOffset = parseInt(offset, 10) || 0;
    const parsedLimit = parseInt(limit, 10) || 10;

    if (parsedOffset < 0 || parsedLimit <= 0) {
      return res
        .status(400)
        .json({ error: "Offset must be >= 0 and limit must be > 0." });
    }

    const data = await prisma.wishlist.findMany({
      skip: parsedOffset,
      take: parsedLimit,
      where: { userId },
      include: {
        product: true, // Optionally include product details
      },
    });

    res.status(200).json({ data });
  } catch (error) {
    console.error("Error in getWishlist:", error);
    res.status(500).json({ error: "An unexpected error occurred." });
  }
};

const createVariantType = async (req, res) => {
  const data = req.body;
  const variant = await prisma.variantType.create({
    data,
  });
  return res.status(201).json({ message: "Variant type created", variant });
};
const getAllVariantTypes = async (req, res) => {
  const variants = await prisma.variantType.findMany();
  return res.status(200).json({ message: "Variant types retrieved", variants });
};

//home page api
const getFilteredProducts = async (req, res) => {
  try {
    let { visible_on } = req.query;

    const products = await prisma.Product.findMany({
      where: {
        visibility: true,
        visible_on: {
          contains: visible_on,
          mode: "insensitive",
        },
      },

      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.log("Error fetching filtered products:", error);
    return res.status(500).json({ message: "Internal Server Error." });
  }
};
const getFeaturedProducts = async (req, res) => {
  try {
    const { type } = req.query;
    const product = await prisma.Product.findMany({
      where: {
        Tag: {
          some: {
            name: {
              contains: type,
              mode: "insensitive",
            },
          },
        },
        visibility: true,
        visible_on: {
          contains: "HOMEPAGE",
          mode: "insensitive",
        },
      },
      include: { Tag: true, images: true },
      take: 10,
    });
    return res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.log("Error fetching featured  products:", error);
    return res.status(500).json({ message: "Internal Server Error." });
  }
};

const getProductsByCategoryId = async (req, res) => {
  try {
    const { id } = req.params;
    const filter = {};
    if (id) {
      filter.id = id;
    }
    // if (slug) {
    //   filter.slug = slug
    // }
    const category = await prisma.Category.findUnique({
      where: filter,
    });
    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }
    const products = await prisma.product.findMany({
      where: {
        Category: {
          some: { ...filter },
        },
        visibility: true,
        visible_on: {
          contains: "CROSSPAGE",
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        vendor: true,
        price: true,
        visibility: true,
        visible_on: true,
        ProductVariant: {
          select: {
            variantName: true,
            price: true,
            quantity: true,
            variantAttributes: {
              select: {
                name: true,
                value: true,
              },
            },
          },
        },
        images: {
          select: {
            id: true,
            url: true,
          },
        },
        Tag: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return res.status(200).json({ success: true, products, category });
  } catch (error) {
    console.error("error: ", error);
    return res.status(500).json({ message: "Internal Server Error." });
  }
};

module.exports = {
  getProducts,
  getFilteredProducts,
  getProductById,
  getProductNames,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductVariantById,
  createProductVariant,
  updateProductVariant,
  deleteProductVariant,
  toggleWishlist,
  getWishlist,
  createVariantType,
  getAllVariantTypes,
  getFeaturedProducts,
  getProductsByCategoryId,
  getProductsCard,
  getProductBySlug,
  getRelativeProducts,
};
