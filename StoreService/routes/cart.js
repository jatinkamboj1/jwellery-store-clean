const express = require("express");
const {
    addToCart,
    getAllCartProducts,
    deleteAllCartProducts,
    getAllCartProductsCount,
    getCartProduct,
    deleteCartProduct,
    updateCartItemQuantity
} = require("../controllers/cartController");
const { upload } = require("../utils/s3Helper");
const { authenticateJWT } = require("../middleware/auth");

const router = express.Router();

router.route("/")
    .get(authenticateJWT, getAllCartProducts)
    .delete(authenticateJWT, deleteAllCartProducts);

router.get("/count",authenticateJWT, getAllCartProductsCount);

router.put('/update-quantity',authenticateJWT, updateCartItemQuantity);

router.route("/product/:id")
    .get(authenticateJWT, getCartProduct)
    .post(authenticateJWT, addToCart)
    .delete(authenticateJWT, deleteCartProduct);

module.exports = router;
