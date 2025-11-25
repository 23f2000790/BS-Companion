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
import "./StudyGuideHistory.css";

const StudyGuideHistory = () => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGuides();
  }, []);

  const fetchGuides = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/auth");
        return;
      }

      const response = await axios.get(
        "http://localhost:5000/api/study-guides/user",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setGuides(response.data.studyGuides);
    } catch (error) {
      console.error("Error fetching study guides:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/study-guides/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Remove from local state
      setGuides(guides.filter((g) => g._id !== id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting study guide:", error);
      alert("Failed to delete study guide");
    }
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

  const LogoutUser = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const DOCK_ITEMS = [
    { label: "Home", icon: <HomeIcon />, onClick: () => navigate("/dashboard") },
    { label: "Leaderboard", icon: <TrophyIcon />, onClick: () => navigate("/leaderboard") },
    { label: "History", icon: <StatsIcon />, onClick: () => navigate("/quiz-history") },
    { label: "Settings", icon: <SettingsIcon />, onClick: () => navigate("/settings") },
    { label: "Logout", icon: <LogoutIcon />, onClick: LogoutUser },
  ];

  // Get unique subjects for filtering
  const uniqueSubjects = [...new Set(guides.map((g) => g.subject))];

  // Filter guides
  const filteredGuides =
    filter === "all" ? guides : guides.filter((g) => g.subject === filter);

  if (loading) {
    return (
      <div className="study-guide-history-page">
        <div className="loader-container">
          <div className="spinner"></div>
          <h3 className="loading-text">Loading study guides...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="study-guide-history-page">
      <div className="history-header">
        <h1>📖 Study Guide Library</h1>
        <button
          onClick={() => navigate("/dashboard")}
          className="btn btn-back"
        >
          ← Back to Dashboard
        </button>
      </div>

      {guides.length > 0 && (
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
      )}

      {filteredGuides.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <h2>No Study Guides Yet</h2>
          <p>Generate your first AI-powered study guide to start building your library!</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="btn btn-primary"
          >
            Generate Study Guide
          </button>
        </div>
      ) : (
        <div className="guides-grid">
          {filteredGuides.map((guide) => (
            <div key={guide._id} className="guide-card">
              <div className="guide-card-header">
                <div className="guide-title-section">
                  <h3>{guide.subject}</h3>
                  <div className="guide-badges">
                    <span className="badge exam-badge">{guide.exam.toUpperCase()}</span>
                    <span className="badge topics-badge">
                      {guide.topics.length} {guide.topics.length === 1 ? 'Topic' : 'Topics'}
                    </span>
                  </div>
                </div>
                <button
                  className="delete-btn"
                  onClick={() => setDeleteConfirm(guide._id)}
                  title="Delete study guide"
                >
                  🗑️
                </button>
              </div>

              <div className="guide-topics">
                {guide.topics.slice(0, 3).map((topic, idx) => (
                  <span key={idx} className="topic-pill">
                    {topic}
                  </span>
                ))}
                {guide.topics.length > 3 && (
                  <span className="topic-pill more-topics">
                    +{guide.topics.length - 3} more
                  </span>
                )}
              </div>

              <div className="guide-card-footer">
                <span className="guide-date">
                  📅 {formatDate(guide.createdAt)}
                </span>
                <button
                  onClick={() => navigate(`/study-guide/${guide._id}`)}
                  className="btn btn-view"
                >
                  View Guide →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Study Guide?</h3>
            <p>Are you sure you want to delete this study guide? This action cannot be undone.</p>
            <div className="modal-actions">
              <button
                className="btn btn-cancel"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-delete"
                onClick={() => handleDelete(deleteConfirm)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <Dock items={DOCK_ITEMS} />
    </div>
  );
};

export default StudyGuideHistory;
