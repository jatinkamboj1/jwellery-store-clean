const express = require("express");
const { authenticateJWT, isAdmin } = require("../middleware/auth");
const {
  getAllDiscountCoupons,
  createDiscountCoupon,
  getDiscountCouponById,
  updateDiscountCoupon,
  deleteDiscountCoupon,
  applyDiscountCoupon,
} = require("../controllers/discountController");

const router = express.Router();

// Countrollers

router
  .route("/")
  .get(authenticateJWT, isAdmin, getAllDiscountCoupons)
  .post(authenticateJWT, isAdmin, createDiscountCoupon);

router.get("/apply", authenticateJWT, applyDiscountCoupon);

router
  .route("/:id")
  .get(authenticateJWT, isAdmin, getDiscountCouponById)
  .put(authenticateJWT, isAdmin, updateDiscountCoupon)
  .delete(authenticateJWT, isAdmin, deleteDiscountCoupon);

module.exports = router;
