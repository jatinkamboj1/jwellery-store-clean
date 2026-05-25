const express = require("express");
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoriesName,
  getSubCategoriesName,
  getNavCategory,
  getCategoryBanner,
  getCategoryBySlug
} = require("../controllers/categoriesController");
const { upload } = require("../utils/s3Helper");
const { isAdmin, authenticateJWT } = require("../middleware/auth");

const router = express.Router();

router.get("/", getCategories); // Get all categories
router.get("/names", getCategoriesName); // Get all categories name
router.get("/slug/:slug", getCategoryBySlug);
router.get("/navcategories", getNavCategory);
router.get("/subcategories", getSubCategoriesName);
router.get("/category-banner", getCategoryBanner);

router.get("/:id", authenticateJWT, isAdmin, getCategoryById); // Get category by ID
router.post(
  "/",
  authenticateJWT,
  isAdmin,
  upload.array("images"),
  createCategory
); // Create category with images
router.put(
  "/:id",
  authenticateJWT,
  isAdmin,
  upload.array("images"),
  updateCategory
); // Update category with images
router.delete("/:id", authenticateJWT, isAdmin, deleteCategory); // Delete category

module.exports = router;
