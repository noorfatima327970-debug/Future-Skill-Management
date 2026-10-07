import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiEdit2,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiUserCheck,
  FiX,
} from "react-icons/fi";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "../styles/Attendance.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const ITEMS_PER_PAGE = 8;

const ATTENDANCE_STATUSES = [
  "Present",
  "Absent",
  "Late",
  "Leave",
];

const getTodayDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const initialForm = {
  studentId: "",
  studentName: "",
  className: "",
  section: "",
  date: getTodayDate(),
  status: "Present",
  remarks: "",
};

const Attendance = () => {
  const [attendances, setAttendances] = useState([]);
  const [students, setStudents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(true);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [classFilter, setClassFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [editingAttendance, setEditingAttendance] = useState(null);
  const [deletingAttendance, setDeletingAttendance] = useState(null);

  const [form, setForm] = useState(initialForm);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchAttendances = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/api/attendance`,
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setAttendances(response.data.attendances || []);
      } else {
        setError(
          response.data.message ||
            "Failed to load attendance."
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load attendance. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      setStudentsLoading(true);

      const response = await axios.get(
        `${API_URL}/api/students`,
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setStudents(response.data.students || []);
      }
    } catch (err) {
      console.error(
        "Fetch Attendance Students Error:",
        err
      );
    } finally {
      setStudentsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendances();
    fetchStudents();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    dateFilter,
    classFilter,
    statusFilter,
  ]);

  const classNames = useMemo(() => {
    return [
      ...new Set(
        [
          ...students.map(
            (student) => student.className
          ),
          ...attendances.map(
            (item) => item.className
          ),
        ].filter(Boolean)
      ),
    ].sort();
  }, [students, attendances]);

  const filteredAttendances = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return attendances.filter((item) => {
      const searchableText = [
        item.studentName,
        item.className,
        item.section,
        item.status,
        item.remarks,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const itemDate = item.date
        ? new Date(item.date)
            .toISOString()
            .split("T")[0]
        : "";

      const matchesSearch =
        !searchValue ||
        searchableText.includes(searchValue);

      const matchesDate =
        !dateFilter ||
        itemDate === dateFilter;

      const matchesClass =
        classFilter === "All" ||
        item.className === classFilter;

      const matchesStatus =
        statusFilter === "All" ||
        item.status === statusFilter;

      return (
        matchesSearch &&
        matchesDate &&
        matchesClass &&
        matchesStatus
      );
    });
  }, [
    attendances,
    search,
    dateFilter,
    classFilter,
    statusFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredAttendances.length /
        ITEMS_PER_PAGE
    )
  );

  const paginatedAttendances =
    filteredAttendances.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const presentCount = attendances.filter(
    (item) => item.status === "Present"
  ).length;

  const absentCount = attendances.filter(
    (item) => item.status === "Absent"
  ).length;

  const lateCount = attendances.filter(
    (item) => item.status === "Late"
  ).length;

  const leaveCount = attendances.filter(
    (item) => item.status === "Leave"
  ).length;

  const openAddModal = () => {
    setEditingAttendance(null);

    setForm({
      ...initialForm,
      date: getTodayDate(),
    });

    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingAttendance(item);

    setForm({
      studentId:
        item.studentId?._id ||
        item.studentId ||
        "",
      studentName: item.studentName || "",
      className: item.className || "",
      section: item.section || "",
      date: item.date
        ? new Date(item.date)
            .toISOString()
            .split("T")[0]
        : "",
      status: item.status || "Present",
      remarks: item.remarks || "",
    });

    setFormError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setIsModalOpen(false);
    setEditingAttendance(null);
    setForm({
      ...initialForm,
      date: getTodayDate(),
    });
    setFormError("");
  };

  const handleStudentChange = (event) => {
    const studentId = event.target.value;

    const selectedStudent = students.find(
      (student) => student._id === studentId
    );

    setForm((previous) => ({
      ...previous,
      studentId,
      studentName: selectedStudent?.name || "",
      className:
        selectedStudent?.className || "",
      section:
        selectedStudent?.section || "",
    }));
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetFormAndClose = () => {
    setIsModalOpen(false);
    setEditingAttendance(null);
    setForm({
      ...initialForm,
      date: getTodayDate(),
    });
    setFormError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    if (
      !form.studentId ||
      !form.studentName.trim() ||
      !form.className.trim() ||
      !form.section.trim() ||
      !form.date ||
      !form.status
    ) {
      setFormError(
        "Please fill all required attendance fields."
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        studentId: form.studentId,
        studentName: form.studentName.trim(),
        className: form.className.trim(),
        section: form.section
          .trim()
          .toUpperCase(),
        date: form.date,
        status: form.status,
        remarks: form.remarks.trim(),
      };

      let response;

      if (editingAttendance) {
        response = await axios.put(
          `${API_URL}/api/attendance/${editingAttendance._id}`,
          payload,
          {
            withCredentials: true,
          }
        );
      } else {
        response = await axios.post(
          `${API_URL}/api/attendance`,
          payload,
          {
            withCredentials: true,
          }
        );
      }

      if (response.data.success) {
        await fetchAttendances();

        // Directly close after successful request.
        // closeModal() is intentionally not used here
        // because saving is still true at this point.
        resetFormAndClose();
      } else {
        setFormError(
          response.data.message ||
            "Failed to save attendance."
        );
      }
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
          "Failed to save attendance."
      );
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (item) => {
    setDeletingAttendance(item);
    setIsDeleteModalOpen(true);
    setError("");
  };

  const closeDeleteModal = () => {
    if (deleting) return;

    setDeletingAttendance(null);
    setIsDeleteModalOpen(false);
  };

  const resetDeleteModal = () => {
    setDeletingAttendance(null);
    setIsDeleteModalOpen(false);
  };

  const handleDelete = async () => {
    if (!deletingAttendance) return;

    try {
      setDeleting(true);
      setError("");

      const response = await axios.delete(
        `${API_URL}/api/attendance/${deletingAttendance._id}`,
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        await fetchAttendances();

        // Directly close after successful deletion.
        // closeDeleteModal() is intentionally not used here
        // because deleting is still true at this point.
        resetDeleteModal();
      } else {
        setError(
          response.data.message ||
            "Failed to delete attendance."
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to delete attendance."
      );

      resetDeleteModal();
    } finally {
      setDeleting(false);
    }
  };

  const handleRefresh = async () => {
    await Promise.all([
      fetchAttendances(),
      fetchStudents(),
    ]);
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  return (
    <div className="attendance-page">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() =>
          setIsSidebarOpen(false)
        }
      />

      {isSidebarOpen && (
        <div
          className="attendance-mobile-overlay"
          onClick={() =>
            setIsSidebarOpen(false)
          }
        ></div>
      )}

      <main className="attendance-main">
        <Topbar
          onMenuClick={() =>
            setIsSidebarOpen(true)
          }
        />

        <div className="attendance-content">
          <div className="attendance-page-header">
            <div>
              <span className="attendance-eyebrow">
                STUDENT MANAGEMENT
              </span>

              <h1>Attendance</h1>

              <p>
                Track and manage daily student
                attendance records.
              </p>
            </div>

            <button
              type="button"
              className="attendance-add-button"
              onClick={openAddModal}
            >
              <FiPlus />
              Mark Attendance
            </button>
          </div>

          <div className="attendance-stats">
            <div className="attendance-stat-card">
              <div className="attendance-stat-icon">
                <FiUserCheck />
              </div>

              <div>
                <span>Total Records</span>

                <strong>
                  {attendances.length}
                </strong>
              </div>
            </div>

            <div className="attendance-stat-card">
              <div className="attendance-stat-icon present">
                <FiCheckCircle />
              </div>

              <div>
                <span>Present</span>

                <strong>
                  {presentCount}
                </strong>
              </div>
            </div>

            <div className="attendance-stat-card">
              <div className="attendance-stat-icon late">
                <FiClock />
              </div>

              <div>
                <span>Late</span>

                <strong>{lateCount}</strong>
              </div>
            </div>

            <div className="attendance-stat-card">
              <div className="attendance-stat-icon absent">
                <FiCalendar />
              </div>

              <div>
                <span>Absent / Leave</span>

                <strong>
                  {absentCount + leaveCount}
                </strong>
              </div>
            </div>
          </div>

          <section className="attendance-card">
            <div className="attendance-toolbar">
              <div className="attendance-search">
                <FiSearch />

                <input
                  type="text"
                  placeholder="Search student, class or section..."
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="attendance-filters">
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(event) =>
                    setDateFilter(
                      event.target.value
                    )
                  }
                />

                <select
                  value={classFilter}
                  onChange={(event) =>
                    setClassFilter(
                      event.target.value
                    )
                  }
                >
                  <option value="All">
                    All Classes
                  </option>

                  {classNames.map(
                    (className) => (
                      <option
                        key={className}
                        value={className}
                      >
                        {className}
                      </option>
                    )
                  )}
                </select>

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(
                      event.target.value
                    )
                  }
                >
                  <option value="All">
                    All Status
                  </option>

                  {ATTENDANCE_STATUSES.map(
                    (status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {status}
                      </option>
                    )
                  )}
                </select>

                <button
                  type="button"
                  className="attendance-refresh"
                  onClick={handleRefresh}
                  disabled={
                    loading ||
                    studentsLoading
                  }
                  aria-label="Refresh attendance"
                >
                  <FiRefreshCw
                    className={
                      loading
                        ? "attendance-refresh-spin"
                        : ""
                    }
                  />
                </button>
              </div>
            </div>

            {error && (
              <div
                className="attendance-error"
                role="alert"
              >
                <span>{error}</span>

                <button
                  type="button"
                  onClick={() => setError("")}
                  aria-label="Close error"
                >
                  <FiX />
                </button>
              </div>
            )}

            {loading ? (
              <div className="attendance-loading">
                <div className="attendance-loader"></div>

                <span>
                  Loading attendance...
                </span>
              </div>
            ) : paginatedAttendances.length ===
              0 ? (
              <div className="attendance-empty">
                <div className="attendance-empty-icon">
                  <FiUserCheck />
                </div>

                <h3>
                  {attendances.length === 0
                    ? "No attendance records yet"
                    : "No matching records"}
                </h3>

                <p>
                  {attendances.length === 0
                    ? "Mark your first student attendance record to get started."
                    : "Try changing your search or filters."}
                </p>

                {attendances.length === 0 && (
                  <button
                    type="button"
                    onClick={openAddModal}
                  >
                    <FiPlus />
                    Mark Attendance
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="attendance-table-wrapper">
                  <table className="attendance-table">
                    <thead>
                      <tr>
                        <th>STUDENT</th>
                        <th>CLASS</th>
                        <th>DATE</th>
                        <th>STATUS</th>
                        <th>REMARKS</th>
                        <th>ACTIONS</th>
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedAttendances.map(
                        (item) => (
                          <tr key={item._id}>
                            <td>
                              <div className="attendance-student">
                                <div className="attendance-avatar">
                                  {item.studentName
                                    ?.charAt(0)
                                    .toUpperCase()}
                                </div>

                                <div>
                                  <strong>
                                    {
                                      item.studentName
                                    }
                                  </strong>

                                  <span>
                                    Student
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td>
                              <div className="attendance-class">
                                <strong>
                                  {item.className}
                                </strong>

                                <span>
                                  Section{" "}
                                  {item.section}
                                </span>
                              </div>
                            </td>

                            <td>
                              <span className="attendance-date">
                                {formatDate(
                                  item.date
                                )}
                              </span>
                            </td>

                            <td>
                              <span
                                className={`attendance-status ${
                                  item.status
                                    ?.toLowerCase()
                                    .replace(
                                      /\s+/g,
                                      "-"
                                    ) || ""
                                }`}
                              >
                                {item.status}
                              </span>
                            </td>

                            <td>
                              <span className="attendance-remarks">
                                {item.remarks ||
                                  "—"}
                              </span>
                            </td>

                            <td>
                              <div className="attendance-actions">
                                <button
                                  type="button"
                                  className="attendance-edit-button"
                                  onClick={() =>
                                    openEditModal(
                                      item
                                    )
                                  }
                                  aria-label="Edit attendance"
                                >
                                  <FiEdit2 />
                                </button>

                                <button
                                  type="button"
                                  className="attendance-delete-button"
                                  onClick={() =>
                                    openDeleteModal(
                                      item
                                    )
                                  }
                                  aria-label="Delete attendance"
                                >
                                  <FiTrash2 />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="attendance-pagination">
                  <span>
                    Showing{" "}
                    {filteredAttendances.length ===
                    0
                      ? 0
                      : (currentPage - 1) *
                          ITEMS_PER_PAGE +
                        1}{" "}
                    to{" "}
                    {Math.min(
                      currentPage *
                        ITEMS_PER_PAGE,
                      filteredAttendances.length
                    )}{" "}
                    of{" "}
                    {filteredAttendances.length}
                  </span>

                  <div>
                    <button
                      type="button"
                      disabled={
                        currentPage === 1
                      }
                      onClick={() =>
                        setCurrentPage(
                          (page) => page - 1
                        )
                      }
                    >
                      Previous
                    </button>

                    <span className="attendance-page-number">
                      {currentPage} /{" "}
                      {totalPages}
                    </span>

                    <button
                      type="button"
                      disabled={
                        currentPage ===
                        totalPages
                      }
                      onClick={() =>
                        setCurrentPage(
                          (page) => page + 1
                        )
                      }
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </main>

      {isModalOpen && (
        <div className="attendance-modal-overlay">
          <div className="attendance-modal">
            <div className="attendance-modal-header">
              <div>
                <span>
                  ATTENDANCE MANAGEMENT
                </span>

                <h2>
                  {editingAttendance
                    ? "Edit Attendance"
                    : "Mark Attendance"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                aria-label="Close modal"
              >
                <FiX />
              </button>
            </div>

            <form
              className="attendance-form"
              onSubmit={handleSubmit}
            >
              {formError && (
                <div className="attendance-form-error">
                  {formError}
                </div>
              )}

              <div className="attendance-form-grid">
                <div className="attendance-form-group attendance-form-full">
                  <label htmlFor="studentId">
                    Student *
                  </label>

                  <select
                    id="studentId"
                    name="studentId"
                    value={form.studentId}
                    onChange={
                      handleStudentChange
                    }
                    disabled={
                      saving ||
                      studentsLoading
                    }
                  >
                    <option value="">
                      {studentsLoading
                        ? "Loading students..."
                        : "Select student"}
                    </option>

                    {students.map(
                      (student) => (
                        <option
                          key={student._id}
                          value={student._id}
                        >
                          {student.name} —{" "}
                          {student.className}{" "}
                          {student.section}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="attendance-form-group">
                  <label htmlFor="className">
                    Class *
                  </label>

                  <input
                    id="className"
                    name="className"
                    type="text"
                    value={form.className}
                    readOnly
                    placeholder="Student class"
                    disabled={saving}
                  />
                </div>

                <div className="attendance-form-group">
                  <label htmlFor="section">
                    Section *
                  </label>

                  <input
                    id="section"
                    name="section"
                    type="text"
                    value={form.section}
                    readOnly
                    placeholder="Student section"
                    disabled={saving}
                  />
                </div>

                <div className="attendance-form-group">
                  <label htmlFor="date">
                    Date *
                  </label>

                  <input
                    id="date"
                    name="date"
                    type="date"
                    value={form.date}
                    onChange={handleFormChange}
                    disabled={saving}
                  />
                </div>

                <div className="attendance-form-group">
                  <label htmlFor="status">
                    Status *
                  </label>

                  <select
                    id="status"
                    name="status"
                    value={form.status}
                    onChange={handleFormChange}
                    disabled={saving}
                  >
                    {ATTENDANCE_STATUSES.map(
                      (status) => (
                        <option
                          key={status}
                          value={status}
                        >
                          {status}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="attendance-form-group attendance-form-full">
                  <label htmlFor="remarks">
                    Remarks
                  </label>

                  <textarea
                    id="remarks"
                    name="remarks"
                    rows="3"
                    placeholder="Optional attendance remarks..."
                    value={form.remarks}
                    onChange={handleFormChange}
                    disabled={saving}
                  ></textarea>
                </div>
              </div>

              <div className="attendance-modal-actions">
                <button
                  type="button"
                  className="attendance-cancel-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="attendance-save-button"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="attendance-button-spinner"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiCheckCircle />

                      {editingAttendance
                        ? "Update Attendance"
                        : "Save Attendance"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen &&
        deletingAttendance && (
          <div className="attendance-modal-overlay">
            <div className="attendance-delete-modal">
              <div className="attendance-delete-icon">
                <FiTrash2 />
              </div>

              <h2>
                Delete Attendance?
              </h2>

              <p>
                Are you sure you want to delete
                the attendance record for{" "}
                <strong>
                  {
                    deletingAttendance.studentName
                  }
                </strong>{" "}
                on{" "}
                <strong>
                  {formatDate(
                    deletingAttendance.date
                  )}
                </strong>
                ?
              </p>

              <div className="attendance-delete-actions">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  disabled={deleting}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting
                    ? "Deleting..."
                    : "Delete Attendance"}
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default Attendance;