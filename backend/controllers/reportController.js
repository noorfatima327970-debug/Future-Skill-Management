const Student = require("../models/Student");
const Attendance = require("../models/Attendance");
const Fee = require("../models/Fee");
const Result = require("../models/Result");
const Class = require("../models/Class");

const getReportSummary = async (req, res) => {
  try {
    const [
      totalStudents,
      activeStudents,
      totalClasses,
      totalAttendance,
      totalFees,
      totalResults,
    ] = await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({
        status: "Active",
      }),
      Class.countDocuments(),
      Attendance.countDocuments(),
      Fee.countDocuments(),
      Result.countDocuments(),
    ]);

    const feeSummary =
      await Fee.aggregate([
        {
          $group: {
            _id: null,
            totalFee: {
              $sum: "$totalFee",
            },
            paidAmount: {
              $sum: "$paidAmount",
            },
            remainingAmount: {
              $sum: "$remainingAmount",
            },
          },
        },
      ]);

    const resultSummary =
      await Result.aggregate([
        {
          $group: {
            _id: null,
            averagePercentage: {
              $avg: "$percentage",
            },
            totalPass: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$status",
                      "Pass",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            totalFail: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$status",
                      "Fail",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]);

    const attendanceSummary =
      await Attendance.aggregate([
        {
          $group: {
            _id: null,
            present: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$status",
                      "Present",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            absent: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$status",
                      "Absent",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            late: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$status",
                      "Late",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            leave: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$status",
                      "Leave",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]);

    const feeData =
      feeSummary[0] || {
        totalFee: 0,
        paidAmount: 0,
        remainingAmount: 0,
      };

    const resultData =
      resultSummary[0] || {
        averagePercentage: 0,
        totalPass: 0,
        totalFail: 0,
      };

    const attendanceData =
      attendanceSummary[0] || {
        present: 0,
        absent: 0,
        late: 0,
        leave: 0,
      };

    return res.status(200).json({
      success: true,
      summary: {
        students: {
          total: totalStudents,
          active: activeStudents,
          inactive:
            totalStudents -
            activeStudents,
        },

        classes: {
          total: totalClasses,
        },

        attendance: {
          total: totalAttendance,
          present:
            attendanceData.present,
          absent:
            attendanceData.absent,
          late: attendanceData.late,
          leave: attendanceData.leave,
        },

        fees: {
          records: totalFees,
          totalFee:
            feeData.totalFee || 0,
          paidAmount:
            feeData.paidAmount || 0,
          remainingAmount:
            feeData.remainingAmount || 0,
        },

        results: {
          total: totalResults,
          pass:
            resultData.totalPass || 0,
          fail:
            resultData.totalFail || 0,
          averagePercentage:
            Number(
              resultData.averagePercentage ||
                0
            ).toFixed(2),
        },
      },
    });
  } catch (error) {
    console.error(
      "Get Report Summary Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to generate report summary",
    });
  }
};

const getStudentReport = async (
  req,
  res
) => {
  try {
    const {
      className,
      section,
      status,
      search,
    } = req.query;

    const filter = {};

    if (className) {
      filter.className = className;
    }

    if (section) {
      filter.section = section;
    }

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          studentId: {
            $regex: search,
            $options: "i",
          },
        },
        {
          admissionNo: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const students =
      await Student.find(filter)
        .sort({
          createdAt: -1,
        })
        .lean();

    return res.status(200).json({
      success: true,
      count: students.length,
      students,
    });
  } catch (error) {
    console.error(
      "Get Student Report Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to generate student report",
    });
  }
};

const getAttendanceReport = async (
  req,
  res
) => {
  try {
    const {
      className,
      section,
      status,
      startDate,
      endDate,
      search,
    } = req.query;

    const filter = {};

    if (className) {
      filter.className = className;
    }

    if (section) {
      filter.section = section;
    }

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.studentName = {
        $regex: search,
        $options: "i",
      };
    }

    if (startDate || endDate) {
      filter.date = {};

      if (startDate) {
        filter.date.$gte = new Date(
          `${startDate}T00:00:00`
        );
      }

      if (endDate) {
        filter.date.$lte = new Date(
          `${endDate}T23:59:59.999`
        );
      }
    }

    const attendance =
      await Attendance.find(filter)
        .sort({
          date: -1,
          studentName: 1,
        })
        .lean();

    const summary = {
      total: attendance.length,
      present: attendance.filter(
        (item) =>
          item.status === "Present"
      ).length,
      absent: attendance.filter(
        (item) =>
          item.status === "Absent"
      ).length,
      late: attendance.filter(
        (item) =>
          item.status === "Late"
      ).length,
      leave: attendance.filter(
        (item) =>
          item.status === "Leave"
      ).length,
    };

    return res.status(200).json({
      success: true,
      count: attendance.length,
      summary,
      attendance,
    });
  } catch (error) {
    console.error(
      "Get Attendance Report Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to generate attendance report",
    });
  }
};

const getFeeReport = async (
  req,
  res
) => {
  try {
    const {
      className,
      section,
      status,
      month,
      search,
    } = req.query;

    const filter = {};

    if (className) {
      filter.className = className;
    }

    if (section) {
      filter.section = section;
    }

    if (status) {
      filter.status = status;
    }

    if (month) {
      filter.month = {
        $regex: month,
        $options: "i",
      };
    }

    if (search) {
      filter.studentName = {
        $regex: search,
        $options: "i",
      };
    }

    const fees =
      await Fee.find(filter)
        .sort({
          dueDate: -1,
          studentName: 1,
        })
        .lean();

    const summary = fees.reduce(
      (result, fee) => {
        result.totalFee +=
          Number(fee.totalFee) || 0;

        result.paidAmount +=
          Number(fee.paidAmount) || 0;

        result.remainingAmount +=
          Number(
            fee.remainingAmount
          ) || 0;

        return result;
      },
      {
        totalFee: 0,
        paidAmount: 0,
        remainingAmount: 0,
      }
    );

    return res.status(200).json({
      success: true,
      count: fees.length,
      summary,
      fees,
    });
  } catch (error) {
    console.error(
      "Get Fee Report Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to generate fee report",
    });
  }
};

const getResultReport = async (
  req,
  res
) => {
  try {
    const {
      className,
      section,
      status,
      grade,
      examName,
      subjectName,
      search,
    } = req.query;

    const filter = {};

    if (className) {
      filter.className = className;
    }

    if (section) {
      filter.section = section;
    }

    if (status) {
      filter.status = status;
    }

    if (grade) {
      filter.grade = grade;
    }

    if (examName) {
      filter.examName = {
        $regex: examName,
        $options: "i",
      };
    }

    if (subjectName) {
      filter.subjectName = {
        $regex: subjectName,
        $options: "i",
      };
    }

    if (search) {
      filter.studentName = {
        $regex: search,
        $options: "i",
      };
    }

    const results =
      await Result.find(filter)
        .sort({
          percentage: -1,
          studentName: 1,
        })
        .lean();

    const totalResults =
      results.length;

    const passCount = results.filter(
      (result) =>
        result.status === "Pass"
    ).length;

    const failCount = results.filter(
      (result) =>
        result.status === "Fail"
    ).length;

    const averagePercentage =
      totalResults > 0
        ? results.reduce(
            (total, result) =>
              total +
              (Number(
                result.percentage
              ) || 0),
            0
          ) / totalResults
        : 0;

    return res.status(200).json({
      success: true,
      count: results.length,
      summary: {
        total: totalResults,
        pass: passCount,
        fail: failCount,
        averagePercentage:
          Number(
            averagePercentage
          ).toFixed(2),
      },
      results,
    });
  } catch (error) {
    console.error(
      "Get Result Report Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to generate result report",
    });
  }
};

const getClassReport = async (
  req,
  res
) => {
  try {
    const { status, search } =
      req.query;

    const classFilter = {};

    if (status) {
      classFilter.status = status;
    }

    if (search) {
      classFilter.className = {
        $regex: search,
        $options: "i",
      };
    }

    const classes =
      await Class.find(classFilter)
        .sort({
          className: 1,
          section: 1,
        })
        .lean();

    const classReports =
      await Promise.all(
        classes.map(
          async (classItem) => {
            const studentFilter = {
              className:
                classItem.className,
              section:
                classItem.section,
            };

            const [
              totalStudents,
              activeStudents,
            ] =
              await Promise.all([
                Student.countDocuments(
                  studentFilter
                ),

                Student.countDocuments({
                  ...studentFilter,
                  status: "Active",
                }),
              ]);

            return {
              ...classItem,
              totalStudents,
              activeStudents,
              availableSeats:
                Math.max(
                  (
                    Number(
                      classItem.capacity
                    ) || 0
                  ) -
                    activeStudents,
                  0
                ),
            };
          }
        )
      );

    return res.status(200).json({
      success: true,
      count: classReports.length,
      classes: classReports,
    });
  } catch (error) {
    console.error(
      "Get Class Report Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to generate class report",
    });
  }
};

module.exports = {
  getReportSummary,
  getStudentReport,
  getAttendanceReport,
  getFeeReport,
  getResultReport,
  getClassReport,
};