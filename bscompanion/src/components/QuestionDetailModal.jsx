import React from 'react';
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import "./quiz-results.css";

const QuestionDetailModal = ({ question, userAnswer, status, term, exam, onClose }) => {
  if (!question) return null;

  const renderText = (text) => {
    if (typeof text !== "string") return text;
    
    // Reuse the same text rendering logic from Quiz.jsx (handling code blocks)
    const parts = text.split(/```(\w+)?\n([\s\S]*?)```/g);
    
    if (parts.length === 1) {
      return <span style={{ whiteSpace: "pre-wrap" }}>{text}</span>;
    }

    const result = [];
    for (let i = 0; i < parts.length; i++) {
      if (i % 3 === 0) {
        if (parts[i]) {
           result.push(
            <span key={`text-${i}`} style={{ whiteSpace: "pre-wrap" }}>
              {parts[i]}
            </span>
          );
        }
      } else if (i % 3 === 1) {
        // Language captured
      } else if (i % 3 === 2) {
        const lang = parts[i-1] || "text";
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

  const isCorrect = status === 'correct';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content question-detail-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <h2>Question Details</h2>
            <div className="modal-badges">
                {term && <span className="badge badge-muted">{term}</span>}
                {exam && <span className="badge badge-muted">{exam}</span>}
            </div>
          </div>
          <button className="btn-close" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-body">
            {question.context && (
                <div className="question-context-box">
                    <strong>Context:</strong>
                    <div className="context-content">{renderText(question.context)}</div>
                </div>
            )}

            {question.image && (
                <div className="question-image-container">
                    <img src={question.image} alt="Question Visual" />
                </div>
            )}

            <div className="question-text-large">
                {renderText(question.question)}
            </div>

            <div className="options-list">
                {question.questionType === 'numerical' ? (
                    <div className="numerical-answer-display">
                        <div className={`answer-box ${isCorrect ? 'correct' : 'incorrect'}`}>
                            <strong>Your Answer:</strong> {userAnswer || "Not Answered"}
                        </div>
                        {!isCorrect && (
                            <div className="answer-box correct">
                                <strong>Correct Answer:</strong> {
                                    typeof question.correctOption === 'object' 
                                    ? `Between ${question.correctOption.min} and ${question.correctOption.max}`
                                    : question.correctOption
                                }
                            </div>
                        )}
                    </div>
                ) : (
                    Object.entries(question.options || {}).map(([key, val]) => {
                        const isSelected = Array.isArray(userAnswer) 
                            ? userAnswer.includes(key) 
                            : userAnswer === key;
                        
                        const isCorrectOption = Array.isArray(question.correctOption)
                            ? question.correctOption.includes(key)
                            : question.correctOption === key;

                        let optionClass = "option-item";
                        if (isCorrectOption) optionClass += " correct-option";
                        if (isSelected) {
                            optionClass += isCorrectOption ? " user-correct" : " user-incorrect";
                        }

                        return (
                            <div key={key} className={optionClass}>
                                <span className="option-marker">
                                    {isSelected && (isCorrectOption ? "✓" : "✗")}
                                    {!isSelected && isCorrectOption && "✓"}
                                </span>
                                <span className="option-label-text">{key}. {renderText(val)}</span>
                            </div>
                        );
                    })
                )}
            </div>

            {question.explanation && (
                <div className="explanation-box">
                    <strong>Explanation:</strong>
                    <div>{renderText(question.explanation)}</div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default QuestionDetailModal;
