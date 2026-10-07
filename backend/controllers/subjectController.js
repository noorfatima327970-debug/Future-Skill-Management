const Subject = require("../models/Subject");

const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find()
      .sort({ className: 1, subjectName: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: subjects.length,
      subjects,
    });
  } catch (error) {
    console.error("Get Subjects Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch subjects",
    });
  }
};

const getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    return res.status(200).json({
      success: true,
      subject,
    });
  } catch (error) {
    console.error("Get Subject Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch subject",
    });
  }
};

const createSubject = async (req, res) => {
  try {
    const {
      subjectName,
      subjectCode,
      className,
      teacherName,
      description,
      status,
    } = req.body;

    if (!subjectName || !subjectCode || !className) {
      return res.status(400).json({
        success: false,
        message:
          "Please fill subject name, subject code and class",
      });
    }

    const normalizedName = subjectName.trim();
    const normalizedCode = subjectCode.trim().toUpperCase();
    const normalizedClass = className.trim();

    const existingSubject = await Subject.findOne({
      subjectCode: normalizedCode,
      className: normalizedClass,
    });

    if (existingSubject) {
      return res.status(409).json({
        success: false,
        message:
          "This subject code already exists for this class",
      });
    }

    const subject = await Subject.create({
      subjectName: normalizedName,
      subjectCode: normalizedCode,
      className: normalizedClass,
      teacherName: teacherName?.trim() || "",
      description: description?.trim() || "",
      status: status || "Active",
    });

    return res.status(201).json({
      success: true,
      message: "Subject created successfully",
      subject,
    });
  } catch (error) {
    console.error("Create Subject Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "This subject code already exists for this class",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create subject",
    });
  }
};

const updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    const {
      subjectName,
      subjectCode,
      className,
      teacherName,
      description,
      status,
    } = req.body;

    if (subjectName !== undefined) {
      subject.subjectName = subjectName.trim();
    }

    if (subjectCode !== undefined) {
      subject.subjectCode = subjectCode.trim().toUpperCase();
    }

    if (className !== undefined) {
      subject.className = className.trim();
    }

    if (teacherName !== undefined) {
      subject.teacherName = teacherName.trim();
    }

    if (description !== undefined) {
      subject.description = description.trim();
    }

    if (status !== undefined) {
      subject.status = status;
    }

    const duplicateSubject = await Subject.findOne({
      _id: { $ne: subject._id },
      subjectCode: subject.subjectCode,
      className: subject.className,
    });

    if (duplicateSubject) {
      return res.status(409).json({
        success: false,
        message:
          "This subject code already exists for this class",
      });
    }

    await subject.save();

    return res.status(200).json({
      success: true,
      message: "Subject updated successfully",
      subject,
    });
  } catch (error) {
    console.error("Update Subject Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "This subject code already exists for this class",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update subject",
    });
  }
};

const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    await Subject.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Subject deleted successfully",
    });
  } catch (error) {
    console.error("Delete Subject Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete subject",
    });
  }
};

module.exports = {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
};