import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import ReactMarkdown from "react-markdown";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { useTheme } from "../context/ThemeContext";
import "./quiz-results.css";

import "./quiz.css";
import QuestionDetailModal from "./QuestionDetailModal";

const IconCheckCircle = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const IconXCircle = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);
const IconTarget = () => (
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
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);
const IconClock = () => (
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
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);
const IconBarChart = () => (
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
    <line x1="12" y1="20" x2="12" y2="10" />
    <line x1="18" y1="20" x2="18" y2="4" />
    <line x1="6" y1="20" x2="6" y2="16" />
  </svg>
);
const IconRocket = () => (
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
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.3.05-3.05-.64-.75-2.17-.8-3.05-.05z" />
    <path d="M16 4.5c1.26-1.5 5-2 5-2s-.5 3.74-2 5c-.84.71-2.3.7-3.05.05-.75-.64-.8-2.17-.05-3.05z" />
    <path d="M12 12.5c1.26 1.26 3.42 1.26 4.68 0 .63-.63.63-1.65 0-2.28l-2.28-2.28a1.605 1.605 0 0 0-2.28 0L7.4 12.62c-.63.63-.63 1.65 0 2.28.63.63 1.65.63 2.28 0l2.34-2.34" />
    <path d="M8.1 16.34a1.605 1.605 0 0 0 0-2.28l-2.28-2.28a1.605 1.605 0 0 0-2.28 0l-1.34 1.34c-.63.63-.63 1.65 0 2.28s1.65.63 2.28 0z" />
  </svg>
);
const IconWrench = () => (
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
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);
const IconMusic = () => (
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
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

// --- Chart Components (no changes here) ---
const BreakdownChart = ({ data }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  useEffect(() => {
    if (chartInstance.current) chartInstance.current.destroy();
    if (!chartRef.current || !window.Chart) return;
    const myChartRef = chartRef.current.getContext("2d");
    chartInstance.current = new window.Chart(myChartRef, {
      type: "doughnut",
      data: {
        labels: ["Correct", "Incorrect", "Not Attempted"],
        datasets: [
          {
            data: [data.correct, data.incorrect, data.not_attempted],
            backgroundColor: ["#28a745", "#dc3545", "#6c757d"],
            borderColor: "#1e1e1e",
            borderWidth: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "70%",
        plugins: {
          legend: {
            position: "bottom",
            labels: { color: "#faf9f6", padding: 15, font: { size: 14 } },
          },
        },
      },
    });
    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [data]);
  return (
    <div className="chart-container">
      <canvas ref={chartRef} />
    </div>
  );
};

const TopicChart = ({ data }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  useEffect(() => {
    if (chartInstance.current) chartInstance.current.destroy();
    if (!chartRef.current || !window.Chart) return;
    const myChartRef = chartRef.current.getContext("2d");
    const labels = Object.keys(data);
    const accuracyData = labels.map((label) => {
      const topic = data[label];
      const attempted = topic.correct + topic.incorrect;
      return attempted > 0 ? (topic.correct / attempted) * 100 : 0;
    });
    chartInstance.current = new window.Chart(myChartRef, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Accuracy by Topic (%)",
            data: accuracyData,
            backgroundColor: "rgba(224, 218, 179, 0.6)",
            borderColor: "rgba(224, 218, 179, 1)",
            borderWidth: 1,
            borderRadius: 4,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            beginAtZero: true,
            max: 100,
            ticks: { color: "#ccc" },
            grid: { color: "rgba(255, 255, 255, 0.1)" },
          },
          y: { ticks: { color: "#ccc" }, grid: { display: false } },
        },
        plugins: { legend: { display: false } },
      },
    });
    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [data]);
  return (
    <div className="chart-container large">
      <canvas ref={chartRef} />
    </div>
  );
};

// --- AI Visualization Components ---

const AnalysisHero = ({ summary }) => {
  if (!summary) return null;
  return (
    <div className="analysis-hero">
      <div className="hero-badge">{summary.archetype}</div>
      <h2 className="hero-title">{summary.title}</h2>
      <div className="hero-insight">
        <span className="insight-icon">💡</span>
        <p>"{summary.behavioral_insight}"</p>
      </div>
    </div>
  );
};

const SkillRadar = ({ data }) => {
  if (!data || data.length === 0) return null;
  return (
    <div className="skill-radar-container">
      <h3>Skill Proficiency</h3>
      <div className="radar-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#444" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#ccc', fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="Skill"
              dataKey="score"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const ResourceLibrary = ({ resources }) => {
  if (!resources || resources.length === 0) return null;
  return (
    <div className="resource-library">
      <h3>Recommended Resources</h3>
      <div className="resource-grid">
        {resources.map((res, idx) => (
          <a 
            key={idx} 
            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(res.search_query)}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="resource-card"
          >
            <div className="resource-icon">📺</div>
            <div className="resource-content">
              <h4>{res.video_title_idea}</h4>
              <p className="resource-topic">{res.topic}</p>
              <p className="resource-reason">{res.reason}</p>
            </div>
            <div className="external-link-icon">↗</div>
          </a>
        ))}
      </div>
    </div>
  );
};

const RedemptionArc = ({ question }) => {
  const [selected, setSelected] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  if (!question) return null;

  const checkAnswer = (option, correct) => {
    if (!option || !correct) return false;
    
    // Normalize strings: lowercase, trim, remove punctuation at the end
    const normOption = option.toLowerCase().trim().replace(/[.,;!]+$/, "");
    const normCorrect = correct.toLowerCase().trim().replace(/[.,;!]+$/, "");
    
    // 1. Exact match (after normalization)
    if (normOption === normCorrect) return true;
    
    // 2. Handle "A. ", "B. " prefixes in the OPTION
    // Example: Option = "A. 42", Correct = "42"
    const optionContent = normOption.replace(/^[a-d]\.\s*/, "");
    if (optionContent === normCorrect) return true;

    // 3. Handle "A. ", "B. " prefixes in the CORRECT answer (less common but possible from AI)
    // Example: Option = "42", Correct = "A. 42"
    const correctContent = normCorrect.replace(/^[a-d]\.\s*/, "");
    if (normOption === correctContent) return true;
    
    // 4. Cross-check content vs content (ignoring prefixes on both)
    if (optionContent === correctContent) return true;

    // 5. Letter match (if correct answer is just "A", "B", etc.)
    if (/^[a-d]$/.test(normCorrect)) {
       return normOption.startsWith(`${normCorrect}.`) || normOption === normCorrect;
    }

    // 6. Substring match (last resort for slight variations)
    // Ensure the match is significant (e.g. > 5 chars) to avoid false positives
    if (correctContent.length > 5 && optionContent.includes(correctContent)) return true;
    if (optionContent.length > 5 && correctContent.includes(optionContent)) return true;

    return false;
  };

  const handleCheck = (option) => {
    setSelected(option);
    setIsCorrect(checkAnswer(option, question.correct_answer));
  };

  return (
    <div className="redemption-arc">
      <div className="redemption-header">
        <h3>Redemption Arc</h3>
        <p>Prove you've learned! Answer this follow-up question.</p>
      </div>
      <div className="redemption-card">
        <p className="redemption-question">{question.question}</p>
        <div className="redemption-options">
          {question.options.map((opt, idx) => (
            <button
              key={idx}
              className={`redemption-opt ${selected === opt ? (isCorrect ? 'correct' : 'incorrect') : ''} ${selected && checkAnswer(opt, question.correct_answer) ? 'correct' : ''}`}
              onClick={() => !selected && handleCheck(opt)}
              disabled={!!selected}
            >
              {opt}
            </button>
          ))}
        </div>
        {selected && (
          <div className={`redemption-feedback ${isCorrect ? 'success' : 'error'}`}>
            <strong>{isCorrect ? 'Correct!' : 'Not quite.'}</strong> {question.explanation}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Results Dashboard Component ---
const QuizResults = ({ results, originalQuestions, resultId, savedAiAnalysis }) => {
  const [aiAnalysis, setAiAnalysis] = useState(savedAiAnalysis || null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);


  const stats = useMemo(() => {
    if (!results) return null;
    const totalAttempted = results.questions.filter(
      (q) => q.status !== "not_attempted"
    ).length;
    const accuracy =
      totalAttempted > 0
        ? ((results.score / totalAttempted) * 100).toFixed(2)
        : "0.00";
    const topicPerformance = results.questions.reduce((acc, q) => {
      const topicName = q.topic || "General";
      if (!acc[topicName]) acc[topicName] = { correct: 0, incorrect: 0 };
      if (q.status === "correct") acc[topicName].correct++;
      if (q.status === "incorrect") acc[topicName].incorrect++;
      return acc;
    }, {});
    const questionStatusCounts = results.questions.reduce(
      (acc, q) => {
        if (!acc[q.status]) acc[q.status] = 0;
        acc[q.status]++;
        return acc;
      },
      { correct: 0, incorrect: 0, not_attempted: 0, partially_correct: 0 }
    );
    const strongTopics = Object.entries(topicPerformance)
      .filter(
        ([_, stats]) =>
          stats.correct + stats.incorrect > 0 &&
          stats.correct / (stats.correct + stats.incorrect) >= 0.5
      )
      .map(([topic]) => topic);
    const weakTopics = Object.entries(topicPerformance)
      .filter(
        ([_, stats]) =>
          stats.correct + stats.incorrect > 0 &&
          stats.correct / (stats.correct + stats.incorrect) < 0.5
      )
      .map(([topic]) => topic);
    return {
      accuracy,
      topicPerformance,
      questionStatusCounts,
      strongTopics,
      weakTopics,
    };
  }, [results]);

  const formatTime = (secs) => `${Math.floor(secs / 60)}m ${secs % 60}s`;
  const formatCorrectAnswer = (option) => {
    if (Array.isArray(option)) return option.join(", ");
    if (
      typeof option === "object" &&
      option !== null &&
      option.min !== undefined &&
      option.max !== undefined
    ) {
      return `Between ${option.min} and ${option.max}`;
    }
    return String(option);
  };

  const handleAnalyzeWithAI = async () => {
    setLoadingAI(true);
    setAiError(null);
    try {
      const token = localStorage.getItem("token");
      const formatTimeStr = (secs) => `${Math.floor(secs / 60)}m ${secs % 60}s`;
      
      const detailedQuestions = results.questions.map((q, idx) => ({
        topic: q.topic,
        questionText: originalQuestions[idx]?.question || "N/A",
        userAnswer: q.userAnswer,
        correctAnswer: originalQuestions[idx]?.correctOption,
        status: q.status
      }));
      
      const response = await axios.post(
        "http://localhost:5000/api/ai/analyze",
        {
          resultId: resultId,
          score: results.score,
          totalQuestions: results.totalQuestions,
          topicPerformance: stats.topicPerformance,
          questions: detailedQuestions,
          timeTaken: formatTimeStr(results.timeTaken)
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAiAnalysis(response.data.analysis);
    } catch (error) {
      console.error("Error fetching AI analysis:", error);
      setAiError(
        error.response?.data?.message || "Failed to generate AI analysis. Please try again."
      );
    } finally {
      setLoadingAI(false);
    }
  };

  if (!results || !stats) return <div className="loading-spinner"></div>;

  return (
    <div className="results-dashboard">
      <div className="ai-analysis-section">
        {!aiAnalysis && (
           <div className="ai-cta-container">
              <button
                className="btn btn-ai-analyze"
                onClick={handleAnalyzeWithAI}
                disabled={loadingAI}
              >
                {loadingAI ? "Analyzing..." : "🤖 Analyze Performance with AI"}
              </button>
              {aiError && <div className="ai-error">{aiError}</div>}
           </div>
        )}

        {aiAnalysis && (
          <div className="ai-dashboard fade-in">
             <AnalysisHero summary={aiAnalysis.summary} />
             
             <div className="ai-grid-layout">
                <div className="ai-grid-left">
                    <SkillRadar data={aiAnalysis.skill_radar_data} />
                </div>
                <div className="ai-grid-right">
                    {aiAnalysis.weak_areas && aiAnalysis.weak_areas.length > 0 && (
                        <div className="weak-areas-panel">
                        <h3>🎯 Focus Areas</h3>
                        {aiAnalysis.weak_areas.map((area, idx) => (
                            <div key={idx} className="weak-area-item">
                            <div className="weak-area-header">
                                <span className="topic-tag">{area.topic}</span>
                            </div>
                            <p className="correction-text">{area.correction}</p>
                            </div>
                        ))}
                        </div>
                    )}
                </div>
             </div>

             <ResourceLibrary resources={aiAnalysis.youtube_resources} />
             
             <RedemptionArc question={aiAnalysis.follow_up_question} />
          </div>
        )}
      </div>

      <div className="results-header">
        <h2 className="results-title">Quiz Performance Analysis</h2>
        <p className="results-subtitle">
          Here's a detailed breakdown of your performance.
        </p>
      </div>
      <div className="stats-grid">
        <div className="stat-card score-card">
          <div className="stat-card__icon">
            <IconTarget />
          </div>
          <div className="stat-card__content">
            <div className="stat-card__value">
              {results.score}
              <span className="stat-card__total">
                / {results.totalQuestions}
              </span>
            </div>
            <div className="stat-card__label">Overall Score</div>
          </div>
        </div>
        <div className="stat-card accuracy-card">
          <div className="stat-card__icon">
            <IconBarChart />
          </div>
          <div className="stat-card__content">
            <div className="stat-card__value">{stats.accuracy}%</div>
            <div className="stat-card__label">Attempt Accuracy</div>
          </div>
        </div>
        <div className="stat-card time-card">
          <div className="stat-card__icon">
            <IconClock />
          </div>
          <div className="stat-card__content">
            <div className="stat-card__value">
              {formatTime(results.timeTaken)}
            </div>
            <div className="stat-card__label">Time Taken</div>
          </div>
        </div>
      </div>
      <div className="charts-grid">
        <div className="chart-card">
          <h3>Question Breakdown</h3>
          <BreakdownChart data={stats.questionStatusCounts} />
        </div>
        <div className="chart-card topic-performance">
          <h3>Topic Performance</h3>
          <TopicChart data={stats.topicPerformance} />
        </div>
      </div>
      <div className="strengths-weaknesses">
        <div className="topic-list-card">
          <div className="topic-list-header">
            <IconRocket />
            <h3>Strong Topics</h3>
          </div>
          <div className="topic-pills-container">
            {stats.strongTopics.length > 0 ? (
              stats.strongTopics.map((t) => (
                <span key={t} className="topic-pill strong">
                  {t}
                </span>
              ))
            ) : (
              <p className="no-topics-message">
                No strong topics identified. Keep practicing!
              </p>
            )}
          </div>
        </div>
        <div className="topic-list-card">
          <div className="topic-list-header">
            <IconWrench />
            <h3>Areas for Improvement</h3>
          </div>
          <div className="topic-pills-container">
            {stats.weakTopics.length > 0 ? (
              stats.weakTopics.map((t) => (
                <span key={t} className="topic-pill weak">
                  {t}
                </span>
              ))
            ) : (
              <p className="no-topics-message">
                No specific weak spots found. Great job!
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="detailed-review">
        <h2 className="review-title">Detailed Question Review</h2>
        {originalQuestions.map((q, i) => {
          const result = results.questions[i];
          if (!result) return null;
          return (
            <div 
              key={i} 
              className={`result-item status-${result.status} clickable-result-item`}
              onClick={() => setSelectedQuestion({
                ...originalQuestions[i],
                userAnswer: result.userAnswer,
                status: result.status,
                term: results.term,
                exam: results.exam
              })}
            >
              <div className="question-text">
                <div className="question-header-badges" style={{ marginBottom: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                    {results.term && <span className="badge badge-muted" style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', color: '#aaa' }}>{results.term}</span>}
                    {results.exam && <span className="badge badge-muted" style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', color: '#aaa' }}>{results.exam}</span>}
                </div>
                {q.context && (
                  <div className="question-context">
                    {q.context}
                  </div>
                )}
                <strong>Q{i + 1}:</strong> {q.question}
              </div>
              <div className="answers-comparison">
                <p className="user-answer">
                  <strong>Your Answer:</strong>{" "}
                  {result.userAnswer
                    ? Array.isArray(result.userAnswer)
                      ? result.userAnswer.join(", ")
                      : String(result.userAnswer)
                    : "Not Answered"}
                </p>
                {result.status !== "correct" && (
                  <p className="correct-answer">
                    <strong>Correct Answer:</strong>{" "}
                    {formatCorrectAnswer(q.correctOption)}
                  </p>
                )}
              </div>
              <div className="result-item__icon">
                {result.status === "correct" ? (
                  <IconCheckCircle />
                ) : (
                  <IconXCircle />
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {selectedQuestion && (
        <QuestionDetailModal
          question={selectedQuestion}
          userAnswer={selectedQuestion.userAnswer}
          status={selectedQuestion.status}
          term={results.term}
          exam={results.exam}
          onClose={() => setSelectedQuestion(null)}
        />
      )}
    </div>
  );
};

// --- Main Quiz Component ---
const Quiz = () => {
  const { subject, resultId } = useParams(); // Get resultId from URL if present
  const location = useLocation();
  const navigate = useNavigate();
  const { quizPrefs, setQuizPrefs, playSoundEffect, musicEnabled, setMusicEnabled, musicTracks } = useTheme();

  const {
    exam,
    topic: initialTopic,
    numQuestions,
    term,
    mode, // "exam" or "practice"
    userId,
  } = location.state || {};

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(0);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [timerRunning, setTimerRunning] = useState(false);
  
  // Track visited questions for navigation coloring
  const [visitedQuestions, setVisitedQuestions] = useState(new Set([0]));
  
  // Refs for scrollable panels
  const leftPanelRef = useRef(null);
  const rightPanelRef = useRef(null);

  // Manual wheel handler removed to restore native scrolling behavior
  // The CSS fix on .quiz-page-wrapper.results-mode handles the scrolling now
  const [startTime, setStartTime] = useState(null);
  const [quizResultPayload, setQuizResultPayload] = useState(null);
  const [quizResultId, setQuizResultId] = useState(null); // Store the DB ID of saved result
  const [savedAiAnalysis, setSavedAiAnalysis] = useState(null); // Store AI analysis from saved result
  const [fromHistory, setFromHistory] = useState(false); // Track if navigated from history

  // --- NEW: State for practice mode ---
  const [checkedAnswers, setCheckedAnswers] = useState({}); // Stores status for checked questions
  const [showFeedback, setShowFeedback] = useState(false); // Controls feedback visibility for the current question

  // --- Persistence Logic ---
  useEffect(() => {
    // Load state from localStorage on mount
    const savedState = localStorage.getItem("quizState");
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        // Only restore if it's the same subject/exam to avoid conflicts
        if (parsed.subject === subject) {
            setQuestions(parsed.questions);
            setAnswers(parsed.answers);
            setCurrent(parsed.current);
            setFinished(parsed.finished);
            setTimeLeft(parsed.timeLeft);
            setTimerRunning(parsed.timerRunning);
            setVisitedQuestions(new Set(parsed.visitedQuestions));
            setStartTime(parsed.startTime);
            setQuizResultPayload(parsed.quizResultPayload);
            setQuizResultId(parsed.quizResultId);
            setSavedAiAnalysis(parsed.savedAiAnalysis);
            setFromHistory(parsed.fromHistory);
            setCheckedAnswers(parsed.checkedAnswers || {});
            // If finished, ensure we are in results mode
            if (parsed.finished) {
                setTimerRunning(false);
            }
        }
      } catch (e) {
        console.error("Failed to load quiz state", e);
      }
    }
  }, [subject]);

  useEffect(() => {
    // Save state to localStorage whenever key state changes
    if (questions.length > 0) {
        const stateToSave = {
            subject,
            questions,
            answers,
            current,
            finished,
            timeLeft,
            timerRunning,
            visitedQuestions: Array.from(visitedQuestions),
            startTime,
            quizResultPayload,
            quizResultId,
            savedAiAnalysis,
            fromHistory,
            checkedAnswers
        };
        localStorage.setItem("quizState", JSON.stringify(stateToSave));
    }
  }, [questions, answers, current, finished, timeLeft, timerRunning, visitedQuestions, startTime, quizResultPayload, quizResultId, savedAiAnalysis, fromHistory, checkedAnswers, subject]);

  // Clear storage when leaving or starting new (handled in cleanup or start)
  useEffect(() => {
      return () => {
          // Optional: Clear on unmount if you want strict session only, 
          // but for reload support we keep it. 
          // We should clear it when navigating back to dashboard explicitly.
      };
  }, []);

  // --- NEW: Submission Modal State ---
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const navContainerRef = useRef(null);

  // Fetch saved result if resultId is in URL (for reload/history)
  useEffect(() => {
    const fetchSavedResult = async () => {
      if (!resultId) return; // Only fetch if resultId exists in URL
      
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:5000/api/results/${resultId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        const savedResult = response.data;
        
        // Check if navigated from history
        setFromHistory(location.state?.fromHistory || false);
        
        // Reconstruct quiz state from saved result
        setQuizResultPayload({
          userId: savedResult.userId,
          subject: savedResult.subject,
          term: savedResult.term,
          exam: savedResult.exam,
          questions: savedResult.questions,
          startTime: savedResult.startTime,
          endTime: savedResult.endTime,
          timeTaken: savedResult.timeTaken,
          score: savedResult.score,
          totalQuestions: savedResult.totalQuestions
        });
        
        setQuizResultId(resultId);
        setFinished(true);
        
        // If AI analysis exists in saved result, store it
        if (savedResult.aiAnalysis) {
          setSavedAiAnalysis(savedResult.aiAnalysis);
        }
        
        // Note: We don't have original questions from saved result
        // They need to be passed via location.state or fetched separately
        // For now, we'll show results without detailed question review
        
        // UPDATE: Backend now returns enriched questions with text/options
        if (savedResult.questions && savedResult.questions.length > 0) {
            setQuestions(savedResult.questions);
        }
      } catch (error) {
        console.error("Error fetching saved result:", error);
        alert("Failed to load quiz result");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchSavedResult();
  }, [resultId, navigate]);

  useEffect(() => {
    if (finished) return;
    const container = navContainerRef.current;
    if (!container) return;
    const currentButton = container.querySelector(".question-nav-item.current");
    currentButton?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });

    // --- NEW: Show feedback if the question has been checked before ---
    setShowFeedback(!!checkedAnswers[current]);
  }, [current, finished, checkedAnswers]);

  useEffect(() => {
    if (exam || initialTopic || term) fetchQuestions();
  }, [exam, initialTopic, term, numQuestions, subject]);

  const fetchQuestions = async () => {
    if (!exam && !initialTopic && !term) return;
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/questions", {
        params: {
          subject,
          exam,
          term,
          topic: initialTopic || "",
          limit: numQuestions,
        },
      });
      if (!res.data?.length) {
        alert("No questions found.");
        return navigate("/dashboard");
      }
      setQuestions(res.data);
      setAnswers({});
      setCurrent(0);
      setFinished(false);
      setQuizResultPayload(null);
      // --- NEW: Reset practice mode state on new quiz ---
      setCheckedAnswers({});
      setShowFeedback(false);
      setStartTime(new Date());
      if (mode === "exam") {
        setTimeLeft(res.data.length * 180);
        setTimerRunning(true);
      }
    } catch (err) {
      console.error("❌ Failed to load questions:", err);
      alert("Failed to load questions. Please try again.");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mode !== "exam" || !timerRunning || timeLeft === null) return;
    if (timeLeft <= 0) {
      finishQuiz();
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, timerRunning, mode]);

  const formatTimeForTimer = (secs) => {
    const h = String(Math.floor(secs / 3600)).padStart(2, "0");
    const m = String(Math.floor((secs % 3600) / 60)).padStart(2, "0");
    const s = String(secs % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const handleSetCurrent = (index) => {
    // Mark the *current* question (the one we are leaving) as visited
    setVisitedQuestions(prev => new Set(prev).add(current));
    setCurrent(index);
  };

  const handleAnswer = (index, value, multiple = false) => {
    // --- NEW: Prevent changing answer after checking in practice mode ---
    if (mode === "practice" && showFeedback) return;

    setAnswers((prev) => {
      const newAnswers = { ...prev };
      if (multiple) {
        const existing = newAnswers[index] || [];
        const updated = existing.includes(value)
          ? existing.filter((v) => v !== value)
          : [...existing, value];
        newAnswers[index] = updated;
      } else {
        newAnswers[index] = value;
      }
      return newAnswers;
    });
  };

  const renderQuestionText = (text) => {
    if (typeof text !== "string") return text;
    
    // Split by triple backticks
    const parts = text.split(/```(\w+)?\n([\s\S]*?)```/g);
    
    if (parts.length === 1) {
      return <span style={{ whiteSpace: "pre-wrap" }}>{text}</span>;
    }

    const result = [];
    for (let i = 0; i < parts.length; i++) {
      // The split with capturing groups works like this:
      // [textBefore, lang, code, textAfter, lang, code, ...]
      // So:
      // i=0: text before first code block
      // i=1: language of first code block
      // i=2: code of first code block
      // i=3: text after first code block (or before next)
      
      // However, if the string starts with a code block, the first element is empty string.
      
      if (i % 3 === 0) {
        // Normal text
        if (parts[i]) {
           result.push(
            <span key={`text-${i}`} style={{ whiteSpace: "pre-wrap" }}>
              {parts[i]}
            </span>
          );
        }
      } else if (i % 3 === 1) {
        // Language (captured group 1) - skip, we'll use it in next iteration
      } else if (i % 3 === 2) {
        // Code (captured group 2)
        const lang = parts[i-1] || "text"; // Use captured language or default
        const code = parts[i];
        result.push(
          <div key={`code-${i}`} className="code-block-wrapper">
            <SyntaxHighlighter
              language={lang}
              style={atomDark}
              customStyle={{
                borderRadius: "8px",
                fontSize: "0.9rem",
                margin: "1rem 0",
              }}
            >
              {code.trim()}
            </SyntaxHighlighter>
          </div>
        );
      }
    }
    return result;
  };

  const getQuestionStatus = (question, userAnswer) => {
    const notAttempted =
      userAnswer === undefined ||
      userAnswer === null ||
      (Array.isArray(userAnswer) && userAnswer.length === 0) ||
      String(userAnswer).trim() === "";
    if (notAttempted) return "not_attempted";
    const correctAnswer = question.correctOption;
    if (question.questionType === "multiple") {
      const userSet = new Set(userAnswer);
      const correctSet = new Set(correctAnswer);
      if (userSet.size !== correctSet.size) return "incorrect";
      for (const ans of userSet) {
        if (!correctSet.has(ans)) return "incorrect";
      }
      return "correct";
    }
    if (
      typeof correctAnswer === "object" &&
      correctAnswer !== null &&
      correctAnswer.min !== undefined &&
      correctAnswer.max !== undefined
    ) {
      const numericAnswer = parseFloat(userAnswer);
      return !isNaN(numericAnswer) &&
        numericAnswer >= correctAnswer.min &&
        numericAnswer <= correctAnswer.max
        ? "correct"
        : "incorrect";
    }
    return String(userAnswer).trim().toLowerCase() ===
      String(correctAnswer).trim().toLowerCase()
      ? "correct"
      : "incorrect";
  };

  const isAnswered = (i) => {
    if (!questions[i]) return false;
    return getQuestionStatus(questions[i], answers[i]) !== "not_attempted";
  };

  // --- NEW: Function to handle checking the answer in practice mode ---
  const handleCheckAnswer = () => {
    if (isAnswered(current)) {
      const status = getQuestionStatus(questions[current], answers[current]);
      setCheckedAnswers((prev) => ({ ...prev, [current]: { status } }));
      setShowFeedback(true);
    }
  };

  // --- NEW: Helper for displaying the correct answer text ---
  const formatCorrectAnswerText = (option) => {
    if (Array.isArray(option)) return option.join(", ");
    if (
      typeof option === "object" &&
      option !== null &&
      option.min !== undefined &&
      option.max !== undefined
    ) {
      return `Between ${option.min} and ${option.max}`;
    }
    return String(option);
  };

  const finishQuiz = async () => {
    setTimerRunning(false);
    const endTime = new Date();
    const timeTaken = startTime ? Math.round((endTime - startTime) / 1000) : 0;

    let calculatedScore = 0;
    const processedQuestions = questions.map((q, i) => {
      const status = getQuestionStatus(q, answers[i]);
      const marks = status === "correct" ? 1 : 0;
      if (marks === 1) calculatedScore++;
      return {
        questionId: q._id,
        userAnswer: answers[i] || null,
        status,
        marks,
        topic: q.topic || "General",
      };
    });

    const payload = {
      userId,
      subject,
      term: term || null,
      exam: exam || null,
      questions: processedQuestions,
      startTime,
      endTime,
      timeTaken,
      score: calculatedScore,
      totalQuestions: questions.length,
    };

    setQuizResultPayload(payload);
    setFinished(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const response = await axios.post("http://localhost:5000/api/results", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Save the result ID for AI analysis
      if (response.data && response.data._id) {
        setQuizResultId(response.data._id);
        // Navigate to result URL with resultId for persistence
        navigate(`/quiz/${subject}/result/${response.data._id}`, {
          replace: true,
          state: location.state // Preserve quiz config for fresh state
        });
      }
    } catch (error) {
      console.error("Error saving quiz results:", error);
    }
  };

  const renderContent = () => {
    if (loading) return <div className="loading-spinner"></div>;
    if (finished && quizResultPayload) {
      // Extract enriched question details from quizResultPayload
      const formattedQuestions = quizResultPayload.questions.map(q => ({
        question: q.question || '',
        context: q.context,
        options: q.options || {},
        correctOption: q.correctOption,
        image: q.image,
        explanation: q.explanation,
        questionType: q.questionType || 'mcq',
        topic: q.topic
      }));
      
      return (
        <QuizResults
         results={quizResultPayload}
          originalQuestions={formattedQuestions}
          resultId={quizResultId}
          savedAiAnalysis={savedAiAnalysis}
        />
      );
    }

    if (questions.length > 0 && current < questions.length) {
      const q = questions[current];
      
      // --- NEW: Pagination Logic for Question Numbers ---
      const QUESTIONS_PER_PAGE = 10;
      const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE);
      const currentPage = Math.floor(current / QUESTIONS_PER_PAGE);
      
      const startQ = currentPage * QUESTIONS_PER_PAGE;
      const endQ = Math.min(startQ + QUESTIONS_PER_PAGE, questions.length);
      const currentQuestions = questions.slice(startQ, endQ);

      return (
        <>
          {/* --- NEW: Horizontal Question Navigation --- */}
          <div className="quiz-nav-horizontal">
             <button 
                className="nav-arrow"
                disabled={currentPage === 0}
                onClick={() => handleSetCurrent((currentPage - 1) * QUESTIONS_PER_PAGE)}
             >
               ←
             </button>
             <div className="nav-numbers-scroll">
                {questions.map((_, i) => {
                    // Only show if in current page range
                    if (i < startQ || i >= endQ) return null;
                    
                    const isVisited = visitedQuestions.has(i);
                    const isAns = isAnswered(i);
                    let navClass = "unvisited";
                    
                    if (isVisited && i !== current) {
                      navClass = isAns ? "visited-answered" : "visited-unanswered";
                    }

                    return (
                      <button
                        key={i}
                        className={`question-nav-item ${i === current ? "current" : ""} ${navClass}`}
                        onClick={() => handleSetCurrent(i)}
                      >
                        {i + 1}
                      </button>
                    );
                })}
             </div>
             <button 
                className="nav-arrow"
                disabled={currentPage === totalPages - 1}
                onClick={() => handleSetCurrent((currentPage + 1) * QUESTIONS_PER_PAGE)}
             >
               →
             </button>
          </div>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${Math.round(
                  (Object.keys(answers).length / questions.length) * 100
                )}%`,
              }}
            />
          </div>
          <div className="quiz-split">
            <div 
              className="quiz-left" 
              ref={leftPanelRef}
            >
              <div className="question-block">
                <div className="question-text">
                  <strong>Q{current + 1}:</strong>{" "}
                  {renderQuestionText(q.question)}
                </div>
                {q.context && (
                  <blockquote className="context-block">
                    {renderQuestionText(q.context)}
                  </blockquote>
                )}
                {q.image && (
                  <div className="image-container">
                    <img src={q.image} alt="Question visual aid" />
                  </div>
                )}
              </div>
            </div>
            <div 
              className="quiz-right"
              ref={rightPanelRef}
            >
              <div className="quiz-right-content">
                  <div className="options-container">
                    {q.questionType === "numerical" ? (
                      <>
                        <input
                          type="text"
                          className={`numerical-input ${
                            mode === "practice" && showFeedback
                              ? checkedAnswers[current]?.status === "correct"
                                ? "correct-practice"
                                : "incorrect-practice"
                              : ""
                          }`}
                          placeholder="Enter your answer"
                          value={answers[current] || ""}
                          onChange={(e) => handleAnswer(current, e.target.value)}
                          disabled={mode === "practice" && showFeedback}
                        />
                        {/* --- NEW: Show correct answer feedback for numerical --- */}
                        {mode === "practice" &&
                          showFeedback &&
                          checkedAnswers[current]?.status !== "correct" && (
                            <div className="correct-answer-feedback">
                              Correct Answer:{" "}
                              {formatCorrectAnswerText(q.correctOption)}
                            </div>
                          )}
                      </>
                    ) : (
                      Object.entries(q.options || {}).map(([key, val]) => {
                        // --- NEW: Add dynamic classes for practice mode feedback ---
                        let practiceClass = "";
                        if (mode === "practice" && showFeedback) {
                          const correctAnswer = q.correctOption;
                          const userAnswer = answers[current];
                          const isMultiple = q.questionType === "multiple";

                          if (
                            (isMultiple && correctAnswer.includes(key)) ||
                            (!isMultiple && key === correctAnswer)
                          ) {
                            practiceClass = "correct-practice";
                          } else if (
                            (isMultiple && userAnswer?.includes(key)) ||
                            (!isMultiple && key === userAnswer)
                          ) {
                            practiceClass = "incorrect-practice";
                          }
                        }

                        return (
                          <label
                            key={key}
                            className={`option-label ${practiceClass}`}
                          >
                            <input
                              type={
                                q.questionType === "multiple" ? "checkbox" : "radio"
                              }
                              name={`q-${current}`}
                              value={key}
                              checked={
                                q.questionType === "multiple"
                                  ? (answers[current] || []).includes(key)
                                  : answers[current] === key
                              }
                              onChange={() =>
                                handleAnswer(
                                  current,
                                  key,
                                  q.questionType === "multiple"
                                )
                              }
                            />
                            <span className="option-text">
                              {renderQuestionText(val)}
                            </span>
                          </label>
                        );
                      })
                    )}
                  </div>

                  {/* --- NEW: Show explanation in practice mode after checking --- */}
                  {mode === "practice" && showFeedback && q.explanation && (
                    <div className="explanation-block">
                      <strong>Explanation:</strong>{" "}
                      {renderQuestionText(q.explanation)}
                    </div>
                  )}
              </div>

              <div className="navigation-buttons fixed-bottom">
                {/* --- NEW: Conditionally render Check button for practice mode --- */}
                {mode === "practice" && (
                  <button
                    className="btn btn-check"
                    onClick={handleCheckAnswer}
                    disabled={showFeedback || !isAnswered(current)}
                  >
                    Check
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      );
    }
    return <div className="loading-spinner"></div>;
  };

  return (
    <div className={`quiz-page-wrapper ${finished ? 'results-mode' : ''}`}>
      <div className="quiz-container">
        <div className="quiz-header">
          <div className="header-left">
            <h1>Quiz for {subject}</h1>
          </div>

          <div className="header-center">
            {/* --- NEW: Header Navigation Buttons (Centered) --- */}
            {!finished && (
              <div className="header-nav-buttons">
                <button
                  className="btn-header-nav"
                  onClick={() => handleSetCurrent(current - 1)}
                  disabled={current === 0}
                  title="Previous Question"
                >
                  Previous
                </button>
                <button
                  className="btn-header-nav"
                  onClick={() => handleSetCurrent(current + 1)}
                  disabled={current === questions.length - 1}
                  title="Next Question"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          <div className="header-right">
            {mode === "exam" && timerRunning && timeLeft != null && quizPrefs.timerVisible && (
              <div className="timer premium-timer">
                <IconClock /> <span>{formatTimeForTimer(timeLeft)}</span>
              </div>
            )}

            {/* --- NEW: Music Controls --- */}
            <div className="quiz-music-controls">
              <button 
                className={`btn-music-toggle ${musicEnabled ? 'active' : ''}`}
                onClick={() => setMusicEnabled(!musicEnabled)}
                title={musicEnabled ? "Mute Music" : "Play Music"}
              >
                <IconMusic />
              </button>
              {musicEnabled && (
                <select
                  className="quiz-music-select"
                  value={quizPrefs.selectedMusicTrack}
                  onChange={(e) => setQuizPrefs(prev => ({ ...prev, selectedMusicTrack: e.target.value }))}
                  onClick={(e) => e.stopPropagation()}
                >
                  {musicTracks.map(track => (
                    <option key={track.id} value={track.id}>
                      {track.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            {!finished && (
              <button
                onClick={() => setShowSubmitModal(true)}
                className="btn btn-submit-quiz-header"
                title="Submit Quiz"
              >
                Submit
              </button>
            )}
            <button
              onClick={() => {
                  localStorage.removeItem("quizState");
                  navigate(fromHistory && finished ? "/quiz-history" : "/dashboard");
              }}
              className="btn btn-leave-quiz-header"
              title={fromHistory && finished ? "Back to History" : "Exit to Dashboard"}
            >
              {fromHistory && finished ? "History" : "Exit"}
            </button>
          </div>
        </div>
        {renderContent()}
        
        {/* --- NEW: Submission Confirmation Modal --- */}
        {showSubmitModal && (
          <div className="quiz-modal-overlay">
            <div className="quiz-modal-content">
              <h2>Submit Quiz?</h2>
              <p>Are you sure you want to submit your quiz?</p>
              {(() => {
                const answeredCount = Object.keys(answers).length;
                const unansweredCount = questions.length - answeredCount;
                if (unansweredCount > 0) {
                  return (
                    <div className="unanswered-warning">
                      You have <strong>{unansweredCount}</strong> unanswered question{unansweredCount !== 1 ? 's' : ''}.
                    </div>
                  );
                }
                return <p>You have answered all questions.</p>;
              })()}
              <div className="quiz-modal-actions">
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setShowSubmitModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={() => {
                    setShowSubmitModal(false);
                    finishQuiz();
                  }}
                >
                  Confirm Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;
