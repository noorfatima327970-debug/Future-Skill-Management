const mongoose = require("mongoose");

const examSchema = new mongoose.Schema(
  {
    examName: {
      type: String,
      required: [true, "Exam name is required"],
      trim: true,
    },

    examType: {
      type: String,
      required: [true, "Exam type is required"],
      enum: [
        "Monthly Test",
        "Mid Term",
        "Final Term",
        "Quiz",
        "Assessment",
        "Other",
      ],
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

    subjectName: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },

    examDate: {
      type: Date,
      required: [true, "Exam date is required"],
    },

    totalMarks: {
      type: Number,
      required: [true, "Total marks are required"],
      min: [1, "Total marks must be at least 1"],
    },

    passingMarks: {
      type: Number,
      required: [true, "Passing marks are required"],
      min: [0, "Passing marks cannot be negative"],
    },

    status: {
      type: String,
      enum: [
        "Scheduled",
        "Completed",
        "Cancelled",
      ],
      default: "Scheduled",
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

examSchema.index(
  {
    examName: 1,
    className: 1,
    section: 1,
    subjectName: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model(
  "Exam",
  examSchema
);