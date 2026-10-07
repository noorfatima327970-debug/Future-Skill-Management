const express = require("express");

const {
  getExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
} = require("../controllers/examController");

const protectAdmin = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/",
  protectAdmin,
  getExams
);

router.get(
  "/:id",
  protectAdmin,
  getExamById
);

router.post(
  "/",
  protectAdmin,
  createExam
);

router.put(
  "/:id",
  protectAdmin,
  updateExam
);

router.delete(
  "/:id",
  protectAdmin,
  deleteExam
);

module.exports = router;