import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; // <--- IMPORT THIS
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Dock from "./Dock";
import { HomeIcon, StatsIcon, SettingsIcon, LogoutIcon, TrophyIcon } from "./icons";
import "./StudyGuideView.css";

const StudyGuideView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [studyGuide, setStudyGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudyGuide = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/");
          return;
        }

        const response = await axios.get(
          `http://localhost:5000/api/study-guides/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setStudyGuide(response.data.studyGuide);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching study guide:", err);
        setError("Failed to load study guide");
        setLoading(false);
      }
    };

    fetchStudyGuide();
  }, [id, navigate]);

  const handleBack = () => {
    navigate("/dashboard");
  };

  const LogoutUser = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const cleanMarkdownContent = (content) => {
    if (!content) return '';
    return content
      .replace(/^```markdown\s*/, '')
      .replace(/^```\s*/, '')
      .replace(/```$/, '');
  };

  const DOCK_ITEMS = [
    { label: "Dashboard", icon: <HomeIcon />, onClick: () => navigate("/dashboard") },
    { label: "Leaderboard", icon: <TrophyIcon />, onClick: () => navigate("/leaderboard") },
    { label: "History", icon: <StatsIcon />, onClick: () => navigate("/quiz-history") },
    { label: "Settings", icon: <SettingsIcon />, onClick: () => navigate("/settings") },
    { label: "Logout", icon: <LogoutIcon />, onClick: LogoutUser },
  ];

  if (loading) {
    return (
      <div className="loader-container">
        <div className="spinner"></div>
        <h3 className="loading-text">Loading study guide...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div className="study-guide-container">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button className="back-button" onClick={handleBack}>
            Back to Dashboard
          </button>
        </div>
        <Dock items={DOCK_ITEMS} />
      </div>
    );
  }

  return (
    <div className="study-guide-container">
      <div className="study-guide-header">
        <button className="back-button" onClick={handleBack}>
          ← Back to Dashboard
        </button>
        <div className="study-guide-meta">
          <h1>Study Guide</h1>
          <div className="study-guide-info">
            <span className="info-badge subject-badge">{studyGuide.subject}</span>
            <span className="info-badge exam-badge">{studyGuide.exam.toUpperCase()}</span>
            <span className="info-badge questions-badge">
              {studyGuide.questionsCount} Questions Analyzed
            </span>
          </div>
          <div className="topics-container">
            <strong>Topics Covered:</strong>
            <div className="topics-list">
              {studyGuide.topics.map((topic, idx) => (
                <span key={idx} className="topic-tag">
                  {topic}
                </span>
              ))}
            </div>
          </div>
          <p className="creation-date">
            Generated on {new Date(studyGuide.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>

      <div className="study-guide-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]} /* <--- ADD THIS LINE */
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <SyntaxHighlighter
                  style={vscDarkPlus}
                  language={match[1]}
                  PreTag="div"
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
          }}
        >
          {cleanMarkdownContent(studyGuide.content)}
        </ReactMarkdown>
      </div>

      <Dock items={DOCK_ITEMS} />
    </div>
  );
};

export default StudyGuideView;