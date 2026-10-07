const express = require("express");

const {
  getTimetables,
  getTimetableById,
  createTimetable,
  updateTimetable,
  deleteTimetable,
} = require("../controllers/timetableController");

const protectAdmin = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protectAdmin, getTimetables);
router.get("/:id", protectAdmin, getTimetableById);
router.post("/", protectAdmin, createTimetable);
router.put("/:id", protectAdmin, updateTimetable);
router.delete("/:id", protectAdmin, deleteTimetable);

module.exports = router;