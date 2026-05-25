const express = require("express");
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updatePersonalInformation,
} = require("../controllers/userController");
const { isAdmin, authenticateJWT } = require("../middleware/auth");
const router = express.Router();

// CRUD operations for User
router.get("/", authenticateJWT, isAdmin, getUsers); // Get all users
router.get("/:id", authenticateJWT, getUserById); // Get user by ID
router.post("/", createUser); // Create a new user
router.put("/", authenticateJWT, updatePersonalInformation); // Update user by ID
router.delete("/:id", authenticateJWT, deleteUser); // Delete user by ID
router.put("/admin/:id", authenticateJWT, isAdmin, updateUser); // Update user by ID

module.exports = router;
