const Student = require("../models/Student");

// ========================================
// GET ALL STUDENTS
// ========================================

const getStudents = async (req, res) => {
  try {
    const students = await Student.find()
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: students.length,
      students,
    });
  } catch (error) {
    console.error("Get Students Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch students",
    });
  }
};

// ========================================
// GET SINGLE STUDENT
// ========================================

const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    return res.status(200).json({
      success: true,
      student,
    });
  } catch (error) {
    console.error("Get Student Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch student",
    });
  }
};

// ========================================
// CREATE STUDENT
// ========================================

const createStudent = async (req, res) => {
  try {
    const {
      studentId,
      admissionNo,
      name,
      fatherName,
      gender,
      dateOfBirth,
      className,
      section,
      phone,
      address,
      admissionDate,
      status,
      profilePhoto,
    } = req.body;

    if (
      !studentId ||
      !admissionNo ||
      !name ||
      !fatherName ||
      !gender ||
      !dateOfBirth ||
      !className ||
      !section ||
      !admissionDate
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required student fields",
      });
    }

    const existingStudent = await Student.findOne({
      $or: [
        { studentId: studentId.trim() },
        { admissionNo: admissionNo.trim() },
      ],
    });

    if (existingStudent) {
      return res.status(409).json({
        success: false,
        message:
          "Student ID or admission number already exists",
      });
    }

    const student = await Student.create({
      studentId: studentId.trim(),
      admissionNo: admissionNo.trim(),
      name: name.trim(),
      fatherName: fatherName.trim(),
      gender,
      dateOfBirth,
      className: className.trim(),
      section: section.trim(),
      phone: phone?.trim() || "",
      address: address?.trim() || "",
      admissionDate,
      status: status || "Active",
      profilePhoto: profilePhoto || "",
    });

    return res.status(201).json({
      success: true,
      message: "Student created successfully",
      student,
    });
  } catch (error) {
    console.error("Create Student Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Student ID or admission number already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create student",
    });
  }
};

// ========================================
// UPDATE STUDENT
// ========================================

const updateStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const {
      studentId,
      admissionNo,
      name,
      fatherName,
      gender,
      dateOfBirth,
      className,
      section,
      phone,
      address,
      admissionDate,
      status,
      profilePhoto,
    } = req.body;

    if (studentId !== undefined) {
      student.studentId = studentId.trim();
    }

    if (admissionNo !== undefined) {
      student.admissionNo = admissionNo.trim();
    }

    if (name !== undefined) {
      student.name = name.trim();
    }

    if (fatherName !== undefined) {
      student.fatherName = fatherName.trim();
    }

    if (gender !== undefined) {
      student.gender = gender;
    }

    if (dateOfBirth !== undefined) {
      student.dateOfBirth = dateOfBirth;
    }

    if (className !== undefined) {
      student.className = className.trim();
    }

    if (section !== undefined) {
      student.section = section.trim();
    }

    if (phone !== undefined) {
      student.phone = phone.trim();
    }

    if (address !== undefined) {
      student.address = address.trim();
    }

    if (admissionDate !== undefined) {
      student.admissionDate = admissionDate;
    }

    if (status !== undefined) {
      student.status = status;
    }

    if (profilePhoto !== undefined) {
      student.profilePhoto = profilePhoto;
    }

    await student.save();

    return res.status(200).json({
      success: true,
      message: "Student updated successfully",
      student,
    });
  } catch (error) {
    console.error("Update Student Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Student ID or admission number already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update student",
    });
  }
};

// ========================================
// DELETE STUDENT
// ========================================

const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    await Student.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Student deleted successfully",
    });
  } catch (error) {
    console.error("Delete Student Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete student",
    });
  }
};

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
};