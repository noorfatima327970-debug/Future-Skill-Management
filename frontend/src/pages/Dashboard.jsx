import { useEffect, useState } from "react";
import axios from "axios";

import {
  FiArrowUpRight,
  FiBookOpen,
  FiCalendar,
  FiClipboard,
  FiDollarSign,
  FiMoreHorizontal,
  FiPlus,
  FiRefreshCw,
  FiUserCheck,
  FiUsers,
} from "react-icons/fi";

import {
  useNavigate,
} from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

import "../styles/Dashboard.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const Dashboard = () => {
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] =
    useState(false);

  const [dashboardData, setDashboardData] =
    useState({
      stats: {
        totalStudents: 0,
        totalTeachers: 0,
        totalClasses: 0,
        feeCollection: 0,
        attendance: 0,
        attendanceDetails: {
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          leave: 0,
        },
      },

      recentStudents: [],
      recentNotices: [],
      todayTimetable: [],
    });

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const fetchDashboardData = async (
    showRefreshLoader = false
  ) => {
    try {
      setError("");

      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await axios.get(
        `${API_URL}/api/dashboard`,
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setDashboardData({
          stats: response.data.stats || {
            totalStudents: 0,
            totalTeachers: 0,
            totalClasses: 0,
            feeCollection: 0,
            attendance: 0,
            attendanceDetails: {
              total: 0,
              present: 0,
              absent: 0,
              late: 0,
              leave: 0,
            },
          },

          recentStudents:
            response.data.recentStudents || [],

          recentNotices:
            response.data.recentNotices || [],

          todayTimetable:
            response.data.todayTimetable || [],
        });
      } else {
        setError(
          response.data.message ||
            "Failed to load dashboard data."
        );
      }
    } catch (error) {
      console.error(
        "Dashboard API Error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  /*
  ==============================================
  NAVIGATION HANDLERS
  ==============================================
  */

  const goTo = (path) => {
    navigate(path);
  };

  const handleAddStudent = () => {
    navigate("/students");
  };

  const handleAttendanceDetails = () => {
    navigate("/attendance");
  };

  const handleViewStudents = () => {
    navigate("/students");
  };

  const handleViewTimetable = () => {
    navigate("/timetable");
  };

  /*
  ==============================================
  DASHBOARD STATS
  ==============================================
  */

  const stats = [
    {
      title: "Total Students",
      value:
        dashboardData.stats.totalStudents,
      icon: <FiUsers />,
      description: "Active students",
      path: "/students",
    },

    {
      title: "Total Teachers",
      value:
        dashboardData.stats.totalTeachers,
      icon: <FiUserCheck />,
      description: "Active teachers",
      path: "/teachers",
    },

    {
      title: "Total Classes",
      value:
        dashboardData.stats.totalClasses,
      icon: <FiBookOpen />,
      description: "Active classes",
      path: "/classes",
    },

    {
      title: "Fee Collection",
      value: `₨ ${Number(
        dashboardData.stats
          .feeCollection || 0
      ).toLocaleString()}`,
      icon: <FiDollarSign />,
      description: "Current collection",
      path: "/fees",
    },
  ];

  /*
  ==============================================
  ATTENDANCE DATA
  ==============================================
  */

  const attendanceDetails =
    dashboardData.stats
      .attendanceDetails || {
      total: 0,
      present: 0,
      absent: 0,
      late: 0,
      leave: 0,
    };

  /*
  ==============================================
  RETURN
  ==============================================
  */

  return (
    <div className="dashboard-layout">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() =>
          setIsSidebarOpen(false)
        }
      />

      <div className="dashboard-main">
        <Topbar
          onMenuClick={() =>
            setIsSidebarOpen(true)
          }
        />

        <main className="dashboard-content">
          <div className="dashboard-header">
            <div>
              <span className="dashboard-eyebrow">
                OVERVIEW
              </span>

              <h1>Dashboard</h1>

              <p>
                Welcome back. Here's what's
                happening at Future Skill
                today.
              </p>
            </div>

            <div className="dashboard-header-actions">
              <button
                type="button"
                className="dashboard-refresh-button"
                onClick={() =>
                  fetchDashboardData(true)
                }
                disabled={
                  loading || refreshing
                }
              >
                <FiRefreshCw
                  className={
                    refreshing
                      ? "refresh-spinning"
                      : ""
                  }
                />

                {refreshing
                  ? "Refreshing..."
                  : "Refresh"}
              </button>

              <button
                type="button"
                className="dashboard-primary-button"
                onClick={
                  handleAddStudent
                }
              >
                <FiPlus />
                Add Student
              </button>
            </div>
          </div>

          {error && (
            <div className="dashboard-error">
              <span>{error}</span>

              <button
                type="button"
                onClick={() =>
                  fetchDashboardData()
                }
              >
                Try again
              </button>
            </div>
          )}

          <section className="dashboard-stats-grid">
            {stats.map((stat) => (
              <div
                className="dashboard-stat-card"
                key={stat.title}
                onClick={() =>
                  goTo(stat.path)
                }
                style={{
                  cursor: "pointer",
                }}
              >
                <div className="dashboard-stat-top">
                  <div className="dashboard-stat-icon">
                    {stat.icon}
                  </div>

                  <button
                    type="button"
                    className="dashboard-stat-menu"
                    aria-label={`More options for ${stat.title}`}
                    onClick={(event) => {
                      event.stopPropagation();
                    }}
                  >
                    <FiMoreHorizontal />
                  </button>
                </div>

                <div className="dashboard-stat-body">
                  <span className="dashboard-stat-title">
                    {stat.title}
                  </span>

                  <strong>
                    {loading
                      ? "—"
                      : stat.value}
                  </strong>

                  <span className="dashboard-stat-description">
                    {stat.description}
                  </span>
                </div>
              </div>
            ))}
          </section>

          <section className="dashboard-main-grid">
            <div className="dashboard-panel dashboard-attendance-panel">
              <div className="dashboard-panel-header">
                <div>
                  <span className="dashboard-panel-label">
                    TODAY
                  </span>

                  <h2>
                    Attendance Overview
                  </h2>
                </div>

                <button
                  type="button"
                  className="dashboard-panel-link"
                  onClick={
                    handleAttendanceDetails
                  }
                >
                  View details
                  <FiArrowUpRight />
                </button>
              </div>

              <div className="attendance-overview">
                <div className="attendance-circle">
                  <div>
                    <strong>
                      {loading
                        ? "—"
                        : `${dashboardData.stats.attendance}%`}
                    </strong>

                    <span>
                      Attendance
                    </span>
                  </div>
                </div>

                <div className="attendance-details">
                  <div className="attendance-detail">
                    <span className="attendance-dot present"></span>

                    <div>
                      <strong>
                        Present
                      </strong>

                      <span>
                        Students present today
                      </span>
                    </div>

                    <b>
                      {
                        attendanceDetails.present
                      }
                    </b>
                  </div>

                  <div className="attendance-detail">
                    <span className="attendance-dot absent"></span>

                    <div>
                      <strong>
                        Absent
                      </strong>

                      <span>
                        Students absent today
                      </span>
                    </div>

                    <b>
                      {
                        attendanceDetails.absent
                      }
                    </b>
                  </div>

                  <div className="attendance-detail">
                    <span className="attendance-dot leave"></span>

                    <div>
                      <strong>
                        On Leave
                      </strong>

                      <span>
                        Students on leave
                      </span>
                    </div>

                    <b>
                      {
                        attendanceDetails.leave
                      }
                    </b>
                  </div>
                </div>
              </div>
            </div>

            <div className="dashboard-panel">
              <div className="dashboard-panel-header">
                <div>
                  <span className="dashboard-panel-label">
                    QUICK ACTIONS
                  </span>

                  <h2>
                    Manage School
                  </h2>
                </div>
              </div>

              <div className="quick-actions">
                <button
                  type="button"
                  onClick={() =>
                    goTo("/students")
                  }
                >
                  <span>
                    <FiUsers />
                  </span>

                  <div>
                    <strong>
                      Students
                    </strong>

                    <small>
                      Manage students
                    </small>
                  </div>

                  <FiArrowUpRight />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    goTo("/teachers")
                  }
                >
                  <span>
                    <FiUserCheck />
                  </span>

                  <div>
                    <strong>
                      Teachers
                    </strong>

                    <small>
                      Manage teachers
                    </small>
                  </div>

                  <FiArrowUpRight />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    goTo("/timetable")
                  }
                >
                  <span>
                    <FiCalendar />
                  </span>

                  <div>
                    <strong>
                      Timetable
                    </strong>

                    <small>
                      View today's schedule
                    </small>
                  </div>

                  <FiArrowUpRight />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    goTo("/attendance")
                  }
                >
                  <span>
                    <FiClipboard />
                  </span>

                  <div>
                    <strong>
                      Attendance
                    </strong>

                    <small>
                      Mark attendance
                    </small>
                  </div>

                  <FiArrowUpRight />
                </button>
              </div>
            </div>
          </section>

          <section className="dashboard-bottom-grid">
            <div className="dashboard-panel">
              <div className="dashboard-panel-header">
                <div>
                  <span className="dashboard-panel-label">
                    STUDENTS
                  </span>

                  <h2>
                    Recent Students
                  </h2>
                </div>

                <button
                  type="button"
                  className="dashboard-panel-link"
                  onClick={
                    handleViewStudents
                  }
                >
                  View all
                  <FiArrowUpRight />
                </button>
              </div>

              {loading ? (
                <div className="dashboard-empty-state">
                  Loading students...
                </div>
              ) : dashboardData
                  .recentStudents
                  .length === 0 ? (
                <div className="dashboard-empty-state">
                  <FiUsers />

                  <strong>
                    No students yet
                  </strong>

                  <span>
                    Add students to see them
                    here.
                  </span>
                </div>
              ) : (
                <div className="recent-students-list">
                  {dashboardData.recentStudents.map(
                    (student) => (
                      <div
                        className="recent-student-row"
                        key={
                          student._id
                        }
                        onClick={() =>
                          goTo(
                            "/students"
                          )
                        }
                        style={{
                          cursor:
                            "pointer",
                        }}
                      >
                        <div className="recent-student-avatar">
                          {student.name
                            ?.charAt(
                              0
                            )
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            {student.name}
                          </strong>

                          <span>
                            {
                              student.studentId
                            }{" "}
                            ·{" "}
                            {
                              student.className
                            }
                          </span>
                        </div>

                        <span
                          className={`student-status ${
                            student.status ===
                            "Active"
                              ? "active"
                              : "inactive"
                          }`}
                        >
                          {
                            student.status
                          }
                        </span>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            <div className="dashboard-panel">
              <div className="dashboard-panel-header">
                <div>
                  <span className="dashboard-panel-label">
                    SCHEDULE
                  </span>

                  <h2>
                    Today's Timetable
                  </h2>
                </div>

                <button
                  type="button"
                  className="dashboard-panel-link"
                  onClick={
                    handleViewTimetable
                  }
                >
                  View timetable
                  <FiArrowUpRight />
                </button>
              </div>

              {dashboardData
                .todayTimetable
                .length === 0 ? (
                <div className="dashboard-empty-state">
                  <FiCalendar />

                  <strong>
                    No timetable available
                  </strong>

                  <span>
                    Today's schedule will
                    appear here.
                  </span>
                </div>
              ) : (
                <div className="timetable-list">
                  {dashboardData.todayTimetable.map(
                    (
                      item,
                      index
                    ) => (
                      <div
                        className="timetable-row"
                        key={
                          item._id ||
                          index
                        }
                        onClick={() =>
                          goTo(
                            "/timetable"
                          )
                        }
                        style={{
                          cursor:
                            "pointer",
                        }}
                      >
                        <span>
                          {item.startTime &&
                          item.endTime
                            ? `${item.startTime} - ${item.endTime}`
                            : item.time ||
                              "—"}
                        </span>

                        <div>
                          <strong>
                            {item.subjectName ||
                              item.subject ||
                              "Subject"}
                          </strong>

                          <small>
                            {item.className ||
                              "Class"}{" "}
                            {item.section
                              ? `- ${item.section}`
                              : ""}
                          </small>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;