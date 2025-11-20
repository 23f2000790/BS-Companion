import React, { useEffect, Suspense, lazy } from "react";
import "./index.css";
import LocomotiveScroll from "locomotive-scroll";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Quiz from "./components/Quiz";

import { ThemeProvider } from "./context/ThemeContext";
import "./components/Theme.css";

const LandingPage = lazy(() => import("./components/LandingPage"));
const AuthPage = lazy(() => import("./components/AuthPage"));
const Dashboard = lazy(() => import("./components/Dashboard"));
const QuizHistory = lazy(() => import("./components/QuizHistory"));
const UserProfile = lazy(() => import("./components/UserProfile"));
const Settings = lazy(() => import("./components/Settings"));


const App = () => {
  return (
    <ThemeProvider>
      <Router>
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
          </Routes>
        </Suspense>
      </Router>
    </ThemeProvider>
  );
};

export default App;
