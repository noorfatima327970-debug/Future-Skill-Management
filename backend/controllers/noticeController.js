const Notice = require("../models/Notice");

const getNotices = async (req, res) => {
  try {
    const notices = await Notice.find().sort({
      noticeDate: -1,
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      notices,
    });
  } catch (error) {
    console.error("Get Notices Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch notices",
    });
  }
};

const getNoticeById = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: "Notice not found",
      });
    }

    return res.status(200).json({
      success: true,
      notice,
    });
  } catch (error) {
    console.error("Get Notice Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch notice",
    });
  }
};

const createNotice = async (req, res) => {
  try {
    const {
      title,
      description,
      noticeDate,
      noticeType,
      targetAudience,
      status,
      createdBy,
    } = req.body;

    if (
      !title ||
      !description ||
      !noticeDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title, description and notice date are required",
      });
    }

    const notice = await Notice.create({
      title: title.trim(),
      description: description.trim(),
      noticeDate,
      noticeType: noticeType || "General",
      targetAudience:
        targetAudience || "All",
      status: status || "Published",
      createdBy:
        createdBy?.trim() || "Admin",
    });

    return res.status(201).json({
      success: true,
      message: "Notice created successfully",
      notice,
    });
  } catch (error) {
    console.error("Create Notice Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create notice",
    });
  }
};

const updateNotice = async (req, res) => {
  try {
    const {
      title,
      description,
      noticeDate,
      noticeType,
      targetAudience,
      status,
      createdBy,
    } = req.body;

    if (
      !title ||
      !description ||
      !noticeDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title, description and notice date are required",
      });
    }

    const notice =
      await Notice.findByIdAndUpdate(
        req.params.id,
        {
          title: title.trim(),
          description: description.trim(),
          noticeDate,
          noticeType:
            noticeType || "General",
          targetAudience:
            targetAudience || "All",
          status:
            status || "Published",
          createdBy:
            createdBy?.trim() || "Admin",
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: "Notice not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notice updated successfully",
      notice,
    });
  } catch (error) {
    console.error("Update Notice Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update notice",
    });
  }
};

const deleteNotice = async (req, res) => {
  try {
    const notice =
      await Notice.findByIdAndDelete(
        req.params.id
      );

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: "Notice not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notice deleted successfully",
    });
  } catch (error) {
    console.error("Delete Notice Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete notice",
    });
  }
};

module.exports = {
  getNotices,
  getNoticeById,
  createNotice,
  updateNotice,
  deleteNotice,
};