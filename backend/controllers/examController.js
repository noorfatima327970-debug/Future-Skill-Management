const Exam = require("../models/Exam");

const getExams = async (req, res) => {
  try {
    const exams = await Exam.find()
      .sort({
        examDate: 1,
        className: 1,
        section: 1,
        subjectName: 1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      count: exams.length,
      exams,
    });
  } catch (error) {
    console.error("Get Exams Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch exams",
    });
  }
};

const getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(
      req.params.id
    );

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    return res.status(200).json({
      success: true,
      exam,
    });
  } catch (error) {
    console.error("Get Exam Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch exam",
    });
  }
};

const createExam = async (req, res) => {
  try {
    const {
      examName,
      examType,
      className,
      section,
      subjectName,
      examDate,
      totalMarks,
      passingMarks,
      status,
      remarks,
    } = req.body;

    if (
      !examName ||
      !examType ||
      !className ||
      !section ||
      !subjectName ||
      !examDate ||
      totalMarks === undefined ||
      passingMarks === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please fill all required exam fields",
      });
    }

    const parsedTotalMarks =
      Number(totalMarks);

    const parsedPassingMarks =
      Number(passingMarks);

    if (
      Number.isNaN(parsedTotalMarks) ||
      Number.isNaN(parsedPassingMarks) ||
      parsedTotalMarks < 1 ||
      parsedPassingMarks < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid marks values",
      });
    }

    if (
      parsedPassingMarks >
      parsedTotalMarks
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Passing marks cannot be greater than total marks",
      });
    }

    const parsedExamDate =
      new Date(examDate);

    if (
      Number.isNaN(
        parsedExamDate.getTime()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid exam date",
      });
    }

    const normalizedClass =
      className.trim();

    const normalizedSection =
      section.trim().toUpperCase();

    const normalizedSubject =
      subjectName.trim();

    const existingExam =
      await Exam.findOne({
        examName: examName.trim(),
        className: normalizedClass,
        section: normalizedSection,
        subjectName: normalizedSubject,
      });

    if (existingExam) {
      return res.status(409).json({
        success: false,
        message:
          "An exam with the same name, class, section and subject already exists",
      });
    }

    const exam = await Exam.create({
      examName: examName.trim(),
      examType,
      className: normalizedClass,
      section: normalizedSection,
      subjectName: normalizedSubject,
      examDate: parsedExamDate,
      totalMarks: parsedTotalMarks,
      passingMarks: parsedPassingMarks,
      status: status || "Scheduled",
      remarks: remarks?.trim() || "",
    });

    return res.status(201).json({
      success: true,
      message: "Exam created successfully",
      exam,
    });
  } catch (error) {
    console.error("Create Exam Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "An exam with the same name, class, section and subject already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create exam",
    });
  }
};

const updateExam = async (req, res) => {
  try {
    const exam = await Exam.findById(
      req.params.id
    );

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    const {
      examName,
      examType,
      className,
      section,
      subjectName,
      examDate,
      totalMarks,
      passingMarks,
      status,
      remarks,
    } = req.body;

    if (examName !== undefined) {
      exam.examName = examName.trim();
    }

    if (examType !== undefined) {
      exam.examType = examType;
    }

    if (className !== undefined) {
      exam.className =
        className.trim();
    }

    if (section !== undefined) {
      exam.section = section
        .trim()
        .toUpperCase();
    }

    if (subjectName !== undefined) {
      exam.subjectName =
        subjectName.trim();
    }

    if (examDate !== undefined) {
      const updatedDate =
        new Date(examDate);

      if (
        Number.isNaN(
          updatedDate.getTime()
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid exam date",
        });
      }

      exam.examDate = updatedDate;
    }

    if (totalMarks !== undefined) {
      exam.totalMarks =
        Number(totalMarks);
    }

    if (passingMarks !== undefined) {
      exam.passingMarks =
        Number(passingMarks);
    }

    if (status !== undefined) {
      exam.status = status;
    }

    if (remarks !== undefined) {
      exam.remarks =
        remarks.trim();
    }

    if (
      Number.isNaN(exam.totalMarks) ||
      Number.isNaN(exam.passingMarks) ||
      exam.totalMarks < 1 ||
      exam.passingMarks < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid marks values",
      });
    }

    if (
      exam.passingMarks >
      exam.totalMarks
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Passing marks cannot be greater than total marks",
      });
    }

    const duplicateExam =
      await Exam.findOne({
        _id: {
          $ne: exam._id,
        },
        examName: exam.examName,
        className: exam.className,
        section: exam.section,
        subjectName:
          exam.subjectName,
      });

    if (duplicateExam) {
      return res.status(409).json({
        success: false,
        message:
          "An exam with the same name, class, section and subject already exists",
      });
    }

    await exam.save();

    return res.status(200).json({
      success: true,
      message: "Exam updated successfully",
      exam,
    });
  } catch (error) {
    console.error("Update Exam Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "An exam with the same name, class, section and subject already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update exam",
    });
  }
};

const deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findById(
      req.params.id
    );

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    await Exam.findByIdAndDelete(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Exam deleted successfully",
    });
  } catch (error) {
    console.error("Delete Exam Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete exam",
    });
  }
};

module.exports = {
  getExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
};