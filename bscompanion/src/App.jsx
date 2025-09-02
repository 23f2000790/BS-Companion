import React, { useEffect } from "react";
import "./index.css";
import LocomotiveScroll from "locomotive-scroll";
import LandingPage from "./components/LandingPage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthPage from "./components/AuthPage";
import Dashboard from "./components/Dashboard";
import Onboarding from "./components/Onboarding";

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
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/onboarding" element={<Onboarding />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
