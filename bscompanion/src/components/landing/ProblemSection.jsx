import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const ProblemSection = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0.2, 0.5, 0.8], [0, 1, 0]);
  const scale = useTransform(scrollYProgress, [0.2, 0.5], [0.8, 1]);
  const x = useTransform(scrollYProgress, [0.2, 0.5], [-100, 0]);

  return (
    <section 
      ref={ref} 
      style={{ 
        minHeight: "100vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        position: "relative",
        padding: "100px 20px"
      }}
    >
      <motion.div 
        style={{ 
          maxWidth: "800px", 
          textAlign: "center", 
          opacity, 
          scale,
          x
        }}
      >
        <h2 style={{ fontSize: "4rem", marginBottom: "2rem", color: "#fff", lineHeight: 1.1 }}>
          Drowning in <span style={{ color: "#ef4444" }}>Disorganized</span> Study Materials?
        </h2>
        <p style={{ fontSize: "1.5rem", color: "#aaa", lineHeight: 1.6 }}>
          Multiple PYQ papers. Last minute Revisions. <br />
          The BS Data Science degree is hard enough with these chaos.
        </p>
      </motion.div>
    </section>
  );
};

export default ProblemSection;
