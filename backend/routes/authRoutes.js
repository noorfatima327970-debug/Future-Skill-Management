const express = require("express");

const {
  loginAdmin,
  logoutAdmin,
  getCurrentAdmin,
} = require("../controllers/authController");

const protectAdmin = require("../middleware/authMiddleware");

const router = express.Router();

// Public
router.post("/login", loginAdmin);

// Protected
router.post("/logout", protectAdmin, logoutAdmin);
router.get("/me", protectAdmin, getCurrentAdmin);

module.exports = router;