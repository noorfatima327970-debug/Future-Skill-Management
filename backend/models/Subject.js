const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    subjectName: {
      type: String,
      required: [true, "Subject name is required"],
      trim: true,
    },

    subjectCode: {
      type: String,
      required: [true, "Subject code is required"],
      trim: true,
      uppercase: true,
    },

    className: {
      type: String,
      required: [true, "Class is required"],
      trim: true,
    },

    teacherName: {
      type: String,
      trim: true,
      default: "",
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

subjectSchema.index(
  { subjectCode: 1, className: 1 },
  { unique: true }
);

module.exports = mongoose.model("Subject", subjectSchema);