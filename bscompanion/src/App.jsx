import React, { useEffect, Suspense, lazy } from "react";
import "./index.css";
import LocomotiveScroll from "locomotive-scroll";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Lazy load components
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
      <div data-scroll-container>
        <div data-scroll data-scroll-section>
          {/* Suspense will show fallback until lazy components load */}
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
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/onboarding" element={<Onboarding />} />
            </Routes>
          </Suspense>
        </div>
      </div>
    </Router>
  );
};

export default App;
