import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FaChartLine, FaLightbulb } from "react-icons/fa";

const InsightsSection = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 10]);

  return (
    <section 
      ref={ref}
      style={{ 
        minHeight: "100vh", 
        display: "flex", 
        flexDirection: "column",
        alignItems: "center", 
        justifyContent: "center", 
        position: "relative",
        padding: "100px 20px",
        background: "#0f0f0f"
      }}
    >
      <div style={{ display: "flex", gap: "50px", alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
        <motion.div style={{ maxWidth: "500px", y }}>
          <h2 style={{ fontSize: "3.5rem", marginBottom: "1.5rem", color: "#fff" }}>
            Data-Driven <span style={{ color: "#4ade80" }}>Insights</span>
          </h2>
          <p style={{ fontSize: "1.2rem", color: "#ccc", lineHeight: 1.6, marginBottom: "2rem" }}>
            Don't just study hard. Study smart. Our AI analyzes your quiz performance to pinpoint exactly where you need to focus.
          </p>
          <div style={{ display: "flex", gap: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#dad7b6" }}>
              <FaChartLine size={24} /> <span>Performance Tracking</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#dad7b6" }}>
              <FaLightbulb size={24} /> <span>Smart Recommendations</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          style={{ 
            width: "400px", 
            height: "300px", 
            background: "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)",
            borderRadius: "20px",
            border: "1px solid #333",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            rotate,
            boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
          }}
        >
          {/* Mock Chart Visual */}
          <div style={{ width: "80%", height: "60%", display: "flex", alignItems: "flex-end", gap: "10px" }}>
            {[40, 70, 50, 90, 60, 80].map((h, i) => (
              <motion.div 
                key={i}
                initial={{ height: 0 }}
                whileInView={{ height: `${h}%` }}
                transition={{ duration: 1, delay: i * 0.1 }}
                style={{ 
                  flex: 1, 
                  background: i === 3 ? "#4ade80" : "#333", 
                  borderRadius: "4px 4px 0 0" 
                }} 
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default InsightsSection;
