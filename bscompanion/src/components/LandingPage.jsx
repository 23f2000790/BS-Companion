import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import Navbar from "./Navbar";
import { FaBrain, FaTrophy, FaFileAlt, FaRocket } from "react-icons/fa";

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
          const res = await axios.get("http://localhost:5000/getuser", {
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
      style={{ 
        overflowX: "hidden", 
        background: "#0a0a0a", 
        color: "#fff"
      }}
    >
      <Navbar />

      {/* Hero Section */}
      <section style={{ height: "100vh", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        {/* Background Gradient Blob */}
        <div style={{
          position: "absolute",
          top: "-20%",
          left: "-10%",
          width: "60vw",
          height: "60vw",
          background: "radial-gradient(circle, rgba(218, 215, 182, 0.15) 0%, rgba(0,0,0,0) 70%)",
          filter: "blur(60px)",
          zIndex: 0
        }} />
        
        <div style={{ zIndex: 1, textAlign: "center", width: "100%", position: "relative" }}>
          <ScrambleText 
            text="Practice. Connect. Grow." 
            className="hero-subtitle"
            style={{ 
              color: "#dad7b6", 
              fontSize: "1.5rem", 
              marginBottom: "1rem", 
              letterSpacing: "0.2em", 
              textTransform: "uppercase",
              display: "inline-block"
            }}
            delay={0.5}
          />
          
          <div style={{ position: "relative", height: "300px", display: "flex", justifyContent: "center", alignItems: "center" }}>
             <motion.h1 
              style={{ 
                fontSize: "15rem", 
                fontWeight: "bold", 
                color: "#dad7b6", 
                lineHeight: 1,
                margin: 0,
                position: "relative",
                zIndex: 1,
                skewY // Apply skew effect
              }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              BS
            </motion.h1>
            <motion.div
              style={{
                position: "absolute",
                top: "60%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                fontSize: "5rem",
                fontWeight: "bold",
                color: "#fff",
                whiteSpace: "nowrap",
                zIndex: 2,
                mixBlendMode: "difference"
              }}
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: "-50%", opacity: 1 }}
              transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            >
              Companion
            </motion.div>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            style={{ fontSize: "1.2rem", maxWidth: "600px", margin: "2rem auto", color: "#ccc", lineHeight: 1.6 }}
          >
            One-Stop Platform for your BS Data Science Academics and Connections.
          </motion.p>

          <MagneticButton 
            onClick={() => navigate("/auth")}
            style={{
              padding: "15px 40px",
              fontSize: "1.2rem",
              backgroundColor: "transparent",
              color: "#dad7b6",
              border: "2px solid #dad7b6",
              borderRadius: "50px",
              marginTop: "20px",
              fontWeight: "bold",
              display: "inline-flex",
              alignItems: "center",
              gap: "10px"
            }}
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
      <section style={{ minHeight: "100vh", padding: "100px 20px", background: "#111", position: "relative", zIndex: 1 }}>
        <motion.h2 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          style={{ textAlign: "center", fontSize: "3rem", marginBottom: "80px", color: "#fff" }}
        >
          Everything You Need
        </motion.h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "40px", maxWidth: "1200px", margin: "0 auto" }}>
          <FeatureCard 
            icon={<FaBrain size={50} color="#dad7b6" />}
            title="Quiz Arena"
            description="Test your knowledge with our extensive question bank tailored for the BS curriculum."
            delay={0.2}
          />
          <FeatureCard 
            icon={<FaTrophy size={50} color="#dad7b6" />}
            title="Leaderboard"
            description="Compete with peers and climb the ranks to showcase your academic prowess."
            delay={0.4}
          />
          <FeatureCard 
            icon={<FaFileAlt size={50} color="#dad7b6" />}
            title="BS Documents"
            description="Access a curated library of study materials, notes, and previous year papers."
            delay={0.6}
          />
        </div>
      </section>

      {/* 4. Insights Section (Data Viz) */}
      <InsightsSection />

      {/* 5. Community Section */}
      <CommunitySection />

      {/* Footer */}
      <footer style={{ padding: "40px 40px 80px 40px", textAlign: "center", borderTop: "1px solid #333", color: "#666", background: "#0a0a0a" }}>
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
      <div
        style={{
          background: "#1a1a1a",
          padding: "40px",
          borderRadius: "20px",
          textAlign: "center",
          border: "1px solid #333",
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}
      >
        <div style={{ marginBottom: "20px" }}>{icon}</div>
        <h3 style={{ fontSize: "1.8rem", marginBottom: "15px", color: "#fff" }}>{title}</h3>
        <p style={{ color: "#aaa", lineHeight: 1.6 }}>{description}</p>
      </div>
    </TiltCard>
  );
};

export default LandingPage;
