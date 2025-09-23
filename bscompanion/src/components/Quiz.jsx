import React, { useState, useEffect, useRef } from "react";
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
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [calculatorDisplay, setCalculatorDisplay] = useState("");
  const [isDegreeMode, setIsDegreeMode] = useState(true);

  const navContainerRef = useRef(null);

  // ✅ Auto-scroll current question button
  useEffect(() => {
    const container = navContainerRef.current;
    if (!container) return;
    const currentButton = container.querySelector(".question-nav-item.current");
    if (currentButton) {
      currentButton.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [current]);

  // ✅ Fetch topics
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/topics", {
          params: { subject },
        });
        setTopics(res.data || []);
      } catch (err) {
        console.error("❌ Failed to fetch topics:", err);
      }
    };
    fetchTopics();
  }, [subject]);

  useEffect(() => {
    if (initialTopic) setSelectedTopic(initialTopic);
  }, [initialTopic]);

  useEffect(() => {
    if (exam || selectedTopic || term) fetchQuestions();
  }, [exam, selectedTopic, term]);

  // ✅ Fetch questions
  const fetchQuestions = async () => {
    if (!exam && !selectedTopic && !term) {
      alert("Select at least one filter!");
      return;
    }
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
        alert("No questions found.");
        navigate("/dashboard");
        return;
      }

      setQuestions(res.data);
      setAnswers({});
      setCurrent(0);
      setFinished(false);
      setScore(null);

      if (mode === "exam") {
        setTimeLeft(getTimeForQuestions(res.data.length));
        setTimerRunning(true);
      }
    } catch (err) {
      console.error("❌ Failed to load questions:", err);
      alert("Failed to load questions.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Timer
  useEffect(() => {
    if (mode !== "exam" || !timerRunning || timeLeft === null) return;
    if (timeLeft <= 0) {
      finishQuiz();
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, timerRunning, mode]);

  const formatTime = (secs) => {
    const h = String(Math.floor(secs / 3600)).padStart(2, "0");
    const m = String(Math.floor((secs % 3600) / 60)).padStart(2, "0");
    const s = String(secs % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  // ✅ Calculator logic
  const handleCalcInput = (val) => setCalculatorDisplay((prev) => prev + val);
  const handleCalcClear = () => setCalculatorDisplay("");
  const handleCalcDel = () => setCalculatorDisplay((prev) => prev.slice(0, -1));
  const toggleDegRad = () => setIsDegreeMode((d) => !d);

  const safeEval = (expr) => {
    let e = expr
      .replace(/π/g, "Math.PI")
      .replace(/\be\b/g, "Math.E")
      .replace(/\^/g, "**")
      .replace(/sin\(/g, "Math.sin(")
      .replace(/cos\(/g, "Math.cos(")
      .replace(/tan\(/g, "Math.tan(")
      .replace(/log\(/g, "Math.log10(")
      .replace(/ln\(/g, "Math.log(")
      .replace(/sqrt\(/g, "Math.sqrt(");

    if (isDegreeMode) {
      e = e
        .replace(/Math\.sin\(([^)]+)\)/g, `Math.sin(($1)*(Math.PI/180))`)
        .replace(/Math\.cos\(([^)]+)\)/g, `Math.cos(($1)*(Math.PI/180))`)
        .replace(/Math\.tan\(([^)]+)\)/g, `Math.tan(($1)*(Math.PI/180))`);
    }

    if (!/^[-+/*().,\d\sA-Za-z_**]+$/.test(e))
      throw new Error("Invalid characters");
    return new Function("Math", `return (${e});`)(Math);
  };

  const handleCalcEquals = () => {
    try {
      setCalculatorDisplay(String(safeEval(calculatorDisplay || "0")));
    } catch {
      setCalculatorDisplay("Error");
    }
  };

  const calculatorRows = [
    ["7", "8", "9", "/", "AC"],
    ["4", "5", "6", "*", "DEL"],
    ["1", "2", "3", "-", "("],
    ["0", ".", ")", "+", "="],
    ["sin(", "cos(", "tan(", "^", "sqrt("],
    ["log(", "ln(", "π", "e", ","],
  ];

  // ✅ Answer handling
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

  // ✅ Time calculation
  const getTimeForQuestions = (count) => {
    let totalTime = count * 90;
    if (totalTime < 600) totalTime = 600;
    if (totalTime > 7200) totalTime = 7200;
    let totalMinutes = Math.ceil(totalTime / 60);
    totalMinutes = Math.ceil(totalMinutes / 5) * 5;
    return totalMinutes * 60;
  };

  // ✅ Render safe text (pre + span without invalid nesting)
  const renderQuestion = (text) => {
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

  // ✅ Correctness helpers
  const isAnswered = (index) => {
    const ua = answers[index],
      q = questions[index];
    if (!q) return false;
    if (q.questionType === "multiple")
      return Array.isArray(ua) && ua.length > 0;
    return ua !== undefined && ua !== null && String(ua).trim() !== "";
  };

  const isCorrect = (index) => {
    const q = questions[index],
      ua = answers[index];
    if (!q) return false;
    const c = q.correctOption;
    if (q.questionType === "single") {
      if (!ua) return false;
      return (
        ua.toString().trim().toLowerCase() === c.toString().trim().toLowerCase()
      );
    }
    if (q.questionType === "numerical") {
      if (ua === null || ua === undefined || ua === "") return false;
      const uaNorm = ua.toString().trim().toLowerCase();
      if (
        typeof c === "object" &&
        !Array.isArray(c) &&
        c.min !== undefined &&
        c.max !== undefined
      ) {
        const val = parseFloat(ua);
        return !isNaN(val) && val >= c.min && val <= c.max;
      }
      if (Array.isArray(c))
        return c.some((ans) => parseFloat(ans) === parseFloat(ua));
      return uaNorm === c.toString().trim().toLowerCase();
    }
    if (q.questionType === "multiple") {
      if (!Array.isArray(ua) || ua.length === 0) return false;
      const cSet = new Set(c),
        uSet = new Set(ua);
      if (uSet.size !== cSet.size) return false;
      for (let ans of uSet) if (!cSet.has(ans)) return false;
      return true;
    }
    return false;
  };

  // ✅ Finish quiz
  const finishQuiz = () => {
    const total = questions.reduce(
      (acc, _, i) => acc + (isCorrect(i) ? 1 : 0),
      0
    );
    setScore(total);
    setFinished(true);
    setTimerRunning(false);
  };

  // ✅ Render main content
  const renderContent = () => {
    if (loading) return <p>Loading questions...</p>;
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
              <div className="question-text">
                <strong>Q{i + 1}:</strong> {renderQuestion(q.question)}
              </div>
              <p className="correct-answer">
                ✅ Correct:{" "}
                {Array.isArray(q.correctOption)
                  ? q.correctOption.join(", ")
                  : typeof q.correctOption === "object" &&
                    q.correctOption !== null
                  ? `Between ${q.correctOption.min} and ${q.correctOption.max}`
                  : q.correctOption}
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
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${Math.round(
                  ((current + 1) / questions.length) * 100
                )}%`,
              }}
            />
            <span className="progress-text">
              {Math.round(((current + 1) / questions.length) * 100)}%
            </span>
          </div>
          <div className="quiz-split">
            <div className="quiz-left">
              <div className="question-block">
                <div className="question-text">
                  <strong>Q{current + 1}:</strong> {renderQuestion(q.question)}
                </div>
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
                ) : q.options && Object.keys(q.options).length > 0 ? (
                  Object.entries(q.options).map(([key, val]) => (
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
                        onChange={(e) =>
                          handleAnswer(
                            current,
                            e.target.value,
                            q.questionType === "multiple"
                          )
                        }
                      />{" "}
                      {renderQuestion(val)}
                    </label>
                  ))
                ) : null}
              </div>

              <div className="question-nav">
                <div className="question-nav-header">Questions</div>
                <div className="question-nav-list" ref={navContainerRef}>
                  {questions.map((_, i) => {
                    const answered = isAnswered(i);
                    const correctStatus = finished
                      ? isCorrect(i)
                        ? "correct"
                        : answered
                        ? "wrong"
                        : ""
                      : "";
                    const classes = [
                      "question-nav-item",
                      i === current ? "current" : "",
                      answered ? "answered" : "unanswered",
                      correctStatus,
                    ]
                      .filter(Boolean)
                      .join(" ");
                    return (
                      <button
                        key={i}
                        className={classes}
                        onClick={() => setCurrent(i)}
                        aria-label={`Go to question ${i + 1}`}
                      >
                        {i + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
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
          <div className="header-right">
            <button
              type="button"
              className="btn btn-secondary calc-button"
              onClick={() => setIsCalculatorOpen(true)}
            >
              Calculator
            </button>
            {mode === "exam" && timerRunning && timeLeft !== null && (
              <h3 className="timer">⏳ {formatTime(timeLeft)}</h3>
            )}
          </div>
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

        {isCalculatorOpen && (
          <div className="calculator-modal" role="dialog" aria-modal="true">
            <div className="calculator">
              <div className="calculator-header">
                <span>Scientific Calculator</span>
                <button
                  type="button"
                  className="calc-close"
                  onClick={() => setIsCalculatorOpen(false)}
                  aria-label="Close calculator"
                >
                  ✕
                </button>
              </div>
              <div className="calc-top-row">
                <button
                  type="button"
                  className="calc-mode"
                  onClick={toggleDegRad}
                >
                  {isDegreeMode ? "DEG" : "RAD"}
                </button>
                <input
                  className="calc-display"
                  value={calculatorDisplay}
                  onChange={(e) => setCalculatorDisplay(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="calc-buttons">
                {calculatorRows.map((row, rIdx) => (
                  <div className="calc-row" key={rIdx}>
                    {row.map((key) =>
                      key === "AC" ? (
                        <button
                          key={key}
                          className="calc-key danger"
                          onClick={handleCalcClear}
                        >
                          AC
                        </button>
                      ) : key === "DEL" ? (
                        <button
                          key={key}
                          className="calc-key warning"
                          onClick={handleCalcDel}
                        >
                          DEL
                        </button>
                      ) : key === "=" ? (
                        <button
                          key={key}
                          className="calc-key primary"
                          onClick={handleCalcEquals}
                        >
                          =
                        </button>
                      ) : (
                        <button
                          key={key}
                          className="calc-key"
                          onClick={() => handleCalcInput(key)}
                        >
                          {key}
                        </button>
                      )
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;
