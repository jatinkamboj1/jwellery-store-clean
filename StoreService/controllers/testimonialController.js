const prisma = require("../prismaClient");
const { uploadToS3 } = require("../utils/s3Helper");

// Utility function to upload base64 images to S3
const processImages = async (images) => {
  const imageUrls = [];
  for (const image of images) {
    const { base64, type, order } = image;
    if (base64?.includes("data:image")) {
      const url = await uploadToS3(base64, "products");
      imageUrls.push({
        url: url,
        type: type || "general",
        order: order || null,
      });
    } else {
      const { base64, order, url } = image;
      imageUrls.push({
        url: base64 || url,
        type: type || "general",
        order: order || null,
      });
    }
  }
  return imageUrls;
};

const deleteAllImages = async (id) => {
  try {
    const productImages = await prisma.Image.deleteMany({
      where: {
        testimonialId: id,
      },
    });
    //console.log(productImages);
  } catch (error) {
    throw error;
  }
};

exports.getAllTestimonials = async (req, res) => {
  try {
    const { offset, limit, name } = req.query;
    const parsedOffset = parseInt(offset) || 0;
    const parsedLimit = parseInt(limit) || 0;
    const userFilters = name
      ? { name: { contains: name, mode: "insensitive" } }
      : undefined;

    const testimonials = await prisma.Testimonial.findMany({
      where: {
        ...userFilters,
      },
      skip: parsedOffset * parsedLimit,
      take: parsedLimit,
      orderBy: {
        rating: "desc",
      },
    });
    const total = await prisma.Testimonial.count({
      where: {
        ...userFilters,
      },
    });
    return res.status(200).json({
      testimonials,
      pageDetails: {
        total,
        offset,
        limit,
        currentPage: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getTestimonialById = async (req, res) => {
  try {
    const { id } = req.params;
    const testimonial = await prisma.Testimonial.findUnique({
      where: { id },
      include: { images: true },
    });
    return res.status(200).json(testimonial);
  } catch (error) {
    return res.status(500).json({ message: `Internal Server Error.` });
  }
};

exports.createTestimonial = async (req, res) => {
  try {
    const { name, review, rating, link, images } = req.body;
    let imageUrls = [];

    // Process images (if any)
    if (images && images.length > 0) {
      const imageArray = Array.isArray(images) ? images : JSON.parse(images);
      imageUrls = await processImages(imageArray); // Ensure processImages returns valid data
    }

    const testimonial = await prisma.Testimonial.create({
      data: {
        name,
        link,
        review,
        rating: parseInt(rating),
        images: imageUrls.length > 0 ? { create: imageUrls } : undefined,
      },
    });
    return res
      .status(201)
      .json({ message: "Successfully added testimonial", testimonial });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const existingTestimonial = await prisma.Testimonial.findUnique({
      where: { id },
    });
    const { review, rating, name, link, images } = req.body;

    const imageUrls = images ? await processImages(images) : [];
    
    const deleteImages = deleteAllImages(id);
    
    const updatedTestimonial = await prisma.Testimonial.update({
      where: {
        id,
      },
      data: {
        review: review || existingTestimonial.review,
        rating: parseInt(rating) || existingTestimonial.rating,
        name: name || existingTestimonial.name,
        link: link || existingTestimonial.link,
        images: imageUrls.length ? { create: imageUrls } : undefined,
      },
    });
    return res.status(200).json({
      message: "Successfully updated testimonial",
      updatedTestimonial,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.Testimonial.delete({ where: { id } });
    return res
      .status(200)
      .json({ message: "Successfully deleted testimonial" });
  } catch (error) {
    return res.status(500).json({ message: `Internal Server Error.` });
  }
};
