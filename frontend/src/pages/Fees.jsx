import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
  FiAlertCircle,
  FiCalendar,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiDollarSign,
  FiEdit2,
  FiFilter,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiUsers,
  FiX,
} from "react-icons/fi";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

import "../styles/Fees.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const ITEMS_PER_PAGE = 8;

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const STATUS_OPTIONS = [
  "Paid",
  "Partial",
  "Unpaid",
  "Overdue",
];

const getToday = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatDate = (dateValue) => {
  if (!dateValue) {
    return "-";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatCurrency = (amount) => {
  return `₨ ${Number(amount || 0).toLocaleString(
    "en-PK"
  )}`;
};

const emptyForm = {
  studentId: "",
  studentName: "",
  className: "",
  section: "",
  month: MONTHS[new Date().getMonth()],
  totalFee: "",
  paidAmount: "",
  dueDate: getToday(),
  remarks: "",
};

const Fees = () => {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] =
    useState(true);

  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] =
    useState(false);

  const [searchTerm, setSearchTerm] =
    useState("");
  const [statusFilter, setStatusFilter] =
    useState("");
  const [monthFilter, setMonthFilter] =
    useState("");

  const [currentPage, setCurrentPage] =
    useState(1);

  const [showModal, setShowModal] =
    useState(false);

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [editingFee, setEditingFee] =
    useState(null);

  const [feeToDelete, setFeeToDelete] =
    useState(null);

  const [form, setForm] =
    useState(emptyForm);

  const [formError, setFormError] =
    useState("");

  const fetchFees = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/api/fees`,
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setFees(response.data.fees || []);
      }
    } catch (err) {
      console.error("Fetch Fees Error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load fee records"
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
        setStudents(
          response.data.students || []
        );
      }
    } catch (err) {
      console.error(
        "Fetch Students Error:",
        err
      );
    } finally {
      setStudentsLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
    fetchStudents();
  }, []);

  const filteredFees = useMemo(() => {
    const search = searchTerm
      .trim()
      .toLowerCase();

    return fees.filter((fee) => {
      const matchesSearch =
        !search ||
        fee.studentName
          ?.toLowerCase()
          .includes(search) ||
        fee.className
          ?.toLowerCase()
          .includes(search) ||
        fee.section
          ?.toLowerCase()
          .includes(search) ||
        fee.month
          ?.toLowerCase()
          .includes(search) ||
        fee.remarks
          ?.toLowerCase()
          .includes(search);

      const matchesStatus =
        !statusFilter ||
        fee.status === statusFilter;

      const matchesMonth =
        !monthFilter ||
        fee.month === monthFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesMonth
      );
    });
  }, [
    fees,
    searchTerm,
    statusFilter,
    monthFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredFees.length / ITEMS_PER_PAGE
    )
  );

  const paginatedFees = useMemo(() => {
    const start =
      (currentPage - 1) *
      ITEMS_PER_PAGE;

    return filteredFees.slice(
      start,
      start + ITEMS_PER_PAGE
    );
  }, [filteredFees, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const stats = useMemo(() => {
    const totalCollection = fees.reduce(
      (sum, fee) =>
        sum + Number(fee.paidAmount || 0),
      0
    );

    const totalRemaining = fees.reduce(
      (sum, fee) =>
        sum +
        Number(
          fee.remainingAmount || 0
        ),
      0
    );

    const paidCount = fees.filter(
      (fee) => fee.status === "Paid"
    ).length;

    const overdueCount = fees.filter(
      (fee) => fee.status === "Overdue"
    ).length;

    return {
      totalRecords: fees.length,
      totalCollection,
      totalRemaining,
      paidCount,
      overdueCount,
    };
  }, [fees]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = (event) => {
    setStatusFilter(event.target.value);
    setCurrentPage(1);
  };

  const handleMonthChange = (event) => {
    setMonthFilter(event.target.value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setMonthFilter("");
    setCurrentPage(1);
  };

  const handleRefresh = async () => {
    await Promise.all([
      fetchFees(),
      fetchStudents(),
    ]);
  };

  const openAddModal = () => {
    setEditingFee(null);
    setForm({
      ...emptyForm,
      month:
        MONTHS[new Date().getMonth()],
      dueDate: getToday(),
    });
    setFormError("");
    setShowModal(true);
  };

  const openEditModal = (fee) => {
    setEditingFee(fee);

    setForm({
      studentId: fee.studentId || "",
      studentName: fee.studentName || "",
      className: fee.className || "",
      section: fee.section || "",
      month: fee.month || "",
      totalFee:
        fee.totalFee ?? "",
      paidAmount:
        fee.paidAmount ?? "",
      dueDate: fee.dueDate
        ? new Date(fee.dueDate)
            .toISOString()
            .split("T")[0]
        : getToday(),
      remarks: fee.remarks || "",
    });

    setFormError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (actionLoading) {
      return;
    }

    setShowModal(false);
    setEditingFee(null);
    setForm(emptyForm);
    setFormError("");
  };

  const handleStudentChange = (event) => {
    const studentId =
      event.target.value;

    const selectedStudent =
      students.find(
        (student) =>
          student._id === studentId
      );

    if (!selectedStudent) {
      setForm((previous) => ({
        ...previous,
        studentId: "",
        studentName: "",
        className: "",
        section: "",
      }));

      return;
    }

    setForm((previous) => ({
      ...previous,
      studentId:
        selectedStudent._id,
      studentName:
        selectedStudent.name || "",
      className:
        selectedStudent.className || "",
      section:
        selectedStudent.section || "",
    }));
  };

  const handleFormChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const remainingAmount = Math.max(
    Number(form.totalFee || 0) -
      Number(form.paidAmount || 0),
    0
  );

  const getPreviewStatus = () => {
    const total = Number(
      form.totalFee || 0
    );
    const paid = Number(
      form.paidAmount || 0
    );

    if (paid > total && total >= 0) {
      return "Invalid";
    }

    if (total > 0 && paid >= total) {
      return "Paid";
    }

    if (paid > 0 && paid < total) {
      return "Partial";
    }

    if (
      remainingAmount > 0 &&
      form.dueDate &&
      new Date(form.dueDate) <
        new Date()
    ) {
      return "Overdue";
    }

    return "Unpaid";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setFormError("");

    if (
      !form.studentId ||
      !form.month ||
      form.totalFee === "" ||
      !form.dueDate
    ) {
      setFormError(
        "Please fill all required fields."
      );
      return;
    }

    const total = Number(
      form.totalFee
    );

    const paid = Number(
      form.paidAmount || 0
    );

    if (
      Number.isNaN(total) ||
      Number.isNaN(paid) ||
      total < 0 ||
      paid < 0
    ) {
      setFormError(
        "Please enter valid fee amounts."
      );
      return;
    }

    if (paid > total) {
      setFormError(
        "Paid amount cannot be greater than total fee."
      );
      return;
    }

    try {
      setActionLoading(true);

      const payload = {
        studentId: form.studentId,
        studentName: form.studentName,
        className: form.className,
        section: form.section,
        month: form.month,
        totalFee: total,
        paidAmount: paid,
        dueDate: form.dueDate,
        remarks: form.remarks,
      };

      let response;

      if (editingFee) {
        response = await axios.put(
          `${API_URL}/api/fees/${editingFee._id}`,
          payload,
          {
            withCredentials: true,
          }
        );
      } else {
        response = await axios.post(
          `${API_URL}/api/fees`,
          payload,
          {
            withCredentials: true,
          }
        );
      }

      if (response.data.success) {
        closeModal();
        await fetchFees();
      }
    } catch (err) {
      console.error(
        "Save Fee Error:",
        err
      );

      setFormError(
        err.response?.data?.message ||
          "Failed to save fee record."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const openDeleteModal = (fee) => {
    setFeeToDelete(fee);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    if (actionLoading) {
      return;
    }

    setShowDeleteModal(false);
    setFeeToDelete(null);
  };

  const handleDelete = async () => {
    if (!feeToDelete) {
      return;
    }

    try {
      setActionLoading(true);

      const response =
        await axios.delete(
          `${API_URL}/api/fees/${feeToDelete._id}`,
          {
            withCredentials: true,
          }
        );

      if (response.data.success) {
        closeDeleteModal();
        await fetchFees();
      }
    } catch (err) {
      console.error(
        "Delete Fee Error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to delete fee record"
      );

      closeDeleteModal();
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusClass = (status) => {
    return (
      `fee-status fee-status-${String(
        status || ""
      ).toLowerCase()}`
    );
  };

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
          className="sidebar-overlay"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      <div className="dashboard-main">
        <Topbar
          onMenuClick={() =>
            setSidebarOpen(true)
          }
        />

        <main className="fees-page">
          <div className="fees-page-header">
            <div>
              <span className="fees-eyebrow">
                FINANCE MANAGEMENT
              </span>

              <h1>Fees</h1>

              <p>
                Manage student fees, collections
                and outstanding balances.
              </p>
            </div>

            <div className="fees-header-actions">
              <button
                type="button"
                className="fees-refresh-button"
                onClick={handleRefresh}
                disabled={loading}
              >
                <FiRefreshCw
                  className={
                    loading
                      ? "fees-spin"
                      : ""
                  }
                />
                Refresh
              </button>

              <button
                type="button"
                className="fees-primary-button"
                onClick={openAddModal}
              >
                <FiPlus />
                Add Fee
              </button>
            </div>
          </div>

          <section className="fees-stats-grid">
            <div className="fee-stat-card">
              <div className="fee-stat-icon">
                <FiUsers />
              </div>

              <div>
                <span>Total Records</span>
                <strong>
                  {stats.totalRecords}
                </strong>
              </div>
            </div>

            <div className="fee-stat-card">
              <div className="fee-stat-icon collection">
                <FiDollarSign />
              </div>

              <div>
                <span>Total Collection</span>
                <strong>
                  {formatCurrency(
                    stats.totalCollection
                  )}
                </strong>
              </div>
            </div>

            <div className="fee-stat-card">
              <div className="fee-stat-icon remaining">
                <FiAlertCircle />
              </div>

              <div>
                <span>Outstanding</span>
                <strong>
                  {formatCurrency(
                    stats.totalRemaining
                  )}
                </strong>
              </div>
            </div>

            <div className="fee-stat-card">
              <div className="fee-stat-icon paid">
                <FiCheckCircle />
              </div>

              <div>
                <span>Paid Records</span>
                <strong>
                  {stats.paidCount}
                </strong>
              </div>
            </div>
          </section>

          <section className="fees-content-card">
            <div className="fees-toolbar">
              <div className="fees-search">
                <FiSearch />

                <input
                  type="text"
                  value={searchTerm}
                  onChange={
                    handleSearchChange
                  }
                  placeholder="Search student, class, month..."
                />
              </div>

              <div className="fees-filters">
                <div className="fees-filter">
                  <FiFilter />

                  <select
                    value={monthFilter}
                    onChange={
                      handleMonthChange
                    }
                  >
                    <option value="">
                      All Months
                    </option>

                    {MONTHS.map(
                      (month) => (
                        <option
                          key={month}
                          value={month}
                        >
                          {month}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="fees-filter">
                  <select
                    value={statusFilter}
                    onChange={
                      handleStatusChange
                    }
                  >
                    <option value="">
                      All Status
                    </option>

                    {STATUS_OPTIONS.map(
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

                {(searchTerm ||
                  statusFilter ||
                  monthFilter) && (
                  <button
                    type="button"
                    className="fees-clear-button"
                    onClick={
                      clearFilters
                    }
                  >
                    <FiX />
                    Clear
                  </button>
                )}
              </div>
            </div>

            {error && (
              <div className="fees-error">
                <FiAlertCircle />
                <span>{error}</span>

                <button
                  type="button"
                  onClick={() =>
                    setError("")
                  }
                >
                  <FiX />
                </button>
              </div>
            )}

            <div className="fees-table-wrapper">
              {loading ? (
                <div className="fees-state">
                  <div className="fees-loader"></div>
                  <p>
                    Loading fee records...
                  </p>
                </div>
              ) : paginatedFees.length ===
                0 ? (
                <div className="fees-state">
                  <div className="fees-empty-icon">
                    <FiDollarSign />
                  </div>

                  <h3>
                    No fee records found
                  </h3>

                  <p>
                    Add a fee record or change
                    your search filters.
                  </p>

                  <button
                    type="button"
                    className="fees-primary-button"
                    onClick={openAddModal}
                  >
                    <FiPlus />
                    Add Fee
                  </button>
                </div>
              ) : (
                <table className="fees-table">
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
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedFees.map(
                      (fee) => (
                        <tr key={fee._id}>
                          <td>
                            <div className="fee-student-cell">
                              <div className="fee-student-avatar">
                                {fee.studentName
                                  ?.charAt(
                                    0
                                  )
                                  .toUpperCase() ||
                                  "S"}
                              </div>

                              <div>
                                <strong>
                                  {
                                    fee.studentName
                                  }
                                </strong>

                                <span>
                                  {
                                    fee.studentId
                                  }
                                </span>
                              </div>
                            </div>
                          </td>

                          <td>
                            <div className="fee-class-cell">
                              <strong>
                                {
                                  fee.className
                                }
                              </strong>

                              <span>
                                Section{" "}
                                {
                                  fee.section
                                }
                              </span>
                            </div>
                          </td>

                          <td>
                            <span className="fee-month">
                              {fee.month}
                            </span>
                          </td>

                          <td>
                            <strong className="fee-amount">
                              {formatCurrency(
                                fee.totalFee
                              )}
                            </strong>
                          </td>

                          <td>
                            <strong className="fee-paid-amount">
                              {formatCurrency(
                                fee.paidAmount
                              )}
                            </strong>
                          </td>

                          <td>
                            <strong
                              className={
                                Number(
                                  fee.remainingAmount
                                ) > 0
                                  ? "fee-remaining-amount"
                                  : "fee-paid-full"
                              }
                            >
                              {formatCurrency(
                                fee.remainingAmount
                              )}
                            </strong>
                          </td>

                          <td>
                            <div className="fee-due-date">
                              <FiCalendar />
                              {formatDate(
                                fee.dueDate
                              )}
                            </div>
                          </td>

                          <td>
                            <span
                              className={getStatusClass(
                                fee.status
                              )}
                            >
                              {fee.status}
                            </span>
                          </td>

                          <td>
                            <div className="fee-actions">
                              <button
                                type="button"
                                className="fee-action edit"
                                onClick={() =>
                                  openEditModal(
                                    fee
                                  )
                                }
                                aria-label="Edit fee"
                              >
                                <FiEdit2 />
                              </button>

                              <button
                                type="button"
                                className="fee-action delete"
                                onClick={() =>
                                  openDeleteModal(
                                    fee
                                  )
                                }
                                aria-label="Delete fee"
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
              filteredFees.length > 0 && (
                <div className="fees-pagination">
                  <span>
                    Showing{" "}
                    <strong>
                      {Math.min(
                        (currentPage - 1) *
                          ITEMS_PER_PAGE +
                          1,
                        filteredFees.length
                      )}
                    </strong>{" "}
                    to{" "}
                    <strong>
                      {Math.min(
                        currentPage *
                          ITEMS_PER_PAGE,
                        filteredFees.length
                      )}
                    </strong>{" "}
                    of{" "}
                    <strong>
                      {filteredFees.length}
                    </strong>{" "}
                    records
                  </span>

                  <div className="fees-pagination-buttons">
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage(
                          (page) =>
                            Math.max(
                              page - 1,
                              1
                            )
                        )
                      }
                      disabled={
                        currentPage === 1
                      }
                    >
                      <FiChevronLeft />
                    </button>

                    {Array.from(
                      {
                        length: totalPages,
                      },
                      (_, index) =>
                        index + 1
                    )
                      .slice(
                        Math.max(
                          0,
                          currentPage - 3
                        ),
                        Math.min(
                          totalPages,
                          currentPage + 2
                        )
                      )
                      .map((page) => (
                        <button
                          type="button"
                          key={page}
                          className={
                            currentPage ===
                            page
                              ? "active"
                              : ""
                          }
                          onClick={() =>
                            setCurrentPage(
                              page
                            )
                          }
                        >
                          {page}
                        </button>
                      ))}

                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage(
                          (page) =>
                            Math.min(
                              page + 1,
                              totalPages
                            )
                        )
                      }
                      disabled={
                        currentPage ===
                        totalPages
                      }
                    >
                      <FiChevronRight />
                    </button>
                  </div>
                </div>
              )}
          </section>
        </main>
      </div>

      {showModal && (
        <div
          className="fees-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >
          <div className="fees-modal">
            <div className="fees-modal-header">
              <div>
                <span>
                  {editingFee
                    ? "UPDATE RECORD"
                    : "NEW RECORD"}
                </span>

                <h2>
                  {editingFee
                    ? "Edit Fee"
                    : "Add Fee"}
                </h2>

                <p>
                  Enter the student's monthly
                  fee details.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={actionLoading}
              >
                <FiX />
              </button>
            </div>

            <form
              className="fees-form"
              onSubmit={handleSubmit}
            >
              {formError && (
                <div className="fees-form-error">
                  <FiAlertCircle />
                  {formError}
                </div>
              )}

              <div className="fees-form-grid">
                <div className="fees-form-group full">
                  <label>
                    Student{" "}
                    <span>*</span>
                  </label>

                  <select
                    name="studentId"
                    value={form.studentId}
                    onChange={
                      handleStudentChange
                    }
                    disabled={
                      studentsLoading ||
                      Boolean(editingFee)
                    }
                    required
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
                          {
                            student.className
                          }{" "}
                          (
                          {
                            student.section
                          }
                          )
                        </option>
                      )
                    )}
                  </select>

                  {editingFee && (
                    <small>
                      Student cannot be changed
                      while editing a fee record.
                    </small>
                  )}
                </div>

                <div className="fees-form-group">
                  <label>Class</label>

                  <input
                    type="text"
                    value={
                      form.className
                    }
                    readOnly
                    placeholder="Auto-filled"
                  />
                </div>

                <div className="fees-form-group">
                  <label>Section</label>

                  <input
                    type="text"
                    value={
                      form.section
                    }
                    readOnly
                    placeholder="Auto-filled"
                  />
                </div>

                <div className="fees-form-group">
                  <label>
                    Fee Month{" "}
                    <span>*</span>
                  </label>

                  <select
                    name="month"
                    value={form.month}
                    onChange={
                      handleFormChange
                    }
                    required
                  >
                    <option value="">
                      Select month
                    </option>

                    {MONTHS.map(
                      (month) => (
                        <option
                          key={month}
                          value={month}
                        >
                          {month}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="fees-form-group">
                  <label>
                    Due Date{" "}
                    <span>*</span>
                  </label>

                  <div className="fees-input-icon">
                    <FiCalendar />

                    <input
                      type="date"
                      name="dueDate"
                      value={
                        form.dueDate
                      }
                      onChange={
                        handleFormChange
                      }
                      required
                    />
                  </div>
                </div>

                <div className="fees-form-group">
                  <label>
                    Total Fee{" "}
                    <span>*</span>
                  </label>

                  <div className="fees-input-icon">
                    <span className="currency-symbol">
                      ₨
                    </span>

                    <input
                      type="number"
                      name="totalFee"
                      min="0"
                      step="0.01"
                      value={
                        form.totalFee
                      }
                      onChange={
                        handleFormChange
                      }
                      placeholder="0"
                      required
                    />
                  </div>
                </div>

                <div className="fees-form-group">
                  <label>Paid Amount</label>

                  <div className="fees-input-icon">
                    <span className="currency-symbol">
                      ₨
                    </span>

                    <input
                      type="number"
                      name="paidAmount"
                      min="0"
                      step="0.01"
                      value={
                        form.paidAmount
                      }
                      onChange={
                        handleFormChange
                      }
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="fees-form-group">
                  <label>Remaining Amount</label>

                  <div className="fees-calculated-field">
                    <span>₨</span>
                    {remainingAmount.toLocaleString(
                      "en-PK"
                    )}
                  </div>
                </div>

                <div className="fees-form-group">
                  <label>Payment Status</label>

                  <div className="fees-preview-status">
                    <span
                      className={getStatusClass(
                        getPreviewStatus()
                      )}
                    >
                      {getPreviewStatus()}
                    </span>
                  </div>
                </div>

                <div className="fees-form-group full">
                  <label>Remarks</label>

                  <textarea
                    name="remarks"
                    value={
                      form.remarks
                    }
                    onChange={
                      handleFormChange
                    }
                    placeholder="Add any notes about this fee..."
                    rows="3"
                  />
                </div>
              </div>

              <div className="fees-modal-footer">
                <button
                  type="button"
                  className="fees-cancel-button"
                  onClick={closeModal}
                  disabled={actionLoading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="fees-primary-button"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <span className="fees-button-spinner"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiCheckCircle />
                      {editingFee
                        ? "Update Fee"
                        : "Save Fee"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal &&
        feeToDelete && (
          <div className="fees-modal-overlay">
            <div className="fees-delete-modal">
              <div className="fees-delete-icon">
                <FiTrash2 />
              </div>

              <h2>
                Delete Fee Record?
              </h2>

              <p>
                Are you sure you want to delete
                the fee record for{" "}
                <strong>
                  {feeToDelete.studentName}
                </strong>
                ?
              </p>

              <div className="fees-delete-info">
                <span>
                  {feeToDelete.month}
                </span>

                <strong>
                  {formatCurrency(
                    feeToDelete.totalFee
                  )}
                </strong>
              </div>

              <div className="fees-delete-actions">
                <button
                  type="button"
                  className="fees-cancel-button"
                  onClick={
                    closeDeleteModal
                  }
                  disabled={actionLoading}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="fees-delete-confirm"
                  onClick={handleDelete}
                  disabled={actionLoading}
                >
                  {actionLoading
                    ? "Deleting..."
                    : "Delete Record"}
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default Fees;