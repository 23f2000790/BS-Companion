import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const Quiz = () => {
  const { subject } = useParams();
  const [exam, setExam] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(0);
  const [finished, setFinished] = useState(false);
  const [numQuestions, setNumQuestions] = useState(10);
  const [timeLeft, setTimeLeft] = useState(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [score, setScore] = useState(null);

  const fetchQuestions = async () => {
    if (!exam) return alert("Please select an exam first!");

    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/questions", {
        params: { subject, exam, limit: numQuestions },
      });

      setQuestions(res.data);
      setAnswers({});
      setCurrent(0);
      setFinished(false);
      setScore(null);

      const totalTime = getTimeForQuestions(numQuestions);
      setTimeLeft(totalTime);
      setTimerRunning(true);
    } catch (err) {
      console.error("❌ Error fetching questions:", err);
      alert("Failed to load questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Timer
  useEffect(() => {
    if (!timerRunning || timeLeft === null) return;

    if (timeLeft <= 0) {
      finishQuiz(); // auto finish
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, timerRunning]);

  const formatTime = (secs) => {
    const h = String(Math.floor(secs / 3600)).padStart(2, "0");
    const m = String(Math.floor((secs % 3600) / 60)).padStart(2, "0");
    const s = String(secs % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  // Handle answers
  const handleAnswer = (index, value, multiple = false) => {
    setAnswers((prev) => {
      if (multiple) {
        const existing = prev[index] || [];
        if (existing.includes(value)) {
          return { ...prev, [index]: existing.filter((v) => v !== value) };
        } else {
          return { ...prev, [index]: [...existing, value] };
        }
      } else {
        return { ...prev, [index]: value };
      }
    });
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

  // Render question text with code & whitespace
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

  // Calculate score
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

        // If user selected any wrong option → 0
        for (let ans of userSet) {
          if (!correctSet.has(ans)) {
            return;
          }
        }

        // Partial score
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
      {timerRunning && timeLeft !== null && (
        <h3 style={{ marginTop: "10px" }}>
          ⏳ Time Left: {formatTime(timeLeft)}
        </h3>
      )}

      {!questions.length && !finished && (
        <>
          <label style={{ marginRight: "10px" }}>Number of Questions: </label>
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

          <select value={exam} onChange={(e) => setExam(e.target.value)}>
            <option value="">-- Select Exam --</option>
            <option value="quiz1">Quiz 1</option>
            <option value="quiz2">Quiz 2</option>
            <option value="ET">End Term (ET)</option>
          </select>

          <button onClick={fetchQuestions} style={{ marginLeft: "10px" }}>
            Submit
          </button>
        </>
      )}

      {loading && <p>Loading questions...</p>}

      {!finished && questions.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <div>
            <p>
              <strong>Q{current + 1}:</strong>{" "}
              {renderQuestion(questions[current].question)}
            </p>

            {questions[current].options ? (
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
            ) : (
              <input
                type="text"
                placeholder="Enter your answer"
                value={answers[current] || ""}
                onChange={(e) => handleAnswer(current, e.target.value)}
              />
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
              <button onClick={finishQuiz} style={{ marginLeft: "10px" }}>
                Finish
              </button>
            )}
          </div>
        </div>
      )}

      {finished && (
        <div style={{ marginTop: "20px" }}>
          <h2>Results</h2>
          <h3>
            🎯 Score: {score?.toFixed(2)} / {questions.length}
          </h3>

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
    </div>
  );
};

export default Quiz;
