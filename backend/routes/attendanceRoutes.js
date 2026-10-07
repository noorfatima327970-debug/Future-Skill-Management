const express = require("express");

const {
  getAttendances,
  getAttendanceById,
  createAttendance,
  updateAttendance,
  deleteAttendance,
} = require("../controllers/attendanceController");

const protectAdmin = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protectAdmin, getAttendances);

router.get(
  "/:id",
  protectAdmin,
  getAttendanceById
);

router.post(
  "/",
  protectAdmin,
  createAttendance
);

router.put(
  "/:id",
  protectAdmin,
  updateAttendance
);

router.delete(
  "/:id",
  protectAdmin,
  deleteAttendance
);

module.exports = router;