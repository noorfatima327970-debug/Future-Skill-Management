const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema(
  {
    teacherId: {
      type: String,
      required: [true, "Teacher ID is required"],
      unique: true,
      trim: true,
    },

    name: {
      type: String,
      required: [true, "Teacher name is required"],
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

    qualification: {
      type: String,
      required: [true, "Qualification is required"],
      trim: true,
    },

    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    address: {
      type: String,
      trim: true,
      default: "",
    },

    joiningDate: {
      type: Date,
      required: [true, "Joining date is required"],
    },

    salary: {
      type: Number,
      required: [true, "Salary is required"],
      min: [0, "Salary cannot be negative"],
      default: 0,
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

module.exports = mongoose.model("Teacher", teacherSchema);