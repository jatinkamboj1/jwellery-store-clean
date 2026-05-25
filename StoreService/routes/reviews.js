const express = require("express");

const { upload } = require("../utils/s3Helper");
const { isAdmin, authenticateJWT } = require("../middleware/auth");
const {
  getAllReviews,
  createReview,
  updateReview,
  deleteReview,
  getReviewByProductId,
} = require("../controllers/reviewsController");

const router = express();

router
  .route("/")
  .get(authenticateJWT, isAdmin, getAllReviews)
  .post(authenticateJWT, upload.array("images"), createReview);

router.route("/product/:slug").get(getReviewByProductId);

router
  .route("/:id")
  .put(authenticateJWT, updateReview)
  .delete(authenticateJWT, deleteReview);

module.exports = router;
