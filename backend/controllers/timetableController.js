const Timetable = require("../models/Timetable");

const getTimetables = async (req, res) => {
  try {
    const timetables = await Timetable.find()
      .sort({
        day: 1,
        startTime: 1,
        className: 1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      count: timetables.length,
      timetables,
    });
  } catch (error) {
    console.error("Get Timetables Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch timetable",
    });
  }
};

const getTimetableById = async (req, res) => {
  try {
    const timetable = await Timetable.findById(
      req.params.id
    );

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: "Timetable entry not found",
      });
    }

    return res.status(200).json({
      success: true,
      timetable,
    });
  } catch (error) {
    console.error("Get Timetable Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch timetable entry",
    });
  }
};

const createTimetable = async (req, res) => {
  try {
    const {
      day,
      className,
      section,
      subjectName,
      teacherName,
      roomNumber,
      startTime,
      endTime,
      status,
    } = req.body;

    if (
      !day ||
      !className ||
      !section ||
      !subjectName ||
      !teacherName ||
      !startTime ||
      !endTime
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please fill all required timetable fields",
      });
    }

    if (startTime >= endTime) {
      return res.status(400).json({
        success: false,
        message:
          "End time must be later than start time",
      });
    }

    const normalizedClass = className.trim();
    const normalizedSection = section.trim().toUpperCase();
    const normalizedSubject = subjectName.trim();
    const normalizedTeacher = teacherName.trim();

    const existingEntry = await Timetable.findOne({
      day,
      className: normalizedClass,
      section: normalizedSection,
      startTime: startTime.trim(),
    });

    if (existingEntry) {
      return res.status(409).json({
        success: false,
        message:
          "A timetable entry already exists for this class at this time",
      });
    }

    const timetable = await Timetable.create({
      day,
      className: normalizedClass,
      section: normalizedSection,
      subjectName: normalizedSubject,
      teacherName: normalizedTeacher,
      roomNumber: roomNumber?.trim() || "",
      startTime: startTime.trim(),
      endTime: endTime.trim(),
      status: status || "Active",
    });

    return res.status(201).json({
      success: true,
      message: "Timetable entry created successfully",
      timetable,
    });
  } catch (error) {
    console.error("Create Timetable Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "A timetable entry already exists for this class at this time",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create timetable entry",
    });
  }
};

const updateTimetable = async (req, res) => {
  try {
    const timetable = await Timetable.findById(
      req.params.id
    );

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: "Timetable entry not found",
      });
    }

    const {
      day,
      className,
      section,
      subjectName,
      teacherName,
      roomNumber,
      startTime,
      endTime,
      status,
    } = req.body;

    if (day !== undefined) {
      timetable.day = day;
    }

    if (className !== undefined) {
      timetable.className = className.trim();
    }

    if (section !== undefined) {
      timetable.section = section.trim().toUpperCase();
    }

    if (subjectName !== undefined) {
      timetable.subjectName = subjectName.trim();
    }

    if (teacherName !== undefined) {
      timetable.teacherName = teacherName.trim();
    }

    if (roomNumber !== undefined) {
      timetable.roomNumber = roomNumber.trim();
    }

    if (startTime !== undefined) {
      timetable.startTime = startTime.trim();
    }

    if (endTime !== undefined) {
      timetable.endTime = endTime.trim();
    }

    if (status !== undefined) {
      timetable.status = status;
    }

    if (
      timetable.startTime >= timetable.endTime
    ) {
      return res.status(400).json({
        success: false,
        message:
          "End time must be later than start time",
      });
    }

    const duplicateEntry = await Timetable.findOne({
      _id: { $ne: timetable._id },
      day: timetable.day,
      className: timetable.className,
      section: timetable.section,
      startTime: timetable.startTime,
    });

    if (duplicateEntry) {
      return res.status(409).json({
        success: false,
        message:
          "A timetable entry already exists for this class at this time",
      });
    }

    await timetable.save();

    return res.status(200).json({
      success: true,
      message: "Timetable entry updated successfully",
      timetable,
    });
  } catch (error) {
    console.error("Update Timetable Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "A timetable entry already exists for this class at this time",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update timetable entry",
    });
  }
};

const deleteTimetable = async (req, res) => {
  try {
    const timetable = await Timetable.findById(
      req.params.id
    );

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: "Timetable entry not found",
      });
    }

    await Timetable.findByIdAndDelete(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Timetable entry deleted successfully",
    });
  } catch (error) {
    console.error("Delete Timetable Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete timetable entry",
    });
  }
};

module.exports = {
  getTimetables,
  getTimetableById,
  createTimetable,
  updateTimetable,
  deleteTimetable,
};