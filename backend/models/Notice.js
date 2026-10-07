const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Notice title is required"],
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Notice description is required"],
      trim: true,
    },

    noticeDate: {
      type: Date,
      required: [true, "Notice date is required"],
    },

    noticeType: {
      type: String,
      enum: [
        "General",
        "Academic",
        "Event",
        "Holiday",
        "Exam",
        "Fee",
        "Important",
      ],
      default: "General",
    },

    targetAudience: {
      type: String,
      enum: [
        "All",
        "Students",
        "Teachers",
        "Staff",
      ],
      default: "All",
    },

    status: {
      type: String,
      enum: ["Published", "Draft"],
      default: "Published",
    },

    createdBy: {
      type: String,
      default: "Admin",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notice", noticeSchema);