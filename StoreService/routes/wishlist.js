const express = require("express");
const { getWishlist, addWishlistItem, removeWishlistItem, clearWishlist } = require("../controllers/wishlistController");
const { authenticateJWT } = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticateJWT, getWishlist);  // Get user wishlist
router.post("/:id", authenticateJWT, addWishlistItem); // Add item
router.delete("/:id", authenticateJWT, removeWishlistItem); // Remove single item
router.delete("/", authenticateJWT, clearWishlist); // Remove all items

module.exports = router;
