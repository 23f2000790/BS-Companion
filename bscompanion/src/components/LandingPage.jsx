import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from '../api/axios';
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import Navbar from "./Navbar";
import { FaBrain, FaTrophy, FaFileAlt, FaRocket }  from "react-icons/fa";
import "./LandingPage.css";

// New Components
import ScrambleText from "./landing/ScrambleText";
import MagneticButton from "./landing/MagneticButton";
import MiniQuizCard from "./landing/MiniQuizCard";
import ActivityTicker from "./landing/ActivityTicker";
import JourneyLine from "./landing/JourneyLine";
import TiltCard from "./landing/TiltCard";
import ProblemSection from "./landing/ProblemSection";
import InsightsSection from "./landing/InsightsSection";
import CommunitySection from "./landing/CommunitySection";

// Helper: decode JWT and check expiry
const isTokenValid = (token) => {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp > currentTime;
  } catch (err) {
    console.error("Invalid token:", err);
    return false;
  }
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuthAndOnboarding = async () => {
      const token = localStorage.getItem("token");

      if (token && isTokenValid(token)) {
        try {
          const res = await api.get("/getuser", {
            headers: { Authorization: `Bearer ${token}` },
          });
          navigate("/dashboard");
        } catch (err) {
          console.error("Error fetching user:", err);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setCheckingAuth(false);
        }
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setCheckingAuth(false);
      }
    };

    checkAuthAndOnboarding();
  }, [navigate]);

  if (checkingAuth) {
    return (
      <div className="loader-container">
        <div className="spinner"></div>
        <h3 className="loading-text">Checking Authentication...</h3>
      </div>
    );
  }

  return <LandingContent navigate={navigate} />;
};

const LandingContent = ({ navigate }) => {
  const containerRef = useRef(null);
  
  const { scrollY } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });
  
  // Velocity Skew
  const scrollVelocity = useSpring(scrollY, { damping: 50, stiffness: 400 });
  const skewY = useTransform(scrollVelocity, [0, 1000], [0, 5]); // Subtle skew based on speed

  return (
    <div 
      ref={containerRef}
      className="landing-container"
    >
      <Navbar />

      {/* Hero Section */}
      <section className="hero-section">
        {/* Background Gradient Blob */}
        <div className="hero-gradient-blob" />
        
        <div className="hero-content">
          <ScrambleText 
            text="Practice. Connect. Grow." 
            className="hero-subtitle"
            delay={0.5}
          />
          
          <div className="hero-title-container">
             <motion.h1 
              className="hero-title-bs"
              style={{ skewY }} // Keep skewY from motion
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              BS
            </motion.h1>
            <motion.div
              className="hero-title-companion"
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: "-50%", opacity: 1 }}
              transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            >
              Companion
            </motion.div>
          </div>

          <motion.p
            className="hero-description"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
          >
            One-Stop Platform for your BS Data Science Academics and Connections.
          </motion.p>

          <MagneticButton 
            onClick={() => navigate("/auth")}
            className="hero-cta-button"
          >
            Get Started <FaRocket />
          </MagneticButton>
        </div>

        {/* Floating Mini Quiz Card */}
        <MiniQuizCard />
      </section>

      {/* 2. The Problem (Scroll Reveal) */}
      <ProblemSection />

      {/* 3. Features Section */}
      <section className="features-section">
        <motion.h2 
          className="features-title"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          Everything You Need
        </motion.h2>

        <div className="features-grid">
          <FeatureCard 
            icon={<FaTrophy size={50} color="#dad7b6" />}
            title="Leaderboard"
            description="Compete with peers and climb the ranks to showcase your academic prowess."
            delay={0.2}
          />
          <FeatureCard 
            icon={<FaBrain size={50} color="#dad7b6" />}
            title="Quiz Arena"
            description="Practice for your exams, with uniquely generated set of questions."
            delay={0.4}
          />
          <FeatureCard 
            icon={<FaFileAlt size={50} color="#dad7b6" />}
            title="BS Documents"
            description="Access a curated library of last moment study guides, crafted from PYQs."
            delay={0.6}
          />
        </div>
      </section>

      {/* 4. Insights Section (Data Viz) */}
      <InsightsSection />

      {/* 5. Community Section */}
      <CommunitySection />

      {/* Footer */}
      <footer className="landing-footer">
        <p>&copy; {new Date().getFullYear()} BS Companion. All rights reserved.</p>
      </footer>

      {/* Activity Ticker */}
      <ActivityTicker />
    </div>
  );
};

const FeatureCard = ({ icon, title, description, delay }) => {
  return (
    <TiltCard delay={delay}>
      <div className="feature-card">
        <div className="feature-card-icon">{icon}</div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </TiltCard>
  );
};

export default LandingPage;
