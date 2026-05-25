const express = require("express");
const { isAdmin, authenticateJWT } = require("../middleware/auth");
const { createTag, getAllTags } = require("../controllers/tagsController");
const router = express.Router();

router.get("/", getAllTags); // Get all products

router.post("/", authenticateJWT, isAdmin, createTag);

module.exports = router;
