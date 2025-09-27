import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import axios from "axios";
import MagicBento from "./MagicBento";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [exam, setExam] = useState("");
  const [topics, setTopics] = useState([]);
  const [terms, setTerms] = useState([]);
  const [numQuestions, setNumQuestions] = useState(10);
  const [mode, setMode] = useState("exam");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [term, setTerm] = useState("");
  const [availExam, setAvailExam] = useState([]);

  // ✅ Fetch logged in user
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

        const { name, email, city, bloodGroup, currentLevel, subjects, _id } =
          res.data.user;

        setUser({ name, email, city, bloodGroup, currentLevel, subjects, _id });
      } catch (err) {
        console.log("Error fetching user:", err);
      }
    };

    GetUser();
  }, [navigate]);

  // ✅ Fetch topics when subject/exam/term changes
  useEffect(() => {
    if (selectedSubject) {
      const params = { subject: selectedSubject };
      if (exam) params.exam = exam;
      if (term) params.term = term;

      axios
        .get("http://localhost:5000/api/topics", { params })
        .then((res) => setTopics(res.data || []))
        .catch((err) => console.error("Error fetching topics:", err));
    }
  }, [selectedSubject, exam, term]);

  // ✅ Fetch terms when subject/exam/topic changes
  useEffect(() => {
    if (selectedSubject) {
      const params = { subject: selectedSubject };
      if (exam) params.exam = exam;
      if (selectedTopic) params.topic = selectedTopic;

      axios
        .get("http://localhost:5000/api/terms", { params })
        .then((res) => setTerms(res.data || []))
        .catch((err) => console.error("Error fetching terms:", err));
    }
  }, [selectedSubject, exam, selectedTopic]);

  if (!user) {
    return (
      <div className="loader-container">
        <div className="spinner"></div>
        <h3 className="loading-text">Loading user data...</h3>
      </div>
    );
  }

  const LogoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
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

    try {
      const res1 = await axios.get("http://localhost:5000/api/topics", {
        params: { subject },
      });
      setTopics(Array.isArray(res1.data) ? res1.data : []);

      const res2 = await axios.get("http://localhost:5000/api/terms", {
        params: { subject },
      });
      setTerms(res2.data.terms || []);
      setAvailExam(res2.data.exams || []);
    } catch (err) {
      console.error("❌ Error fetching filters:", err);
    }
  };

  const startQuiz = () => {
    if (!exam && !selectedTopic && !term) {
      alert("Please select at least one filter (Exam, Topic, or Term)");
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

  const handleMouseMove = (e) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    button.style.setProperty("--x", `${x}px`);
    button.style.setProperty("--y", `${y}px`);
  };

  return (
    <div className="dashboard">
      <MagicBento />
      <h1>Welcome, {user.name} 👋</h1>
      <p>
        <b>Email:</b> {user.email}
      </p>
      <p>
        <b>City:</b> {user.city}
      </p>
      <p>
        <b>Blood Group:</b> {user.bloodGroup}
      </p>
      <p>
        <b>Current Level:</b> {user.currentLevel}
      </p>
      <p>
        <b>Subjects:</b> {user.subjects?.join(", ")}
      </p>

      {user.subjects.map((subject, index) => (
        <div key={index} className="subject-card">
          <button onClick={() => openQuizModal(subject)}>{subject}</button>
        </div>
      ))}

      {/* Logout */}
      <button
        onClick={LogoutUser}
        className="button"
        style={{ top: 10, right: 10, scale: 0.8 }}
        onMouseMove={handleMouseMove}
      >
        Logout
      </button>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Start Quiz - {selectedSubject}</h2>

            {/* 🔹 Top row (Topic / Exam / Term) */}
            <div className="modal-top">
              {/* Topic */}
              <div className="modal-box">
                <label>Topic</label>
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                >
                  <option value="">-- All Topics --</option>
                  {topics.map((t, i) => (
                    <option key={i} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Exam */}
              <div className="modal-box">
                <label>Exam</label>
                <select value={exam} onChange={(e) => setExam(e.target.value)}>
                  <option value="">-- All Exams --</option>
                  {availExam &&
                    availExam.map((t, i) => (
                      <option key={i} value={t}>
                        {t}
                      </option>
                    ))}
                </select>
              </div>

              {/* Term */}
              <div className="modal-box">
                <label>Term</label>
                <select value={term} onChange={(e) => setTerm(e.target.value)}>
                  <option value="">-- All Terms --</option>
                  {Array.isArray(terms) &&
                    terms.map((t, i) => (
                      <option key={i} value={t}>
                        {t}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* 🔹 Bottom row (No. of Questions + Mode + Buttons) */}
            <div className="modal-bottom">
              <div className="modal-bottom-left">
                <label>
                  Number of Questions
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(e.target.value)}
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
    </div>
  );
};

export default Dashboard;
