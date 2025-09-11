import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Spline from "@splinetool/react-spline";
import Swapy from "./swapy";
import ImageReveal from "./ImageReveal"; // ✅ import here

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

          if (res.data.needsOnboarding) {
            navigate("/onboarding");
          } else {
            navigate("/dashboard");
          }
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

  const handleMouseMove = (e) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    button.style.setProperty("--x", `${x}px`);
    button.style.setProperty("--y", `${y}px`);
  };

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
      {/* ✅ Navbar */}
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

      {/* ✅ Hero Section */}
      <div className="LandingPage">
        <h3 className="quote">Practice. Connect. Grow.</h3>

        <div style={{ position: "absolute", left: 120, top: 40 }}>
          <h1 className="bs" style={{ position: "relative", left: 0, top: 0 }}>
            BS
          </h1>
          <h3
            className="companion"
            style={{ position: "relative", left: 260, bottom: 100 }}
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

      {/* ✅ Additional Sections */}
      <div
        className="page2"
        style={{
          width: "100%",
          height: "100vh",
        }}
      ></div>

      <div style={{ height: "100vh" }}>
        <Swapy />
      </div>
      <div className="image-reveal-wrapper">
        <ImageReveal />
      </div>
      <div style={{ height: "100vh" }}></div>
    </div>
  );
};

export default LandingPage;
