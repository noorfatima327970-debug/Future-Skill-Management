const express = require("express");

const {
  getFees,
  getFeeById,
  createFee,
  updateFee,
  deleteFee,
} = require("../controllers/feeController");

const protectAdmin = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protectAdmin, getFees);

router.get(
  "/:id",
  protectAdmin,
  getFeeById
);

router.post(
  "/",
  protectAdmin,
  createFee
);

router.put(
  "/:id",
  protectAdmin,
  updateFee
);

router.delete(
  "/:id",
  protectAdmin,
  deleteFee
);

module.exports = router;