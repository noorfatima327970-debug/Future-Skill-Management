const express = require("express");

const {
  getReportSummary,
  getStudentReport,
  getAttendanceReport,
  getFeeReport,
  getResultReport,
  getClassReport,
} = require("../controllers/reportController");

const protectAdmin = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/summary",
  protectAdmin,
  getReportSummary
);

router.get(
  "/students",
  protectAdmin,
  getStudentReport
);

router.get(
  "/attendance",
  protectAdmin,
  getAttendanceReport
);

router.get(
  "/fees",
  protectAdmin,
  getFeeReport
);

router.get(
  "/results",
  protectAdmin,
  getResultReport
);

router.get(
  "/classes",
  protectAdmin,
  getClassReport
);

module.exports = router;