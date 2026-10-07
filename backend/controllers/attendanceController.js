const Attendance = require("../models/Attendance");

const getAttendances = async (req, res) => {
  try {
    const attendances = await Attendance.find()
      .sort({
        date: -1,
        className: 1,
        section: 1,
        studentName: 1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      count: attendances.length,
      attendances,
    });
  } catch (error) {
    console.error("Get Attendances Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch attendance records",
    });
  }
};

const getAttendanceById = async (req, res) => {
  try {
    const attendance = await Attendance.findById(
      req.params.id
    );

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found",
      });
    }

    return res.status(200).json({
      success: true,
      attendance,
    });
  } catch (error) {
    console.error("Get Attendance Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch attendance record",
    });
  }
};

const createAttendance = async (req, res) => {
  try {
    const {
      studentId,
      studentName,
      className,
      section,
      date,
      status,
      remarks,
    } = req.body;

    if (
      !studentId ||
      !studentName ||
      !className ||
      !section ||
      !date ||
      !status
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please fill all required attendance fields",
      });
    }

    const attendanceDate = new Date(date);

    if (Number.isNaN(attendanceDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid attendance date",
      });
    }

    const normalizedClass = className.trim();
    const normalizedSection = section
      .trim()
      .toUpperCase();

    const existingAttendance =
      await Attendance.findOne({
        studentId,
        date: attendanceDate,
      });

    if (existingAttendance) {
      return res.status(409).json({
        success: false,
        message:
          "Attendance for this student already exists for this date",
      });
    }

    const attendance = await Attendance.create({
      studentId,
      studentName: studentName.trim(),
      className: normalizedClass,
      section: normalizedSection,
      date: attendanceDate,
      status,
      remarks: remarks?.trim() || "",
    });

    return res.status(201).json({
      success: true,
      message: "Attendance created successfully",
      attendance,
    });
  } catch (error) {
    console.error("Create Attendance Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Attendance for this student already exists for this date",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create attendance",
    });
  }
};

const updateAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findById(
      req.params.id
    );

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found",
      });
    }

    const {
      studentId,
      studentName,
      className,
      section,
      date,
      status,
      remarks,
    } = req.body;

    if (studentId !== undefined) {
      attendance.studentId = studentId;
    }

    if (studentName !== undefined) {
      attendance.studentName =
        studentName.trim();
    }

    if (className !== undefined) {
      attendance.className =
        className.trim();
    }

    if (section !== undefined) {
      attendance.section = section
        .trim()
        .toUpperCase();
    }

    if (date !== undefined) {
      const updatedDate = new Date(date);

      if (Number.isNaN(updatedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid attendance date",
        });
      }

      attendance.date = updatedDate;
    }

    if (status !== undefined) {
      attendance.status = status;
    }

    if (remarks !== undefined) {
      attendance.remarks =
        remarks.trim();
    }

    const duplicateAttendance =
      await Attendance.findOne({
        _id: {
          $ne: attendance._id,
        },
        studentId: attendance.studentId,
        date: attendance.date,
      });

    if (duplicateAttendance) {
      return res.status(409).json({
        success: false,
        message:
          "Attendance for this student already exists for this date",
      });
    }

    await attendance.save();

    return res.status(200).json({
      success: true,
      message: "Attendance updated successfully",
      attendance,
    });
  } catch (error) {
    console.error("Update Attendance Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Attendance for this student already exists for this date",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update attendance",
    });
  }
};

const deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findById(
      req.params.id
    );

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found",
      });
    }

    await Attendance.findByIdAndDelete(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Attendance deleted successfully",
    });
  } catch (error) {
    console.error("Delete Attendance Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete attendance",
    });
  }
};

module.exports = {
  getAttendances,
  getAttendanceById,
  createAttendance,
  updateAttendance,
  deleteAttendance,
};