const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: [true, "Student ID is required"],
      unique: true,
      trim: true,
    },

    admissionNo: {
      type: String,
      required: [true, "Admission number is required"],
      unique: true,
      trim: true,
    },

    name: {
      type: String,
      required: [true, "Student name is required"],
      trim: true,
    },

    fatherName: {
      type: String,
      required: [true, "Father name is required"],
      trim: true,
    },

    gender: {
      type: String,
      required: [true, "Gender is required"],
      enum: ["Male", "Female", "Other"],
    },

    dateOfBirth: {
      type: Date,
      required: [true, "Date of birth is required"],
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
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    address: {
      type: String,
      trim: true,
      default: "",
    },

    admissionDate: {
      type: Date,
      required: [true, "Admission date is required"],
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },

    profilePhoto: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Student", studentSchema);