import React from "react";
import { motion } from "framer-motion";

const CommunitySection = () => {
  return (
    <section style={{ minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "100px 20px", textAlign: "center" }}>
      <motion.h2 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{ fontSize: "3rem", marginBottom: "3rem", color: "#fff" }}
      >
        Join the <span style={{ color: "#60a5fa" }}>Elite</span>
      </motion.h2>
      
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", justifyContent: "center", maxWidth: "1000px" }}>
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: i * 0.2 }}
            style={{
              background: "rgba(255,255,255,0.05)",
              padding: "30px",
              borderRadius: "15px",
              width: "300px",
              textAlign: "left",
              border: "1px solid rgba(255,255,255,0.1)"
            }}
          >
            <p style={{ color: "#ccc", fontStyle: "italic", marginBottom: "20px" }}>
              "This app completely changed how I prepare for my stats exams. The insights are a game changer."
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#dad7b6" }} />
              <div>
                <h4 style={{ margin: 0, color: "#fff" }}>Student {i}</h4>
                <span style={{ fontSize: "0.8rem", color: "#888" }}>BS Degree, IITM</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default CommunitySection;
