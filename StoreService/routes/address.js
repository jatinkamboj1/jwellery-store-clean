const express = require("express");
const { authenticateJWT, isAdmin } = require("../middleware/auth");
const {
  addUserAddress,
  getAddressByUserId,
  updateAddress,
  deleteAddress,
  getAddressBytoken,
  updateAddressbyToken,
  getAddressType,
} = require("../controllers/addressesController");

const router = express.Router();

// Countrollers
router.route("/types").get(authenticateJWT, getAddressType);
router.route("/user").get(authenticateJWT, getAddressBytoken); //fetch User address by token
router.route("/user/:id").put(authenticateJWT, updateAddressbyToken);
router
  .route("/:id")
  .get(authenticateJWT, isAdmin, getAddressByUserId)
  .post(authenticateJWT, addUserAddress)
  .put(authenticateJWT, isAdmin, updateAddress)
  .delete(authenticateJWT, isAdmin, deleteAddress);

module.exports = router;
