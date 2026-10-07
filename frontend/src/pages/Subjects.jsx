import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FiBookOpen,
  FiEdit2,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiUsers,
  FiX,
} from "react-icons/fi";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "../styles/Subjects.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const ITEMS_PER_PAGE = 8;

const initialForm = {
  subjectName: "",
  subjectCode: "",
  className: "",
  teacherName: "",
  description: "",
  status: "Active",
};

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [classesLoading, setClassesLoading] = useState(true);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [editingSubject, setEditingSubject] = useState(null);
  const [deletingSubject, setDeletingSubject] = useState(null);

  const [form, setForm] = useState(initialForm);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  /* =========================================
     FETCH SUBJECTS
  ========================================= */

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/api/subjects`,
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setSubjects(response.data.subjects || []);
      } else {
        setError(
          response.data.message ||
            "Failed to load subjects."
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load subjects. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================
     FETCH CLASSES
     Used for class filter only
  ========================================= */

  const fetchClasses = async () => {
    try {
      setClassesLoading(true);

      const response = await axios.get(
        `${API_URL}/api/classes`,
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setClasses(response.data.classes || []);
      }
    } catch (err) {
      console.error("Fetch Classes Error:", err);
    } finally {
      setClassesLoading(false);
    }
  };

  /* =========================================
     INITIAL LOAD
  ========================================= */

  useEffect(() => {
    fetchSubjects();
    fetchClasses();
  }, []);

  /* =========================================
     RESET PAGINATION
  ========================================= */

  useEffect(() => {
    setCurrentPage(1);
  }, [search, classFilter, statusFilter]);

  /* =========================================
     CLASS OPTIONS
     Used for table filter
  ========================================= */

  const classOptions = useMemo(() => {
    const values = classes
      .map((item) => item.className)
      .filter(Boolean);

    return [...new Set(values)];
  }, [classes]);

  /* =========================================
     FILTER SUBJECTS
  ========================================= */

  const filteredSubjects = useMemo(() => {
    const searchValue = search
      .trim()
      .toLowerCase();

    return subjects.filter((subject) => {
      const matchesSearch =
        !searchValue ||
        subject.subjectName
          ?.toLowerCase()
          .includes(searchValue) ||
        subject.subjectCode
          ?.toLowerCase()
          .includes(searchValue) ||
        subject.className
          ?.toLowerCase()
          .includes(searchValue) ||
        subject.teacherName
          ?.toLowerCase()
          .includes(searchValue);

      const matchesClass =
        classFilter === "All" ||
        subject.className === classFilter;

      const matchesStatus =
        statusFilter === "All" ||
        subject.status === statusFilter;

      return (
        matchesSearch &&
        matchesClass &&
        matchesStatus
      );
    });
  }, [
    subjects,
    search,
    classFilter,
    statusFilter,
  ]);

  /* =========================================
     PAGINATION
  ========================================= */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredSubjects.length / ITEMS_PER_PAGE
    )
  );

  const paginatedSubjects = filteredSubjects.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  /* =========================================
     STATS
  ========================================= */

  const activeCount = subjects.filter(
    (subject) => subject.status === "Active"
  ).length;

  const inactiveCount = subjects.filter(
    (subject) => subject.status === "Inactive"
  ).length;

  const classCount = new Set(
    subjects.map((subject) => subject.className)
  ).size;

  /* =========================================
     OPEN ADD MODAL
  ========================================= */

  const openAddModal = () => {
    setEditingSubject(null);
    setForm(initialForm);
    setFormError("");
    setIsModalOpen(true);
  };

  /* =========================================
     OPEN EDIT MODAL
  ========================================= */

  const openEditModal = (subject) => {
    setEditingSubject(subject);

    setForm({
      subjectName: subject.subjectName || "",
      subjectCode: subject.subjectCode || "",
      className: subject.className || "",
      teacherName: subject.teacherName || "",
      description: subject.description || "",
      status: subject.status || "Active",
    });

    setFormError("");
    setIsModalOpen(true);
  };

  /* =========================================
     CLOSE SUBJECT MODAL
  ========================================= */

  const closeModal = () => {
    if (saving) return;

    setIsModalOpen(false);
    setEditingSubject(null);
    setForm(initialForm);
    setFormError("");
  };

  /* =========================================
     FORM CHANGE
  ========================================= */

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =========================================
     SUBMIT SUBJECT
  ========================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    if (
      !form.subjectName.trim() ||
      !form.subjectCode.trim() ||
      !form.className.trim()
    ) {
      setFormError(
        "Please fill subject name, subject code and class."
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        subjectName: form.subjectName.trim(),
        subjectCode: form.subjectCode
          .trim()
          .toUpperCase(),
        className: form.className.trim(),
        teacherName: form.teacherName.trim(),
        description: form.description.trim(),
        status: form.status,
      };

      if (editingSubject) {
        const response = await axios.put(
          `${API_URL}/api/subjects/${editingSubject._id}`,
          payload,
          {
            withCredentials: true,
          }
        );

        if (response.data.success) {
          await fetchSubjects();

          setIsModalOpen(false);
          setEditingSubject(null);
          setForm(initialForm);
          setFormError("");
        }
      } else {
        const response = await axios.post(
          `${API_URL}/api/subjects`,
          payload,
          {
            withCredentials: true,
          }
        );

        if (response.data.success) {
          await fetchSubjects();

          setIsModalOpen(false);
          setEditingSubject(null);
          setForm(initialForm);
          setFormError("");
        }
      }
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
          "Failed to save subject. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================
     DELETE MODAL
  ========================================= */

  const openDeleteModal = (subject) => {
    setDeletingSubject(subject);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (deleting) return;

    setDeletingSubject(null);
    setIsDeleteModalOpen(false);
  };

  /* =========================================
     DELETE SUBJECT
  ========================================= */

  const handleDelete = async () => {
    if (!deletingSubject) return;

    try {
      setDeleting(true);

      const response = await axios.delete(
        `${API_URL}/api/subjects/${deletingSubject._id}`,
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        await fetchSubjects();

        setDeletingSubject(null);
        setIsDeleteModalOpen(false);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to delete subject."
      );

      setDeletingSubject(null);
      setIsDeleteModalOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  /* =========================================
     REFRESH
  ========================================= */

  const handleRefresh = async () => {
    await Promise.all([
      fetchSubjects(),
      fetchClasses(),
    ]);
  };

  return (
    <div className="subjects-page">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {isSidebarOpen && (
        <div
          className="subjects-mobile-overlay"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      <main className="subjects-main">
        <Topbar
          onMenuClick={() =>
            setIsSidebarOpen(true)
          }
        />

        <div className="subjects-content">
          {/* PAGE HEADER */}

          <div className="subjects-page-header">
            <div>
              <span className="subjects-eyebrow">
                ACADEMICS
              </span>

              <h1>Subjects</h1>

              <p>
                Manage subjects, classes and assigned
                teachers from one place.
              </p>
            </div>

            <button
              type="button"
              className="subjects-add-button"
              onClick={openAddModal}
            >
              <FiPlus />
              Add Subject
            </button>
          </div>

          {/* STATS */}

          <div className="subjects-stats">
            <div className="subject-stat-card">
              <div className="subject-stat-icon">
                <FiBookOpen />
              </div>

              <div>
                <span>Total Subjects</span>
                <strong>{subjects.length}</strong>
              </div>
            </div>

            <div className="subject-stat-card">
              <div className="subject-stat-icon">
                <FiUsers />
              </div>

              <div>
                <span>Classes Covered</span>
                <strong>{classCount}</strong>
              </div>
            </div>

            <div className="subject-stat-card">
              <div className="subject-stat-icon">
                <FiBookOpen />
              </div>

              <div>
                <span>Active Subjects</span>
                <strong>{activeCount}</strong>
              </div>
            </div>

            <div className="subject-stat-card">
              <div className="subject-stat-icon">
                <FiBookOpen />
              </div>

              <div>
                <span>Inactive Subjects</span>
                <strong>{inactiveCount}</strong>
              </div>
            </div>
          </div>

          {/* MAIN SUBJECTS CARD */}

          <section className="subjects-card">
            {/* TOOLBAR */}

            <div className="subjects-toolbar">
              <div className="subjects-search">
                <FiSearch />

                <input
                  type="text"
                  placeholder="Search subject, code, class or teacher..."
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                />
              </div>

              <div className="subjects-filters">
                <select
                  value={classFilter}
                  onChange={(event) =>
                    setClassFilter(event.target.value)
                  }
                >
                  <option value="All">
                    All Classes
                  </option>

                  {classOptions.map((className) => (
                    <option
                      key={className}
                      value={className}
                    >
                      {className}
                    </option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value)
                  }
                >
                  <option value="All">
                    All Status
                  </option>

                  <option value="Active">
                    Active
                  </option>

                  <option value="Inactive">
                    Inactive
                  </option>
                </select>

                <button
                  type="button"
                  className="subjects-refresh"
                  onClick={handleRefresh}
                  disabled={
                    loading || classesLoading
                  }
                  aria-label="Refresh subjects"
                >
                  <FiRefreshCw
                    className={
                      loading
                        ? "subjects-refresh-spin"
                        : ""
                    }
                  />
                </button>
              </div>
            </div>

            {/* ERROR */}

            {error && (
              <div
                className="subjects-error"
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

            {/* LOADING */}

            {loading ? (
              <div className="subjects-loading">
                <div className="subjects-loader"></div>

                <span>
                  Loading subjects...
                </span>
              </div>
            ) : paginatedSubjects.length === 0 ? (
              /* EMPTY */

              <div className="subjects-empty">
                <div className="subjects-empty-icon">
                  <FiBookOpen />
                </div>

                <h3>
                  {subjects.length === 0
                    ? "No subjects yet"
                    : "No matching subjects"}
                </h3>

                <p>
                  {subjects.length === 0
                    ? "Add your first subject to get started."
                    : "Try changing your search or filters."}
                </p>

                {subjects.length === 0 && (
                  <button
                    type="button"
                    onClick={openAddModal}
                  >
                    <FiPlus />
                    Add Subject
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* TABLE */}

                <div className="subjects-table-wrapper">
                  <table className="subjects-table">
                    <thead>
                      <tr>
                        <th>SUBJECT</th>
                        <th>CODE</th>
                        <th>CLASS</th>
                        <th>TEACHER</th>
                        <th>STATUS</th>
                        <th>ACTIONS</th>
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedSubjects.map(
                        (subject) => (
                          <tr key={subject._id}>
                            <td>
                              <div className="subject-name-cell">
                                <div className="subject-row-icon">
                                  <FiBookOpen />
                                </div>

                                <div>
                                  <strong>
                                    {subject.subjectName}
                                  </strong>

                                  {subject.description && (
                                    <span>
                                      {subject.description}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td>
                              <span className="subject-code">
                                {subject.subjectCode}
                              </span>
                            </td>

                            <td>
                              <span className="class-badge">
                                {subject.className}
                              </span>
                            </td>

                            <td>
                              {subject.teacherName ||
                                "Not assigned"}
                            </td>

                            <td>
                              <span
                                className={`subject-status ${
                                  subject.status ===
                                  "Active"
                                    ? "active"
                                    : "inactive"
                                }`}
                              >
                                {subject.status}
                              </span>
                            </td>

                            <td>
                              <div className="subject-actions">
                                <button
                                  type="button"
                                  className="subject-edit-button"
                                  onClick={() =>
                                    openEditModal(
                                      subject
                                    )
                                  }
                                  aria-label={`Edit ${subject.subjectName}`}
                                >
                                  <FiEdit2 />
                                </button>

                                <button
                                  type="button"
                                  className="subject-delete-button"
                                  onClick={() =>
                                    openDeleteModal(
                                      subject
                                    )
                                  }
                                  aria-label={`Delete ${subject.subjectName}`}
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

                {/* PAGINATION */}

                <div className="subjects-pagination">
                  <span>
                    Showing{" "}
                    {filteredSubjects.length === 0
                      ? 0
                      : (currentPage - 1) *
                          ITEMS_PER_PAGE +
                        1}{" "}
                    to{" "}
                    {Math.min(
                      currentPage * ITEMS_PER_PAGE,
                      filteredSubjects.length
                    )}{" "}
                    of {filteredSubjects.length}
                  </span>

                  <div>
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() =>
                        setCurrentPage(
                          (page) => page - 1
                        )
                      }
                    >
                      Previous
                    </button>

                    <span className="page-number">
                      {currentPage} / {totalPages}
                    </span>

                    <button
                      type="button"
                      disabled={
                        currentPage === totalPages
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

      {/* =========================================
          ADD / EDIT SUBJECT MODAL
      ========================================= */}

      {isModalOpen && (
        <div className="subjects-modal-overlay">
          <div className="subjects-modal">
            <div className="subjects-modal-header">
              <div>
                <span>SUBJECT MANAGEMENT</span>

                <h2>
                  {editingSubject
                    ? "Edit Subject"
                    : "Add Subject"}
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
              className="subjects-form"
              onSubmit={handleSubmit}
            >
              {formError && (
                <div className="subjects-form-error">
                  {formError}
                </div>
              )}

              <div className="subjects-form-grid">
                {/* SUBJECT NAME */}

                <div className="subjects-form-group">
                  <label htmlFor="subjectName">
                    Subject Name *
                  </label>

                  <input
                    id="subjectName"
                    name="subjectName"
                    type="text"
                    placeholder="e.g. Mathematics"
                    value={form.subjectName}
                    onChange={handleFormChange}
                    disabled={saving}
                  />
                </div>

                {/* SUBJECT CODE */}

                <div className="subjects-form-group">
                  <label htmlFor="subjectCode">
                    Subject Code *
                  </label>

                  <input
                    id="subjectCode"
                    name="subjectCode"
                    type="text"
                    placeholder="e.g. MATH-01"
                    value={form.subjectCode}
                    onChange={handleFormChange}
                    disabled={saving}
                  />
                </div>

                {/* CLASS - SIMPLE TEXT INPUT */}

                <div className="subjects-form-group">
                  <label htmlFor="className">
                    Class *
                  </label>

                  <input
                    id="className"
                    name="className"
                    type="text"
                    placeholder="e.g. Class 5, 9th, Matric"
                    value={form.className}
                    onChange={handleFormChange}
                    disabled={saving}
                    autoComplete="off"
                  />
                </div>

                {/* TEACHER */}

                <div className="subjects-form-group">
                  <label htmlFor="teacherName">
                    Teacher
                  </label>

                  <input
                    id="teacherName"
                    name="teacherName"
                    type="text"
                    placeholder="e.g. Ahmed Khan"
                    value={form.teacherName}
                    onChange={handleFormChange}
                    disabled={saving}
                  />
                </div>

                {/* STATUS */}

                <div className="subjects-form-group">
                  <label htmlFor="status">
                    Status
                  </label>

                  <select
                    id="status"
                    name="status"
                    value={form.status}
                    onChange={handleFormChange}
                    disabled={saving}
                  >
                    <option value="Active">
                      Active
                    </option>

                    <option value="Inactive">
                      Inactive
                    </option>
                  </select>
                </div>

                {/* DESCRIPTION */}

                <div className="subjects-form-group subjects-full-width">
                  <label htmlFor="description">
                    Description
                  </label>

                  <textarea
                    id="description"
                    name="description"
                    rows="3"
                    placeholder="Short subject description..."
                    value={form.description}
                    onChange={handleFormChange}
                    disabled={saving}
                  ></textarea>
                </div>
              </div>

              {/* ACTIONS */}

              <div className="subjects-modal-actions">
                <button
                  type="button"
                  className="subjects-cancel-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="subjects-save-button"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="subjects-button-spinner"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiPlus />

                      {editingSubject
                        ? "Update Subject"
                        : "Save Subject"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================
          DELETE MODAL
      ========================================= */}

      {isDeleteModalOpen && deletingSubject && (
        <div className="subjects-modal-overlay">
          <div className="subjects-delete-modal">
            <div className="subjects-delete-icon">
              <FiTrash2 />
            </div>

            <h2>Delete Subject?</h2>

            <p>
              Are you sure you want to delete{" "}
              <strong>
                {deletingSubject.subjectName}
              </strong>
              ? This action cannot be undone.
            </p>

            <div className="subjects-delete-actions">
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
                  : "Delete Subject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subjects;