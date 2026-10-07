const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      required: [true, "Day is required"],
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
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

    teacherName: {
      type: String,
      required: [true, "Teacher is required"],
      trim: true,
    },

    roomNumber: {
      type: String,
      trim: true,
      default: "",
    },

    startTime: {
      type: String,
      required: [true, "Start time is required"],
      trim: true,
    },

    endTime: {
      type: String,
      required: [true, "End time is required"],
      trim: true,
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

timetableSchema.index(
  {
    day: 1,
    className: 1,
    section: 1,
    startTime: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model(
  "Timetable",
  timetableSchema
);