import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FiAlertCircle,
  FiBarChart2,
  FiBookOpen,
  FiCalendar,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiDollarSign,
  FiFileText,
  FiRefreshCw,
  FiSearch,
  FiUsers,
  FiXCircle,
} from "react-icons/fi";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

import "../styles/Reports.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

const ITEMS_PER_PAGE = 8;

const Reports = () => {
  const [activeReport, setActiveReport] =
    useState("summary");

  const [summary, setSummary] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [fees, setFees] = useState([]);
  const [results, setResults] = useState([]);
  const [classes, setClasses] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [className, setClassName] =
    useState("");
  const [section, setSection] = useState("");
  const [startDate, setStartDate] =
    useState("");
  const [endDate, setEndDate] =
    useState("");
  const [month, setMonth] = useState("");

  const [page, setPage] = useState(1);

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const buildParams = () => {
    const params = {};

    if (search.trim()) {
      params.search = search.trim();
    }

    if (status) {
      params.status = status;
    }

    if (className) {
      params.className = className;
    }

    if (section) {
      params.section = section;
    }

    if (startDate) {
      params.startDate = startDate;
    }

    if (endDate) {
      params.endDate = endDate;
    }

    if (month) {
      params.month = month;
    }

    return params;
  };

  const loadReport = async (
    reportType = activeReport
  ) => {
    try {
      setLoading(true);
      setError("");

      const params = buildParams();

      let endpoint = "";

      switch (reportType) {
        case "students":
          endpoint = "/api/reports/students";
          break;

        case "attendance":
          endpoint =
            "/api/reports/attendance";
          break;

        case "fees":
          endpoint = "/api/reports/fees";
          break;

        case "results":
          endpoint =
            "/api/reports/results";
          break;

        case "classes":
          endpoint =
            "/api/reports/classes";
          break;

        default:
          endpoint =
            "/api/reports/summary";
      }

      const response = await api.get(
        endpoint,
        { params }
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message ||
            "Failed to load report"
        );
      }

      if (reportType === "summary") {
        setSummary(response.data.summary);
      }

      if (reportType === "students") {
        setStudents(
          response.data.students || []
        );
      }

      if (reportType === "attendance") {
        setAttendance(
          response.data.attendance || []
        );
      }

      if (reportType === "fees") {
        setFees(response.data.fees || []);
      }

      if (reportType === "results") {
        setResults(
          response.data.results || []
        );
      }

      if (reportType === "classes") {
        setClasses(
          response.data.classes || []
        );
      }
    } catch (err) {
      console.error(
        "Report Error:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load report"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport(activeReport);
  }, [activeReport]);

  useEffect(() => {
    setPage(1);
  }, [
    search,
    status,
    className,
    section,
    startDate,
    endDate,
    month,
  ]);

  const handleApplyFilters = () => {
    setPage(1);
    loadReport(activeReport);
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatus("");
    setClassName("");
    setSection("");
    setStartDate("");
    setEndDate("");
    setMonth("");
    setPage(1);

    setTimeout(() => {
      loadReport(activeReport);
    }, 0);
  };

  const handleRefresh = () => {
    loadReport(activeReport);
  };

  const handlePrint = () => {
    window.print();
  };

  const reportItems = useMemo(() => {
    switch (activeReport) {
      case "students":
        return students;

      case "attendance":
        return attendance;

      case "fees":
        return fees;

      case "results":
        return results;

      case "classes":
        return classes;

      default:
        return [];
    }
  }, [
    activeReport,
    students,
    attendance,
    fees,
    results,
    classes,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      reportItems.length /
        ITEMS_PER_PAGE
    )
  );

  const currentItems = reportItems.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const studentStats =
    summary?.students || {
      total: 0,
      active: 0,
      inactive: 0,
    };

  const attendanceStats =
    summary?.attendance || {
      total: 0,
      present: 0,
      absent: 0,
      late: 0,
      leave: 0,
    };

  const feeStats = summary?.fees || {
    records: 0,
    totalFee: 0,
    paidAmount: 0,
    remainingAmount: 0,
  };

  const resultStats =
    summary?.results || {
      total: 0,
      pass: 0,
      fail: 0,
      averagePercentage: 0,
    };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatCurrency = (amount) => {
    return `₨ ${Number(
      amount || 0
    ).toLocaleString()}`;
  };

  const getStatusClass = (value) => {
    if (!value) return "";

    return value
      .toLowerCase()
      .replace(/\s+/g, "-");
  };

  const renderSummary = () => {
    if (!summary) {
      return (
        <div className="reports-empty">
          {loading
            ? "Loading summary..."
            : "No summary data available."}
        </div>
      );
    }

    return (
      <>
        <div className="reports-stat-grid">
          <div className="report-stat-card">
            <div className="report-stat-icon students">
              <FiUsers />
            </div>

            <div>
              <span>Total Students</span>
              <strong>
                {studentStats.total}
              </strong>
              <small>
                {studentStats.active} active
              </small>
            </div>
          </div>

          <div className="report-stat-card">
            <div className="report-stat-icon attendance">
              <FiCheckCircle />
            </div>

            <div>
              <span>Attendance Records</span>
              <strong>
                {attendanceStats.total}
              </strong>
              <small>
                {attendanceStats.present} present
              </small>
            </div>
          </div>

          <div className="report-stat-card">
            <div className="report-stat-icon fees">
              <FiDollarSign />
            </div>

            <div>
              <span>Fee Collection</span>
              <strong>
                {formatCurrency(
                  feeStats.paidAmount
                )}
              </strong>
              <small>
                {formatCurrency(
                  feeStats.remainingAmount
                )}{" "}
                outstanding
              </small>
            </div>
          </div>

          <div className="report-stat-card">
            <div className="report-stat-icon results">
              <FiBarChart2 />
            </div>

            <div>
              <span>Average Result</span>
              <strong>
                {resultStats.averagePercentage}%
              </strong>
              <small>
                {resultStats.pass} passed
              </small>
            </div>
          </div>
        </div>

        <div className="reports-summary-grid">
          <div className="reports-panel">
            <div className="reports-panel-header">
              <div>
                <h3>Student Overview</h3>
                <p>
                  Current student statistics
                </p>
              </div>
            </div>

            <div className="overview-list">
              <div>
                <span>Total Students</span>
                <strong>
                  {studentStats.total}
                </strong>
              </div>

              <div>
                <span>Active Students</span>
                <strong>
                  {studentStats.active}
                </strong>
              </div>

              <div>
                <span>Inactive Students</span>
                <strong>
                  {studentStats.inactive}
                </strong>
              </div>
            </div>
          </div>

          <div className="reports-panel">
            <div className="reports-panel-header">
              <div>
                <h3>Attendance Overview</h3>
                <p>
                  Attendance record breakdown
                </p>
              </div>
            </div>

            <div className="overview-list">
              <div>
                <span>Present</span>
                <strong>
                  {attendanceStats.present}
                </strong>
              </div>

              <div>
                <span>Absent</span>
                <strong>
                  {attendanceStats.absent}
                </strong>
              </div>

              <div>
                <span>Late</span>
                <strong>
                  {attendanceStats.late}
                </strong>
              </div>

              <div>
                <span>Leave</span>
                <strong>
                  {attendanceStats.leave}
                </strong>
              </div>
            </div>
          </div>

          <div className="reports-panel">
            <div className="reports-panel-header">
              <div>
                <h3>Fee Overview</h3>
                <p>
                  Overall fee collection
                </p>
              </div>
            </div>

            <div className="overview-list">
              <div>
                <span>Total Fee</span>
                <strong>
                  {formatCurrency(
                    feeStats.totalFee
                  )}
                </strong>
              </div>

              <div>
                <span>Collected</span>
                <strong>
                  {formatCurrency(
                    feeStats.paidAmount
                  )}
                </strong>
              </div>

              <div>
                <span>Outstanding</span>
                <strong>
                  {formatCurrency(
                    feeStats.remainingAmount
                  )}
                </strong>
              </div>
            </div>
          </div>

          <div className="reports-panel">
            <div className="reports-panel-header">
              <div>
                <h3>Result Overview</h3>
                <p>
                  Overall examination results
                </p>
              </div>
            </div>

            <div className="overview-list">
              <div>
                <span>Total Results</span>
                <strong>
                  {resultStats.total}
                </strong>
              </div>

              <div>
                <span>Passed</span>
                <strong>
                  {resultStats.pass}
                </strong>
              </div>

              <div>
                <span>Failed</span>
                <strong>
                  {resultStats.fail}
                </strong>
              </div>

              <div>
                <span>Average</span>
                <strong>
                  {resultStats.averagePercentage}%
                </strong>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderStudentReport = () => (
    <ReportTable
      title="Student Report"
      description="Complete student records"
    >
      <table>
        <thead>
          <tr>
            <th>Student</th>
            <th>Admission No.</th>
            <th>Father Name</th>
            <th>Class</th>
            <th>Gender</th>
            <th>Admission Date</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {currentItems.map((student) => (
            <tr key={student._id}>
              <td>
                <div className="table-person">
                  <div className="table-avatar">
                    {student.name
                      ?.charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <strong>
                      {student.name}
                    </strong>
                    <span>
                      {student.studentId}
                    </span>
                  </div>
                </div>
              </td>

              <td>
                {student.admissionNo ||
                  "-"}
              </td>

              <td>
                {student.fatherName || "-"}
              </td>

              <td>
                {student.className} -{" "}
                {student.section}
              </td>

              <td>
                {student.gender || "-"}
              </td>

              <td>
                {formatDate(
                  student.admissionDate
                )}
              </td>

              <td>
                <span
                  className={`status-badge ${getStatusClass(
                    student.status
                  )}`}
                >
                  {student.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </ReportTable>
  );

  const renderAttendanceReport = () => (
    <ReportTable
      title="Attendance Report"
      description="Student attendance records"
    >
      <table>
        <thead>
          <tr>
            <th>Student</th>
            <th>Class</th>
            <th>Date</th>
            <th>Status</th>
            <th>Remarks</th>
          </tr>
        </thead>

        <tbody>
          {currentItems.map((item) => (
            <tr key={item._id}>
              <td>
                <strong>
                  {item.studentName}
                </strong>
              </td>

              <td>
                {item.className} -{" "}
                {item.section}
              </td>

              <td>
                {formatDate(item.date)}
              </td>

              <td>
                <span
                  className={`status-badge ${getStatusClass(
                    item.status
                  )}`}
                >
                  {item.status}
                </span>
              </td>

              <td>
                {item.remarks || "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </ReportTable>
  );

  const renderFeeReport = () => (
    <ReportTable
      title="Fee Report"
      description="Student fee collection records"
    >
      <table>
        <thead>
          <tr>
            <th>Student</th>
            <th>Class</th>
            <th>Month</th>
            <th>Total Fee</th>
            <th>Paid</th>
            <th>Remaining</th>
            <th>Due Date</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {currentItems.map((fee) => (
            <tr key={fee._id}>
              <td>
                <strong>
                  {fee.studentName}
                </strong>
              </td>

              <td>
                {fee.className} -{" "}
                {fee.section}
              </td>

              <td>{fee.month}</td>

              <td>
                {formatCurrency(
                  fee.totalFee
                )}
              </td>

              <td className="amount-positive">
                {formatCurrency(
                  fee.paidAmount
                )}
              </td>

              <td className="amount-negative">
                {formatCurrency(
                  fee.remainingAmount
                )}
              </td>

              <td>
                {formatDate(fee.dueDate)}
              </td>

              <td>
                <span
                  className={`status-badge ${getStatusClass(
                    fee.status
                  )}`}
                >
                  {fee.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </ReportTable>
  );

  const renderResultReport = () => (
    <ReportTable
      title="Exam & Result Report"
      description="Student examination performance"
    >
      <table>
        <thead>
          <tr>
            <th>Student</th>
            <th>Exam</th>
            <th>Subject</th>
            <th>Class</th>
            <th>Marks</th>
            <th>Percentage</th>
            <th>Grade</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {currentItems.map((result) => (
            <tr key={result._id}>
              <td>
                <strong>
                  {result.studentName}
                </strong>
              </td>

              <td>{result.examName}</td>

              <td>
                {result.subjectName}
              </td>

              <td>
                {result.className} -{" "}
                {result.section}
              </td>

              <td>
                {result.obtainedMarks} /{" "}
                {result.totalMarks}
              </td>

              <td>
                {Number(
                  result.percentage || 0
                ).toFixed(2)}
                %
              </td>

              <td>
                <span className="grade-badge">
                  {result.grade}
                </span>
              </td>

              <td>
                <span
                  className={`status-badge ${getStatusClass(
                    result.status
                  )}`}
                >
                  {result.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </ReportTable>
  );

  const renderClassReport = () => (
    <ReportTable
      title="Class-wise Report"
      description="Class capacity and student statistics"
    >
      <table>
        <thead>
          <tr>
            <th>Class</th>
            <th>Section</th>
            <th>Class Teacher</th>
            <th>Room</th>
            <th>Capacity</th>
            <th>Students</th>
            <th>Active</th>
            <th>Available Seats</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {currentItems.map((item) => (
            <tr key={item._id}>
              <td>
                <strong>
                  {item.className}
                </strong>
              </td>

              <td>{item.section}</td>

              <td>
                {item.classTeacher || "-"}
              </td>

              <td>
                {item.roomNumber || "-"}
              </td>

              <td>{item.capacity}</td>

              <td>
                {item.totalStudents}
              </td>

              <td>
                {item.activeStudents}
              </td>

              <td>
                {item.availableSeats}
              </td>

              <td>
                <span
                  className={`status-badge ${getStatusClass(
                    item.status
                  )}`}
                >
                  {item.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </ReportTable>
  );

  const renderReport = () => {
    if (loading) {
      return (
        <div className="reports-loading">
          <FiRefreshCw className="spin" />
          <span>
            Generating report...
          </span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="reports-error">
          <FiAlertCircle />
          <div>
            <strong>
              Unable to load report
            </strong>
            <p>{error}</p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
          >
            Try Again
          </button>
        </div>
      );
    }

    if (
      activeReport !== "summary" &&
      reportItems.length === 0
    ) {
      return (
        <div className="reports-empty">
          <FiFileText />
          <h3>No records found</h3>
          <p>
            No data matches the selected
            filters.
          </p>
        </div>
      );
    }

    switch (activeReport) {
      case "students":
        return renderStudentReport();

      case "attendance":
        return renderAttendanceReport();

      case "fees":
        return renderFeeReport();

      case "results":
        return renderResultReport();

      case "classes":
        return renderClassReport();

      default:
        return renderSummary();
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() =>
          setSidebarOpen(false)
        }
      />

      <div className="dashboard-main">
        <Topbar
          onMenuClick={() =>
            setSidebarOpen(true)
          }
        />

        <main className="reports-page">
          <div className="reports-header">
            <div>
              <span className="reports-eyebrow">
                Management Reports
              </span>

              <h1>Reports</h1>

              <p>
                Analyze students, attendance,
                fees, exams and class
                performance.
              </p>
            </div>

            <div className="reports-header-actions">
              <button
                type="button"
                className="reports-secondary-btn"
                onClick={handleRefresh}
              >
                <FiRefreshCw />
                Refresh
              </button>

              <button
                type="button"
                className="reports-primary-btn"
                onClick={handlePrint}
              >
                <FiFileText />
                Print Report
              </button>
            </div>
          </div>

          <div className="report-tabs">
            <button
              type="button"
              className={
                activeReport === "summary"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveReport("summary")
              }
            >
              <FiBarChart2 />
              Summary
            </button>

            <button
              type="button"
              className={
                activeReport === "students"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveReport("students")
              }
            >
              <FiUsers />
              Students
            </button>

            <button
              type="button"
              className={
                activeReport === "attendance"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveReport("attendance")
              }
            >
              <FiCheckCircle />
              Attendance
            </button>

            <button
              type="button"
              className={
                activeReport === "fees"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveReport("fees")
              }
            >
              <FiDollarSign />
              Fees
            </button>

            <button
              type="button"
              className={
                activeReport === "results"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveReport("results")
              }
            >
              <FiBarChart2 />
              Results
            </button>

            <button
              type="button"
              className={
                activeReport === "classes"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveReport("classes")
              }
            >
              <FiBookOpen />
              Classes
            </button>
          </div>

          {activeReport !== "summary" && (
            <div className="reports-filters">
              <div className="report-search">
                <FiSearch />
                <input
                  type="text"
                  placeholder="Search report..."
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                />
              </div>

              <select
                value={className}
                onChange={(event) =>
                  setClassName(
                    event.target.value
                  )
                }
              >
                <option value="">
                  All Classes
                </option>

                {[
                  ...new Set(
                    classes.map(
                      (item) =>
                        item.className
                    )
                  ),
                ].map((name) => (
                  <option
                    key={name}
                    value={name}
                  >
                    {name}
                  </option>
                ))}
              </select>

              {(activeReport ===
                "students" ||
                activeReport ===
                  "attendance" ||
                activeReport ===
                  "fees" ||
                activeReport ===
                  "results") && (
                <select
                  value={section}
                  onChange={(event) =>
                    setSection(
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    All Sections
                  </option>

                  {[
                    ...new Set(
                      classes
                        .filter(
                          (item) =>
                            !className ||
                            item.className ===
                              className
                        )
                        .map(
                          (item) =>
                            item.section
                        )
                    ),
                  ].map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      Section {item}
                    </option>
                  ))}
                </select>
              )}

              {activeReport !==
                "classes" && (
                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    All Status
                  </option>

                  {activeReport ===
                    "students" && (
                    <>
                      <option value="Active">
                        Active
                      </option>
                      <option value="Inactive">
                        Inactive
                      </option>
                    </>
                  )}

                  {activeReport ===
                    "attendance" && (
                    <>
                      <option value="Present">
                        Present
                      </option>
                      <option value="Absent">
                        Absent
                      </option>
                      <option value="Late">
                        Late
                      </option>
                      <option value="Leave">
                        Leave
                      </option>
                    </>
                  )}

                  {activeReport ===
                    "fees" && (
                    <>
                      <option value="Paid">
                        Paid
                      </option>
                      <option value="Partial">
                        Partial
                      </option>
                      <option value="Unpaid">
                        Unpaid
                      </option>
                      <option value="Overdue">
                        Overdue
                      </option>
                    </>
                  )}

                  {activeReport ===
                    "results" && (
                    <>
                      <option value="Pass">
                        Pass
                      </option>
                      <option value="Fail">
                        Fail
                      </option>
                    </>
                  )}
                </select>
              )}

              {activeReport ===
                "attendance" && (
                <>
                  <div className="date-input">
                    <FiCalendar />
                    <input
                      type="date"
                      value={startDate}
                      onChange={(event) =>
                        setStartDate(
                          event.target.value
                        )
                      }
                    />
                  </div>

                  <div className="date-input">
                    <FiCalendar />
                    <input
                      type="date"
                      value={endDate}
                      onChange={(event) =>
                        setEndDate(
                          event.target.value
                        )
                      }
                    />
                  </div>
                </>
              )}

              {activeReport === "fees" && (
                <input
                  className="month-input"
                  type="text"
                  placeholder="Fee month"
                  value={month}
                  onChange={(event) =>
                    setMonth(
                      event.target.value
                    )
                  }
                />
              )}

              <button
                type="button"
                className="filter-apply-btn"
                onClick={handleApplyFilters}
              >
                Apply
              </button>

              <button
                type="button"
                className="filter-clear-btn"
                onClick={
                  handleClearFilters
                }
              >
                <FiX />
              </button>
            </div>
          )}

          <div className="reports-content">
            {renderReport()}
          </div>

          {activeReport !== "summary" &&
            reportItems.length > 0 && (
              <div className="reports-pagination">
                <span>
                  Showing{" "}
                  {(page - 1) *
                    ITEMS_PER_PAGE +
                    1}{" "}
                  to{" "}
                  {Math.min(
                    page *
                      ITEMS_PER_PAGE,
                    reportItems.length
                  )}{" "}
                  of {reportItems.length}
                </span>

                <div>
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() =>
                      setPage(
                        (current) =>
                          current - 1
                      )
                    }
                  >
                    <FiChevronLeft />
                  </button>

                  <strong>
                    {page}
                  </strong>

                  <span>
                    / {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={
                      page === totalPages
                    }
                    onClick={() =>
                      setPage(
                        (current) =>
                          current + 1
                      )
                    }
                  >
                    <FiChevronRight />
                  </button>
                </div>
              </div>
            )}
        </main>
      </div>
    </div>
  );
};

const ReportTable = ({
  title,
  description,
  children,
}) => {
  return (
    <div className="reports-panel report-table-panel">
      <div className="reports-panel-header">
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>

      <div className="report-table-wrapper">
        {children}
      </div>
    </div>
  );
};

export default Reports;