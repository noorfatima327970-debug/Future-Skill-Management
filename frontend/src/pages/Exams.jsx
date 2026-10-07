import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FiAlertCircle,
  FiBookOpen,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiEdit2,
  FiFilter,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiX,
  FiXCircle,
} from "react-icons/fi";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "../styles/Exams.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const EXAM_TYPES = [
  "Monthly Test",
  "Mid Term",
  "Final Term",
  "Quiz",
  "Assessment",
  "Other",
];

const EXAM_STATUSES = [
  "Scheduled",
  "Completed",
  "Cancelled",
];

const ITEMS_PER_PAGE = 8;

const emptyForm = {
  examName: "",
  examType: "Monthly Test",
  className: "",
  section: "",
  subjectName: "",
  examDate: "",
  totalMarks: "",
  passingMarks: "",
  status: "Scheduled",
  remarks: "",
};

const Exams = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [exams, setExams] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] =
    useState(false);

  const [editingExam, setEditingExam] = useState(null);
  const [deletingExam, setDeletingExam] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const fetchExams = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/api/exams`,
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setExams(response.data.exams || []);
      } else {
        setError(
          response.data.message || "Failed to load exams"
        );
      }
    } catch (err) {
      console.error("Fetch Exams Error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load exams. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const uniqueClasses = useMemo(() => {
    return [
      ...new Set(
        exams
          .map((exam) => exam.className?.trim())
          .filter(Boolean)
      ),
    ].sort((a, b) => a.localeCompare(b));
  }, [exams]);

  const filteredExams = useMemo(() => {
    const query = search.trim().toLowerCase();

    return exams.filter((exam) => {
      const matchesSearch =
        !query ||
        exam.examName?.toLowerCase().includes(query) ||
        exam.examType?.toLowerCase().includes(query) ||
        exam.className?.toLowerCase().includes(query) ||
        exam.section?.toLowerCase().includes(query) ||
        exam.subjectName
          ?.toLowerCase()
          .includes(query) ||
        exam.remarks?.toLowerCase().includes(query);

      const matchesType =
        !typeFilter ||
        exam.examType === typeFilter;

      const matchesStatus =
        !statusFilter ||
        exam.status === statusFilter;

      const matchesClass =
        !classFilter ||
        exam.className === classFilter;

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus &&
        matchesClass
      );
    });
  }, [
    exams,
    search,
    typeFilter,
    statusFilter,
    classFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredExams.length / ITEMS_PER_PAGE
    )
  );

  const paginatedExams = filteredExams.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    typeFilter,
    statusFilter,
    classFilter,
  ]);

  const stats = useMemo(() => {
    return {
      total: exams.length,

      scheduled: exams.filter(
        (exam) => exam.status === "Scheduled"
      ).length,

      completed: exams.filter(
        (exam) => exam.status === "Completed"
      ).length,

      cancelled: exams.filter(
        (exam) => exam.status === "Cancelled"
      ).length,
    };
  }, [exams]);

  const formatDateForInput = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    const year = parsedDate.getFullYear();

    const month = String(
      parsedDate.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      parsedDate.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const openAddModal = () => {
    setEditingExam(null);
    setForm(emptyForm);
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (exam) => {
    setEditingExam(exam);

    setForm({
      examName: exam.examName || "",
      examType:
        exam.examType || "Monthly Test",
      className: exam.className || "",
      section: exam.section || "",
      subjectName: exam.subjectName || "",
      examDate: formatDateForInput(
        exam.examDate
      ),
      totalMarks:
        exam.totalMarks !== undefined
          ? String(exam.totalMarks)
          : "",
      passingMarks:
        exam.passingMarks !== undefined
          ? String(exam.passingMarks)
          : "",
      status: exam.status || "Scheduled",
      remarks: exam.remarks || "",
    });

    setFormError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setEditingExam(null);
    setForm(emptyForm);
    setFormError("");
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (
      name === "totalMarks" ||
      name === "passingMarks"
    ) {
      setFormError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setFormError("");

    if (
      !form.examName.trim() ||
      !form.examType ||
      !form.className.trim() ||
      !form.section.trim() ||
      !form.subjectName.trim() ||
      !form.examDate ||
      form.totalMarks === "" ||
      form.passingMarks === ""
    ) {
      setFormError(
        "Please fill all required fields."
      );
      return;
    }

    const totalMarks = Number(
      form.totalMarks
    );

    const passingMarks = Number(
      form.passingMarks
    );

    if (
      !Number.isFinite(totalMarks) ||
      totalMarks <= 0
    ) {
      setFormError(
        "Total marks must be greater than 0."
      );
      return;
    }

    if (
      !Number.isFinite(passingMarks) ||
      passingMarks < 0
    ) {
      setFormError(
        "Passing marks cannot be negative."
      );
      return;
    }

    if (passingMarks > totalMarks) {
      setFormError(
        "Passing marks cannot be greater than total marks."
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        examName: form.examName.trim(),

        examType: form.examType,

        className: form.className.trim(),

        section: form.section.trim(),

        subjectName: form.subjectName.trim(),

        examDate: form.examDate,

        totalMarks,

        passingMarks,

        status: form.status,

        remarks: form.remarks.trim(),
      };

      let response;

      if (editingExam) {
        response = await axios.put(
          `${API_URL}/api/exams/${editingExam._id}`,
          payload,
          {
            withCredentials: true,
          }
        );
      } else {
        response = await axios.post(
          `${API_URL}/api/exams`,
          payload,
          {
            withCredentials: true,
          }
        );
      }

      if (!response.data.success) {
        setFormError(
          response.data.message ||
            "Failed to save exam."
        );
        return;
      }

      await fetchExams();

      closeModal();
    } catch (err) {
      console.error(
        "Save Exam Error:",
        err
      );

      setFormError(
        err.response?.data?.message ||
          "Failed to save exam. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (exam) => {
    setDeletingExam(exam);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (saving) return;

    setDeleteModalOpen(false);
    setDeletingExam(null);
  };

  const handleDelete = async () => {
    if (!deletingExam) return;

    try {
      setSaving(true);

      const response = await axios.delete(
        `${API_URL}/api/exams/${deletingExam._id}`,
        {
          withCredentials: true,
        }
      );

      if (!response.data.success) {
        setError(
          response.data.message ||
            "Failed to delete exam."
        );
        return;
      }

      await fetchExams();

      setDeleteModalOpen(false);
      setDeletingExam(null);
    } catch (err) {
      console.error(
        "Delete Exam Error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to delete exam. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const getStatusClass = (status) => {
    if (status === "Completed") {
      return "status-completed";
    }

    if (status === "Cancelled") {
      return "status-cancelled";
    }

    return "status-scheduled";
  };

  const getTypeClass = (type) => {
    if (type === "Final Term") {
      return "type-final";
    }

    if (type === "Mid Term") {
      return "type-mid";
    }

    if (type === "Quiz") {
      return "type-quiz";
    }

    return "type-default";
  };

  const passPercentage =
    form.totalMarks &&
    Number(form.totalMarks) > 0
      ? (
          (Number(form.passingMarks || 0) /
            Number(form.totalMarks)) *
          100
        ).toFixed(1)
      : "0.0";

  return (
    <div className="dashboard-layout">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() =>
          setSidebarOpen(false)
        }
      />

      {sidebarOpen && (
        <div
          className="dashboard-overlay"
          onClick={() =>
            setSidebarOpen(false)
          }
        ></div>
      )}

      <div className="dashboard-main">
        <Topbar
          onMenuClick={() =>
            setSidebarOpen(true)
          }
        />

        <main className="exams-page">
          <div className="exams-page-header">
            <div>
              <span className="exams-page-eyebrow">
                ACADEMIC MANAGEMENT
              </span>

              <h1>Exams</h1>

              <p>
                Create and manage school examinations,
                schedules and marks.
              </p>
            </div>

            <button
              type="button"
              className="exams-primary-btn"
              onClick={openAddModal}
            >
              <FiPlus />
              Add Exam
            </button>
          </div>

          {error && (
            <div className="exams-error-banner">
              <FiAlertCircle />

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

          <section className="exams-stats-grid">
            <div className="exam-stat-card">
              <div className="exam-stat-icon">
                <FiBookOpen />
              </div>

              <div>
                <span>Total Exams</span>
                <strong>{stats.total}</strong>
              </div>
            </div>

            <div className="exam-stat-card">
              <div className="exam-stat-icon scheduled">
                <FiClock />
              </div>

              <div>
                <span>Scheduled</span>
                <strong>
                  {stats.scheduled}
                </strong>
              </div>
            </div>

            <div className="exam-stat-card">
              <div className="exam-stat-icon completed">
                <FiCheckCircle />
              </div>

              <div>
                <span>Completed</span>
                <strong>
                  {stats.completed}
                </strong>
              </div>
            </div>

            <div className="exam-stat-card">
              <div className="exam-stat-icon cancelled">
                <FiXCircle />
              </div>

              <div>
                <span>Cancelled</span>
                <strong>
                  {stats.cancelled}
                </strong>
              </div>
            </div>
          </section>

          <section className="exams-content-card">
            <div className="exams-toolbar">
              <div className="exams-search">
                <FiSearch />

                <input
                  type="text"
                  placeholder="Search exams, class, subject..."
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                />
              </div>

              <div className="exams-filters">
                <div className="exam-filter">
                  <FiFilter />

                  <select
                    value={typeFilter}
                    onChange={(event) =>
                      setTypeFilter(
                        event.target.value
                      )
                    }
                  >
                    <option value="">
                      All Types
                    </option>

                    {EXAM_TYPES.map((type) => (
                      <option
                        key={type}
                        value={type}
                      >
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="exam-filter">
                  <select
                    value={statusFilter}
                    onChange={(event) =>
                      setStatusFilter(
                        event.target.value
                      )
                    }
                  >
                    <option value="">
                      All Status
                    </option>

                    {EXAM_STATUSES.map(
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

                <div className="exam-filter">
                  <select
                    value={classFilter}
                    onChange={(event) =>
                      setClassFilter(
                        event.target.value
                      )
                    }
                  >
                    <option value="">
                      All Classes
                    </option>

                    {uniqueClasses.map(
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
                </div>

                <button
                  type="button"
                  className="exams-refresh-btn"
                  onClick={fetchExams}
                  title="Refresh exams"
                >
                  <FiRefreshCw />
                </button>
              </div>
            </div>

            <div className="exams-table-wrapper">
              {loading ? (
                <div className="exams-loading">
                  <div className="exams-spinner"></div>

                  <span>
                    Loading exams...
                  </span>
                </div>
              ) : paginatedExams.length === 0 ? (
                <div className="exams-empty">
                  <div className="exams-empty-icon">
                    <FiBookOpen />
                  </div>

                  <h3>No exams found</h3>

                  <p>
                    {search ||
                    typeFilter ||
                    statusFilter ||
                    classFilter
                      ? "Try changing your search or filters."
                      : "Add your first exam to get started."}
                  </p>

                  {!search &&
                    !typeFilter &&
                    !statusFilter &&
                    !classFilter && (
                      <button
                        type="button"
                        className="exams-primary-btn"
                        onClick={openAddModal}
                      >
                        <FiPlus />
                        Add Exam
                      </button>
                    )}
                </div>
              ) : (
                <table className="exams-table">
                  <thead>
                    <tr>
                      <th>Exam</th>
                      <th>Class</th>
                      <th>Subject</th>
                      <th>Exam Date</th>
                      <th>Marks</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedExams.map(
                      (exam) => {
                        const percentage =
                          exam.totalMarks > 0
                            ? (
                                (exam.passingMarks /
                                  exam.totalMarks) *
                                100
                              ).toFixed(0)
                            : 0;

                        return (
                          <tr
                            key={exam._id}
                          >
                            <td>
                              <div className="exam-name-cell">
                                <div className="exam-name-icon">
                                  <FiBookOpen />
                                </div>

                                <div>
                                  <strong>
                                    {exam.examName}
                                  </strong>

                                  <span
                                    className={`exam-type-badge ${getTypeClass(
                                      exam.examType
                                    )}`}
                                  >
                                    {exam.examType}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td>
                              <div className="exam-class-cell">
                                <strong>
                                  {exam.className}
                                </strong>

                                <span>
                                  Section{" "}
                                  {exam.section}
                                </span>
                              </div>
                            </td>

                            <td>
                              <span className="exam-subject">
                                {exam.subjectName}
                              </span>
                            </td>

                            <td>
                              <div className="exam-date-cell">
                                <FiCalendar />

                                <span>
                                  {formatDate(
                                    exam.examDate
                                  )}
                                </span>
                              </div>
                            </td>

                            <td>
                              <div className="exam-marks-cell">
                                <strong>
                                  {exam.passingMarks} /{" "}
                                  {exam.totalMarks}
                                </strong>

                                <span>
                                  Pass {percentage}%
                                </span>
                              </div>
                            </td>

                            <td>
                              <span
                                className={`exam-status-badge ${getStatusClass(
                                  exam.status
                                )}`}
                              >
                                <span></span>

                                {exam.status}
                              </span>
                            </td>

                            <td>
                              <div className="exam-actions">
                                <button
                                  type="button"
                                  className="exam-action-btn edit"
                                  onClick={() =>
                                    openEditModal(
                                      exam
                                    )
                                  }
                                  title="Edit exam"
                                >
                                  <FiEdit2 />
                                </button>

                                <button
                                  type="button"
                                  className="exam-action-btn delete"
                                  onClick={() =>
                                    openDeleteModal(
                                      exam
                                    )
                                  }
                                  title="Delete exam"
                                >
                                  <FiTrash2 />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {!loading &&
              filteredExams.length > 0 && (
                <div className="exams-pagination">
                  <span>
                    Showing{" "}
                    <strong>
                      {(currentPage - 1) *
                        ITEMS_PER_PAGE +
                        1}
                    </strong>{" "}
                    to{" "}
                    <strong>
                      {Math.min(
                        currentPage *
                          ITEMS_PER_PAGE,
                        filteredExams.length
                      )}
                    </strong>{" "}
                    of{" "}
                    <strong>
                      {filteredExams.length}
                    </strong>{" "}
                    exams
                  </span>

                  <div className="pagination-buttons">
                    <button
                      type="button"
                      disabled={
                        currentPage === 1
                      }
                      onClick={() =>
                        setCurrentPage(
                          (page) =>
                            Math.max(
                              1,
                              page - 1
                            )
                        )
                      }
                    >
                      Previous
                    </button>

                    {Array.from(
                      {
                        length: totalPages,
                      },
                      (_, index) => index + 1
                    ).map((page) => (
                      <button
                        type="button"
                        key={page}
                        className={
                          currentPage === page
                            ? "active"
                            : ""
                        }
                        onClick={() =>
                          setCurrentPage(page)
                        }
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      type="button"
                      disabled={
                        currentPage ===
                        totalPages
                      }
                      onClick={() =>
                        setCurrentPage(
                          (page) =>
                            Math.min(
                              totalPages,
                              page + 1
                            )
                        )
                      }
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
          </section>
        </main>
      </div>

      {modalOpen && (
        <div
          className="exam-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              closeModal();
            }
          }}
        >
          <div className="exam-modal">
            <div className="exam-modal-header">
              <div>
                <span>
                  {editingExam
                    ? "UPDATE EXAM"
                    : "NEW EXAM"}
                </span>

                <h2>
                  {editingExam
                    ? "Edit Exam"
                    : "Add Exam"}
                </h2>

                <p>
                  Enter the examination details below.
                </p>
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
              className="exam-form"
              onSubmit={handleSubmit}
            >
              {formError && (
                <div className="exam-form-error">
                  <FiAlertCircle />

                  <span>{formError}</span>
                </div>
              )}

              <div className="exam-form-grid">
                <div className="exam-form-group exam-form-full">
                  <label>
                    Exam Name{" "}
                    <span>*</span>
                  </label>

                  <input
                    type="text"
                    name="examName"
                    value={form.examName}
                    onChange={handleFormChange}
                    placeholder="e.g. Mathematics Mid Term"
                    disabled={saving}
                    autoComplete="off"
                  />
                </div>

                <div className="exam-form-group">
                  <label>
                    Exam Type{" "}
                    <span>*</span>
                  </label>

                  <select
                    name="examType"
                    value={form.examType}
                    onChange={handleFormChange}
                    disabled={saving}
                  >
                    {EXAM_TYPES.map((type) => (
                      <option
                        key={type}
                        value={type}
                      >
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="exam-form-group">
                  <label>
                    Exam Date{" "}
                    <span>*</span>
                  </label>

                  <input
                    type="date"
                    name="examDate"
                    value={form.examDate}
                    onChange={handleFormChange}
                    disabled={saving}
                  />
                </div>

                {/* =================================================
                    CLASS - FREE TEXT INPUT
                    ================================================= */}

                <div className="exam-form-group">
                  <label>
                    Class{" "}
                    <span>*</span>
                  </label>

                  <input
                    type="text"
                    name="className"
                    value={form.className}
                    onChange={handleFormChange}
                    placeholder="e.g. Class 5, 9th, Matric"
                    disabled={saving}
                    autoComplete="off"
                  />
                </div>

                {/* =================================================
                    SECTION - FREE TEXT INPUT
                    ================================================= */}

                <div className="exam-form-group">
                  <label>
                    Section{" "}
                    <span>*</span>
                  </label>

                  <input
                    type="text"
                    name="section"
                    value={form.section}
                    onChange={handleFormChange}
                    placeholder="e.g. A, B, Blue, Morning"
                    disabled={saving}
                    autoComplete="off"
                  />
                </div>

                {/* =================================================
                    SUBJECT - FREE TEXT INPUT
                    ================================================= */}

                <div className="exam-form-group exam-form-full">
                  <label>
                    Subject{" "}
                    <span>*</span>
                  </label>

                  <input
                    type="text"
                    name="subjectName"
                    value={form.subjectName}
                    onChange={handleFormChange}
                    placeholder="e.g. Mathematics, English, Physics"
                    disabled={saving}
                    autoComplete="off"
                  />
                </div>

                <div className="exam-form-group">
                  <label>
                    Total Marks{" "}
                    <span>*</span>
                  </label>

                  <input
                    type="number"
                    min="1"
                    name="totalMarks"
                    value={form.totalMarks}
                    onChange={handleFormChange}
                    placeholder="100"
                    disabled={saving}
                  />
                </div>

                <div className="exam-form-group">
                  <label>
                    Passing Marks{" "}
                    <span>*</span>
                  </label>

                  <input
                    type="number"
                    min="0"
                    name="passingMarks"
                    value={form.passingMarks}
                    onChange={handleFormChange}
                    placeholder="40"
                    disabled={saving}
                  />
                </div>

                <div className="exam-form-group">
                  <label>Status</label>

                  <select
                    name="status"
                    value={form.status}
                    onChange={handleFormChange}
                    disabled={saving}
                  >
                    {EXAM_STATUSES.map(
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

                <div className="exam-pass-preview">
                  <div>
                    <span>
                      Passing Percentage
                    </span>

                    <strong>
                      {passPercentage}%
                    </strong>
                  </div>

                  <div className="exam-pass-bar">
                    <span
                      style={{
                        width: `${Math.min(
                          Number(passPercentage),
                          100
                        )}%`,
                      }}
                    ></span>
                  </div>
                </div>

                <div className="exam-form-group exam-form-full">
                  <label>Remarks</label>

                  <textarea
                    name="remarks"
                    value={form.remarks}
                    onChange={handleFormChange}
                    rows="3"
                    placeholder="Optional notes..."
                    disabled={saving}
                  ></textarea>
                </div>
              </div>

              <div className="exam-modal-footer">
                <button
                  type="button"
                  className="exam-cancel-btn"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="exams-primary-btn"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="button-spinner"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      {editingExam ? (
                        <FiEdit2 />
                      ) : (
                        <FiPlus />
                      )}

                      {editingExam
                        ? "Update Exam"
                        : "Add Exam"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteModalOpen && deletingExam && (
        <div
          className="exam-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              closeDeleteModal();
            }
          }}
        >
          <div className="exam-delete-modal">
            <div className="exam-delete-icon">
              <FiTrash2 />
            </div>

            <h2>Delete Exam?</h2>

            <p>
              Are you sure you want to delete{" "}
              <strong>
                {deletingExam.examName}
              </strong>
              ? This action cannot be undone.
            </p>

            <div className="exam-delete-actions">
              <button
                type="button"
                className="exam-cancel-btn"
                onClick={closeDeleteModal}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="button"
                className="exam-delete-confirm"
                onClick={handleDelete}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="button-spinner"></span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <FiTrash2 />
                    Delete Exam
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Exams;