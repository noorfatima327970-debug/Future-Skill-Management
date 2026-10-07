const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Class = require("../models/Class");
const Fee = require("../models/Fee");
const Attendance = require("../models/Attendance");
const Notice = require("../models/Notice");
const Timetable = require("../models/Timetable");

/*
==================================================
GET DASHBOARD STATISTICS
==================================================
*/

const getDashboardStats = async (req, res) => {
  try {
    const [
      totalStudents,
      activeStudents,
      totalTeachers,
      activeTeachers,
      totalClasses,
      activeClasses,
      feeSummary,
      attendanceSummary,
      recentStudents,
      recentNotices,
    ] = await Promise.all([
      Student.countDocuments(),

      Student.countDocuments({
        status: "Active",
      }),

      Teacher.countDocuments(),

      Teacher.countDocuments({
        status: "Active",
      }),

      Class.countDocuments(),

      Class.countDocuments({
        status: "Active",
      }),

      Fee.aggregate([
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
      ]),

      Attendance.aggregate([
        {
          $group: {
            _id: "$status",
            count: {
              $sum: 1,
            },
          },
        },
      ]),

      Student.find()
        .sort({
          createdAt: -1,
        })
        .limit(5)
        .select(
          "studentId admissionNo name fatherName className section status createdAt"
        )
        .lean(),

      Notice.find()
        .sort({
          noticeDate: -1,
          createdAt: -1,
        })
        .limit(5)
        .select(
          "title description noticeDate noticeType targetAudience status createdAt"
        )
        .lean(),
    ]);

    /*
    ==============================================
    FEE SUMMARY
    ==============================================
    */

    const feeData =
      feeSummary[0] || {
        totalFee: 0,
        paidAmount: 0,
        remainingAmount: 0,
      };

    /*
    ==============================================
    ATTENDANCE SUMMARY
    ==============================================
    */

    const attendanceData = {
      total: 0,
      present: 0,
      absent: 0,
      late: 0,
      leave: 0,
    };

    attendanceSummary.forEach(
      (item) => {
        const count = item.count || 0;

        attendanceData.total += count;

        if (item._id === "Present") {
          attendanceData.present =
            count;
        }

        if (item._id === "Absent") {
          attendanceData.absent =
            count;
        }

        if (item._id === "Late") {
          attendanceData.late =
            count;
        }

        if (item._id === "Leave") {
          attendanceData.leave =
            count;
        }
      }
    );

    /*
    ==============================================
    ATTENDANCE PERCENTAGE
    ==============================================
    */

    const attendancePercentage =
      attendanceData.total > 0
        ? Number(
            (
              (attendanceData.present /
                attendanceData.total) *
              100
            ).toFixed(2)
          )
        : 0;

    /*
    ==============================================
    TODAY'S TIMETABLE
    ==============================================
    */

    const today = new Date();

    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    const todayName =
      dayNames[today.getDay()];

    let todayTimetable = [];

    if (
      todayName !== "Sunday"
    ) {
      todayTimetable =
        await Timetable.find({
          day: todayName,
          status: "Active",
        })
          .sort({
            startTime: 1,
          })
          .limit(10)
          .lean();
    }

    /*
    ==============================================
    RESPONSE
    ==============================================
    */

    return res.status(200).json({
      success: true,

      stats: {
        totalStudents,
        activeStudents,

        totalTeachers,
        activeTeachers,

        totalClasses,
        activeClasses,

        feeCollection:
          feeData.paidAmount || 0,

        totalFee:
          feeData.totalFee || 0,

        outstandingFees:
          feeData.remainingAmount || 0,

        attendance:
          attendancePercentage,

        attendanceDetails:
          attendanceData,
      },

      recentStudents,

      recentNotices,

      todayTimetable,
    });
  } catch (error) {
    console.error(
      "Dashboard Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load dashboard data",
    });
  }
};

module.exports = {
  getDashboardStats,
};