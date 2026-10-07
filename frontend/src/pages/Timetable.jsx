import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FiBookOpen,
  FiCalendar,
  FiClock,
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
import "../styles/Timetable.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const ITEMS_PER_PAGE = 8;

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const initialForm = {
  day: "Monday",
  className: "",
  section: "",
  subjectName: "",
  teacherName: "",
  roomNumber: "",
  startTime: "",
  endTime: "",
  status: "Active",
};

const Timetable = () => {
  const [timetables, setTimetables] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const [search, setSearch] = useState("");
  const [dayFilter, setDayFilter] = useState("All");
  const [classFilter, setClassFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] =
    useState(false);

  const [editingTimetable, setEditingTimetable] =
    useState(null);
  const [deletingTimetable, setDeletingTimetable] =
    useState(null);

  const [form, setForm] = useState(initialForm);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] =
    useState(false);

  const fetchTimetables = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/api/timetable`,
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setTimetables(response.data.timetables || []);
      } else {
        setError(
          response.data.message ||
            "Failed to load timetable."
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load timetable. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetables();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    dayFilter,
    classFilter,
    statusFilter,
  ]);

  const classNames = useMemo(() => {
    return [
      ...new Set(
        timetables
          .map((item) => item.className)
          .filter(Boolean)
      ),
    ];
  }, [timetables]);

  const filteredTimetables = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return timetables.filter((item) => {
      const searchableText = [
        item.day,
        item.className,
        item.section,
        item.subjectName,
        item.teacherName,
        item.roomNumber,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !searchValue ||
        searchableText.includes(searchValue);

      const matchesDay =
        dayFilter === "All" ||
        item.day === dayFilter;

      const matchesClass =
        classFilter === "All" ||
        item.className === classFilter;

      const matchesStatus =
        statusFilter === "All" ||
        item.status === statusFilter;

      return (
        matchesSearch &&
        matchesDay &&
        matchesClass &&
        matchesStatus
      );
    });
  }, [
    timetables,
    search,
    dayFilter,
    classFilter,
    statusFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredTimetables.length / ITEMS_PER_PAGE
    )
  );

  const paginatedTimetables =
    filteredTimetables.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const activeCount = timetables.filter(
    (item) => item.status === "Active"
  ).length;

  const inactiveCount = timetables.filter(
    (item) => item.status === "Inactive"
  ).length;

  const classCount = new Set(
    timetables.map(
      (item) =>
        `${item.className}-${item.section}`
    )
  ).size;

  const openAddModal = () => {
    setEditingTimetable(null);
    setForm(initialForm);
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingTimetable(item);

    setForm({
      day: item.day || "Monday",
      className: item.className || "",
      section: item.section || "",
      subjectName: item.subjectName || "",
      teacherName: item.teacherName || "",
      roomNumber: item.roomNumber || "",
      startTime: item.startTime || "",
      endTime: item.endTime || "",
      status: item.status || "Active",
    });

    setFormError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setIsModalOpen(false);
    setEditingTimetable(null);
    setForm(initialForm);
    setFormError("");
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    if (
      !form.day ||
      !form.className.trim() ||
      !form.section.trim() ||
      !form.subjectName.trim() ||
      !form.teacherName.trim() ||
      !form.startTime ||
      !form.endTime
    ) {
      setFormError(
        "Please fill all required timetable fields."
      );
      return;
    }

    if (form.startTime >= form.endTime) {
      setFormError(
        "End time must be later than start time."
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        day: form.day,
        className: form.className.trim(),
        section: form.section.trim(),
        subjectName: form.subjectName.trim(),
        teacherName: form.teacherName.trim(),
        roomNumber: form.roomNumber.trim(),
        startTime: form.startTime,
        endTime: form.endTime,
        status: form.status,
      };

      if (editingTimetable) {
        const response = await axios.put(
          `${API_URL}/api/timetable/${editingTimetable._id}`,
          payload,
          {
            withCredentials: true,
          }
        );

        if (response.data.success) {
          await fetchTimetables();

          setIsModalOpen(false);
          setEditingTimetable(null);
          setForm(initialForm);
          setFormError("");
        }
      } else {
        const response = await axios.post(
          `${API_URL}/api/timetable`,
          payload,
          {
            withCredentials: true,
          }
        );

        if (response.data.success) {
          await fetchTimetables();

          setIsModalOpen(false);
          setEditingTimetable(null);
          setForm(initialForm);
          setFormError("");
        }
      }
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
          "Failed to save timetable entry."
      );
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (item) => {
    setDeletingTimetable(item);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (deleting) return;

    setDeletingTimetable(null);
    setIsDeleteModalOpen(false);
  };

  const handleDelete = async () => {
    if (!deletingTimetable) return;

    try {
      setDeleting(true);

      const response = await axios.delete(
        `${API_URL}/api/timetable/${deletingTimetable._id}`,
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        await fetchTimetables();

        setDeletingTimetable(null);
        setIsDeleteModalOpen(false);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to delete timetable entry."
      );

      setDeletingTimetable(null);
      setIsDeleteModalOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleRefresh = async () => {
    await fetchTimetables();
  };

  return (
    <div className="timetable-page">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() =>
          setIsSidebarOpen(false)
        }
      />

      {isSidebarOpen && (
        <div
          className="timetable-mobile-overlay"
          onClick={() =>
            setIsSidebarOpen(false)
          }
        ></div>
      )}

      <main className="timetable-main">
        <Topbar
          onMenuClick={() =>
            setIsSidebarOpen(true)
          }
        />

        <div className="timetable-content">
          <div className="timetable-page-header">
            <div>
              <span className="timetable-eyebrow">
                ACADEMICS
              </span>

              <h1>Timetable</h1>

              <p>
                Organize weekly classes, subjects,
                teachers and room schedules.
              </p>
            </div>

            <button
              type="button"
              className="timetable-add-button"
              onClick={openAddModal}
            >
              <FiPlus />
              Add Schedule
            </button>
          </div>

          <div className="timetable-stats">
            <div className="timetable-stat-card">
              <div className="timetable-stat-icon">
                <FiCalendar />
              </div>

              <div>
                <span>Total Schedules</span>
                <strong>
                  {timetables.length}
                </strong>
              </div>
            </div>

            <div className="timetable-stat-card">
              <div className="timetable-stat-icon">
                <FiUsers />
              </div>

              <div>
                <span>Classes Covered</span>
                <strong>{classCount}</strong>
              </div>
            </div>

            <div className="timetable-stat-card">
              <div className="timetable-stat-icon">
                <FiClock />
              </div>

              <div>
                <span>Active Schedules</span>
                <strong>{activeCount}</strong>
              </div>
            </div>

            <div className="timetable-stat-card">
              <div className="timetable-stat-icon">
                <FiCalendar />
              </div>

              <div>
                <span>Inactive Schedules</span>
                <strong>
                  {inactiveCount}
                </strong>
              </div>
            </div>
          </div>

          <section className="timetable-card">
            <div className="timetable-toolbar">
              <div className="timetable-search">
                <FiSearch />

                <input
                  type="text"
                  placeholder="Search class, subject, teacher or room..."
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                />
              </div>

              <div className="timetable-filters">
                <select
                  value={dayFilter}
                  onChange={(event) =>
                    setDayFilter(event.target.value)
                  }
                >
                  <option value="All">
                    All Days
                  </option>

                  {DAYS.map((day) => (
                    <option
                      key={day}
                      value={day}
                    >
                      {day}
                    </option>
                  ))}
                </select>

                <select
                  value={classFilter}
                  onChange={(event) =>
                    setClassFilter(event.target.value)
                  }
                >
                  <option value="All">
                    All Classes
                  </option>

                  {classNames.map((className) => (
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
                  className="timetable-refresh"
                  onClick={handleRefresh}
                  disabled={loading}
                  aria-label="Refresh timetable"
                >
                  <FiRefreshCw
                    className={
                      loading
                        ? "timetable-refresh-spin"
                        : ""
                    }
                  />
                </button>
              </div>
            </div>

            {error && (
              <div
                className="timetable-error"
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
              <div className="timetable-loading">
                <div className="timetable-loader"></div>

                <span>
                  Loading timetable...
                </span>
              </div>
            ) : paginatedTimetables.length ===
              0 ? (
              <div className="timetable-empty">
                <div className="timetable-empty-icon">
                  <FiCalendar />
                </div>

                <h3>
                  {timetables.length === 0
                    ? "No timetable entries yet"
                    : "No matching schedules"}
                </h3>

                <p>
                  {timetables.length === 0
                    ? "Add your first class schedule to get started."
                    : "Try changing your search or filters."}
                </p>

                {timetables.length === 0 && (
                  <button
                    type="button"
                    onClick={openAddModal}
                  >
                    <FiPlus />
                    Add Schedule
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="timetable-table-wrapper">
                  <table className="timetable-table">
                    <thead>
                      <tr>
                        <th>DAY</th>
                        <th>TIME</th>
                        <th>CLASS</th>
                        <th>SUBJECT</th>
                        <th>TEACHER</th>
                        <th>ROOM</th>
                        <th>STATUS</th>
                        <th>ACTIONS</th>
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedTimetables.map(
                        (item) => (
                          <tr key={item._id}>
                            <td>
                              <span className="timetable-day">
                                {item.day}
                              </span>
                            </td>

                            <td>
                              <div className="timetable-time">
                                <strong>
                                  {item.startTime}
                                </strong>

                                <span>
                                  {item.endTime}
                                </span>
                              </div>
                            </td>

                            <td>
                              <div className="timetable-class">
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
                              <div className="timetable-subject">
                                <div className="timetable-subject-icon">
                                  <FiBookOpen />
                                </div>

                                <span>
                                  {item.subjectName}
                                </span>
                              </div>
                            </td>

                            <td>
                              {item.teacherName}
                            </td>

                            <td>
                              {item.roomNumber || "—"}
                            </td>

                            <td>
                              <span
                                className={`timetable-status ${
                                  item.status ===
                                  "Active"
                                    ? "active"
                                    : "inactive"
                                }`}
                              >
                                {item.status}
                              </span>
                            </td>

                            <td>
                              <div className="timetable-actions">
                                <button
                                  type="button"
                                  className="timetable-edit-button"
                                  onClick={() =>
                                    openEditModal(
                                      item
                                    )
                                  }
                                  aria-label="Edit schedule"
                                >
                                  <FiEdit2 />
                                </button>

                                <button
                                  type="button"
                                  className="timetable-delete-button"
                                  onClick={() =>
                                    openDeleteModal(
                                      item
                                    )
                                  }
                                  aria-label="Delete schedule"
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

                <div className="timetable-pagination">
                  <span>
                    Showing{" "}
                    {filteredTimetables.length === 0
                      ? 0
                      : (currentPage - 1) *
                          ITEMS_PER_PAGE +
                        1}{" "}
                    to{" "}
                    {Math.min(
                      currentPage *
                        ITEMS_PER_PAGE,
                      filteredTimetables.length
                    )}{" "}
                    of{" "}
                    {filteredTimetables.length}
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

                    <span className="timetable-page-number">
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
        <div className="timetable-modal-overlay">
          <div className="timetable-modal">
            <div className="timetable-modal-header">
              <div>
                <span>
                  TIMETABLE MANAGEMENT
                </span>

                <h2>
                  {editingTimetable
                    ? "Edit Schedule"
                    : "Add Schedule"}
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
              className="timetable-form"
              onSubmit={handleSubmit}
            >
              {formError && (
                <div className="timetable-form-error">
                  {formError}
                </div>
              )}

              <div className="timetable-form-grid">
                <div className="timetable-form-group">
                  <label htmlFor="day">
                    Day *
                  </label>

                  <select
                    id="day"
                    name="day"
                    value={form.day}
                    onChange={handleFormChange}
                    disabled={saving}
                  >
                    {DAYS.map((day) => (
                      <option
                        key={day}
                        value={day}
                      >
                        {day}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="timetable-form-group">
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

                <div className="timetable-form-group">
                  <label htmlFor="section">
                    Section *
                  </label>

                  <input
                    id="section"
                    name="section"
                    type="text"
                    placeholder="e.g. A, B, Blue"
                    value={form.section}
                    onChange={handleFormChange}
                    disabled={saving}
                    autoComplete="off"
                  />
                </div>

                <div className="timetable-form-group">
                  <label htmlFor="subjectName">
                    Subject *
                  </label>

                  <input
                    id="subjectName"
                    name="subjectName"
                    type="text"
                    placeholder="e.g. Mathematics, English"
                    value={form.subjectName}
                    onChange={handleFormChange}
                    disabled={saving}
                    autoComplete="off"
                  />
                </div>

                <div className="timetable-form-group">
                  <label htmlFor="teacherName">
                    Teacher *
                  </label>

                  <input
                    id="teacherName"
                    name="teacherName"
                    type="text"
                    placeholder="Teacher name"
                    value={form.teacherName}
                    onChange={handleFormChange}
                    disabled={saving}
                  />
                </div>

                <div className="timetable-form-group">
                  <label htmlFor="roomNumber">
                    Room
                  </label>

                  <input
                    id="roomNumber"
                    name="roomNumber"
                    type="text"
                    placeholder="e.g. Room 05"
                    value={form.roomNumber}
                    onChange={handleFormChange}
                    disabled={saving}
                  />
                </div>

                <div className="timetable-form-group">
                  <label htmlFor="startTime">
                    Start Time *
                  </label>

                  <input
                    id="startTime"
                    name="startTime"
                    type="time"
                    value={form.startTime}
                    onChange={handleFormChange}
                    disabled={saving}
                  />
                </div>

                <div className="timetable-form-group">
                  <label htmlFor="endTime">
                    End Time *
                  </label>

                  <input
                    id="endTime"
                    name="endTime"
                    type="time"
                    value={form.endTime}
                    onChange={handleFormChange}
                    disabled={saving}
                  />
                </div>

                <div className="timetable-form-group">
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
              </div>

              <div className="timetable-modal-actions">
                <button
                  type="button"
                  className="timetable-cancel-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="timetable-save-button"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="timetable-button-spinner"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiPlus />
                      {editingTimetable
                        ? "Update Schedule"
                        : "Save Schedule"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen &&
        deletingTimetable && (
          <div className="timetable-modal-overlay">
            <div className="timetable-delete-modal">
              <div className="timetable-delete-icon">
                <FiTrash2 />
              </div>

              <h2>Delete Schedule?</h2>

              <p>
                Are you sure you want to delete the{" "}
                <strong>
                  {deletingTimetable.subjectName}
                </strong>{" "}
                schedule for{" "}
                <strong>
                  {deletingTimetable.className}{" "}
                  {deletingTimetable.section}
                </strong>
                ?
              </p>

              <div className="timetable-delete-actions">
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
                    : "Delete Schedule"}
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default Timetable;