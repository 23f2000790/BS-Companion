import React, { useState } from "react";
import { IconXCircle } from "./icons";
import "./StudyGuideModal.css";

const StudyGuideModal = ({ show, onClose, userSubjects, onGenerate }) => {
  const [step, setStep] = useState(1); // 1: Subject Selection, 2: Exam Selection
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedExam, setSelectedExam] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const examOptions = ["quiz1", "quiz2", "ET"];

  const handleSubjectNext = () => {
    if (!selectedSubject) {
      alert("Please select a subject");
      return;
    }
    setStep(2);
  };

  const handleGenerateStudyGuide = async () => {
    if (!selectedExam) {
      alert("Please select an exam type");
      return;
    }

    setIsGenerating(true);
    try {
      await onGenerate(selectedSubject, selectedExam);
      handleClose();
    } catch (error) {
      console.error("Error generating study guide:", error);
      alert("Failed to generate study guide. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSelectedSubject("");
    setSelectedExam("");
    setIsGenerating(false);
    onClose();
  };

  const handleBack = () => {
    setStep(1);
    setSelectedExam("");
  };

  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="modal-content study-guide-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close-btn" onClick={handleClose}>
          <IconXCircle />
        </button>

        {step === 1 ? (
          <>
            <h2>Select Subject</h2>
            <p className="modal-subtitle">
              Choose a subject for your study guide
            </p>

            <div className="subject-selection-grid">
              {userSubjects.map((subject) => (
                <div
                  key={subject}
                  className={`subject-option ${
                    selectedSubject === subject ? "selected" : ""
                  }`}
                  onClick={() => setSelectedSubject(subject)}
                >
                  <span>{subject}</span>
                  {selectedSubject === subject && (
                    <div className="selected-indicator">✓</div>
                  )}
                </div>
              ))}
            </div>

            <div className="modal-actions">
              <button className="cancel-btn" onClick={handleClose}>
                Cancel
              </button>
              <button className="confirm-btn" onClick={handleSubjectNext}>
                Next
              </button>
            </div>
          </>
        ) : (
          <>
            <h2>Select Exam Type</h2>
            <p className="modal-subtitle">
              Choose the exam for <strong>{selectedSubject}</strong>
            </p>

            <div className="exam-selection-grid">
              {examOptions.map((exam) => (
                <div
                  key={exam}
                  className={`exam-option ${
                    selectedExam === exam ? "selected" : ""
                  }`}
                  onClick={() => setSelectedExam(exam)}
                >
                  <div className="exam-icon">
                    {exam === "quiz1" && "📝"}
                    {exam === "quiz2" && "📚"}
                    {exam === "ET" && "🎯"}
                  </div>
                  <span className="exam-name">{exam.toUpperCase()}</span>
                  {selectedExam === exam && (
                    <div className="selected-indicator">✓</div>
                  )}
                </div>
              ))}
            </div>

            <div className="modal-actions">
              <button className="cancel-btn" onClick={handleBack}>
                Back
              </button>
              <button
                className="confirm-btn generate-btn"
                onClick={handleGenerateStudyGuide}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <span className="spinner-small"></span>
                    Generating...
                  </>
                ) : (
                  "Generate Study Guide"
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StudyGuideModal;
