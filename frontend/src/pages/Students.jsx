import { useEffect, useMemo, useState } from "react";
import {
  FiAlertCircle,
  FiChevronLeft,
  FiChevronRight,
  FiEdit2,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiUsers,
  FiX,
} from "react-icons/fi";
import axios from "axios";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "../styles/Students.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [classFilter, setClassFilter] = useState("All");

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  const [deleteStudent, setDeleteStudent] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const studentsPerPage = 8;

  const emptyForm = {
    studentId: "",
    admissionNo: "",
    name: "",
    fatherName: "",
    gender: "",
    dateOfBirth: "",
    className: "",
    section: "",
    phone: "",
    address: "",
    admissionDate: "",
    status: "Active",
  };

  const [formData, setFormData] = useState(emptyForm);

  // ========================================
  // FETCH STUDENTS
  // ========================================

  const fetchStudents = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await axios.get(`${API_URL}/api/students`, {
        withCredentials: true,
      });

      if (response.data.success) {
        setStudents(response.data.students || []);
      } else {
        setError(response.data.message || "Failed to load students.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load students. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // ========================================
  // CLASS OPTIONS
  // ========================================

  const classOptions = useMemo(() => {
    const classes = students
      .map((student) => student.className)
      .filter(Boolean);

    return [...new Set(classes)].sort();
  }, [students]);

  // ========================================
  // FILTER STUDENTS
  // ========================================

  const filteredStudents = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return students.filter((student) => {
      const matchesSearch =
        !searchValue ||
        student.name?.toLowerCase().includes(searchValue) ||
        student.studentId?.toLowerCase().includes(searchValue) ||
        student.admissionNo?.toLowerCase().includes(searchValue) ||
        student.fatherName?.toLowerCase().includes(searchValue) ||
        student.phone?.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "All" || student.status === statusFilter;

      const matchesClass =
        classFilter === "All" || student.className === classFilter;

      return matchesSearch && matchesStatus && matchesClass;
    });
  }, [students, search, statusFilter, classFilter]);

  // ========================================
  // PAGINATION
  // ========================================

  const totalPages = Math.max(
    1,
    Math.ceil(filteredStudents.length / studentsPerPage)
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const startIndex = (safeCurrentPage - 1) * studentsPerPage;

  const paginatedStudents = filteredStudents.slice(
    startIndex,
    startIndex + studentsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, classFilter]);

  // ========================================
  // FORM HANDLERS
  // ========================================

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openAddForm = () => {
    setEditingStudent(null);
    setFormData(emptyForm);
    setFormError("");
    setShowForm(true);
  };

  const openEditForm = (student) => {
    setEditingStudent(student);
    setFormError("");

    setFormData({
      studentId: student.studentId || "",
      admissionNo: student.admissionNo || "",
      name: student.name || "",
      fatherName: student.fatherName || "",
      gender: student.gender || "",
      dateOfBirth: student.dateOfBirth
        ? student.dateOfBirth.substring(0, 10)
        : "",
      className: student.className || "",
      section: student.section || "",
      phone: student.phone || "",
      address: student.address || "",
      admissionDate: student.admissionDate
        ? student.admissionDate.substring(0, 10)
        : "",
      status: student.status || "Active",
    });

    setShowForm(true);
  };

  const closeForm = () => {
    if (formLoading) return;

    setShowForm(false);
    setEditingStudent(null);
    setFormData(emptyForm);
    setFormError("");
  };

  // ========================================
  // CREATE / UPDATE STUDENT
  // ========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setFormError("");

    if (
      !formData.studentId.trim() ||
      !formData.admissionNo.trim() ||
      !formData.name.trim() ||
      !formData.fatherName.trim() ||
      !formData.gender ||
      !formData.dateOfBirth ||
      !formData.className.trim() ||
      !formData.section.trim() ||
      !formData.admissionDate
    ) {
      setFormError("Please fill all required fields.");
      return;
    }

    try {
      setFormLoading(true);

      let response;

      if (editingStudent) {
        response = await axios.put(
          `${API_URL}/api/students/${editingStudent._id}`,
          formData,
          {
            withCredentials: true,
          }
        );
      } else {
        response = await axios.post(
          `${API_URL}/api/students`,
          formData,
          {
            withCredentials: true,
          }
        );
      }

      if (response.data.success) {
        closeForm();
        await fetchStudents();
      } else {
        setFormError(
          response.data.message || "Unable to save student."
        );
      }
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
          "Unable to save student. Please try again."
      );
    } finally {
      setFormLoading(false);
    }
  };

  // ========================================
  // DELETE STUDENT
  // ========================================

  const handleDelete = async () => {
    if (!deleteStudent) return;

    try {
      setDeleting(true);

      const response = await axios.delete(
        `${API_URL}/api/students/${deleteStudent._id}`,
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setDeleteStudent(null);
        await fetchStudents();
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete student. Please try again."
      );
    } finally {
      setDeleting(false);
    }
  };

  // ========================================
  // HELPERS
  // ========================================

  const getInitials = (name = "") => {
    const parts = name.trim().split(/\s+/);

    if (parts.length === 1) {
      return parts[0]?.charAt(0).toUpperCase() || "S";
    }

    return `${parts[0]?.charAt(0) || ""}${
      parts[parts.length - 1]?.charAt(0) || ""
    }`.toUpperCase();
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const activeStudents = students.filter(
    (student) => student.status === "Active"
  ).length;

  const inactiveStudents = students.filter(
    (student) => student.status === "Inactive"
  ).length;

  return (
    <div className="students-layout">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {isSidebarOpen && (
        <div
          className="students-sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      <main className="students-main">
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} />

        <div className="students-content">
          {/* PAGE HEADER */}

          <div className="students-page-header">
            <div>
              <span className="students-eyebrow">
                STUDENT MANAGEMENT
              </span>

              <h1>Students</h1>

              <p>
                Manage student records, admissions and academic
                information.
              </p>
            </div>

            <button
              type="button"
              className="add-student-button"
              onClick={openAddForm}
            >
              <FiPlus />
              Add Student
            </button>
          </div>

          {/* STATS */}

          <div className="students-mini-stats">
            <div className="students-mini-card">
              <div className="students-mini-icon total">
                <FiUsers />
              </div>

              <div>
                <span>Total Students</span>
                <strong>{students.length}</strong>
              </div>
            </div>

            <div className="students-mini-card">
              <div className="students-mini-icon active">
                <span></span>
              </div>

              <div>
                <span>Active Students</span>
                <strong>{activeStudents}</strong>
              </div>
            </div>

            <div className="students-mini-card">
              <div className="students-mini-icon inactive">
                <span></span>
              </div>

              <div>
                <span>Inactive Students</span>
                <strong>{inactiveStudents}</strong>
              </div>
            </div>
          </div>

          {/* MAIN CARD */}

          <section className="students-card">
            <div className="students-toolbar">
              <div className="students-search">
                <FiSearch />

                <input
                  type="text"
                  placeholder="Search by name, ID, admission no..."
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                />
              </div>

              <div className="students-filters">
                <select
                  value={classFilter}
                  onChange={(event) =>
                    setClassFilter(event.target.value)
                  }
                >
                  <option value="All">All Classes</option>

                  {classOptions.map((className) => (
                    <option key={className} value={className}>
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
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>

                <button
                  type="button"
                  className="refresh-students-button"
                  onClick={() => fetchStudents(true)}
                  disabled={refreshing}
                  aria-label="Refresh students"
                >
                  <FiRefreshCw
                    className={refreshing ? "spinning" : ""}
                  />
                </button>
              </div>
            </div>

            {error && (
              <div className="students-error">
                <FiAlertCircle />
                <span>{error}</span>

                <button
                  type="button"
                  onClick={() => fetchStudents()}
                >
                  Try again
                </button>
              </div>
            )}

            {/* TABLE */}

            <div className="students-table-wrapper">
              {loading ? (
                <div className="students-loading">
                  <div className="students-loader"></div>
                  <span>Loading students...</span>
                </div>
              ) : paginatedStudents.length === 0 ? (
                <div className="students-empty">
                  <div className="students-empty-icon">
                    <FiUsers />
                  </div>

                  <h3>
                    {students.length === 0
                      ? "No students yet"
                      : "No students found"}
                  </h3>

                  <p>
                    {students.length === 0
                      ? "Add your first student to start managing student records."
                      : "Try changing your search or filter options."}
                  </p>

                  {students.length === 0 && (
                    <button
                      type="button"
                      onClick={openAddForm}
                    >
                      <FiPlus />
                      Add Student
                    </button>
                  )}
                </div>
              ) : (
                <table className="students-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Admission No.</th>
                      <th>Class</th>
                      <th>Father Name</th>
                      <th>Phone</th>
                      <th>Admission Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedStudents.map((student) => (
                      <tr key={student._id}>
                        <td>
                          <div className="student-info">
                            <div className="student-table-avatar">
                              {getInitials(student.name)}
                            </div>

                            <div>
                              <strong>{student.name}</strong>
                              <span>
                                ID: {student.studentId}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="admission-number">
                            {student.admissionNo}
                          </span>
                        </td>

                        <td>
                          <div className="class-info">
                            <strong>
                              {student.className}
                            </strong>
                            <span>
                              Section {student.section}
                            </span>
                          </div>
                        </td>

                        <td>{student.fatherName}</td>

                        <td>
                          {student.phone || "-"}
                        </td>

                        <td>
                          {formatDate(student.admissionDate)}
                        </td>

                        <td>
                          <span
                            className={`student-status ${
                              student.status === "Active"
                                ? "active"
                                : "inactive"
                            }`}
                          >
                            <span></span>
                            {student.status}
                          </span>
                        </td>

                        <td>
                          <div className="student-actions">
                            <button
                              type="button"
                              className="edit-student"
                              onClick={() =>
                                openEditForm(student)
                              }
                              aria-label={`Edit ${student.name}`}
                            >
                              <FiEdit2 />
                            </button>

                            <button
                              type="button"
                              className="delete-student"
                              onClick={() =>
                                setDeleteStudent(student)
                              }
                              aria-label={`Delete ${student.name}`}
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* PAGINATION */}

            {!loading && filteredStudents.length > 0 && (
              <div className="students-pagination">
                <span>
                  Showing{" "}
                  <strong>
                    {startIndex + 1}-
                    {Math.min(
                      startIndex + studentsPerPage,
                      filteredStudents.length
                    )}
                  </strong>{" "}
                  of <strong>{filteredStudents.length}</strong>{" "}
                  students
                </span>

                <div className="pagination-buttons">
                  <button
                    type="button"
                    disabled={safeCurrentPage === 1}
                    onClick={() =>
                      setCurrentPage((page) => page - 1)
                    }
                    aria-label="Previous page"
                  >
                    <FiChevronLeft />
                  </button>

                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1
                  ).map((page) => (
                    <button
                      key={page}
                      type="button"
                      className={
                        page === safeCurrentPage ? "active" : ""
                      }
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={safeCurrentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((page) => page + 1)
                    }
                    aria-label="Next page"
                  >
                    <FiChevronRight />
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* ========================================
          ADD / EDIT MODAL
      ======================================== */}

      {showForm && (
        <div className="student-modal-overlay">
          <div className="student-modal">
            <div className="student-modal-header">
              <div>
                <span>
                  {editingStudent
                    ? "UPDATE RECORD"
                    : "NEW RECORD"}
                </span>

                <h2>
                  {editingStudent
                    ? "Edit Student"
                    : "Add Student"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={formLoading}
                aria-label="Close"
              >
                <FiX />
              </button>
            </div>

            {formError && (
              <div className="student-form-error">
                <FiAlertCircle />
                {formError}
              </div>
            )}

            <form
              className="student-form"
              onSubmit={handleSubmit}
            >
              <div className="student-form-grid">
                <div className="student-form-group">
                  <label>
                    Student ID <span>*</span>
                  </label>

                  <input
                    name="studentId"
                    type="text"
                    placeholder="FS-001"
                    value={formData.studentId}
                    onChange={handleFormChange}
                    disabled={formLoading}
                  />
                </div>

                <div className="student-form-group">
                  <label>
                    Admission No. <span>*</span>
                  </label>

                  <input
                    name="admissionNo"
                    type="text"
                    placeholder="ADM-2026-001"
                    value={formData.admissionNo}
                    onChange={handleFormChange}
                    disabled={formLoading}
                  />
                </div>

                <div className="student-form-group">
                  <label>
                    Student Name <span>*</span>
                  </label>

                  <input
                    name="name"
                    type="text"
                    placeholder="Enter student name"
                    value={formData.name}
                    onChange={handleFormChange}
                    disabled={formLoading}
                  />
                </div>

                <div className="student-form-group">
                  <label>
                    Father Name <span>*</span>
                  </label>

                  <input
                    name="fatherName"
                    type="text"
                    placeholder="Enter father name"
                    value={formData.fatherName}
                    onChange={handleFormChange}
                    disabled={formLoading}
                  />
                </div>

                <div className="student-form-group">
                  <label>
                    Gender <span>*</span>
                  </label>

                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleFormChange}
                    disabled={formLoading}
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="student-form-group">
                  <label>
                    Date of Birth <span>*</span>
                  </label>

                  <input
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleFormChange}
                    disabled={formLoading}
                  />
                </div>

                <div className="student-form-group">
                  <label>
                    Class <span>*</span>
                  </label>

                  <input
                    name="className"
                    type="text"
                    placeholder="e.g. Class 5"
                    value={formData.className}
                    onChange={handleFormChange}
                    disabled={formLoading}
                  />
                </div>

                <div className="student-form-group">
                  <label>
                    Section <span>*</span>
                  </label>

                  <input
                    name="section"
                    type="text"
                    placeholder="e.g. A"
                    value={formData.section}
                    onChange={handleFormChange}
                    disabled={formLoading}
                  />
                </div>

                <div className="student-form-group">
                  <label>Phone</label>

                  <input
                    name="phone"
                    type="tel"
                    placeholder="03XX-XXXXXXX"
                    value={formData.phone}
                    onChange={handleFormChange}
                    disabled={formLoading}
                  />
                </div>

                <div className="student-form-group">
                  <label>Admission Date <span>*</span></label>

                  <input
                    name="admissionDate"
                    type="date"
                    value={formData.admissionDate}
                    onChange={handleFormChange}
                    disabled={formLoading}
                  />
                </div>

                <div className="student-form-group">
                  <label>Status</label>

                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    disabled={formLoading}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="student-form-group student-form-full">
                  <label>Address</label>

                  <textarea
                    name="address"
                    placeholder="Enter student address"
                    value={formData.address}
                    onChange={handleFormChange}
                    disabled={formLoading}
                    rows="3"
                  ></textarea>
                </div>
              </div>

              <div className="student-form-actions">
                <button
                  type="button"
                  className="cancel-student-button"
                  onClick={closeForm}
                  disabled={formLoading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-student-button"
                  disabled={formLoading}
                >
                  {formLoading ? (
                    <>
                      <span></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiPlus />
                      {editingStudent
                        ? "Update Student"
                        : "Save Student"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================
          DELETE CONFIRMATION
      ======================================== */}

      {deleteStudent && (
        <div className="student-modal-overlay">
          <div className="delete-modal">
            <div className="delete-modal-icon">
              <FiTrash2 />
            </div>

            <h2>Delete Student?</h2>

            <p>
              Are you sure you want to delete{" "}
              <strong>{deleteStudent.name}</strong>? This action
              cannot be undone.
            </p>

            <div className="delete-modal-actions">
              <button
                type="button"
                onClick={() => setDeleteStudent(null)}
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete Student"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;