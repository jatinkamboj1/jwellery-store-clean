const express = require("express");
const {
  getProducts,
  getProductNames,
  getProductVariantById,
  getFilteredProducts,
  getFeaturedProducts,
  createVariantType,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleWishlist,
  getWishlist,
  getProductsByCategoryId,
  getAllVariantTypes,
  getProductsCard,
  getProductBySlug,
  getRelativeProducts
} = require("../controllers/productsController");
const { upload } = require("../utils/s3Helper");
const { authenticateJWT, isAdmin } = require("../middleware/auth");

const router = express.Router();

// CRUD operations for Product
router.get("/", getProducts); // Get all products
router.get("/by-slug/:slug", getProductBySlug); // Get product by slug
router.get("/by-id/:id", authenticateJWT, isAdmin, getProductById); // Get product by ID
router.get("/names", getProductNames);
router.get("/relative/:slug", getRelativeProducts);

router.get("/variants", getProductVariantById);
router.get("/userproducts", getFilteredProducts);
router.get("/home-featured", getFeaturedProducts);
router.get("/products-card", getProductsCard);

router.route("/varient-types")
  .get(authenticateJWT, isAdmin, getAllVariantTypes)
  .post(authenticateJWT, isAdmin, createVariantType);

// Create & update product with images
router.post( "/", authenticateJWT, isAdmin, upload.array("images"), createProduct); 
router.put( "/:id", authenticateJWT, isAdmin, upload.array("images"), updateProduct); 

// Delete product
router.delete("/:id", authenticateJWT, isAdmin, deleteProduct);



// Toggle Wishlist (Add/Remove)
router.put("/wishlist", authenticateJWT, toggleWishlist);

router.get("/wishlist/:userId", authenticateJWT, getWishlist);

router.get("/user/:categoryId", getProductsByCategoryId);

module.exports = router;
