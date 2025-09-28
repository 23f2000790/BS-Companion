import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import "./Dock.css";
import axios from "axios";
import MagicBento from "./MagicBento";
import Dock from "./Dock";

// --------- Static Icons ---------
const HomeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);
const ConnectionsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);
const StatsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 3v18h18"></path>
    <path d="M18 17V9"></path>
    <path d="M13 17V5"></path>
    <path d="M8 17v-3"></path>
  </svg>
);
const SettingsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);
const LogoutIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" x2="9" y1="12" y2="12"></line>
  </svg>
);

// --------- Subject Lists ---------
const foundational = [
  "Math 1",
  "English 1",
  "Computational Thinking",
  "Statistics 1",
  "Math 2",
  "English 2",
  "Programming in Python",
  "Statistics 2",
];
const diploma = [
  "PDSA",
  "DBMS",
  "BDM",
  "TDS",
  "System Commands",
  "MAD 1",
  "MAD 2",
  "MLF",
  "MLT",
  "MLP",
  "Business Analytics",
  "Java",
];

// =============================================================
//                          COMPONENT
// =============================================================
const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // --- Add / Remove subjects ---
  const [showAddModal, setShowAddModal] = useState(false);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [selectedNewSubjects, setSelectedNewSubjects] = useState([]);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [subjectToRemove, setSubjectToRemove] = useState("");

  const openAddSubjectsModal = () => {
    const levelList =
      user.currentLevel === "Foundational" ? foundational : diploma;
    const remaining = levelList.filter((s) => !user.subjects.includes(s));
    setAvailableSubjects(remaining);
    setSelectedNewSubjects([]);
    setShowAddModal(true);
  };

  const confirmAddSubjects = async () => {
    if (!selectedNewSubjects.length) return;
    const res = await axios.put(
      "http://localhost:5000/user/update-subjects",
      { add: selectedNewSubjects },
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );
    setUser(res.data.user); // update UI instantly
    setShowAddModal(false);
  };

  const onRemoveClick = (sub) => {
    setSubjectToRemove(sub);
    setShowRemoveModal(true);
  };

  const confirmRemove = async () => {
    const res = await axios.put(
      "http://localhost:5000/user/update-subjects",
      { remove: subjectToRemove },
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );
    setUser(res.data.user);
    setShowRemoveModal(false);
  };

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
        const res = await axios.get("http://localhost:5000/getuser", {
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

      axios
        .get("http://localhost:5000/api/topics", { params })
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

      axios
        .get("http://localhost:5000/api/terms", { params })
        .then((res) => setTerms(res.data.terms || []))
        .catch((err) => console.error("Error fetching terms:", err))
        .finally(() => setIsFilterLoading(false));
    }
  }, [selectedSubject, exam, selectedTopic]);

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
        axios.get("http://localhost:5000/api/topics", { params: { subject } }),
        axios.get("http://localhost:5000/api/terms", { params: { subject } }),
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
    { label: "Connections", icon: <ConnectionsIcon />, onClick: () => {} },
    { label: "Statistics", icon: <StatsIcon />, onClick: () => {} },
    { label: "Settings", icon: <SettingsIcon />, onClick: () => {} },
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

      <MagicBento
        user={user}
        openQuizModal={openQuizModal}
        openAddSubjectsModal={openAddSubjectsModal}
        onRemoveClick={onRemoveClick}
      />

      {/* ===== Quiz Modal ===== */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Start Quiz - {selectedSubject}</h2>

            <div className="modal-top">
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
            </div>

            <div className="modal-bottom">
              <div className="modal-bottom-left">
                <label>
                  Number of Questions
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(Number(e.target.value))}
                  />
                </label>
                <label>
                  Mode
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                  >
                    <option value="exam">Exam Mode</option>
                    <option value="practice">Practice Mode</option>
                  </select>
                </label>
              </div>

              <div className="modal-buttons">
                <button className="cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button className="submit" onClick={startQuiz}>
                  Start Quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== Add Subjects Modal ===== */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Select New Subjects</h2>
            <div
              style={{
                width: "100%",
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              {availableSubjects.map((sub) => (
                <label key={sub} style={{ width: "45%" }}>
                  <input
                    type="checkbox"
                    value={sub}
                    onChange={(e) => {
                      const v = e.target.value;
                      setSelectedNewSubjects((prev) =>
                        prev.includes(v)
                          ? prev.filter((x) => x !== v)
                          : [...prev, v]
                      );
                    }}
                  />{" "}
                  {sub}
                </label>
              ))}
            </div>
            <div className="modal-buttons">
              <button className="cancel" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button className="submit" onClick={confirmAddSubjects}>
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Remove Subject Modal ===== */}
      {showRemoveModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Remove {subjectToRemove}?</h2>
            <div className="modal-buttons">
              <button
                className="cancel"
                onClick={() => setShowRemoveModal(false)}
              >
                Cancel
              </button>
              <button className="submit" onClick={confirmRemove}>
                Confirm
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
