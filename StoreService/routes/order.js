const express = require("express");
const { authenticateJWT, isAdmin } = require("../middleware/auth");

const router = express.Router();

// Controllers
const {
  getOrders,
  getOrderById,
  createOrder,
  // deleteOrder,
  getUserOrdersById,
  updateOrder,
  getUserOrdersByToken,
} = require("../controllers/orderController");

// Routes
router.get("/", authenticateJWT, isAdmin, getOrders); // Get all orders
router.get("/userOrder", authenticateJWT, getUserOrdersByToken); // Get  orders by token user

router
  .route("/:id")
  .get(authenticateJWT, getOrderById)
  .put(authenticateJWT, updateOrder); // Get order by ID
router.get("/user/:id", authenticateJWT, getUserOrdersById); // Get order by ID
router.post("/", authenticateJWT, createOrder); // Create a new order
// router.delete("/:id", authenticateJWT, isAdmin, deleteOrder); // Delete order by ID

module.exports = router;
