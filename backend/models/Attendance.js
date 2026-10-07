const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
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

    date: {
      type: Date,
      required: [true, "Attendance date is required"],
    },

    status: {
      type: String,
      required: [true, "Attendance status is required"],
      enum: ["Present", "Absent", "Late", "Leave"],
      default: "Present",
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

/*
  One student can have only one attendance
  record for a particular date.
*/
attendanceSchema.index(
  {
    studentId: 1,
    date: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model(
  "Attendance",
  attendanceSchema
);