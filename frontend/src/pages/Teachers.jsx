import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
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
import "../styles/Teachers.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const initialForm = {
  teacherId: "",
  name: "",
  fatherName: "",
  gender: "Male",
  dateOfBirth: "",
  qualification: "",
  subject: "",
  phone: "",
  email: "",
  address: "",
  joiningDate: "",
  salary: "",
  status: "Active",
};

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 8;

  const fetchTeachers = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await axios.get(`${API_URL}/api/teachers`, {
        withCredentials: true,
      });

      if (response.data.success) {
        setTeachers(response.data.teachers || []);
      } else {
        setError(response.data.message || "Failed to load teachers.");
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load teachers. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const filteredTeachers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return teachers.filter((teacher) => {
      const matchesSearch =
        !query ||
        teacher.name?.toLowerCase().includes(query) ||
        teacher.teacherId?.toLowerCase().includes(query) ||
        teacher.subject?.toLowerCase().includes(query) ||
        teacher.phone?.toLowerCase().includes(query) ||
        teacher.email?.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || teacher.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [teachers, search, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTeachers.length / itemsPerPage)
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedTeachers = filteredTeachers.slice(
    (safeCurrentPage - 1) * itemsPerPage,
    safeCurrentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const activeTeachers = teachers.filter(
    (teacher) => teacher.status === "Active"
  ).length;

  const inactiveTeachers = teachers.filter(
    (teacher) => teacher.status === "Inactive"
  ).length;

  const totalSalary = teachers.reduce(
    (sum, teacher) => sum + Number(teacher.salary || 0),
    0
  );

  const formatDate = (date) => {
    if (!date) return "—";

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) return "—";

    return value.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatSalary = (salary) => {
    return `₨ ${Number(salary || 0).toLocaleString("en-PK")}`;
  };

  const openAddModal = () => {
    setEditingTeacher(null);
    setForm(initialForm);
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (teacher) => {
    setEditingTeacher(teacher);

    setForm({
      teacherId: teacher.teacherId || "",
      name: teacher.name || "",
      fatherName: teacher.fatherName || "",
      gender: teacher.gender || "Male",
      dateOfBirth: teacher.dateOfBirth
        ? new Date(teacher.dateOfBirth).toISOString().split("T")[0]
        : "",
      qualification: teacher.qualification || "",
      subject: teacher.subject || "",
      phone: teacher.phone || "",
      email: teacher.email || "",
      address: teacher.address || "",
      joiningDate: teacher.joiningDate
        ? new Date(teacher.joiningDate).toISOString().split("T")[0]
        : "",
      salary: teacher.salary ?? "",
      status: teacher.status || "Active",
    });

    setFormError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setIsModalOpen(false);
    setEditingTeacher(null);
    setForm(initialForm);
    setFormError("");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (
      !form.teacherId.trim() ||
      !form.name.trim() ||
      !form.fatherName.trim() ||
      !form.gender ||
      !form.dateOfBirth ||
      !form.qualification.trim() ||
      !form.subject.trim() ||
      !form.phone.trim() ||
      !form.joiningDate ||
      form.salary === "" ||
      Number(form.salary) < 0
    ) {
      return "Please fill all required teacher fields correctly.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      setSaving(true);
      setFormError("");

      let response;

      if (editingTeacher) {
        response = await axios.put(
          `${API_URL}/api/teachers/${editingTeacher._id}`,
          form,
          {
            withCredentials: true,
          }
        );
      } else {
        response = await axios.post(`${API_URL}/api/teachers`, form, {
          withCredentials: true,
        });
      }

      if (response.data.success) {
        closeModal();
        await fetchTeachers(true);
      } else {
        setFormError(
          response.data.message || "Failed to save teacher."
        );
      }
    } catch (error) {
      setFormError(
        error.response?.data?.message ||
          "Failed to save teacher. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);

      const response = await axios.delete(
        `${API_URL}/api/teachers/${deleteTarget._id}`,
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setDeleteTarget(null);
        await fetchTeachers(true);
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to delete teacher. Please try again."
      );
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;

    setCurrentPage(page);
  };

  return (
    <div className="teachers-layout">
      <Sidebar />

      <div className="teachers-main">
        <Topbar />

        <main className="teachers-content">
          <div className="teachers-page-header">
            <div>
              <span className="teachers-eyebrow">TEACHER MANAGEMENT</span>

              <h1>Teachers</h1>

              <p>
                Manage your school teachers, subjects, salaries and
                employment information.
              </p>
            </div>

            <button
              type="button"
              className="teachers-add-button"
              onClick={openAddModal}
            >
              <FiPlus />
              Add Teacher
            </button>
          </div>

          <div className="teachers-stats">
            <div className="teacher-stat-card">
              <div className="teacher-stat-icon">
                <FiUserCheck />
              </div>

              <div>
                <span>Total Teachers</span>
                <strong>{teachers.length}</strong>
              </div>
            </div>

            <div className="teacher-stat-card">
              <div className="teacher-stat-icon">
                <FiUserCheck />
              </div>

              <div>
                <span>Active Teachers</span>
                <strong>{activeTeachers}</strong>
              </div>
            </div>

            <div className="teacher-stat-card">
              <div className="teacher-stat-icon">
                <FiUserCheck />
              </div>

              <div>
                <span>Inactive Teachers</span>
                <strong>{inactiveTeachers}</strong>
              </div>
            </div>

            <div className="teacher-stat-card">
              <div className="teacher-stat-icon">
                <span className="salary-symbol">₨</span>
              </div>

              <div>
                <span>Monthly Salary</span>
                <strong>{formatSalary(totalSalary)}</strong>
              </div>
            </div>
          </div>

          <section className="teachers-card">
            <div className="teachers-toolbar">
              <div className="teachers-search">
                <FiSearch />

                <input
                  type="text"
                  placeholder="Search by name, ID, subject..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              <div className="teachers-toolbar-actions">
                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value)
                  }
                  className="teachers-filter"
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>

                <button
                  type="button"
                  className="teachers-refresh"
                  onClick={() => fetchTeachers(true)}
                  disabled={refreshing}
                  aria-label="Refresh teachers"
                >
                  <FiRefreshCw
                    className={refreshing ? "spin" : ""}
                  />
                </button>
              </div>
            </div>

            {error && (
              <div className="teachers-error" role="alert">
                {error}
              </div>
            )}

            {loading ? (
              <div className="teachers-loading">
                Loading teachers...
              </div>
            ) : filteredTeachers.length === 0 ? (
              <div className="teachers-empty">
                <div className="teachers-empty-icon">
                  <FiUserCheck />
                </div>

                <h3>No teachers found</h3>

                <p>
                  {search || statusFilter !== "All"
                    ? "Try changing your search or filter."
                    : "Add your first teacher to get started."}
                </p>

                {!search && statusFilter === "All" && (
                  <button
                    type="button"
                    onClick={openAddModal}
                    className="teachers-empty-button"
                  >
                    <FiPlus />
                    Add Teacher
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="teachers-table-wrapper">
                  <table className="teachers-table">
                    <thead>
                      <tr>
                        <th>Teacher</th>
                        <th>Teacher ID</th>
                        <th>Subject</th>
                        <th>Phone</th>
                        <th>Joining Date</th>
                        <th>Salary</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedTeachers.map((teacher) => (
                        <tr key={teacher._id}>
                          <td>
                            <div className="teacher-name-cell">
                              <div className="teacher-avatar">
                                {teacher.name
                                  ?.charAt(0)
                                  .toUpperCase() || "T"}
                              </div>

                              <div>
                                <strong>{teacher.name}</strong>
                                <span>{teacher.email || "No email"}</span>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span className="teacher-id">
                              {teacher.teacherId}
                            </span>
                          </td>

                          <td>{teacher.subject}</td>

                          <td>{teacher.phone}</td>

                          <td>{formatDate(teacher.joiningDate)}</td>

                          <td className="teacher-salary">
                            {formatSalary(teacher.salary)}
                          </td>

                          <td>
                            <span
                              className={`teacher-status ${
                                teacher.status === "Active"
                                  ? "active"
                                  : "inactive"
                              }`}
                            >
                              {teacher.status}
                            </span>
                          </td>

                          <td>
                            <div className="teacher-actions">
                              <button
                                type="button"
                                className="teacher-action edit"
                                onClick={() =>
                                  openEditModal(teacher)
                                }
                                aria-label={`Edit ${teacher.name}`}
                              >
                                <FiEdit2 />
                              </button>

                              <button
                                type="button"
                                className="teacher-action delete"
                                onClick={() =>
                                  setDeleteTarget(teacher)
                                }
                                aria-label={`Delete ${teacher.name}`}
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="teachers-pagination">
                  <span>
                    Showing{" "}
                    <strong>
                      {filteredTeachers.length === 0
                        ? 0
                        : (safeCurrentPage - 1) * itemsPerPage + 1}
                    </strong>{" "}
                    to{" "}
                    <strong>
                      {Math.min(
                        safeCurrentPage * itemsPerPage,
                        filteredTeachers.length
                      )}
                    </strong>{" "}
                    of <strong>{filteredTeachers.length}</strong>{" "}
                    teachers
                  </span>

                  <div className="pagination-buttons">
                    <button
                      type="button"
                      onClick={() => goToPage(safeCurrentPage - 1)}
                      disabled={safeCurrentPage === 1}
                    >
                      Previous
                    </button>

                    {Array.from(
                      { length: totalPages },
                      (_, index) => index + 1
                    )
                      .slice(
                        Math.max(0, safeCurrentPage - 3),
                        Math.min(totalPages, safeCurrentPage + 2)
                      )
                      .map((page) => (
                        <button
                          type="button"
                          key={page}
                          className={
                            page === safeCurrentPage ? "active" : ""
                          }
                          onClick={() => goToPage(page)}
                        >
                          {page}
                        </button>
                      ))}

                    <button
                      type="button"
                      onClick={() => goToPage(safeCurrentPage + 1)}
                      disabled={safeCurrentPage === totalPages}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>
        </main>
      </div>

      {isModalOpen && (
        <div
          className="teachers-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="teachers-modal">
            <div className="teachers-modal-header">
              <div>
                <span>TEACHER INFORMATION</span>

                <h2>
                  {editingTeacher ? "Edit Teacher" : "Add Teacher"}
                </h2>
              </div>

              <button
                type="button"
                className="teachers-modal-close"
                onClick={closeModal}
                disabled={saving}
                aria-label="Close"
              >
                <FiX />
              </button>
            </div>

            <form
              className="teachers-form"
              onSubmit={handleSubmit}
            >
              {formError && (
                <div className="teachers-form-error">
                  {formError}
                </div>
              )}

              <div className="teachers-form-grid">
                <div className="teacher-form-group">
                  <label htmlFor="teacherId">
                    Teacher ID <span>*</span>
                  </label>

                  <input
                    id="teacherId"
                    name="teacherId"
                    type="text"
                    placeholder="e.g. TCH-001"
                    value={form.teacherId}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </div>

                <div className="teacher-form-group">
                  <label htmlFor="name">
                    Full Name <span>*</span>
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter teacher name"
                    value={form.name}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </div>

                <div className="teacher-form-group">
                  <label htmlFor="fatherName">
                    Father Name <span>*</span>
                  </label>

                  <input
                    id="fatherName"
                    name="fatherName"
                    type="text"
                    placeholder="Enter father name"
                    value={form.fatherName}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </div>

                <div className="teacher-form-group">
                  <label htmlFor="gender">
                    Gender <span>*</span>
                  </label>

                  <select
                    id="gender"
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    disabled={saving}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="teacher-form-group">
                  <label htmlFor="dateOfBirth">
                    Date of Birth <span>*</span>
                  </label>

                  <input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={form.dateOfBirth}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </div>

                <div className="teacher-form-group">
                  <label htmlFor="qualification">
                    Qualification <span>*</span>
                  </label>

                  <input
                    id="qualification"
                    name="qualification"
                    type="text"
                    placeholder="e.g. M.Sc Mathematics"
                    value={form.qualification}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </div>

                <div className="teacher-form-group">
                  <label htmlFor="subject">
                    Subject <span>*</span>
                  </label>

                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    placeholder="e.g. Mathematics"
                    value={form.subject}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </div>

                <div className="teacher-form-group">
                  <label htmlFor="phone">
                    Phone <span>*</span>
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="03XX-XXXXXXX"
                    value={form.phone}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </div>

                <div className="teacher-form-group">
                  <label htmlFor="email">Email</label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="teacher@example.com"
                    value={form.email}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </div>

                <div className="teacher-form-group">
                  <label htmlFor="joiningDate">
                    Joining Date <span>*</span>
                  </label>

                  <input
                    id="joiningDate"
                    name="joiningDate"
                    type="date"
                    value={form.joiningDate}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </div>

                <div className="teacher-form-group">
                  <label htmlFor="salary">
                    Monthly Salary (₨) <span>*</span>
                  </label>

                  <input
                    id="salary"
                    name="salary"
                    type="number"
                    min="0"
                    placeholder="e.g. 50000"
                    value={form.salary}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </div>

                <div className="teacher-form-group">
                  <label htmlFor="status">Status</label>

                  <select
                    id="status"
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    disabled={saving}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="teacher-form-group full-width">
                  <label htmlFor="address">Address</label>

                  <textarea
                    id="address"
                    name="address"
                    rows="3"
                    placeholder="Enter teacher address"
                    value={form.address}
                    onChange={handleChange}
                    disabled={saving}
                  ></textarea>
                </div>
              </div>

              <div className="teachers-form-footer">
                <button
                  type="button"
                  className="teacher-cancel-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="teacher-save-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingTeacher
                    ? "Update Teacher"
                    : "Add Teacher"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div
          className="teachers-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deleting) {
              setDeleteTarget(null);
            }
          }}
        >
          <div className="teacher-delete-modal">
            <div className="teacher-delete-icon">
              <FiTrash2 />
            </div>

            <h2>Delete Teacher?</h2>

            <p>
              Are you sure you want to delete{" "}
              <strong>{deleteTarget.name}</strong>? This action
              cannot be undone.
            </p>

            <div className="teacher-delete-actions">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                type="button"
                className="confirm-delete"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete Teacher"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teachers;