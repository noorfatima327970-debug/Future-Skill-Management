const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Student is required"],
    },

    studentName: {
      type: String,
      required: [true, "Student name is required"],
      trim: true,
    },

    className: {
      type: String,
      required: [true, "Class is required"],
      trim: true,
    },

    section: {
      type: String,
      required: [true, "Section is required"],
      trim: true,
      uppercase: true,
    },

    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: [true, "Exam is required"],
    },

    examName: {
      type: String,
      required: [true, "Exam name is required"],
      trim: true,
    },

    subjectName: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },

    totalMarks: {
      type: Number,
      required: [true, "Total marks are required"],
      min: [1, "Total marks must be at least 1"],
    },

    obtainedMarks: {
      type: Number,
      required: [true, "Obtained marks are required"],
      min: [0, "Obtained marks cannot be negative"],
    },

    percentage: {
      type: Number,
      default: 0,
      min: [0, "Percentage cannot be negative"],
      max: [100, "Percentage cannot exceed 100"],
    },

    grade: {
      type: String,
      default: "F",
      trim: true,
    },

    status: {
      type: String,
      enum: ["Pass", "Fail"],
      default: "Fail",
    },

    remarks: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

resultSchema.index(
  {
    studentId: 1,
    examId: 1,
    subjectName: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model(
  "Result",
  resultSchema
);