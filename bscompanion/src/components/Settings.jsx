import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import Dock from './Dock';
import {
  HomeIcon,
  StatsIcon,
  SettingsIcon,
  LogoutIcon,
} from './icons';
import './Settings.css';

const Settings = () => {
  const navigate = useNavigate();
  const { 
    theme, 
    toggleTheme, 
    accentColor, 
    setAccentColor,
    musicEnabled,
    setMusicEnabled,
    quizPrefs,
    setQuizPrefs
  } = useTheme();
  
  // Local state for other settings (mock functionality for now)
  const [notifications, setNotifications] = useState({
    studyReminders: true,
    performanceReports: false,
  });

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleQuizPrefChange = (key) => {
    setQuizPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleExportData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch user data
      const userResponse = await axios.get('http://localhost:5000/getuser', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const user = userResponse.data.user;
      
      // Fetch quiz history
      const historyResponse = await axios.get(
        `http://localhost:5000/api/results/user/${user._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const quizHistory = historyResponse.data;
      
      // Calculate statistics
      const totalQuizzes = quizHistory.length;
      const totalQuestions = quizHistory.reduce((sum, quiz) => sum + quiz.totalQuestions, 0);
      const totalCorrect = quizHistory.reduce((sum, quiz) => sum + quiz.score, 0);
      const averageScore = totalQuizzes > 0 ? ((totalCorrect / totalQuestions) * 100).toFixed(1) : 0;
      const totalTimeSpent = quizHistory.reduce((sum, quiz) => sum + quiz.timeTaken, 0);
      const hoursSpent = Math.floor(totalTimeSpent / 3600);
      const minutesSpent = Math.floor((totalTimeSpent % 3600) / 60);
      
      // Subject-wise performance
      const subjectStats = {};
      quizHistory.forEach(quiz => {
        const subject = quiz.subject;
        if (!subjectStats[subject]) {
          subjectStats[subject] = { total: 0, correct: 0, quizzes: 0 };
        }
        subjectStats[subject].total += quiz.totalQuestions;
        subjectStats[subject].correct += quiz.score;
        subjectStats[subject].quizzes += 1;
      });
      
      // Sort quizzes by date (most recent first)
      const sortedQuizzes = [...quizHistory].sort((a, b) => 
        new Date(b.endTime) - new Date(a.endTime)
      );
      
      // Generate report HTML
      const reportContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Academic Performance Report - BS Companion</title>
            <style>
              @page { margin: 2cm; }
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                font-family: 'Times New Roman', serif; 
                line-height: 1.6; 
                color: #000;
                max-width: 210mm;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                text-align: center;
                border-bottom: 2px solid #000;
                padding-bottom: 15px;
                margin-bottom: 30px;
              }
              .header h1 {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 5px;
                text-transform: uppercase;
                letter-spacing: 2px;
              }
              .header .subtitle {
                font-size: 14px;
                font-style: italic;
                color: #333;
              }
              .section {
                margin-bottom: 25px;
                page-break-inside: avoid;
              }
              .section-title {
                font-size: 16px;
                font-weight: bold;
                text-transform: uppercase;
                border-bottom: 1px solid #000;
                padding-bottom: 5px;
                margin-bottom: 15px;
                letter-spacing: 1px;
              }
              .info-grid {
                display: grid;
                grid-template-columns: 150px 1fr;
                gap: 8px;
                margin-bottom: 15px;
              }
              .info-label {
                font-weight: bold;
              }
              .info-value {
                color: #333;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 10px;
              }
              th, td {
                border: 1px solid #000;
                padding: 8px;
                text-align: left;
                font-size: 12px;
              }
              th {
                background-color: #f0f0f0;
                font-weight: bold;
              }
              .stats-grid {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                gap: 15px;
                margin-top: 15px;
              }
              .stat-box {
                border: 1px solid #000;
                padding: 15px;
                text-align: center;
              }
              .stat-label {
                font-size: 11px;
                text-transform: uppercase;
                margin-bottom: 5px;
                color: #666;
              }
              .stat-value {
                font-size: 24px;
                font-weight: bold;
              }
              .footer {
                margin-top: 40px;
                padding-top: 15px;
                border-top: 1px solid #000;
                text-align: center;
                font-size: 10px;
                color: #666;
              }
              .signature-section {
                margin-top: 50px;
                display: flex;
                justify-content: space-between;
              }
              .signature-box {
                text-align: center;
              }
              .signature-line {
                border-top: 1px solid #000;
                width: 200px;
                margin-top: 40px;
                margin-bottom: 5px;
              }
              .page-break {
                page-break-after: always;
              }
            </style>
          </head>
          <body>
            <!-- Header -->
            <div class="header">
              <h1>Academic Performance Report</h1>
              <div class="subtitle">BS Companion Learning Platform</div>
              <div style="margin-top: 10px; font-size: 12px;">
                Report Generated: ${new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                })}
              </div>
            </div>

            <!-- Student Information -->
            <div class="section">
              <div class="section-title">Student Information</div>
              <div class="info-grid">
                <div class="info-label">Name:</div>
                <div class="info-value">${user.name || 'N/A'}</div>
                
                <div class="info-label">Email:</div>
                <div class="info-value">${user.email || 'N/A'}</div>
                
                <div class="info-label">Student ID:</div>
                <div class="info-value">${user._id}</div>
                
                <div class="info-label">Current Level:</div>
                <div class="info-value">${user.currentLevel || 'N/A'}</div>
                
                <div class="info-label">City:</div>
                <div class="info-value">${user.city || 'N/A'}</div>
                
                <div class="info-label">Enrolled Subjects:</div>
                <div class="info-value">${user.subjects?.join(', ') || 'None'}</div>
              </div>
            </div>

            <!-- Overall Performance Summary -->
            <div class="section">
              <div class="section-title">Overall Performance Summary</div>
              <div class="stats-grid">
                <div class="stat-box">
                  <div class="stat-label">Total Quizzes</div>
                  <div class="stat-value">${totalQuizzes}</div>
                </div>
                <div class="stat-box">
                  <div class="stat-label">Average Score</div>
                  <div class="stat-value">${averageScore}%</div>
                </div>
                <div class="stat-box">
                  <div class="stat-label">Total Questions</div>
                  <div class="stat-value">${totalQuestions}</div>
                </div>
                <div class="stat-box">
                  <div class="stat-label">Correct Answers</div>
                  <div class="stat-value">${totalCorrect}</div>
                </div>
                <div class="stat-box">
                  <div class="stat-label">Accuracy Rate</div>
                  <div class="stat-value">${averageScore}%</div>
                </div>
                <div class="stat-box">
                  <div class="stat-label">Study Time</div>
                  <div class="stat-value">${hoursSpent}h ${minutesSpent}m</div>
                </div>
              </div>
            </div>

            <!-- Subject-wise Performance -->
            ${Object.keys(subjectStats).length > 0 ? `
            <div class="section">
              <div class="section-title">Subject-wise Performance Analysis</div>
              <table>
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Quizzes Attempted</th>
                    <th>Total Questions</th>
                    <th>Correct Answers</th>
                    <th>Accuracy (%)</th>
                  </tr>
                </thead>
                <tbody>
                  ${Object.entries(subjectStats).map(([subject, stats]) => `
                    <tr>
                      <td><strong>${subject}</strong></td>
                      <td>${stats.quizzes}</td>
                      <td>${stats.total}</td>
                      <td>${stats.correct}</td>
                      <td>${((stats.correct / stats.total) * 100).toFixed(1)}%</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            ` : ''}

            <!-- Detailed Quiz History -->
            ${totalQuizzes > 0 ? `
            <div class="section page-break">
              <div class="section-title">Detailed Quiz History</div>
              <table>
                <thead>
                  <tr>
                    <th style="width: 30px;">#</th>
                    <th>Date</th>
                    <th>Subject</th>
                    <th>Term/Exam</th>
                    <th>Questions</th>
                    <th>Score</th>
                    <th>Accuracy</th>
                    <th>Time Taken</th>
                  </tr>
                </thead>
                <tbody>
                  ${sortedQuizzes.map((quiz, index) => {
                    const accuracy = ((quiz.score / quiz.totalQuestions) * 100).toFixed(1);
                    const minutes = Math.floor(quiz.timeTaken / 60);
                    const seconds = quiz.timeTaken % 60;
                    const dateObj = new Date(quiz.createdAt || quiz.endTime);
                    const dateStr = isNaN(dateObj.getTime()) ? 'N/A' : dateObj.toLocaleDateString();
                    
                    return `
                      <tr>
                        <td>${index + 1}</td>
                        <td>${dateStr}</td>
                        <td>${quiz.subject}</td>
                        <td>${quiz.term || quiz.exam || 'Practice'}</td>
                        <td>${quiz.totalQuestions}</td>
                        <td>${quiz.score}/${quiz.totalQuestions}</td>
                        <td>${accuracy}%</td>
                        <td>${minutes}m ${seconds}s</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
            ` : `
            <div class="section">
              <div class="section-title">Detailed Quiz History</div>
              <p style="text-align: center; padding: 20px; color: #666;">No quiz attempts recorded yet.</p>
            </div>
            `}

            <!-- Remarks and Recommendations -->
            <div class="section">
              <div class="section-title">Performance Remarks</div>
              <p style="margin-top: 10px;">
                ${totalQuizzes === 0 
                  ? 'The student has not attempted any quizzes yet. Regular practice is recommended to build a strong foundation.'
                  : averageScore >= 80 
                    ? `The student has demonstrated excellent performance with an average accuracy of ${averageScore}%. This shows strong understanding of the subjects. Continue maintaining this consistency.`
                    : averageScore >= 60
                      ? `The student has shown satisfactory performance with an average accuracy of ${averageScore}%. There is room for improvement through focused practice on weaker topics.`
                      : `The student needs significant improvement with an average accuracy of ${averageScore}%. Additional study time and focused revision are strongly recommended.`
                }
              </p>
            </div>

            <!-- Signature Section -->
            <div class="signature-section">
              <div class="signature-box">
                <div class="signature-line"></div>
                <div style="font-size: 11px;">Generated By System</div>
              </div>
              <div class="signature-box">
                <div class="signature-line"></div>
                <div style="font-size: 11px;">Date: ${new Date().toLocaleDateString()}</div>
              </div>
            </div>

            <!-- Footer -->
            <div class="footer">
              <p>This is a computer-generated report from BS Companion Learning Platform</p>
              <p>For queries, contact: support@bscompanion.com</p>
              <p>© ${new Date().getFullYear()} BS Companion. All rights reserved.</p>
            </div>

            <script>
              // Auto-print when page loads
              window.onload = () => { 
                setTimeout(() => window.print(), 500); 
              };
            </script>
          </body>
        </html>
      `;
      
      const printWindow = window.open('', '_blank');
      printWindow.document.write(reportContent);
      printWindow.document.close();
      
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    }
  };

  const handleFeedback = async () => {
    if (!feedbackText.trim()) {
      setFeedbackError('Please enter your feedback');
      return;
    }

    setFeedbackSubmitting(true);
    setFeedbackError('');

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/feedback',
        { feedback: feedbackText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setFeedbackSuccess(true);
      setFeedbackText('');
      
      // Close modal after 2 seconds
      setTimeout(() => {
        setShowFeedbackModal(false);
        setFeedbackSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setFeedbackError(error.response?.data?.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const LogoutUser = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const DOCK_ITEMS = [
    { label: 'Home', icon: <HomeIcon />, onClick: () => navigate('/dashboard') },
    { label: 'History', icon: <StatsIcon />, onClick: () => navigate('/quiz-history') },
    { label: 'Settings', icon: <SettingsIcon />, onClick: () => {} }, // Already here
    { label: 'Logout', icon: <LogoutIcon />, onClick: LogoutUser },
  ];

  const accentColors = [
    '#667eea', // Default (Original)
    '#6366f1', // Indigo
    '#7c3aed', // Purple/Violet
    '#ec4899', // Pink
    '#10b981', // Emerald
    '#f59e0b', // Amber
  ];

  // Feedback modal state
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  return (
    <div className="settings-page">
      <div className="settings-container">
        <header className="settings-header">
          <h1>Settings</h1>
          <p className="settings-subtitle">Customize your learning experience</p>
        </header>

        <div className="settings-grid">
          {/* Appearance Section */}
          <section className="settings-section">
            <h2>Appearance</h2>
            <div className="settings-card">
              <div className="setting-item">
                <div className="setting-info">
                  <span className="setting-label">Dark Mode</span>
                  <span className="setting-desc">Switch between dark and light themes</span>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={theme === 'dark'} 
                    onChange={toggleTheme} 
                  />
                  <span className="slider round"></span>
                </label>
              </div>
              
              <div className="setting-item">
                <div className="setting-info">
                  <span className="setting-label">Accent Color</span>
                  <span className="setting-desc">Choose your brand color</span>
                </div>
                <div className="color-picker">
                  {accentColors.map((color) => (
                    <div 
                      key={color}
                      className="color-option" 
                      style={{ 
                        background: color,
                        borderColor: accentColor === color ? 'var(--text-primary)' : 'transparent',
                        transform: accentColor === color ? 'scale(1.2)' : 'scale(1)'
                      }}
                      onClick={() => setAccentColor(color)}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Quiz Preferences */}
          <section className="settings-section">
            <h2>Quiz Preferences</h2>
            <div className="settings-card">
              <div className="setting-item">
                <div className="setting-info">
                  <span className="setting-label">Sound Effects</span>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={quizPrefs.soundEffects} 
                    onChange={() => handleQuizPrefChange('soundEffects')} 
                  />
                  <span className="slider round"></span>
                </label>
              </div>
              <div className="setting-item">
                <div className="setting-info">
                  <span className="setting-label">Background Music</span>
                  <span className="setting-desc">Lo-fi beats for focus</span>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={musicEnabled} 
                    onChange={() => setMusicEnabled(!musicEnabled)} 
                  />
                  <span className="slider round"></span>
                </label>
              </div>
              <div className="setting-item">
                <div className="setting-info">
                  <span className="setting-label">Timer Visibility</span>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={quizPrefs.timerVisible} 
                    onChange={() => handleQuizPrefChange('timerVisible')} 
                  />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
          </section>

          {/* Account & Data */}
          <section className="settings-section">
            <h2>Account & Data</h2>
            <div className="settings-card">
              <div className="setting-item clickable" onClick={() => navigate('/profile')}>
                <div className="setting-info">
                  <span className="setting-label">Edit Profile</span>
                  <span className="setting-desc">Update name, city, level</span>
                </div>
                <span className="arrow-icon">→</span>
              </div>
              <div className="setting-item clickable danger">
                <div className="setting-info">
                  <span className="setting-label">Clear Quiz History</span>
                  <span className="setting-desc">Permanently delete all progress</span>
                </div>
                <span className="arrow-icon">🗑️</span>
              </div>
              <div className="setting-item clickable" onClick={handleExportData}>
                <div className="setting-info">
                  <span className="setting-label">Export Data</span>
                  <span className="setting-desc">Download your performance report</span>
                </div>
                <span className="arrow-icon">📥</span>
              </div>
            </div>
          </section>

          {/* About */}
          <section className="settings-section">
            <h2>About</h2>
            <div className="settings-card">
              <div className="setting-item">
                <div className="setting-info">
                  <span className="setting-label">Version</span>
                </div>
                <span className="setting-value">v1.0.0</span>
              </div>
              <div className="setting-item clickable" onClick={() => setShowFeedbackModal(true)}>
                <div className="setting-info">
                  <span className="setting-label">Send Feedback</span>
                </div>
                <span className="arrow-icon">💬</span>
              </div>
            </div>
          </section>
        </div>
      </div>
      
      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="modal-overlay" onClick={() => setShowFeedbackModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowFeedbackModal(false)}>
              ✕
            </button>
            <h2>Send Feedback</h2>
            
            {feedbackSuccess ? (
              <div className="feedback-success">
                <div className="success-icon">✓</div>
                <p>Thank you for your feedback!</p>
              </div>
            ) : (
              <>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  We'd love to hear your thoughts, suggestions, or issues!
                </p>
                
                <textarea
                  className="feedback-textarea"
                  placeholder="Enter your feedback here..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  rows={6}
                  disabled={feedbackSubmitting}
                />
                
                {feedbackError && (
                  <div className="feedback-error">{feedbackError}</div>
                )}
                
                <div className="modal-actions">
                  <button 
                    className="cancel-btn" 
                    onClick={() => setShowFeedbackModal(false)}
                    disabled={feedbackSubmitting}
                  >
                    Cancel
                  </button>
                  <button 
                    className="confirm-btn" 
                    onClick={handleFeedback}
                    disabled={feedbackSubmitting || !feedbackText.trim()}
                  >
                    {feedbackSubmitting ? 'Sending...' : 'Send Feedback'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      
      <Dock items={DOCK_ITEMS} />
    </div>
  );
};

export default Settings;
