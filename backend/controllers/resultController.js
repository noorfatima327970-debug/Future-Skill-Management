const Result = require("../models/Result");
const Student = require("../models/Student");
const Exam = require("../models/Exam");

const calculateGrade = (percentage) => {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B";
  if (percentage >= 60) return "C";
  if (percentage >= 50) return "D";
  return "F";
};

const calculatePercentage = (
  obtainedMarks,
  totalMarks
) => {
  if (!totalMarks || totalMarks <= 0) {
    return 0;
  }

  return Number(
    ((obtainedMarks / totalMarks) * 100).toFixed(2)
  );
};

const getResults = async (req, res) => {
  try {
    const results = await Result.find()
      .sort({
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      count: results.length,
      results,
    });
  } catch (error) {
    console.error(
      "Get Results Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch results",
    });
  }
};

const getResultById = async (req, res) => {
  try {
    const result = await Result.findById(
      req.params.id
    ).lean();

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Result not found",
      });
    }

    return res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    console.error(
      "Get Result By ID Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch result",
    });
  }
};

const createResult = async (req, res) => {
  try {
    const {
      studentId,
      examId,
      subjectName,
      obtainedMarks,
      remarks,
    } = req.body;

    if (
      !studentId ||
      !examId ||
      !subjectName ||
      obtainedMarks === undefined ||
      obtainedMarks === ""
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Student, exam, subject and obtained marks are required",
      });
    }

    const student =
      await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const exam =
      await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    const cleanSubjectName =
      String(subjectName).trim();

    if (!cleanSubjectName) {
      return res.status(400).json({
        success: false,
        message: "Subject is required",
      });
    }

    const numericObtainedMarks =
      Number(obtainedMarks);

    if (
      !Number.isFinite(
        numericObtainedMarks
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Obtained marks must be a valid number",
      });
    }

    if (numericObtainedMarks < 0) {
      return res.status(400).json({
        success: false,
        message:
          "Obtained marks cannot be negative",
      });
    }

    if (
      numericObtainedMarks >
      exam.totalMarks
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Obtained marks cannot be greater than total marks",
      });
    }

    const existingResult =
      await Result.findOne({
        studentId,
        examId,
        subjectName: cleanSubjectName,
      });

    if (existingResult) {
      return res.status(409).json({
        success: false,
        message:
          "Result for this student, exam and subject already exists",
      });
    }

    const percentage =
      calculatePercentage(
        numericObtainedMarks,
        exam.totalMarks
      );

    const grade =
      calculateGrade(percentage);

    const status =
      numericObtainedMarks >=
      exam.passingMarks
        ? "Pass"
        : "Fail";

    const result = await Result.create({
      studentId: student._id,
      studentName: student.name,
      className: student.className,
      section: student.section,

      examId: exam._id,
      examName: exam.examName,

      subjectName: cleanSubjectName,

      totalMarks: exam.totalMarks,
      obtainedMarks: numericObtainedMarks,

      percentage,
      grade,
      status,

      remarks: remarks
        ? String(remarks).trim()
        : "",
    });

    return res.status(201).json({
      success: true,
      message: "Result created successfully",
      result,
    });
  } catch (error) {
    console.error(
      "Create Result Error:",
      error
    );

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Result for this student, exam and subject already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create result",
    });
  }
};

const updateResult = async (req, res) => {
  try {
    const result =
      await Result.findById(
        req.params.id
      );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Result not found",
      });
    }

    const {
      studentId,
      examId,
      subjectName,
      obtainedMarks,
      remarks,
    } = req.body;

    const finalStudentId =
      studentId || result.studentId;

    const finalExamId =
      examId || result.examId;

    const finalSubjectName =
      subjectName !== undefined
        ? String(subjectName).trim()
        : result.subjectName;

    if (
      !finalStudentId ||
      !finalExamId ||
      !finalSubjectName
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Student, exam and subject are required",
      });
    }

    const student =
      await Student.findById(
        finalStudentId
      );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const exam =
      await Exam.findById(
        finalExamId
      );

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    const numericObtainedMarks =
      obtainedMarks !== undefined &&
      obtainedMarks !== ""
        ? Number(obtainedMarks)
        : Number(result.obtainedMarks);

    if (
      !Number.isFinite(
        numericObtainedMarks
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Obtained marks must be a valid number",
      });
    }

    if (numericObtainedMarks < 0) {
      return res.status(400).json({
        success: false,
        message:
          "Obtained marks cannot be negative",
      });
    }

    if (
      numericObtainedMarks >
      exam.totalMarks
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Obtained marks cannot be greater than total marks",
      });
    }

    const duplicateResult =
      await Result.findOne({
        _id: {
          $ne: result._id,
        },
        studentId: finalStudentId,
        examId: finalExamId,
        subjectName: finalSubjectName,
      });

    if (duplicateResult) {
      return res.status(409).json({
        success: false,
        message:
          "Another result for this student, exam and subject already exists",
      });
    }

    const percentage =
      calculatePercentage(
        numericObtainedMarks,
        exam.totalMarks
      );

    const grade =
      calculateGrade(percentage);

    const status =
      numericObtainedMarks >=
      exam.passingMarks
        ? "Pass"
        : "Fail";

    result.studentId = student._id;
    result.studentName = student.name;
    result.className = student.className;
    result.section = student.section;

    result.examId = exam._id;
    result.examName = exam.examName;

    result.subjectName =
      finalSubjectName;

    result.totalMarks =
      exam.totalMarks;

    result.obtainedMarks =
      numericObtainedMarks;

    result.percentage = percentage;
    result.grade = grade;
    result.status = status;

    if (remarks !== undefined) {
      result.remarks = String(
        remarks
      ).trim();
    }

    await result.save();

    return res.status(200).json({
      success: true,
      message: "Result updated successfully",
      result,
    });
  } catch (error) {
    console.error(
      "Update Result Error:",
      error
    );

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Result for this student, exam and subject already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update result",
    });
  }
};

const deleteResult = async (req, res) => {
  try {
    const result =
      await Result.findById(
        req.params.id
      );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Result not found",
      });
    }

    await result.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Result deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete Result Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete result",
    });
  }
};

module.exports = {
  getResults,
  getResultById,
  createResult,
  updateResult,
  deleteResult,
};