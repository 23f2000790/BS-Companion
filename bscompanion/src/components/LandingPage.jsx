import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Spline from "@splinetool/react-spline";

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
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Check if we already verified auth in this session
    const alreadyChecked = sessionStorage.getItem("authChecked");

    if (alreadyChecked) {
      setCheckingAuth(false);
      return;
    }

    const token = localStorage.getItem("token");

    if (token && isTokenValid(token)) {
      navigate("/dashboard");
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setTimeout(() => {
        setCheckingAuth(false);
        sessionStorage.setItem("authChecked", "true"); // Mark as done
      }, 800);
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

  // ✅ Show loader until auth check is done
  if (checkingAuth) {
    return (
      <div className="loader-container">
        <div className="spinner"></div>
        <h3 className="loading-text">Checking Authentication...</h3>
      </div>
    );
  }

  return (
    <div className="landing">
      <div className="navbar" style={{ zIndex: 2 }}>
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
      </div>
      <div className="LandingPage">
        <h3 className="quote">Practice. Connect. Grow.</h3>
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
      <div
        className="page2"
        style={{
          width: "100%",
          height: "100vh",
        }}
      >
        <iframe
          src="https://my.spline.design/particles-IG4AV43mOynm3aZRSOaygiO3/"
          frameBorder="0"
          style={{
            border: "none",
            position: "absolute",
            top: "1600px",
            left: "-200px",
            width: "60%",
            height: "80%",
            transform: "scale(1.2)",
            transformOrigin: "top left",
          }}
          title="Spline 3D Scene"
        ></iframe>
      </div>
      <div style={{ height: "100vh" }}></div>
      <div style={{ height: "100vh" }}></div>
    </div>
  );
};

export default LandingPage;
