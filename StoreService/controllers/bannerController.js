const prisma = require("../prismaClient");
const { uploadToS3 } = require("../utils/s3Helper");

exports.addBanner = async (req, res) => {
  try {
    const { title, description, images, link, heading, order, type, content_type } = req.body;
    const url = await uploadToS3(images, "banners");
    delete req.body.images;

    const newBanner = await prisma.BannerImage.create({
      data: {
        url,
        link,
        title,
        heading,
        description,
        order: parseInt(order),
        type,
        content_type
      },
    });
    return res
      .status(201)
      .json({ message: "Succesfully created new Banner", newBanner });
  } catch (error) {
    console.log("error: ", error);

    return res.status(500).json({ message: `Internal Server Error.` });
  }
};

exports.getBanners = async (req, res) => {
  try {
    const banners = await prisma.BannerImage.findMany();
    return res.status(200).json(banners);
  } catch (error) {
    return res.status(500).json({ message: `Internal Server Error.` });
  }
};

exports.updateBanner = async (req, res) => {
  const { id } = req.params;
  try {
    const banner = await prisma.BannerImage.findUnique({ where: { id } });

    const { title, description, images, link, heading, order, type } = req.body;

    let url;
    if (images?.includes("data:image")) {
      url = await uploadToS3(images, "banners");
    } else {
      url = images;
    }
    const updateBanner = await prisma.BannerImage.update({
      where: { id },
      data: {
        url: url || banner.url,
        link: link,
        title: title,
        heading: heading,
        description: description,
        order: parseInt(order),
        type,
      },
    });
    return res
      .status(200)
      .json({ message: "Updated banner succesfully", updateBanner });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: `Internal Server Error.` });
  }
};

exports.deleteBanner = async (req, res) => {
  const { id } = req.params;
  try {
    const banner = await prisma.BannerImage.findUnique({ where: { id } });
    await prisma.BannerImage.delete({ where: { id } });
    return res.status(200).json({ message: "Successfully deleted Banner" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error." });
  }
};

exports.getFilteredBanners = async (req, res) => {
  try {
    const { type } = req.query;

    const banners = await prisma.BannerImage.findMany({
      where: {
        type: {
          contains: type,
          mode: "insensitive",
        },
      },
      orderBy: {
        order: "desc",
      },
    });

    return res.status(200).json({ success: true, data: banners });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error." });
  }
};
