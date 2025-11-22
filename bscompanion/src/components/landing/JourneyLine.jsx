import React from "react";
import { useScroll, useTransform, motion } from "framer-motion";

const JourneyLine = () => {
  const { scrollYProgress } = useScroll();
  
  return (
    <div style={{
      position: "absolute",
      left: "50%",
      top: 0,
      bottom: 0,
      width: "4px", // Slightly thicker
      transform: "translateX(-50%)",
      zIndex: 0,
      pointerEvents: "none",
      overflow: "hidden"
    }}>
      {/* Background Track */}
      <div style={{
        position: "absolute",
        top: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "2px",
        height: "100%",
        background: "rgba(255, 255, 255, 0.05)"
      }} />

      {/* Glowing Fill Line */}
      <motion.div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "2px",
          height: "100%",
          background: "linear-gradient(180deg, #dad7b6 0%, #4ade80 50%, #60a5fa 100%)", // Gold -> Green -> Blue gradient
          scaleY: scrollYProgress,
          transformOrigin: "top",
          boxShadow: "0 0 15px 2px rgba(218, 215, 182, 0.3)" // Glow effect
        }}
      />
      
      {/* Moving Head/Particle */}
      <motion.div
        style={{
          position: "absolute",
          top: useTransform(scrollYProgress, [0, 1], ["0%", "100%"]), // Dynamic top based on scroll
          left: "50%",
          width: "10px",
          height: "10px",
          borderRadius: "50%",
          background: "#fff",
          transform: "translate(-50%, -50%)",
          boxShadow: "0 0 20px 5px rgba(255, 255, 255, 0.5)",
          zIndex: 1
        }}
      />
    </div>
  );
};

export default JourneyLine;
