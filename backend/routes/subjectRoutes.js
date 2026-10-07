const express = require("express");

const {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
} = require("../controllers/subjectController");

const protectAdmin = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protectAdmin, getSubjects);
router.get("/:id", protectAdmin, getSubjectById);
router.post("/", protectAdmin, createSubject);
router.put("/:id", protectAdmin, updateSubject);
router.delete("/:id", protectAdmin, deleteSubject);

module.exports = router;