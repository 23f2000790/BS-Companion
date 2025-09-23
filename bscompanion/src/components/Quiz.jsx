import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./quiz.css";

// --- SVG Icon Components for modern UI ---
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

// --- Chart Components ---
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

// --- Results Dashboard Component ---
const QuizResults = ({ results, originalQuestions }) => {
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

    // --- ## UPDATED LOGIC: Strong Topics >= 50% ## ---
    const strongTopics = Object.entries(topicPerformance)
      .filter(
        ([_, stats]) =>
          stats.correct + stats.incorrect > 0 &&
          stats.correct / (stats.correct + stats.incorrect) >= 0.5
      )
      .map(([topic]) => topic);

    // --- ## UPDATED LOGIC: Weak Topics < 50% ## ---
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

  if (!results || !stats) return <div className="loading-spinner"></div>;

  return (
    <div className="results-dashboard">
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
            <div key={i} className={`result-item status-${result.status}`}>
              <div className="question-text">
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
    </div>
  );
};

// --- Main Quiz Component ---
const Quiz = () => {
  const { subject } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const {
    exam,
    topic: initialTopic,
    numQuestions,
    term,
    mode,
    userId,
  } = location.state || {};

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(0);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [quizResultPayload, setQuizResultPayload] = useState(null);

  const navContainerRef = useRef(null);

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
  }, [current, finished]);

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
      setStartTime(new Date());
      if (mode === "exam") {
        setTimeLeft(Math.min(Math.max(res.data.length * 90, 600), 7200));
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

  const handleAnswer = (index, value, multiple = false) => {
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
    if (typeof text !== "string" || !text.includes("```")) {
      return <span style={{ whiteSpace: "pre-wrap" }}>{text}</span>;
    }
    return text.split("```").map((part, i) =>
      i % 2 === 1 ? (
        <pre key={i}>
          <code>{part}</code>
        </pre>
      ) : (
        <span key={i} style={{ whiteSpace: "pre-wrap" }}>
          {part}
        </span>
      )
    );
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
      await axios.post("http://localhost:5000/api/results", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Error saving quiz results:", error);
    }
  };

  const renderContent = () => {
    if (loading) return <div className="loading-spinner"></div>;
    if (finished && quizResultPayload)
      return (
        <QuizResults
          results={quizResultPayload}
          originalQuestions={questions}
        />
      );

    if (questions.length > 0 && current < questions.length) {
      const q = questions[current];
      return (
        <>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${Math.round(
                  ((current + 1) / questions.length) * 100
                )}%`,
              }}
            />
          </div>
          <div className="quiz-split">
            <div className="quiz-left">
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
            <div className="quiz-right">
              <div className="options-container">
                {q.questionType === "numerical" ? (
                  <input
                    type="text"
                    className="numerical-input"
                    placeholder="Enter your answer"
                    value={answers[current] || ""}
                    onChange={(e) => handleAnswer(current, e.target.value)}
                  />
                ) : (
                  Object.entries(q.options || {}).map(([key, val]) => (
                    <label key={key} className="option-label">
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
                  ))
                )}
              </div>
              <div className="question-nav">
                <div className="question-nav-header">Questions</div>
                <div className="question-nav-list" ref={navContainerRef}>
                  {questions.map((_, i) => (
                    <button
                      key={i}
                      className={`question-nav-item ${
                        i === current ? "current" : ""
                      } ${isAnswered(i) ? "answered" : "unanswered"}`}
                      onClick={() => setCurrent(i)}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
              <div className="navigation-buttons">
                <button
                  className="btn btn-secondary"
                  onClick={() => setCurrent(current - 1)}
                  disabled={current === 0}
                >
                  Previous
                </button>
                {current < questions.length - 1 ? (
                  <button
                    className="btn btn-primary"
                    onClick={() => setCurrent(current + 1)}
                  >
                    Next
                  </button>
                ) : (
                  <button className="btn btn-finish" onClick={finishQuiz}>
                    Finish
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
    <div className="quiz-page-wrapper">
      <div className="quiz-container">
        <div className="quiz-header">
          <h1>Quiz for {subject}</h1>
          <div className="header-right">
            {mode === "exam" && timerRunning && timeLeft != null && (
              <div className="timer">
                <IconClock /> {formatTimeForTimer(timeLeft)}
              </div>
            )}
          </div>
        </div>
        {renderContent()}
        {(questions.length > 0 || finished) && (
          <button
            onClick={() => navigate("/dashboard")}
            className="btn btn-leave-quiz"
          >
            Back to Dashboard
          </button>
        )}
      </div>
    </div>
  );
};

export default Quiz;
