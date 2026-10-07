const express = require("express");

const {
  getResults,
  getResultById,
  createResult,
  updateResult,
  deleteResult,
} = require("../controllers/resultController");

const protectAdmin = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/",
  protectAdmin,
  getResults
);

router.get(
  "/:id",
  protectAdmin,
  getResultById
);

router.post(
  "/",
  protectAdmin,
  createResult
);

router.put(
  "/:id",
  protectAdmin,
  updateResult
);

router.delete(
  "/:id",
  protectAdmin,
  deleteResult
);

module.exports = router;