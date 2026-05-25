const prisma = require("../prismaClient");

const getAllTags = async (req, res) => {
  try {
    const tags = await prisma.tag.findMany();
    return res.status(200).json(tags);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tags", error });
  }
};

const createTag = async (req, res) => {
  const data = req.body;
  //console.log('data: ', data);

  try {
    const tag = await prisma.tag.findMany({
      where: {
        name: data.name,
        isCategory:data.isCategory
      } });
      //console.log('tag: ', tag);
    const newTag = await prisma.tag.create({
      data,
    });
    return res
      .status(201)
      .json({ message: "Tag created successfully", newTag });
  } catch (error) {
    console.log('error: ', error);
    res.status(500).json({ message: "Error creating tag", error });
  }
};

module.exports = { createTag, getAllTags };
