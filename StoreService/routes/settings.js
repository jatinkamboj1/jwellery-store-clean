const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const settingsFilePath = path.join(__dirname, "../settings.json");

// Get settings
router.get("/", (req, res) => {
  try {
    if (fs.existsSync(settingsFilePath)) {
      const data = fs.readFileSync(settingsFilePath, "utf8");
      res.status(200).json(JSON.parse(data));
    } else {
      res.status(404).json({ error: "Settings not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to read settings" });
  }
});

// Update settings
router.put("/", (req, res) => {
  try {
    const newSettings = req.body;
    let currentSettings = {};
    if (fs.existsSync(settingsFilePath)) {
      currentSettings = JSON.parse(fs.readFileSync(settingsFilePath, "utf8"));
    }
    
    const updatedSettings = { ...currentSettings, ...newSettings };
    fs.writeFileSync(settingsFilePath, JSON.stringify(updatedSettings, null, 2), "utf8");
    
    res.status(200).json({ message: "Settings updated successfully", settings: updatedSettings });
  } catch (error) {
    res.status(500).json({ error: "Failed to update settings" });
  }
});

module.exports = router;
