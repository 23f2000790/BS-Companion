import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import axios from "axios";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [exam, setExam] = useState("");
  const [topics, setTopics] = useState([]);
  const [numQuestions, setNumQuestions] = useState(10);
  const [mode, setMode] = useState("exam");
  const [selectedTopic, setSelectedTopic] = useState("");

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

  // ✅ Fetch topics dynamically when subject OR exam changes
  useEffect(() => {
    if (selectedSubject) {
      // build params dynamically (no empty strings)
      const params = { subject: selectedSubject };
      if (exam && exam.trim()) params.exam = exam;

      axios
        .get("http://localhost:5000/api/topics", { params })
        .then((res) => {
          setTopics(res.data || []);
        })
        .catch((err) => console.error("Error fetching topics:", err));
    }
  }, [selectedSubject, exam]);

  if (!user) {
    return <h2>Loading user data...</h2>;
  }

  const LogoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const openQuizModal = async (subject) => {
    setSelectedSubject(subject);
    setShowModal(true);
    setSelectedTopic(""); // reset
    setExam(""); // reset exam too

    try {
      const res = await axios.get("http://localhost:5000/api/topics", {
        params: { subject },
      });
      setTopics(res.data);
    } catch (err) {
      console.error("❌ Error fetching topics:", err);
    }
  };

  const startQuiz = () => {
    // ✅ allow start if either exam or topic chosen
    if (!exam && !selectedTopic) {
      alert("Please select an exam or a topic");
      return;
    }

    setShowModal(false);
    navigate(`/quiz/${selectedSubject}`, {
      state: {
        userId: user._id,
        exam: exam?.trim() || null, // pass null if no exam
        numQuestions,
        mode,
        topic: selectedTopic?.trim() || null,
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

            {/* Exam selection */}
            <label>Exam Type:</label>
            <select value={exam} onChange={(e) => setExam(e.target.value)}>
              <option value="">-- Select Exam --</option>
              <option value="quiz1">Quiz 1</option>
              <option value="quiz2">Quiz 2</option>
              <option value="ET">End Term (ET)</option>
            </select>

            {/* Topic selection */}
            <label style={{ marginTop: "10px" }}>Topic:</label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
            >
              <option value="">-- All Topics --</option>
              {topics.map((topic, i) => (
                <option key={i} value={topic}>
                  {topic}
                </option>
              ))}
            </select>

            {/* Number of questions */}
            <label style={{ marginTop: "10px" }}>Number of Questions:</label>
            <select
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value={40}>40</option>
              <option value={50}>50</option>
            </select>

            {/* Mode selection */}
            <label style={{ marginTop: "10px" }}>Mode:</label>
            <div>
              <label>
                <input
                  type="radio"
                  value="exam"
                  checked={mode === "exam"}
                  onChange={() => setMode("exam")}
                />
                Exam Mode
              </label>
              <label style={{ marginLeft: "15px" }}>
                <input
                  type="radio"
                  value="practice"
                  checked={mode === "practice"}
                  onChange={() => setMode("practice")}
                />
                Practice Mode
              </label>
            </div>

            <div style={{ marginTop: "20px" }}>
              <button onClick={startQuiz}>Start</button>
              <button
                style={{ marginLeft: "10px" }}
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
