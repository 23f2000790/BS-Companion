import React from "react";

// Import All Subject Images
const imgMath1 = "https://res.cloudinary.com/dnzudjm0y/image/upload/v1764143162/Math_1_sfs7uk.png";
const imgMath2 = "https://res.cloudinary.com/dnzudjm0y/image/upload/v1764143184/Math_2_opmqpm.jpg";
const imgEnglish1 = "https://res.cloudinary.com/dnzudjm0y/image/upload/v1764143136/English_1_lubo1b.jpg";
const imgEnglish2 = "https://res.cloudinary.com/dnzudjm0y/image/upload/v1764143144/English_2_rtjj45.png";
const imgStats1 = "https://res.cloudinary.com/dnzudjm0y/image/upload/v1764143196/Statistics_1_hlnuuv.jpg";
const imgStats2 = "https://res.cloudinary.com/dnzudjm0y/image/upload/v1764143195/Statistics_2_eiy4ek.jpg";
const imgCT = "https://res.cloudinary.com/dnzudjm0y/image/upload/v1764143150/Computational_Thinking_ya5kbf.jpg";
const imgPython = "https://res.cloudinary.com/dnzudjm0y/image/upload/v1764143177/python_h4l216.jpg";
const imgJava = "https://res.cloudinary.com/dnzudjm0y/image/upload/v1764143155/java_ipj3yo.jpg";
const imgMAD1 = "https://res.cloudinary.com/dnzudjm0y/image/upload/v1764143160/mad1_ghgt82.jpg";
const imgMAD2 = "https://res.cloudinary.com/dnzudjm0y/image/upload/v1764143163/mad2_pxgnfn.jpg";
const imgDBMS = "https://res.cloudinary.com/dnzudjm0y/image/upload/v1764143143/dbms_dgjjly.jpg";
const imgPDSA = "https://res.cloudinary.com/dnzudjm0y/image/upload/v1764143186/pdsa_ck2qo9.jpg";
const imgTerminal = "https://res.cloudinary.com/dnzudjm0y/image/upload/v1764143152/system_commands_ijermn.jpg";
const imgMLF = "https://res.cloudinary.com/dnzudjm0y/image/upload/v1764143180/mlf_csoa3a.jpg";
const imgMLT = "https://res.cloudinary.com/dnzudjm0y/image/upload/v1764143171/mlt_saxs2k.jpg";
const imgMLP = "https://res.cloudinary.com/dnzudjm0y/image/upload/v1764143182/mlp_prmjwc.jpg";
const imgBDM = "https://res.cloudinary.com/dnzudjm0y/image/upload/v1764143134/bdm_efkehm.jpg";
const imgTDS = "https://res.cloudinary.com/dnzudjm0y/image/upload/v1764143140/tds_nondoe.jpg";
const imgAnalytics = "https://res.cloudinary.com/dnzudjm0y/image/upload/v1764143153/business_analytics_ycuj1r.jpg";

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
