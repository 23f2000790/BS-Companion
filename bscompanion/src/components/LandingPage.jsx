import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Helper function to decode JWT
const isTokenValid = (token) => {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Date.now() / 1000; // in seconds
    return payload.exp > currentTime;
  } catch (err) {
    console.error("Invalid token:", err);
    return false;
  }
};

const LandingPage = () => {
  const navigate = useNavigate();

  // Redirect if user is already logged in and token is valid
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && isTokenValid(token)) {
      navigate("/profile");
    } else {
      // Remove invalid or expired token
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }, [navigate]);

  const handleMouseMove = (e) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    button.style.setProperty("--x", `${x}px`);
    button.style.setProperty("--y", `${y}px`);
  };

  return (
    <div className="LandingPage">
      <div style={{ position: "absolute", left: 120, top: 40 }}>
        <h1 className="bs" style={{ position: "relative", left: 0, top: 0 }}>
          BS
        </h1>
        <h3
          className="companion"
          style={{
            position: "relative",
            left: 260,
            bottom: 100,
          }}
        >
          Companion
        </h3>
      </div>

      <div className="navbar">
        <button
          className="button"
          style={{ top: 40, right: 30 }}
          onMouseMove={handleMouseMove}
          onClick={() => navigate("/auth")}
        >
          &ensp;&ensp;&ensp;&ensp;SignIn&ensp;&ensp;&ensp;&ensp;
        </button>
        <button
          className="button"
          style={{ top: 40, right: 159 }}
          onMouseMove={handleMouseMove}
        >
          &ensp;About&ensp;
        </button>
        <button
          className="button"
          style={{ top: 40, right: 244 }}
          onMouseMove={handleMouseMove}
        >
          &ensp;BS Documents&ensp;
        </button>
        <h3 className="quote">Practice. Connect. Grow.</h3>
      </div>

      <h3 style={{ textAlign: "center" }} className="sentence">
        <strong>
          One-Stop Platform
          <br />
          for your
          <br />
          BS Data Science
          <br />
          Academics and
          <br /> Connections.
        </strong>
      </h3>
    </div>
  );
};

export default LandingPage;
