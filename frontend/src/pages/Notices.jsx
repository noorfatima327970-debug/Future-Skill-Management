import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FiBell,
  FiCalendar,
  FiEdit2,
  FiEye,
  FiFileText,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiUsers,
  FiX,
} from "react-icons/fi";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "../styles/Notices.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const initialForm = {
  title: "",
  description: "",
  noticeDate: "",
  noticeType: "General",
  targetAudience: "All",
  status: "Published",
  createdBy: "Admin",
};

const noticeTypes = [
  "General",
  "Academic",
  "Event",
  "Holiday",
  "Exam",
  "Fee",
  "Important",
];

const audiences = [
  "All",
  "Students",
  "Teachers",
  "Staff",
];

const statuses = ["Published", "Draft"];

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getToday = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  const localDate = new Date(
    date.getTime() - offset * 60 * 1000
  );

  return localDate.toISOString().split("T")[0];
};

const Notices = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [audienceFilter, setAudienceFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  const [editingNotice, setEditingNotice] = useState(null);
  const [viewingNotice, setViewingNotice] = useState(null);

  const [formData, setFormData] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchNotices = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await axios.get(
        `${API_URL}/api/notices`,
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setNotices(response.data.notices || []);
      } else {
        setError("Failed to load notices.");
      }
    } catch (err) {
      console.error("Fetch Notices Error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load notices."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const filteredNotices = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    return notices.filter((notice) => {
      const matchesSearch =
        !search ||
        notice.title?.toLowerCase().includes(search) ||
        notice.description
          ?.toLowerCase()
          .includes(search) ||
        notice.noticeType
          ?.toLowerCase()
          .includes(search) ||
        notice.targetAudience
          ?.toLowerCase()
          .includes(search);

      const matchesType =
        typeFilter === "All" ||
        notice.noticeType === typeFilter;

      const matchesAudience =
        audienceFilter === "All" ||
        notice.targetAudience === audienceFilter;

      const matchesStatus =
        statusFilter === "All" ||
        notice.status === statusFilter;

      return (
        matchesSearch &&
        matchesType &&
        matchesAudience &&
        matchesStatus
      );
    });
  }, [
    notices,
    searchTerm,
    typeFilter,
    audienceFilter,
    statusFilter,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    typeFilter,
    audienceFilter,
    statusFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredNotices.length / itemsPerPage
    )
  );

  const paginatedNotices = filteredNotices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const publishedCount = notices.filter(
    (notice) => notice.status === "Published"
  ).length;

  const draftCount = notices.filter(
    (notice) => notice.status === "Draft"
  ).length;

  const importantCount = notices.filter(
    (notice) => notice.noticeType === "Important"
  ).length;

  const todayCount = notices.filter((notice) => {
    if (!notice.noticeDate) return false;

    const noticeDate = new Date(notice.noticeDate);
    const today = new Date();

    return (
      noticeDate.getFullYear() === today.getFullYear() &&
      noticeDate.getMonth() === today.getMonth() &&
      noticeDate.getDate() === today.getDate()
    );
  }).length;

  const openAddModal = () => {
    setEditingNotice(null);

    setFormData({
      ...initialForm,
      noticeDate: getToday(),
    });

    setShowModal(true);
  };

  const openEditModal = (notice) => {
    setEditingNotice(notice);

    setFormData({
      title: notice.title || "",
      description: notice.description || "",
      noticeDate: notice.noticeDate
        ? new Date(notice.noticeDate)
            .toISOString()
            .split("T")[0]
        : "",
      noticeType:
        notice.noticeType || "General",
      targetAudience:
        notice.targetAudience || "All",
      status:
        notice.status || "Published",
      createdBy:
        notice.createdBy || "Admin",
    });

    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingNotice(null);
    setFormData(initialForm);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.noticeDate
    ) {
      setError(
        "Title, description and notice date are required."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      if (editingNotice) {
        await axios.put(
          `${API_URL}/api/notices/${editingNotice._id}`,
          formData,
          {
            withCredentials: true,
          }
        );
      } else {
        await axios.post(
          `${API_URL}/api/notices`,
          formData,
          {
            withCredentials: true,
          }
        );
      }

      closeModal();
      await fetchNotices();
    } catch (err) {
      console.error("Save Notice Error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to save notice."
      );
    } finally {
      setSaving(false);
    }
  };

  const openViewModal = (notice) => {
    setViewingNotice(notice);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setViewingNotice(null);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setDeleting(true);
      setError("");

      await axios.delete(
        `${API_URL}/api/notices/${deleteId}`,
        {
          withCredentials: true,
        }
      );

      setDeleteId(null);
      await fetchNotices();
    } catch (err) {
      console.error("Delete Notice Error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to delete notice."
      );
    } finally {
      setDeleting(false);
    }
  };

  const getTypeClass = (type) => {
    return (
      "notice-type-badge " +
      type?.toLowerCase().replace(/\s+/g, "-")
    );
  };

  return (
    <div className="dashboard-layout">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="dashboard-main">
        <Topbar
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <main className="notices-page">
          <div className="notices-header">
            <div>
              <span className="notices-eyebrow">
                COMMUNICATION
              </span>

              <h1>Notices</h1>

              <p>
                Create and manage important school
                announcements.
              </p>
            </div>

            <button
              type="button"
              className="notices-add-button"
              onClick={openAddModal}
            >
              <FiPlus />
              Add Notice
            </button>
          </div>

          {error && (
            <div className="notices-error">
              <span>{error}</span>

              <button
                type="button"
                onClick={() => setError("")}
              >
                <FiX />
              </button>
            </div>
          )}

          <section className="notices-stats">
            <div className="notice-stat-card">
              <div className="notice-stat-icon total">
                <FiBell />
              </div>

              <div>
                <span>Total Notices</span>
                <strong>{notices.length}</strong>
              </div>
            </div>

            <div className="notice-stat-card">
              <div className="notice-stat-icon published">
                <FiEye />
              </div>

              <div>
                <span>Published</span>
                <strong>{publishedCount}</strong>
              </div>
            </div>

            <div className="notice-stat-card">
              <div className="notice-stat-icon draft">
                <FiFileText />
              </div>

              <div>
                <span>Drafts</span>
                <strong>{draftCount}</strong>
              </div>
            </div>

            <div className="notice-stat-card">
              <div className="notice-stat-icon important">
                <FiCalendar />
              </div>

              <div>
                <span>Today</span>
                <strong>{todayCount}</strong>
              </div>
            </div>
          </section>

          <section className="notices-card">
            <div className="notices-toolbar">
              <div className="notices-search">
                <FiSearch />

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
                  }
                  placeholder="Search notices..."
                />
              </div>

              <div className="notices-filters">
                <select
                  value={typeFilter}
                  onChange={(event) =>
                    setTypeFilter(event.target.value)
                  }
                >
                  <option value="All">
                    All Types
                  </option>

                  {noticeTypes.map((type) => (
                    <option
                      key={type}
                      value={type}
                    >
                      {type}
                    </option>
                  ))}
                </select>

                <select
                  value={audienceFilter}
                  onChange={(event) =>
                    setAudienceFilter(
                      event.target.value
                    )
                  }
                >
                  <option value="All">
                    All Audiences
                  </option>

                  {audiences.map((audience) => (
                    <option
                      key={audience}
                      value={audience}
                    >
                      {audience}
                    </option>
                  ))}
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

                  {statuses.map((status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {status}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  className="notices-refresh"
                  onClick={() =>
                    fetchNotices(true)
                  }
                  disabled={refreshing}
                  title="Refresh notices"
                >
                  <FiRefreshCw
                    className={
                      refreshing
                        ? "spin"
                        : ""
                    }
                  />
                </button>
              </div>
            </div>

            <div className="notices-table-wrapper">
              {loading ? (
                <div className="notices-loading">
                  <div className="notices-loader"></div>
                  <span>
                    Loading notices...
                  </span>
                </div>
              ) : paginatedNotices.length === 0 ? (
                <div className="notices-empty">
                  <div className="notices-empty-icon">
                    <FiBell />
                  </div>

                  <h3>No notices found</h3>

                  <p>
                    Try changing your filters or
                    create a new notice.
                  </p>

                  <button
                    type="button"
                    onClick={openAddModal}
                  >
                    <FiPlus />
                    Add Notice
                  </button>
                </div>
              ) : (
                <table className="notices-table">
                  <thead>
                    <tr>
                      <th>Notice</th>
                      <th>Type</th>
                      <th>Audience</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedNotices.map(
                      (notice) => (
                        <tr key={notice._id}>
                          <td>
                            <div className="notice-title-cell">
                              <div className="notice-row-icon">
                                <FiBell />
                              </div>

                              <div>
                                <strong>
                                  {notice.title}
                                </strong>

                                <span>
                                  {notice.description
                                    ?.length > 70
                                    ? `${notice.description.slice(
                                        0,
                                        70
                                      )}...`
                                    : notice.description}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span
                              className={getTypeClass(
                                notice.noticeType
                              )}
                            >
                              {notice.noticeType}
                            </span>
                          </td>

                          <td>
                            <div className="notice-audience">
                              <FiUsers />
                              <span>
                                {notice.targetAudience}
                              </span>
                            </div>
                          </td>

                          <td>
                            <span className="notice-date">
                              {formatDate(
                                notice.noticeDate
                              )}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`notice-status ${
                                notice.status ===
                                "Published"
                                  ? "published"
                                  : "draft"
                              }`}
                            >
                              <span></span>
                              {notice.status}
                            </span>
                          </td>

                          <td>
                            <div className="notice-actions">
                              <button
                                type="button"
                                className="view"
                                onClick={() =>
                                  openViewModal(
                                    notice
                                  )
                                }
                                title="View notice"
                              >
                                <FiEye />
                              </button>

                              <button
                                type="button"
                                className="edit"
                                onClick={() =>
                                  openEditModal(
                                    notice
                                  )
                                }
                                title="Edit notice"
                              >
                                <FiEdit2 />
                              </button>

                              <button
                                type="button"
                                className="delete"
                                onClick={() =>
                                  setDeleteId(
                                    notice._id
                                  )
                                }
                                title="Delete notice"
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
              )}
            </div>

            {!loading &&
              filteredNotices.length > 0 && (
                <div className="notices-pagination">
                  <span>
                    Showing{" "}
                    <strong>
                      {(currentPage - 1) *
                        itemsPerPage +
                        1}
                    </strong>{" "}
                    to{" "}
                    <strong>
                      {Math.min(
                        currentPage *
                          itemsPerPage,
                        filteredNotices.length
                      )}
                    </strong>{" "}
                    of{" "}
                    <strong>
                      {filteredNotices.length}
                    </strong>{" "}
                    notices
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
                        key={page}
                        type="button"
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

      {showModal && (
        <div
          className="notice-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >
          <div className="notice-modal">
            <div className="notice-modal-header">
              <div>
                <span>
                  {editingNotice
                    ? "UPDATE NOTICE"
                    : "NEW NOTICE"}
                </span>

                <h2>
                  {editingNotice
                    ? "Edit Notice"
                    : "Create Notice"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="notice-form-grid">
                <div className="notice-form-group full">
                  <label>
                    Notice Title
                  </label>

                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter notice title"
                    required
                  />
                </div>

                <div className="notice-form-group">
                  <label>
                    Notice Type
                  </label>

                  <select
                    name="noticeType"
                    value={
                      formData.noticeType
                    }
                    onChange={handleChange}
                  >
                    {noticeTypes.map(
                      (type) => (
                        <option
                          key={type}
                          value={type}
                        >
                          {type}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="notice-form-group">
                  <label>
                    Notice Date
                  </label>

                  <input
                    type="date"
                    name="noticeDate"
                    value={
                      formData.noticeDate
                    }
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="notice-form-group">
                  <label>
                    Target Audience
                  </label>

                  <select
                    name="targetAudience"
                    value={
                      formData.targetAudience
                    }
                    onChange={handleChange}
                  >
                    {audiences.map(
                      (audience) => (
                        <option
                          key={audience}
                          value={audience}
                        >
                          {audience}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="notice-form-group">
                  <label>Status</label>

                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    {statuses.map(
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

                <div className="notice-form-group full">
                  <label>
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={
                      formData.description
                    }
                    onChange={handleChange}
                    placeholder="Write the notice details..."
                    rows="6"
                    required
                  />
                </div>
              </div>

              <div className="notice-modal-footer">
                <button
                  type="button"
                  className="cancel"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="button-spinner"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiFileText />
                      {editingNotice
                        ? "Update Notice"
                        : "Create Notice"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showViewModal &&
        viewingNotice && (
          <div
            className="notice-modal-overlay"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closeViewModal();
              }
            }}
          >
            <div className="notice-view-modal">
              <div className="notice-view-header">
                <div className="notice-view-icon">
                  <FiBell />
                </div>

                <button
                  type="button"
                  onClick={closeViewModal}
                >
                  <FiX />
                </button>
              </div>

              <div className="notice-view-content">
                <div className="notice-view-meta">
                  <span
                    className={getTypeClass(
                      viewingNotice.noticeType
                    )}
                  >
                    {viewingNotice.noticeType}
                  </span>

                  <span
                    className={`notice-status ${
                      viewingNotice.status ===
                      "Published"
                        ? "published"
                        : "draft"
                    }`}
                  >
                    <span></span>
                    {viewingNotice.status}
                  </span>
                </div>

                <h2>
                  {viewingNotice.title}
                </h2>

                <div className="notice-view-info">
                  <span>
                    <FiCalendar />
                    {formatDate(
                      viewingNotice.noticeDate
                    )}
                  </span>

                  <span>
                    <FiUsers />
                    {viewingNotice.targetAudience}
                  </span>
                </div>

                <div className="notice-view-description">
                  {viewingNotice.description}
                </div>

                <div className="notice-view-footer">
                  Created by{" "}
                  <strong>
                    {viewingNotice.createdBy ||
                      "Admin"}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        )}

      {deleteId && (
        <div
          className="notice-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setDeleteId(null);
            }
          }}
        >
          <div className="notice-delete-modal">
            <div className="delete-icon">
              <FiTrash2 />
            </div>

            <h2>Delete Notice?</h2>

            <p>
              Are you sure you want to delete this
              notice? This action cannot be undone.
            </p>

            <div className="delete-actions">
              <button
                type="button"
                className="cancel"
                onClick={() =>
                  setDeleteId(null)
                }
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
                {deleting
                  ? "Deleting..."
                  : "Delete Notice"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notices;