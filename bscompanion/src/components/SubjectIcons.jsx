import React from "react";

// Import All Subject Images
import imgMath1 from "../assets/subject-icons/Math 1.png";
import imgMath2 from "../assets/subject-icons/Math 2.jpg";
import imgEnglish1 from "../assets/subject-icons/English 1.jpg";
import imgEnglish2 from "../assets/subject-icons/English 2.png";
import imgStats1 from "../assets/subject-icons/Statistics 1.jpg";
import imgStats2 from "../assets/subject-icons/Statistics 2.jpg";
import imgCT from "../assets/subject-icons/Computational Thinking.jpg";
import imgPython from "../assets/subject-icons/python.jpg";
import imgJava from "../assets/subject-icons/java.jpg";
import imgMAD1 from "../assets/subject-icons/mad1.jpg";
import imgMAD2 from "../assets/subject-icons/mad2.jpg";
import imgDBMS from "../assets/subject-icons/dbms.jpg";
import imgPDSA from "../assets/subject-icons/pdsa.jpg";
import imgTerminal from "../assets/subject-icons/system_commands.jpg";
import imgMLF from "../assets/subject-icons/mlf.jpg";
import imgMLT from "../assets/subject-icons/mlt.jpg";
import imgMLP from "../assets/subject-icons/mlp.jpg";
import imgBDM from "../assets/subject-icons/bdm.jpg";
import imgTDS from "../assets/subject-icons/tds.jpg";
import imgAnalytics from "../assets/subject-icons/business analytics.jpg";

/**
 * Get the background image URL for a subject based on its name
 * @param {string} name - Subject name
 * @returns {string} - Image URL
 */
export const getSubjectIconUrl = (name) => {
  const n = name.toLowerCase();
  
  // --- Foundational ---
  if (n.includes("math 1")) return imgMath1;
  if (n.includes("math 2")) return imgMath2;
  if (n.includes("statistics 1") || n.includes("stats 1")) return imgStats1;
  if (n.includes("statistics 2") || n.includes("stats 2")) return imgStats2;
  if (n.includes("english 1")) return imgEnglish1;
  if (n.includes("english 2")) return imgEnglish2;
  if (n.includes("python") || n.includes("programming")) return imgPython;
  if (n.includes("thinking") || n.includes("ct")) return imgCT;

  // --- Diploma ---
  if (n.includes("java")) return imgJava;
  if (n.includes("web") || n.includes("mad 1")) return imgMAD1;
  if (n.includes("app") || n.includes("mad 2")) return imgMAD2;
  if (n.includes("dbms") || n.includes("sql")) return imgDBMS;
  if (n.includes("pdsa")) return imgPDSA;
  if (n.includes("system") || n.includes("command")) return imgTerminal;
  if (n.includes("mlf")) return imgMLF;
  if (n.includes("mlt")) return imgMLT;
  if (n.includes("mlp")) return imgMLP;
  if (n.includes("bdm")) return imgBDM;
  if (n.includes("tds") || n.includes("tools")) return imgTDS;
  if (n.includes("analytics") || n.includes("business")) return imgAnalytics;

  return null;
};
