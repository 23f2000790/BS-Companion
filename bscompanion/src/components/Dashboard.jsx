import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from '../api/axios';
import MagicBento from "./MagicBento";
import Dock from "./Dock";
import { useTheme } from "../context/ThemeContext";
import {
  HomeIcon,
  ConnectionsIcon,
  StatsIcon,
  SettingsIcon,
  LogoutIcon,
  IconXCircle,
  TrophyIcon,
} from "./icons";
import { FOUNDATIONAL_SUBJECTS, DIPLOMA_SUBJECTS } from "../constants";
import "./Dashboard.css";
import "./Dock.css";

// =============================================================
//                          COMPONENT
// =============================================================
const Dashboard = () => {
  const navigate = useNavigate();
  const { playSoundEffect } = useTheme();
  const [user, setUser] = useState(null);
  const checkboxGridRef = React.useRef(null);

  // --- Add / Remove subjects ---
  const [showAddModal, setShowAddModal] = useState(false);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [selectedNewSubjects, setSelectedNewSubjects] = useState([]);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [subjectToRemove, setSubjectToRemove] = useState("");

  // --- Quiz Modal State ---
  const [showModal, setShowModal] = useState(false);
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [exam, setExam] = useState("");
  const [topics, setTopics] = useState([]);
  const [terms, setTerms] = useState([]);
  const [numQuestions, setNumQuestions] = useState(10);
  const [mode, setMode] = useState("exam");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [term, setTerm] = useState("");
  const [availExam, setAvailExam] = useState([]);

  // --- Fetch user on mount ---
  useEffect(() => {
    const GetUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }
      try {
        const res = await api.get("/getuser", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data.user);
      } catch (err) {
        console.error("Error fetching user:", err);
        localStorage.removeItem("token");
        navigate("/");
      }
    };
    GetUser();
  }, [navigate]);

  // --- Load topics & terms when filters change ---
  useEffect(() => {
    if (selectedSubject) {
      setIsFilterLoading(true);
      const params = { subject: selectedSubject };
      if (exam) params.exam = exam;
      if (term) params.term = term;

      api
        .get("/api/topics", { params })
        .then((res) => setTopics(res.data || []))
        .catch((err) => console.error("Error fetching topics:", err))
        .finally(() => setIsFilterLoading(false));
    }
  }, [selectedSubject, exam, term]);

  useEffect(() => {
    if (selectedSubject) {
      setIsFilterLoading(true);
      const params = { subject: selectedSubject };
      if (exam) params.exam = exam;
      if (selectedTopic) params.topic = selectedTopic;

      api
        .get("/api/terms", { params })
        .then((res) => setTerms(res.data.terms || []))
        .catch((err) => console.error("Error fetching terms:", err))
        .finally(() => setIsFilterLoading(false));
    }
  }, [selectedSubject, exam, selectedTopic]);

  // --- Dashboard Scroll Lock ---
  useEffect(() => {
    const dashboard = document.querySelector(".dashboard");
    if (!dashboard) return;

    if (showAddModal || showRemoveModal || showModal) {
      dashboard.classList.add("locked");
    } else {
      dashboard.classList.remove("locked");
    }

    // Cleanup on unmount
    return () => {
      if (dashboard) dashboard.classList.remove("locked");
    };
  }, [showAddModal, showRemoveModal, showModal]);

  const openAddSubjectsModal = () => {
    const levelList =
      user.currentLevel === "Foundational"
        ? FOUNDATIONAL_SUBJECTS
        : DIPLOMA_SUBJECTS;
    const remaining = levelList.filter((s) => !user.subjects.includes(s));
    console.log("Open Add Subject Modal:", { 
      userSubjects: user.subjects, 
      levelList, 
      remaining 
    });
    setAvailableSubjects(remaining);
    setSelectedNewSubjects([]);
    setShowAddModal(true);
  };

  const confirmAddSubjects = async () => {
    if (!selectedNewSubjects.length) return;
    try {
      const res = await api.put(
        "/user/update-subjects",
        { add: selectedNewSubjects },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setUser(res.data.user); // update UI instantly
      playSoundEffect('subject-add'); // Play sound effect
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding subjects:", error);
    }
  };

  // --- Focus Management for Add Subject Modal ---
  useEffect(() => {
    if (showAddModal && checkboxGridRef.current) {
      // Small timeout to ensure render is complete and transition has started
      setTimeout(() => {
        checkboxGridRef.current.focus();
      }, 50);
    }
  }, [showAddModal]);

  const onRemoveClick = (sub) => {
    setSubjectToRemove(sub);
    setShowRemoveModal(true);
  };

  const confirmRemove = async () => {
    try {
      const res = await api.put(
        "/user/update-subjects",
        { remove: subjectToRemove },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setUser(res.data.user);
      setShowRemoveModal(false);
    } catch (error) {
      console.error("Error removing subject:", error);
    }
  };

  const LogoutUser = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const openQuizModal = async (subject) => {
    setSelectedSubject(subject);
    setShowModal(true);
    setSelectedTopic("");
    setExam("");
    setTerm("");
    setTopics([]);
    setTerms([]);
    setAvailExam([]);
    setIsFilterLoading(true);

    try {
      const [topicsRes, termsExamsRes] = await Promise.all([
        api.get("/api/topics", { params: { subject } }),
        api.get("/api/terms", { params: { subject } }),
      ]);
      setTopics(Array.isArray(topicsRes.data) ? topicsRes.data : []);
      setTerms(termsExamsRes.data.terms || []);
      setAvailExam(termsExamsRes.data.exams || []);
    } catch (err) {
      console.error("Error fetching initial filters:", err);
    } finally {
      setIsFilterLoading(false);
    }
  };

  const startQuiz = () => {
    if (!exam && !selectedTopic && !term) {
      alert("Please select at least one filter (Exam, Topic, or Term).");
      return;
    }
    setShowModal(false);
    navigate(`/quiz/${selectedSubject}`, {
      state: {
        userId: user._id,
        exam: exam || null,
        topic: selectedTopic || null,
        term: term || null,
        numQuestions,
        mode,
      },
    });
  };

  const DOCK_ITEMS = [
    { label: "Home", icon: <HomeIcon />, onClick: () => {} },
    { label: "Leaderboard", icon: <TrophyIcon />, onClick: () => navigate("/leaderboard") },
    { label: "History", icon: <StatsIcon />, onClick: () => navigate("/quiz-history") },
    { label: "Settings", icon: <SettingsIcon />, onClick: () => navigate("/settings") },
    { label: "Logout", icon: <LogoutIcon />, onClick: LogoutUser },
  ];

  if (!user) {
    return (
      <div className="loader-container">
        <div className="spinner"></div>
        <h3 className="loading-text">Loading user data...</h3>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {user.name} 👋</h1>
      </div>

      <div className="dashboard-grid">
        <div className="bento-item">
          <MagicBento 
            user={user}
            openQuizModal={openQuizModal}
            openAddSubjectsModal={openAddSubjectsModal}
            onRemoveClick={onRemoveClick}
          />
        </div>
      </div>

      {/* --- Add Subject Modal --- */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div
            className="modal-content add-subject-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close-btn"
              onClick={() => setShowAddModal(false)}
            >
              <IconXCircle />
            </button>
            <h2>Add Subject</h2>
            <div
              className="checkbox-grid"
              ref={checkboxGridRef}
              tabIndex={-1}
            >
              {availableSubjects.length > 0 ? (
                availableSubjects.map((sub) => (
                  <label key={sub} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedNewSubjects.includes(sub)}
                      onChange={() => {
                        setSelectedNewSubjects((prev) =>
                          prev.includes(sub)
                            ? prev.filter((x) => x !== sub)
                            : [...prev, sub]
                        );
                      }}
                    />
                    {sub}
                  </label>
                ))
              ) : (
                <p style={{ gridColumn: "1 / -1", textAlign: "center", color: "#888" }}>
                  All subjects added!
                </p>
              )}
            </div>
            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button className="confirm-btn" onClick={confirmAddSubjects}>
                Add Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Remove Subject Modal --- */}
      {showRemoveModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowRemoveModal(false)}
        >
          <div
            className="modal-content remove-subject-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close-btn"
              onClick={() => setShowRemoveModal(false)}
            >
              <IconXCircle />
            </button>
            <h2>Remove Subject</h2>
            <p style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              Are you sure you want to remove <strong>{subjectToRemove}</strong>?
            </p>
            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowRemoveModal(false)}
              >
                Cancel
              </button>
              <button className="confirm-btn" onClick={confirmRemove}>
                Confirm Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Quiz Setup Modal --- */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="modal-content quiz-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close-btn"
              onClick={() => setShowModal(false)}
            >
              <IconXCircle />
            </button>
            <h2>Start Quiz: {selectedSubject}</h2>
            
            <div className="modal-box">
              <label>Topic</label>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                disabled={isFilterLoading}
              >
                <option value="">-- All Topics --</option>
                {isFilterLoading ? (
                  <option disabled>Loading...</option>
                ) : (
                  topics.map((t, i) => (
                    <option key={i} value={t}>
                      {t}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="modal-box">
              <label>Exam</label>
              <select
                value={exam}
                onChange={(e) => setExam(e.target.value)}
                disabled={isFilterLoading}
              >
                <option value="">-- All Exams --</option>
                {isFilterLoading ? (
                  <option disabled>Loading...</option>
                ) : (
                  availExam.map((t, i) => (
                    <option key={i} value={t}>
                      {t}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="modal-box">
              <label>Term</label>
              <select
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                disabled={isFilterLoading}
              >
                <option value="">-- All Terms --</option>
                {isFilterLoading ? (
                  <option disabled>Loading...</option>
                ) : (
                  terms.map((t, i) => (
                    <option key={i} value={t}>
                      {t}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="modal-bottom">
              <div className="modal-bottom-left" style={{ width: "100%" }}>
                <div style={{ display: "flex", gap: "1rem", width: "100%" }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", marginBottom: "0.5rem", color: "#a0a0a0", fontSize: "0.875rem" }}>Questions</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={numQuestions}
                      onChange={(e) => setNumQuestions(Number(e.target.value))}
                      style={{ width: "100%" }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", marginBottom: "0.5rem", color: "#a0a0a0", fontSize: "0.875rem" }}>Mode</label>
                    <select
                      value={mode}
                      onChange={(e) => setMode(e.target.value)}
                      style={{ width: "100%" }}
                    >
                      <option value="exam">Exam Mode</option>
                      <option value="practice">Practice Mode</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button className="confirm-btn" onClick={startQuiz}>
                Start Quiz
              </button>
            </div>
          </div>
        </div>
      )}

      <Dock items={DOCK_ITEMS} />
    </div>
  );
};

export default Dashboard;
