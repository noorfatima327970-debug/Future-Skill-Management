import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FiAlertCircle,
  FiAward,
  FiCheckCircle,
  FiEdit2,
  FiFilter,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiUser,
  FiUsers,
  FiX,
  FiXCircle,
} from "react-icons/fi";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "../styles/Results.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const ITEMS_PER_PAGE = 8;

const emptyForm = {
  studentId: "",
  examId: "",
  subjectName: "",
  obtainedMarks: "",
  remarks: "",
};

const Results = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [results, setResults] = useState([]);
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [editingResult, setEditingResult] = useState(null);
  const [deletingResult, setDeletingResult] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/api/results`,
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setResults(response.data.results || []);
      } else {
        setError(
          response.data.message ||
            "Failed to load results."
        );
      }
    } catch (err) {
      console.error(
        "Fetch Results Error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load results. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedData = async () => {
    try {
      const [
        studentsResponse,
        examsResponse,
      ] = await Promise.all([
        axios.get(`${API_URL}/api/students`, {
          withCredentials: true,
        }),
        axios.get(`${API_URL}/api/exams`, {
          withCredentials: true,
        }),
      ]);

      if (studentsResponse.data.success) {
        setStudents(
          studentsResponse.data.students || []
        );
      }

      if (examsResponse.data.success) {
        setExams(
          examsResponse.data.exams || []
        );
      }
    } catch (err) {
      console.error(
        "Fetch Result Related Data Error:",
        err
      );
    }
  };

  useEffect(() => {
    fetchResults();
    fetchRelatedData();
  }, []);

  /*
   * Class filter ab students API ke data ke saath
   * existing results se bhi build hota hai.
   */
  const classOptions = useMemo(() => {
    return [
      ...new Set(
        [
          ...students.map(
            (student) =>
              student.className
          ),
          ...results.map(
            (result) =>
              result.className
          ),
        ]
          .filter(Boolean)
          .map((value) =>
            value.trim()
          )
      ),
    ].sort((a, b) =>
      a.localeCompare(b)
    );
  }, [students, results]);

  const gradeOptions = [
    "A+",
    "A",
    "B",
    "C",
    "D",
    "F",
  ];

  const filteredResults = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return results.filter((result) => {
      const matchesSearch =
        !query ||
        result.studentName
          ?.toLowerCase()
          .includes(query) ||
        result.examName
          ?.toLowerCase()
          .includes(query) ||
        result.subjectName
          ?.toLowerCase()
          .includes(query) ||
        result.className
          ?.toLowerCase()
          .includes(query) ||
        result.section
          ?.toLowerCase()
          .includes(query) ||
        result.grade
          ?.toLowerCase()
          .includes(query);

      const matchesClass =
        !classFilter ||
        result.className ===
          classFilter;

      const matchesStatus =
        !statusFilter ||
        result.status ===
          statusFilter;

      const matchesGrade =
        !gradeFilter ||
        result.grade ===
          gradeFilter;

      return (
        matchesSearch &&
        matchesClass &&
        matchesStatus &&
        matchesGrade
      );
    });
  }, [
    results,
    search,
    classFilter,
    statusFilter,
    gradeFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredResults.length /
        ITEMS_PER_PAGE
    )
  );

  const paginatedResults =
    filteredResults.slice(
      (currentPage - 1) *
        ITEMS_PER_PAGE,
      currentPage *
        ITEMS_PER_PAGE
    );

  useEffect(() => {
    if (
      currentPage >
      totalPages
    ) {
      setCurrentPage(
        totalPages
      );
    }
  }, [
    currentPage,
    totalPages,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    classFilter,
    statusFilter,
    gradeFilter,
  ]);

  const stats = useMemo(() => {
    const total =
      results.length;

    const passed =
      results.filter(
        (result) =>
          result.status ===
          "Pass"
      ).length;

    const failed =
      results.filter(
        (result) =>
          result.status ===
          "Fail"
      ).length;

    const average =
      total > 0
        ? (
            results.reduce(
              (
                sum,
                result
              ) =>
                sum +
                Number(
                  result.percentage ||
                    0
                ),
              0
            ) / total
          ).toFixed(1)
        : "0.0";

    return {
      total,
      passed,
      failed,
      average,
    };
  }, [results]);

  const openAddModal = () => {
    setEditingResult(null);
    setForm(emptyForm);
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (
    result
  ) => {
    setEditingResult(result);

    setForm({
      studentId:
        result.studentId ||
        "",
      examId:
        result.examId ||
        "",
      subjectName:
        result.subjectName ||
        "",
      obtainedMarks:
        result.obtainedMarks !==
        undefined
          ? String(
              result.obtainedMarks
            )
          : "",
      remarks:
        result.remarks || "",
    });

    setFormError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setEditingResult(null);
    setForm(emptyForm);
    setFormError("");
  };

  const selectedStudent =
    useMemo(() => {
      return students.find(
        (student) =>
          String(
            student._id
          ) ===
          String(
            form.studentId
          )
      );
    }, [
      students,
      form.studentId,
    ]);

  const selectedExam =
    useMemo(() => {
      return exams.find(
        (exam) =>
          String(exam._id) ===
          String(form.examId)
      );
    }, [
      exams,
      form.examId,
    ]);

  const availableExams =
    useMemo(() => {
      if (!form.studentId) {
        return exams;
      }

      if (!selectedStudent) {
        return exams;
      }

      const matchingExams =
        exams.filter(
          (exam) =>
            exam.className
              ?.trim() ===
              selectedStudent.className
                ?.trim() &&
            exam.section
              ?.trim()
              .toUpperCase() ===
              selectedStudent.section
                ?.trim()
                .toUpperCase()
        );

      return matchingExams.length >
        0
        ? matchingExams
        : exams;
    }, [
      exams,
      form.studentId,
      selectedStudent,
    ]);

  const obtainedMarksNumber =
    Number(
      form.obtainedMarks || 0
    );

  const totalMarksNumber =
    Number(
      selectedExam?.totalMarks ||
        0
    );

  const passingMarksNumber =
    Number(
      selectedExam?.passingMarks ||
        0
    );

  const previewPercentage =
    totalMarksNumber > 0
      ? Number(
          (
            (obtainedMarksNumber /
              totalMarksNumber) *
            100
          ).toFixed(2)
        )
      : 0;

  const previewGrade =
    previewPercentage >= 90
      ? "A+"
      : previewPercentage >=
        80
      ? "A"
      : previewPercentage >=
        70
      ? "B"
      : previewPercentage >=
        60
      ? "C"
      : previewPercentage >=
        50
      ? "D"
      : "F";

  const previewStatus =
    totalMarksNumber > 0 &&
    obtainedMarksNumber >=
      passingMarksNumber
      ? "Pass"
      : "Fail";

  /*
   * Generic form handler.
   *
   * Subject ab simple text input hai.
   * Isliye Exam change hone par subject ko
   * automatically overwrite nahi kiya jayega.
   */
  const handleFormChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setForm(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );

    setFormError("");

    /*
     * Student change hone par related exam
     * reset karna continue rakha gaya hai.
     */
    if (
      name ===
      "studentId"
    ) {
      setForm(
        (previous) => ({
          ...previous,
          studentId: value,
          examId: "",
        })
      );
    }
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setFormError("");

    if (
      !form.studentId ||
      !form.examId ||
      !form.subjectName.trim() ||
      form.obtainedMarks ===
        ""
    ) {
      setFormError(
        "Please fill all required fields."
      );
      return;
    }

    const obtainedMarks =
      Number(
        form.obtainedMarks
      );

    if (
      !Number.isFinite(
        obtainedMarks
      )
    ) {
      setFormError(
        "Obtained marks must be a valid number."
      );
      return;
    }

    if (
      obtainedMarks < 0
    ) {
      setFormError(
        "Obtained marks cannot be negative."
      );
      return;
    }

    if (
      selectedExam &&
      obtainedMarks >
        Number(
          selectedExam.totalMarks
        )
    ) {
      setFormError(
        "Obtained marks cannot be greater than total marks."
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        studentId:
          form.studentId,

        examId:
          form.examId,

        /*
         * Subject manually entered hoga.
         */
        subjectName:
          form.subjectName.trim(),

        obtainedMarks,

        remarks:
          form.remarks.trim(),
      };

      let response;

      if (editingResult) {
        response =
          await axios.put(
            `${API_URL}/api/results/${editingResult._id}`,
            payload,
            {
              withCredentials: true,
            }
          );
      } else {
        response =
          await axios.post(
            `${API_URL}/api/results`,
            payload,
            {
              withCredentials: true,
            }
          );
      }

      if (
        !response.data.success
      ) {
        setFormError(
          response.data.message ||
            "Failed to save result."
        );
        return;
      }

      await fetchResults();
      closeModal();
    } catch (err) {
      console.error(
        "Save Result Error:",
        err
      );

      setFormError(
        err.response?.data
          ?.message ||
          "Failed to save result. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (
    result
  ) => {
    setDeletingResult(result);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeletingResult(null);
  };

  const handleDelete =
    async () => {
      if (
        !deletingResult
      )
        return;

      try {
        setSaving(true);

        const response =
          await axios.delete(
            `${API_URL}/api/results/${deletingResult._id}`,
            {
              withCredentials: true,
            }
          );

        if (
          !response.data
            .success
        ) {
          setError(
            response.data.message ||
              "Failed to delete result."
          );
          return;
        }

        await fetchResults();
        closeDeleteModal();
      } catch (err) {
        console.error(
          "Delete Result Error:",
          err
        );

        setError(
          err.response?.data
            ?.message ||
            "Failed to delete result."
        );
      } finally {
        setSaving(false);
      }
    };

  const getGradeClass = (
    grade
  ) => {
    if (
      grade === "A+" ||
      grade === "A"
    ) {
      return "grade-excellent";
    }

    if (grade === "B") {
      return "grade-good";
    }

    if (grade === "C") {
      return "grade-average";
    }

    if (grade === "D") {
      return "grade-pass";
    }

    return "grade-fail";
  };

  return (
    <div className="dashboard-layout">
      <Sidebar
        isOpen={
          sidebarOpen
        }
        onClose={() =>
          setSidebarOpen(
            false
          )
        }
      />

      {sidebarOpen && (
        <div
          className="dashboard-overlay"
          onClick={() =>
            setSidebarOpen(
              false
            )
          }
        ></div>
      )}

      <div className="dashboard-main">
        <Topbar
          onMenuClick={() =>
            setSidebarOpen(
              true
            )
          }
        />

        <main className="results-page">
          <div className="results-page-header">
            <div>
              <span className="results-page-eyebrow">
                ACADEMIC MANAGEMENT
              </span>

              <h1>Results</h1>

              <p>
                Manage student examination
                results, grades and academic
                performance.
              </p>
            </div>

            <button
              type="button"
              className="results-primary-btn"
              onClick={
                openAddModal
              }
            >
              <FiPlus />
              Add Result
            </button>
          </div>

          {error && (
            <div className="results-error-banner">
              <FiAlertCircle />

              <span>
                {error}
              </span>

              <button
                type="button"
                onClick={() =>
                  setError("")
                }
                aria-label="Close error"
              >
                <FiX />
              </button>
            </div>
          )}

          <section className="results-stats-grid">
            <div className="result-stat-card">
              <div className="result-stat-icon">
                <FiAward />
              </div>

              <div>
                <span>
                  Total Results
                </span>

                <strong>
                  {stats.total}
                </strong>
              </div>
            </div>

            <div className="result-stat-card">
              <div className="result-stat-icon passed">
                <FiCheckCircle />
              </div>

              <div>
                <span>
                  Passed
                </span>

                <strong>
                  {stats.passed}
                </strong>
              </div>
            </div>

            <div className="result-stat-card">
              <div className="result-stat-icon failed">
                <FiXCircle />
              </div>

              <div>
                <span>
                  Failed
                </span>

                <strong>
                  {stats.failed}
                </strong>
              </div>
            </div>

            <div className="result-stat-card">
              <div className="result-stat-icon average">
                <FiAward />
              </div>

              <div>
                <span>
                  Average
                </span>

                <strong>
                  {stats.average}%
                </strong>
              </div>
            </div>
          </section>

          <section className="results-content-card">
            <div className="results-toolbar">
              <div className="results-search">
                <FiSearch />

                <input
                  type="text"
                  placeholder="Search student, exam, subject..."
                  value={search}
                  onChange={(
                    event
                  ) =>
                    setSearch(
                      event.target
                        .value
                    )
                  }
                />
              </div>

              <div className="results-filters">
                <div className="result-filter">
                  <FiFilter />

                  <select
                    value={
                      classFilter
                    }
                    onChange={(
                      event
                    ) =>
                      setClassFilter(
                        event
                          .target
                          .value
                      )
                    }
                  >
                    <option value="">
                      All Classes
                    </option>

                    {classOptions.map(
                      (
                        className
                      ) => (
                        <option
                          key={
                            className
                          }
                          value={
                            className
                          }
                        >
                          {
                            className
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="result-filter">
                  <select
                    value={
                      statusFilter
                    }
                    onChange={(
                      event
                    ) =>
                      setStatusFilter(
                        event
                          .target
                          .value
                      )
                    }
                  >
                    <option value="">
                      All Status
                    </option>

                    <option value="Pass">
                      Pass
                    </option>

                    <option value="Fail">
                      Fail
                    </option>
                  </select>
                </div>

                <div className="result-filter">
                  <select
                    value={
                      gradeFilter
                    }
                    onChange={(
                      event
                    ) =>
                      setGradeFilter(
                        event
                          .target
                          .value
                      )
                    }
                  >
                    <option value="">
                      All Grades
                    </option>

                    {gradeOptions.map(
                      (grade) => (
                        <option
                          key={
                            grade
                          }
                          value={
                            grade
                          }
                        >
                          Grade{" "}
                          {grade}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <button
                  type="button"
                  className="results-refresh-btn"
                  onClick={
                    fetchResults
                  }
                  title="Refresh results"
                >
                  <FiRefreshCw />
                </button>
              </div>
            </div>

            <div className="results-table-wrapper">
              {loading ? (
                <div className="results-loading">
                  <div className="results-spinner"></div>

                  <span>
                    Loading
                    results...
                  </span>
                </div>
              ) : paginatedResults.length ===
                0 ? (
                <div className="results-empty">
                  <div className="results-empty-icon">
                    <FiAward />
                  </div>

                  <h3>
                    No results found
                  </h3>

                  <p>
                    {search ||
                    classFilter ||
                    statusFilter ||
                    gradeFilter
                      ? "Try changing your search or filters."
                      : "Add your first student result to get started."}
                  </p>

                  {!search &&
                    !classFilter &&
                    !statusFilter &&
                    !gradeFilter && (
                      <button
                        type="button"
                        className="results-primary-btn"
                        onClick={
                          openAddModal
                        }
                      >
                        <FiPlus />
                        Add Result
                      </button>
                    )}
                </div>
              ) : (
                <table className="results-table">
                  <thead>
                    <tr>
                      <th>
                        Student
                      </th>

                      <th>
                        Exam
                      </th>

                      <th>
                        Subject
                      </th>

                      <th>
                        Marks
                      </th>

                      <th>
                        Percentage
                      </th>

                      <th>
                        Grade
                      </th>

                      <th>
                        Status
                      </th>

                      <th>
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedResults.map(
                      (
                        result
                      ) => (
                        <tr
                          key={
                            result._id
                          }
                        >
                          <td>
                            <div className="result-student-cell">
                              <div className="result-student-icon">
                                <FiUser />
                              </div>

                              <div>
                                <strong>
                                  {
                                    result.studentName
                                  }
                                </strong>

                                <span>
                                  {
                                    result.className
                                  }{" "}
                                  -
                                  Section{" "}
                                  {
                                    result.section
                                  }
                                </span>
                              </div>
                            </div>
                          </td>

                          <td>
                            <div className="result-exam-cell">
                              <strong>
                                {
                                  result.examName
                                }
                              </strong>

                              <span>
                                Total{" "}
                                {
                                  result.totalMarks
                                }{" "}
                                marks
                              </span>
                            </div>
                          </td>

                          <td>
                            <span className="result-subject">
                              {
                                result.subjectName
                              }
                            </span>
                          </td>

                          <td>
                            <div className="result-marks-cell">
                              <strong>
                                {
                                  result.obtainedMarks
                                }{" "}
                                /{" "}
                                {
                                  result.totalMarks
                                }
                              </strong>

                              <span>
                                Passing{" "}
                                {
                                  result.totalMarks
                                }
                              </span>
                            </div>
                          </td>

                          <td>
                            <strong className="result-percentage">
                              {
                                result.percentage
                              }
                              %
                            </strong>
                          </td>

                          <td>
                            <span
                              className={`result-grade-badge ${getGradeClass(
                                result.grade
                              )}`}
                            >
                              {
                                result.grade
                              }
                            </span>
                          </td>

                          <td>
                            <span
                              className={`result-status-badge ${
                                result.status ===
                                "Pass"
                                  ? "result-status-pass"
                                  : "result-status-fail"
                              }`}
                            >
                              <span></span>

                              {
                                result.status
                              }
                            </span>
                          </td>

                          <td>
                            <div className="result-actions">
                              <button
                                type="button"
                                className="result-action-btn edit"
                                onClick={() =>
                                  openEditModal(
                                    result
                                  )
                                }
                                title="Edit result"
                              >
                                <FiEdit2 />
                              </button>

                              <button
                                type="button"
                                className="result-action-btn delete"
                                onClick={() =>
                                  openDeleteModal(
                                    result
                                  )
                                }
                                title="Delete result"
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
              filteredResults.length >
                0 && (
                <div className="results-pagination">
                  <span>
                    Showing{" "}
                    <strong>
                      {(currentPage -
                        1) *
                        ITEMS_PER_PAGE +
                        1}
                    </strong>{" "}
                    to{" "}
                    <strong>
                      {Math.min(
                        currentPage *
                          ITEMS_PER_PAGE,
                        filteredResults.length
                      )}
                    </strong>{" "}
                    of{" "}
                    <strong>
                      {
                        filteredResults.length
                      }
                    </strong>{" "}
                    results
                  </span>

                  <div className="result-pagination-buttons">
                    <button
                      type="button"
                      disabled={
                        currentPage ===
                        1
                      }
                      onClick={() =>
                        setCurrentPage(
                          (
                            page
                          ) =>
                            Math.max(
                              1,
                              page -
                                1
                            )
                        )
                      }
                    >
                      Previous
                    </button>

                    {Array.from(
                      {
                        length:
                          totalPages,
                      },
                      (
                        _,
                        index
                      ) =>
                        index +
                        1
                    ).map(
                      (
                        page
                      ) => (
                        <button
                          type="button"
                          key={
                            page
                          }
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
                          {
                            page
                          }
                        </button>
                      )
                    )}

                    <button
                      type="button"
                      disabled={
                        currentPage ===
                        totalPages
                      }
                      onClick={() =>
                        setCurrentPage(
                          (
                            page
                          ) =>
                            Math.min(
                              totalPages,
                              page +
                                1
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
          className="result-modal-overlay"
          onMouseDown={(
            event
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >
          <div className="result-modal">
            <div className="result-modal-header">
              <div>
                <span>
                  {editingResult
                    ? "UPDATE RESULT"
                    : "NEW RESULT"}
                </span>

                <h2>
                  {editingResult
                    ? "Edit Result"
                    : "Add Result"}
                </h2>

                <p>
                  Select a student and exam,
                  then enter subject and
                  obtained marks.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  closeModal
                }
                aria-label="Close modal"
              >
                <FiX />
              </button>
            </div>

            <form
              className="result-form"
              onSubmit={
                handleSubmit
              }
            >
              {formError && (
                <div className="result-form-error">
                  <FiAlertCircle />

                  <span>
                    {
                      formError
                    }
                  </span>
                </div>
              )}

              <div className="result-form-grid">
                <div className="result-form-group result-form-full">
                  <label>
                    Student{" "}
                    <span>*</span>
                  </label>

                  <select
                    name="studentId"
                    value={
                      form.studentId
                    }
                    onChange={
                      handleFormChange
                    }
                  >
                    <option value="">
                      Select student
                    </option>

                    {students.map(
                      (
                        student
                      ) => (
                        <option
                          key={
                            student._id
                          }
                          value={
                            student._id
                          }
                        >
                          {
                            student.name
                          }{" "}
                          —{" "}
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

                  {selectedStudent && (
                    <div className="result-selected-info">
                      <FiUsers />

                      <span>
                        {
                          selectedStudent.name
                        }
                        {" • "}
                        {
                          selectedStudent.className
                        }{" "}
                        -
                        Section{" "}
                        {
                          selectedStudent.section
                        }
                      </span>
                    </div>
                  )}
                </div>

                <div className="result-form-group result-form-full">
                  <label>
                    Exam{" "}
                    <span>*</span>
                  </label>

                  <select
                    name="examId"
                    value={
                      form.examId
                    }
                    onChange={
                      handleFormChange
                    }
                  >
                    <option value="">
                      Select exam
                    </option>

                    {availableExams.map(
                      (
                        exam
                      ) => (
                        <option
                          key={
                            exam._id
                          }
                          value={
                            exam._id
                          }
                        >
                          {
                            exam.examName
                          }{" "}
                          —{" "}
                          {
                            exam.subjectName
                          }{" "}
                          —{" "}
                          {
                            exam.className
                          }{" "}
                          (
                          {
                            exam.section
                          }
                          )
                        </option>
                      )
                    )}
                  </select>
                </div>

                {selectedExam && (
                  <div className="result-exam-preview result-form-full">
                    <div>
                      <span>
                        Total Marks
                      </span>

                      <strong>
                        {
                          selectedExam.totalMarks
                        }
                      </strong>
                    </div>

                    <div>
                      <span>
                        Passing Marks
                      </span>

                      <strong>
                        {
                          selectedExam.passingMarks
                        }
                      </strong>
                    </div>

                    <div>
                      <span>
                        Subject
                      </span>

                      <strong>
                        {
                          selectedExam.subjectName
                        }
                      </strong>
                    </div>
                  </div>
                )}

                {/* Subject ab dropdown nahi hai */}
                <div className="result-form-group result-form-full">
                  <label>
                    Subject{" "}
                    <span>*</span>
                  </label>

                  <input
                    type="text"
                    name="subjectName"
                    value={
                      form.subjectName
                    }
                    onChange={
                      handleFormChange
                    }
                    placeholder="e.g. Mathematics, English, Physics"
                    autoComplete="off"
                  />
                </div>

                <div className="result-form-group">
                  <label>
                    Obtained Marks{" "}
                    <span>*</span>
                  </label>

                  <input
                    type="number"
                    min="0"
                    max={
                      selectedExam?.totalMarks ||
                      undefined
                    }
                    step="0.01"
                    name="obtainedMarks"
                    value={
                      form.obtainedMarks
                    }
                    onChange={
                      handleFormChange
                    }
                    placeholder="Enter marks"
                  />
                </div>

                <div className="result-performance-preview result-form-full">
                  <div className="performance-item">
                    <span>
                      Percentage
                    </span>

                    <strong>
                      {
                        previewPercentage
                      }
                      %
                    </strong>
                  </div>

                  <div className="performance-item">
                    <span>
                      Grade
                    </span>

                    <strong
                      className={getGradeClass(
                        previewGrade
                      )}
                    >
                      {
                        previewGrade
                      }
                    </strong>
                  </div>

                  <div className="performance-item">
                    <span>
                      Status
                    </span>

                    <strong
                      className={
                        previewStatus ===
                        "Pass"
                          ? "preview-pass"
                          : "preview-fail"
                      }
                    >
                      {
                        previewStatus
                      }
                    </strong>
                  </div>
                </div>

                <div className="result-form-group result-form-full">
                  <label>
                    Remarks
                  </label>

                  <textarea
                    name="remarks"
                    value={
                      form.remarks
                    }
                    onChange={
                      handleFormChange
                    }
                    rows="3"
                    placeholder="Optional notes..."
                  ></textarea>
                </div>
              </div>

              <div className="result-modal-footer">
                <button
                  type="button"
                  className="result-cancel-btn"
                  onClick={
                    closeModal
                  }
                  disabled={
                    saving
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="results-primary-btn"
                  disabled={
                    saving
                  }
                >
                  {saving ? (
                    <>
                      <span className="result-button-spinner"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      {editingResult ? (
                        <FiEdit2 />
                      ) : (
                        <FiPlus />
                      )}

                      {editingResult
                        ? "Update Result"
                        : "Add Result"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteModalOpen &&
        deletingResult && (
          <div
            className="result-modal-overlay"
            onMouseDown={(
              event
            ) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closeDeleteModal();
              }
            }}
          >
            <div className="result-delete-modal">
              <div className="result-delete-icon">
                <FiTrash2 />
              </div>

              <h2>
                Delete Result?
              </h2>

              <p>
                Are you sure you want
                to delete the result of{" "}
                <strong>
                  {
                    deletingResult.studentName
                  }
                </strong>
                ? This action cannot be
                undone.
              </p>

              <div className="result-delete-actions">
                <button
                  type="button"
                  className="result-cancel-btn"
                  onClick={
                    closeDeleteModal
                  }
                  disabled={
                    saving
                  }
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="result-delete-confirm"
                  onClick={
                    handleDelete
                  }
                  disabled={
                    saving
                  }
                >
                  {saving ? (
                    <>
                      <span className="result-delete-spinner"></span>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <FiTrash2 />
                      Delete Result
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

export default Results;