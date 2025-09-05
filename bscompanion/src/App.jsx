import React, { useEffect, Suspense, lazy } from "react";
import "./index.css";
import LocomotiveScroll from "locomotive-scroll";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Quiz from "./components/Quiz";

const LandingPage = lazy(() => import("./components/LandingPage"));
const AuthPage = lazy(() => import("./components/AuthPage"));
const Dashboard = lazy(() => import("./components/Dashboard"));
const Onboarding = lazy(() => import("./components/Onboarding"));

const App = () => {
  useEffect(() => {
    const locomotiveScroll = new LocomotiveScroll({
      smooth: true,
    });
    return () => {
      locomotiveScroll.destroy();
    };
  }, []);

  return (
    <Router>
      <Suspense
        fallback={
          <div className="loader-container">
            <div className="spinner"></div>
            <h3 className="loading-text">Loading...</h3>
          </div>
        }
      >
        <div data-scroll-container>
          <div data-scroll data-scroll-section>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute requireOnboardingComplete={true}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute requireOnboardingComplete={false}>
                    <Onboarding />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quiz/:subject"
                element={
                  <ProtectedRoute requireOnboardingComplete={true}>
                    <Quiz />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </div>
      </Suspense>
    </Router>
  );
};

export default App;
