import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Dock from "./Dock";
import {
  HomeIcon,
  StatsIcon,
  SettingsIcon,
  LogoutIcon,
  TrophyIcon,
} from "./icons";
import "./QuizHistory.css";

const QuizHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  // Fetch user data first to get userId
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/auth");
          return;
        }

        const response = await axios.get("http://localhost:5000/getuser", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setUserId(response.data.user._id);
      } catch (error) {
        console.error("Error fetching user:", error);
        navigate("/auth");
      }
    };

    fetchUser();
  }, [navigate]);

  useEffect(() => {
    if (!userId) return; // Wait until userId is available

    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");

        const params = filter !== "all" ? `?subject=${filter}` : "";
        const response = await axios.get(
          `http://localhost:5000/api/results/user/${userId}${params}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setHistory(response.data);
      } catch (error) {
        console.error("Error fetching quiz history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [filter, userId]);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}m ${remainingSecs}s`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getScoreColor = (score, total) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return "score-excellent";
    if (percentage >= 60) return "score-good";
    if (percentage >= 40) return "score-average";
    return "score-poor";
  };

  const LogoutUser = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const DOCK_ITEMS = [
    { label: 'Home', icon: <HomeIcon />, onClick: () => navigate('/dashboard') },
    { label: 'Leaderboard', icon: <TrophyIcon />, onClick: () => navigate('/leaderboard') },
    { label: 'History', icon: <StatsIcon />, onClick: () => {} },
    { label: 'Settings', icon: <SettingsIcon />, onClick: () => navigate('/settings') },
    { label: 'Logout', icon: <LogoutIcon />, onClick: LogoutUser },
  ];

  const uniqueSubjects = [...new Set(history.map((h) => h.subject))];

  if (loading) {
    return (
      <div className="quiz-history-page">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="quiz-history-page">
      <div className="history-header">
        <h1>📚 Quiz History</h1>
        <button
          onClick={() => navigate("/dashboard")}
          className="btn btn-back"
        >
          ← Back to Dashboard
        </button>
      </div>

      <div className="history-filters">
        <button
          className={`filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All Subjects
        </button>
        {uniqueSubjects.map((subject) => (
          <button
            key={subject}
            className={`filter-btn ${filter === subject ? "active" : ""}`}
            onClick={() => setFilter(subject)}
          >
            {subject}
          </button>
        ))}
      </div>

      {history.length === 0 ? (
        <div className="empty-state">
          <p>📝 No quiz history found</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="btn btn-primary"
          >
            Take Your First Quiz
          </button>
        </div>
      ) : (
        <div className="history-grid">
          {history.map((quiz) => (
            <div key={quiz._id} className="quiz-card">
              <div className="quiz-card-header">
                <div>
                  <h3>{quiz.subject}</h3>
                  <p className="quiz-meta">
                    {quiz.exam && <span className="meta-badge">{quiz.exam}</span>}
                    {quiz.term && <span className="meta-badge">{quiz.term}</span>}
                  </p>
                </div>
                {quiz.hasAiAnalysis && (
                  <div className="ai-badge" title="AI Analysis Available">
                    🤖
                  </div>
                )}
              </div>

              <div className="quiz-stats">
                <div className={`stat ${getScoreColor(quiz.score, quiz.totalQuestions)}`}>
                  <span className="stat-value">
                    {quiz.score}/{quiz.totalQuestions}
                  </span>
                  <span className="stat-label">Score</span>
                </div>
                <div className="stat">
                  <span className="stat-value">
                    {((quiz.score / quiz.totalQuestions) * 100).toFixed(0)}%
                  </span>
                  <span className="stat-label">Accuracy</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{formatTime(quiz.timeTaken)}</span>
                  <span className="stat-label">Time</span>
                </div>
              </div>

              <div className="quiz-card-footer">
                <span className="quiz-date">{formatDate(quiz.createdAt)}</span>
                <button
                  onClick={() =>
                    navigate(`/quiz/${quiz.subject}/result/${quiz._id}`, {
                      state: { fromHistory: true }
                    })
                  }
                  className="btn btn-view"
                >
                  View Details →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Dock items={DOCK_ITEMS} />
    </div>
  );
};

export default QuizHistory;
