import React, { useEffect, Suspense, lazy } from "react";
import "./index.css";
import LocomotiveScroll from "locomotive-scroll";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Quiz from "./components/Quiz";
import CustomCursor from "./components/landing/CustomCursor";

import { ThemeProvider } from "./context/ThemeContext";
import "./components/Theme.css";

const LandingPage = lazy(() => import("./components/LandingPage"));
const AuthPage = lazy(() => import("./components/AuthPage"));
const Dashboard = lazy(() => import("./components/Dashboard"));
const QuizHistory = lazy(() => import("./components/QuizHistory"));
const UserProfile = lazy(() => import("./components/UserProfile"));
const Settings = lazy(() => import("./components/Settings"));
const LeaderboardPage = lazy(() => import("./pages/LeaderboardPage"));
const StudyGuideView = lazy(() => import("./components/StudyGuideView"));
const StudyGuideHistory = lazy(() => import("./components/StudyGuideHistory"));

// Wrapper component to handle custom cursor visibility
const AppContent = () => {
  const location = useLocation();
  
  // Only show custom cursor on landing and auth pages
  const showCustomCursor = location.pathname === '/' || location.pathname === '/auth';

  // Add body classes for cursor styling
  useEffect(() => {
    document.body.classList.remove('landing-page', 'auth-page');
    
    if (location.pathname === '/') {
      document.body.classList.add('landing-page');
    } else if (location.pathname === '/auth') {
      document.body.classList.add('auth-page');
    }
    
    return () => {
      document.body.classList.remove('landing-page', 'auth-page');
    };
  }, [location.pathname]);

  return (
    <>
      {/* Custom cursor only on landing and sign-in pages */}
      {showCustomCursor && <CustomCursor />}
      
      <Suspense
        fallback={
          <div className="loader-container">
            <div className="spinner"></div>
            <h3 className="loading-text">Loading...</h3>
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz/:subject"
            element={
              <ProtectedRoute>
                <Quiz />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz/:subject/result/:resultId"
            element={
              <ProtectedRoute>
                <Quiz />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz-history"
            element={
              <ProtectedRoute>
                <QuizHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <LeaderboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/study-guide/:id"
            element={
              <ProtectedRoute>
                <StudyGuideView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/study-guide-history"
            element={
              <ProtectedRoute>
                <StudyGuideHistory />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <Router>
        {/* Hide default cursor only on landing and auth pages */}
        <style>
          {`
            body.landing-page,
            body.auth-page {
              cursor: none !important;
            }
            body.landing-page *,
            body.auth-page * {
              cursor: none !important;
            }
          `}
        </style>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
};

export default App;
