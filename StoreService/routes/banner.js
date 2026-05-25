const express = require("express");

const { upload } = require("../utils/s3Helper");
const { isAdmin, authenticateJWT } = require("../middleware/auth");
const {
  addBanner,
  getBanners,
  updateBanner,
  deleteBanner,
  getFilteredBanners,
} = require("../controllers/bannerController");

const router = express.Router();

router
  .route("/")
  .get(getBanners)
  .post(authenticateJWT, isAdmin, upload.array("images"), addBanner);
router.route("/homebanner").get(getFilteredBanners);
router
  .route("/:id")
  .put(authenticateJWT, isAdmin, updateBanner)
  .delete(authenticateJWT, isAdmin, deleteBanner);

module.exports = router;
