import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const Quiz = () => {
  const { subject } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const {
    exam,
    topic: initialTopic,
    numQuestions,
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
    if (exam || selectedTopic) {
      fetchQuestions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exam, selectedTopic]);

  const fetchQuestions = async () => {
    if (!exam && !selectedTopic)
      return alert("Please select an exam or topic first!");

    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/questions", {
        params: {
          subject,
          exam,
          topic: selectedTopic || "",
          limit: numQuestions,
        },
      });

      if (!res.data || res.data.length === 0) {
        alert("No questions found for this selection.");
        return;
      }

      setQuestions(res.data);
      setAnswers({});
      setCurrent(0);
      setFinished(false);
      setScore(null);

      if (mode === "exam") {
        const totalTime = getTimeForQuestions(numQuestions);
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
    if (mode !== "exam") return;
    if (!timerRunning || timeLeft === null) return;

    if (timeLeft <= 0) {
      finishQuiz();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
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
      } else {
        return { ...prev, [index]: value };
      }
    });
    setChecked((prev) => ({ ...prev, [index]: false }));
  };

  const getTimeForQuestions = (count) => {
    switch (count) {
      case 10:
        return 20 * 60;
      case 20:
        return 30 * 60;
      case 30:
        return 45 * 60;
      case 40:
        return 60 * 60;
      case 50:
        return 90 * 60;
      default:
        return 20 * 60;
    }
  };

  const renderQuestion = (text) => {
    if (text.includes("```")) {
      const parts = text.split("```");
      return parts.map((part, i) =>
        i % 2 === 1 ? (
          <pre
            key={i}
            style={{
              background: "#f4f4f4",
              padding: "8px",
              borderRadius: "4px",
              overflowX: "auto",
            }}
          >
            <code>{part}</code>
          </pre>
        ) : (
          <span
            key={i}
            style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}
          >
            {part}
          </span>
        )
      );
    }

    return (
      <span style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}>
        {text}
      </span>
    );
  };

  const calculateScore = () => {
    let total = 0;

    questions.forEach((q, i) => {
      const userAns = answers[i];
      const correct = q.correctOption;

      if (q.questionType === "single" || q.questionType === "numerical") {
        if (
          userAns &&
          userAns.toString().trim() === correct.toString().trim()
        ) {
          total += 1;
        }
      } else if (q.questionType === "multiple") {
        if (!Array.isArray(userAns)) return;

        const correctSet = new Set(correct);
        const userSet = new Set(userAns);

        for (let ans of userSet) {
          if (!correctSet.has(ans)) {
            return;
          }
        }

        const fraction = userSet.size / correctSet.size;
        total += fraction;
      }
    });

    return total;
  };

  const finishQuiz = () => {
    const finalScore = calculateScore();
    setScore(finalScore);
    setFinished(true);
    setTimerRunning(false);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Quiz for {subject}</h1>

      {mode === "exam" && timerRunning && timeLeft !== null && (
        <h3 style={{ marginTop: "10px" }}>
          ⏳ Time Left: {formatTime(timeLeft)}
        </h3>
      )}

      {/* Topic Dropdown */}
      {topics.length > 0 && !questions.length && (
        <div style={{ marginTop: "10px" }}>
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

      {!questions.length && !finished && (
        <button onClick={fetchQuestions} style={{ marginTop: "15px" }}>
          Start Quiz
        </button>
      )}

      {loading && <p>Loading questions...</p>}

      {!finished && questions.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <div>
            <p>
              <strong>Q{current + 1}:</strong>{" "}
              {renderQuestion(questions[current].question)}
              {renderQuestion(questions[current].topic)}
            </p>

            {/* ✅ Updated rendering logic */}
            {questions[current].questionType === "numerical" ? (
              <input
                type="text"
                placeholder="Enter your answer"
                value={answers[current] || ""}
                onChange={(e) => handleAnswer(current, e.target.value)}
              />
            ) : questions[current].options &&
              Object.keys(questions[current].options).length > 0 ? (
              Object.entries(questions[current].options).map(([key, value]) => (
                <div key={key}>
                  <label>
                    <input
                      type={
                        questions[current].questionType === "multiple"
                          ? "checkbox"
                          : "radio"
                      }
                      name={`q-${current}`}
                      value={key}
                      checked={
                        questions[current].questionType === "multiple"
                          ? (answers[current] || []).includes(key)
                          : answers[current] === key
                      }
                      onChange={(e) =>
                        handleAnswer(
                          current,
                          e.target.value,
                          questions[current].questionType === "multiple"
                        )
                      }
                    />{" "}
                    {value}
                  </label>
                </div>
              ))
            ) : null}

            {mode === "practice" && answers[current] && !checked[current] && (
              <div style={{ marginTop: "10px" }}>
                <button
                  onClick={() =>
                    setChecked((prev) => ({ ...prev, [current]: true }))
                  }
                >
                  Check Answer
                </button>
              </div>
            )}

            {mode === "practice" && checked[current] && (
              <div style={{ marginTop: "10px", color: "green" }}>
                ✅ Correct Answer:{" "}
                {Array.isArray(questions[current].correctOption)
                  ? questions[current].correctOption.join(", ")
                  : questions[current].correctOption}
              </div>
            )}
          </div>

          <div style={{ marginTop: "20px" }}>
            <button
              onClick={() => setCurrent(current - 1)}
              disabled={current === 0}
            >
              Previous
            </button>
            {current < questions.length - 1 ? (
              <button
                onClick={() => setCurrent(current + 1)}
                style={{ marginLeft: "10px" }}
              >
                Next
              </button>
            ) : (
              mode === "exam" && (
                <button onClick={finishQuiz} style={{ marginLeft: "10px" }}>
                  Finish
                </button>
              )
            )}
          </div>
        </div>
      )}

      {mode === "exam" && finished && (
        <div style={{ marginTop: "20px" }}>
          <h2>Results</h2>
          <h3>🎯 Score: {((score / questions.length) * 100).toFixed(2)}%</h3>

          {questions.map((q, i) => (
            <div key={i} style={{ marginBottom: "15px" }}>
              <p>
                <strong>Q{i + 1}:</strong> {renderQuestion(q.question)}
              </p>
              <p>
                ✅ Correct Answer:{" "}
                {Array.isArray(q.correctOption)
                  ? q.correctOption.join(", ")
                  : q.correctOption}
              </p>
              <p>
                📝 Your Answer:{" "}
                {Array.isArray(answers[i])
                  ? answers[i].join(", ")
                  : answers[i] || "Not answered"}
              </p>
            </div>
          ))}
        </div>
      )}

      {(questions.length > 0 || finished) && (
        <button
          onClick={() => navigate("/dashboard")}
          style={{ marginTop: "20px", background: "red", color: "white" }}
        >
          Leave Quiz
        </button>
      )}
    </div>
  );
};

export default Quiz;
