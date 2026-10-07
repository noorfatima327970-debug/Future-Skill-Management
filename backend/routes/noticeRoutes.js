const express = require("express");

const {
  getNotices,
  getNoticeById,
  createNotice,
  updateNotice,
  deleteNotice,
} = require("../controllers/noticeController");

const protectAdmin = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/",
  protectAdmin,
  getNotices
);

router.get(
  "/:id",
  protectAdmin,
  getNoticeById
);

router.post(
  "/",
  protectAdmin,
  createNotice
);

router.put(
  "/:id",
  protectAdmin,
  updateNotice
);

router.delete(
  "/:id",
  protectAdmin,
  deleteNotice
);

module.exports = router;