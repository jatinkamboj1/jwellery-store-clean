const express = require("express");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const router = express.Router();

// Get Categories with Products and Subcategories
router.get("/category-with-products", async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        subCategories: {
          include: { products: true, images: true },
        },
        products: { include: { images: true } },
      },
    });
    res.status(200).json(categories);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get All Products in a Category
router.get("/category/:id/product", async (req, res) => {
  const { id } = req.params;
  try {
    const category = await prisma.category.findUnique({
      where: { id },
      include: { products: { include: { images: true } } },
    });
    if (!category) return res.status(404).json({ error: "Category not found" });
    res.status(200).json(category.products);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get All Products in a Subcategory
router.get("/subcategories/:id/product", async (req, res) => {
  const { id } = req.params;
  try {
    const subCategory = await prisma.subCategory.findUnique({
      where: { id },
      include: { products: { include: { images: true } } },
    });
    if (!subCategory)
      return res.status(404).json({ error: "Subcategory not found" });
    res.status(200).json(subCategory.products);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get a Product by ID
router.get("/product/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true, subCategory: true },
    });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.status(200).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
