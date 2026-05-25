const categoryRoutes = require("./category");
const userRoutes = require("./user");
const pageRoutes = require("./page");
const authRoutes = require("./login");
const products = require("./product");
const order = require("./order");
const discountRoutes = require("./discount");
const addressRoutes = require("./address");
const tagsRoutes = require("./tags");
const bannerRoute = require("./banner");
const reviewRoutes = require("./reviews");
const testimonialRoutes = require("./testimonials");
const wishlistRoutes = require("./wishlist");
const cartRoutes = require("./cart");

const express = require("express");
const { authenticateJWT, isAdmin } = require("../middleware/auth");
const router = express.Router();

router.use("/user", userRoutes);
router.use("/category", categoryRoutes);
router.use("/product", products);
router.use("/orders", order);
router.use("/page", pageRoutes);
router.use("/discount", discountRoutes);
router.use("/address", addressRoutes);
router.use("/auth", authRoutes);
router.use("/tags", tagsRoutes);
router.use("/banner", bannerRoute);
router.use("/review", reviewRoutes);
router.use("/testimonials", testimonialRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/cart", cartRoutes);

module.exports = router;
