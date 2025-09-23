import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./quiz.css";

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
  } = location.state || {};

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(0);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [score, setScore] = useState(null);
  const [checked, setChecked] = useState({});
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(initialTopic || "");

  // Fetch topics for subject
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/topics", {
          params: { subject },
        });
        setTopics(res.data || []);
      } catch (err) {
        console.error("❌ Error fetching topics:", err);
      }
    };
    fetchTopics();
  }, [subject]);

  // Ensure selectedTopic matches initialTopic once
  useEffect(() => {
    if (initialTopic) {
      setSelectedTopic(initialTopic);
    }
  }, [initialTopic]);

  // Fetch questions when exam or selectedTopic changes
  useEffect(() => {
    if (exam || selectedTopic || term) {
      fetchQuestions();
    }
  }, [exam, selectedTopic, term]);

  const fetchQuestions = async () => {
    if (!exam && !selectedTopic && !term)
      return alert("Please select at least one filter (Exam, Topic, or Term)!");

    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/questions", {
        params: {
          subject,
          exam,
          term,
          topic: selectedTopic || "",
          limit: numQuestions,
        },
      });

      if (!res.data || res.data.length === 0) {
        alert("No questions found for this selection.");
        navigate("/dashboard"); // Navigate back if no questions
        return;
      }

      setQuestions(res.data);
      setAnswers({});
      setCurrent(0);
      setFinished(false);
      setScore(null);

      if (mode === "exam") {
        const totalTime = getTimeForQuestions(res.data.length);
        setTimeLeft(totalTime);
        setTimerRunning(true);
      }
    } catch (err) {
      console.error("❌ Error fetching questions:", err);
      alert("Failed to load questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Timer
  useEffect(() => {
    if (mode !== "exam" || !timerRunning || timeLeft === null) return;

    if (timeLeft <= 0) {
      finishQuiz();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, timerRunning, mode]);

  const formatTime = (secs) => {
    const h = String(Math.floor(secs / 3600)).padStart(2, "0");
    const m = String(Math.floor((secs % 3600) / 60)).padStart(2, "0");
    const s = String(secs % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const handleAnswer = (index, value, multiple = false) => {
    setAnswers((prev) => {
      if (multiple) {
        const existing = prev[index] || [];
        const updated = existing.includes(value)
          ? existing.filter((v) => v !== value)
          : [...existing, value];
        return { ...prev, [index]: updated };
      }
      return { ...prev, [index]: value };
    });
    setChecked((prev) => ({ ...prev, [index]: false }));
  };

  const getTimeForQuestions = (count) => {
    const secondsPerQuestion = 90;
    let totalTime = count * secondsPerQuestion;

    const minTime = 10 * 60; // 10 minutes
    const maxTime = 120 * 60; // 2 hours

    if (totalTime < minTime) totalTime = minTime;
    if (totalTime > maxTime) totalTime = maxTime;

    let totalMinutes = Math.ceil(totalTime / 60);
    totalMinutes = Math.ceil(totalMinutes / 5) * 5;

    return totalMinutes * 60;
  };

  const renderQuestion = (text) => {
    if (typeof text !== "string" || !text.includes("```")) {
      return (
        <span style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}>
          {text}
        </span>
      );
    }
    const parts = text.split("```");
    return parts.map((part, i) =>
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

  const calculateScore = () => {
    let total = 0;

    questions.forEach((q, i) => {
      const userAns = answers[i];
      const correct = q.correctOption;

      if (q.questionType === "single") {
        if (
          userAns &&
          userAns.toString().trim().toLowerCase() ===
            correct.toString().trim().toLowerCase()
        ) {
          total += 1;
        }
      } else if (q.questionType === "numerical") {
        if (userAns === null || userAns === undefined || userAns === "") return;

        const normalizedUserAns = userAns.toString().trim().toLowerCase();

        // CASE 1: Range {min, max}
        if (
          typeof correct === "object" &&
          !Array.isArray(correct) &&
          correct.min !== undefined &&
          correct.max !== undefined
        ) {
          const userVal = parseFloat(userAns);
          if (
            !isNaN(userVal) &&
            userVal >= correct.min &&
            userVal <= correct.max
          ) {
            total += 1;
          }
        }

        // CASE 2: Multiple possible numerical answers [2, -2]
        else if (Array.isArray(correct)) {
          if (correct.some((ans) => parseFloat(ans) === parseFloat(userAns))) {
            total += 1;
          }
        }

        // CASE 3: Single fixed value (number OR string)
        else {
          const normalizedCorrect = correct.toString().trim().toLowerCase();
          if (normalizedUserAns === normalizedCorrect) {
            total += 1;
          }
        }
      } else if (q.questionType === "multiple") {
        if (!Array.isArray(userAns) || userAns.length === 0) return;

        const correctSet = new Set(correct);
        const userSet = new Set(userAns);

        if (userSet.size > correctSet.size) return;

        let isSubset = true;
        for (let ans of userSet) {
          if (!correctSet.has(ans)) {
            isSubset = false;
            break;
          }
        }

        if (isSubset) {
          const fraction = userSet.size / correctSet.size;
          total += fraction;
        }
      }
    });

    return total;
  };

  const finishQuiz = () => {
    const finalScore = calculateScore();
    console.log("✅ Final Score:", finalScore); // <-- Debug here
    setScore(finalScore);
    setFinished(true);
    setTimerRunning(false);
  };
  // Conditional Rendering for the main content
  const renderContent = () => {
    if (loading) {
      return <p>Loading questions...</p>;
    }

    if (finished) {
      return (
        <div className="results-container">
          <h2>Results</h2>
          <h3>
            🎯 Score:{" "}
            {score !== null && questions.length > 0
              ? ((score / questions.length) * 100).toFixed(2) + "%"
              : "Calculating..."}
          </h3>
          {questions.map((q, i) => (
            <div key={i} className="result-item">
              {q.context && (
                <blockquote className="context-block">
                  {renderQuestion(q.context)}
                </blockquote>
              )}
              <p className="question-text">
                <strong>Q{i + 1}:</strong> {renderQuestion(q.question)}
              </p>
              <p className="correct-answer">
                ✅ Correct:{" "}
                {
                  Array.isArray(q.correctOption)
                    ? q.correctOption.join(", ") // Case 1: Array → Join values
                    : typeof q.correctOption === "object" &&
                      q.correctOption !== null
                    ? `Between ${q.correctOption.min} and ${q.correctOption.max}` // Case 2: Range → Show nicely
                    : q.correctOption // Case 3: Single value
                }
              </p>
              <p className="user-answer">
                📝 Yours:{" "}
                {Array.isArray(answers[i])
                  ? answers[i].join(", ")
                  : answers[i] || "Not answered"}
              </p>
            </div>
          ))}
        </div>
      );
    }

    if (questions.length > 0) {
      const q = questions[current];
      return (
        <>
          <div className="question-block">
            <p className="question-text">
              <strong>Q{current + 1}:</strong> {renderQuestion(q.question)}
            </p>
            {q.context && (
              <blockquote className="context-block">
                {renderQuestion(q.context)}
              </blockquote>
            )}
            {q.image && (
              <div className="image-container">
                <img src={q.image} alt="Question related" />
              </div>
            )}
          </div>

          <div className="options-container">
            {q.questionType === "numerical" ? (
              <input
                type="text"
                className="numerical-input" // Added a class for styling
                placeholder="Enter your answer"
                value={answers[current] || ""}
                onChange={(e) => handleAnswer(current, e.target.value)}
              />
            ) : q.options && Object.keys(q.options).length > 0 ? (
              Object.entries(q.options).map(([key, value]) => (
                <label key={key} className="option-label">
                  <input
                    type={q.questionType === "multiple" ? "checkbox" : "radio"}
                    name={`q-${current}`}
                    value={key}
                    checked={
                      q.questionType === "multiple"
                        ? (answers[current] || []).includes(key)
                        : answers[current] === key
                    }
                    onChange={(e) =>
                      handleAnswer(
                        current,
                        e.target.value,
                        q.questionType === "multiple"
                      )
                    }
                  />{" "}
                  {value}
                </label>
              ))
            ) : null}
          </div>

          {mode === "practice" && answers[current] && !checked[current] && (
            <div className="practice-check">
              <button
                className="btn btn-primary"
                onClick={() =>
                  setChecked((prev) => ({ ...prev, [current]: true }))
                }
              >
                Check Answer
              </button>
            </div>
          )}

          {mode === "practice" && checked[current] && (
            <div className="correct-answer practice-feedback">
              ✅ Correct Answer:{" "}
              {Array.isArray(q.correctOption)
                ? q.correctOption.join(", ")
                : q.correctOption}
            </div>
          )}

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
              <button className="btn btn-primary" onClick={finishQuiz}>
                Finish
              </button>
            )}
          </div>
        </>
      );
    }

    // Initial state: Topic selection and Start button
    return (
      <div className="quiz-start-controls">
        {topics.length > 0 && (
          <div>
            <label>Topic (optional): </label>
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
        )}
        <button className="btn btn-primary" onClick={fetchQuestions}>
          Start Quiz
        </button>
      </div>
    );
  };

  return (
    <div className="quiz-page-wrapper">
      <div className="quiz-container">
        <div className="quiz-header">
          <h1>Quiz for {subject}</h1>
          {mode === "exam" && timerRunning && timeLeft !== null && (
            <h3 className="timer">⏳ Time Left: {formatTime(timeLeft)}</h3>
          )}
        </div>

        {renderContent()}

        {(questions.length > 0 || finished) && (
          <button
            onClick={() => navigate("/dashboard")}
            className="btn btn-leave-quiz"
          >
            Leave Quiz
          </button>
        )}
      </div>
    </div>
  );
};

export default Quiz;
