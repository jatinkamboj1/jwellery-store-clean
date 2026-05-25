const express = require("express");

const { isAdmin, authenticateJWT } = require("../middleware/auth");
const {
  getAllTestimonials,
  getTestimonialById,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} = require("../controllers/testimonialController");
const { upload } = require("../utils/s3Helper");
const router = express();

router
  .route("/")
  .get(getAllTestimonials)
  .post(authenticateJWT, isAdmin, upload.array("images"), createTestimonial);

router
  .route("/:id")
  .get(authenticateJWT, isAdmin, getTestimonialById)
  .put(authenticateJWT, isAdmin, upload.array("images"), updateTestimonial)
  .delete(authenticateJWT, isAdmin, deleteTestimonial);

module.exports = router;
