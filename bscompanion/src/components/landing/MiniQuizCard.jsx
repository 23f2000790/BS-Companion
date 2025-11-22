import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const questions = [
  {
    question: "What is a P-value?",
    options: [
      { text: "Probability of Hypothesis", isCorrect: false },
      { text: "Prob. of Evidence given H0", isCorrect: true }
    ]
  },
  {
    question: "Output of print(2 ** 3)?",
    options: [
      { text: "6", isCorrect: false },
      { text: "8", isCorrect: true }
    ]
  },
  {
    question: "Derivative of x²?",
    options: [
      { text: "2x", isCorrect: true },
      { text: "x", isCorrect: false }
    ]
  },
  {
    question: "Synonym for 'Ephemeral'?",
    options: [
      { text: "Lasting", isCorrect: false },
      { text: "Short-lived", isCorrect: true }
    ]
  },
  {
    question: "Binary of 5?",
    options: [
      { text: "101", isCorrect: true },
      { text: "110", isCorrect: false }
    ]
  },
  {
    question: "Median of [1, 2, 100]?",
    options: [
      { text: "2", isCorrect: true },
      { text: "51.5", isCorrect: false }
    ]
  },
  {
    question: "Which is mutable in Python?",
    options: [
      { text: "Tuple", isCorrect: false },
      { text: "List", isCorrect: true }
    ]
  },
  {
    question: "Integral of 2x dx?",
    options: [
      { text: "x² + C", isCorrect: true },
      { text: "2x² + C", isCorrect: false }
    ]
  },
  {
    question: "Antonym of 'Benevolent'?",
    options: [
      { text: "Malevolent", isCorrect: true },
      { text: "Kind", isCorrect: false }
    ]
  },
  {
    question: "Time complexity of Binary Search?",
    options: [
      { text: "O(n)", isCorrect: false },
      { text: "O(log n)", isCorrect: true }
    ]
  }
];

const MiniQuizCard = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answered, setAnswered] = useState(null); // 'correct' | 'incorrect' | null

  // Randomize start index on mount
  useEffect(() => {
    setCurrentIndex(Math.floor(Math.random() * questions.length));
  }, []);

  const handleAnswer = (isCorrect) => {
    setAnswered(isCorrect ? "correct" : "incorrect");
  };

  const currentQuestion = questions[currentIndex];

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1, duration: 0.8 }}
      style={{
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(10px)",
        padding: "20px",
        borderRadius: "15px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        maxWidth: "300px",
        position: "absolute",
        right: "10%",
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 2,
        boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)"
      }}
    >
      <AnimatePresence mode="wait">
        {!answered ? (
          <motion.div
            key="question"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <h4 style={{ color: "#dad7b6", marginBottom: "15px", fontSize: "1rem" }}>
              Quick Check: {currentQuestion.question}
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {currentQuestion.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(option.isCorrect)}
                  style={optionStyle}
                >
                  {option.text}
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ textAlign: "center", padding: "20px 0" }}
          >
            {answered === "correct" ? (
              <FaCheckCircle size={40} color="#4ade80" style={{ marginBottom: "10px" }} />
            ) : (
              <FaTimesCircle size={40} color="#f87171" style={{ marginBottom: "10px" }} />
            )}
            <h4 style={{ color: "#fff", marginBottom: "5px" }}>
              {answered === "correct" ? "Spot On!" : "Not quite!"}
            </h4>
            <p style={{ fontSize: "0.8rem", color: "#aaa" }}>
              Join BS Companion to master Statistics.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const optionStyle = {
  padding: "10px",
  background: "rgba(255, 255, 255, 0.1)",
  border: "none",
  borderRadius: "8px",
  color: "#fff",
  cursor: "pointer",
  textAlign: "left",
  fontSize: "0.9rem",
  transition: "background 0.2s"
};

export default MiniQuizCard;
