import React, { useState } from "react";
import axios from "axios";
import { signInWithGoogle } from "../firebase";
import { useNavigate } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import { FcGoogle } from "react-icons/fc";
import benchele from "../assets/images/benchele.png";
import bookele from "../assets/images/bookele.png";
import clockele from "../assets/images/clockele.png";
import diceele from "../assets/images/diceele.png";
import flowerele from "../assets/images/flowerele.png";
import paperele from "../assets/images/paperele.png";
import penele from "../assets/images/penele.png";

const AuthPage = () => {
  const handleMouseMove = (e) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    button.style.setProperty("--x", `${x}px`);
    button.style.setProperty("--y", `${y}px`);
  };

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("login"); // 'login' or 'register'
  const [hoveredTab, setHoveredTab] = useState(null); // track hovered tab button

  // Email/password state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Google sign-in
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await signInWithGoogle();
      const { displayName, email, photoURL } = result.user;

      const res = await axios.post("http://localhost:5000/auth/google", {
        name: displayName,
        email,
        photoURL,
      });

      const { token, user, isNew } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      if (isNew) {
        navigate("/onboarding");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError("Google sign-in failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Email/password registration or login
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (activeTab === "register" && !name) {
      setError("Name is required for registration.");
      setLoading(false);
      return;
    }
    if (!email || !password) {
      setError("Email and password are required.");
      setLoading(false);
      return;
    }

    try {
      const url =
        activeTab === "register"
          ? "http://localhost:5000/auth/register"
          : "http://localhost:5000/auth/login";

      const res = await axios.post(url, { name, email, password });
      const { token, user, isNew } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      if (isNew) {
        navigate("/onboarding");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      {/* Floating elements with slide animations */}
      <div
        className="floating-element slide-left"
        style={{
          bottom: "50px",
          left: "140px",
          animationDuration: "7s",
          animationDelay: "0.2s",
        }}
      >
        <img
          src={benchele}
          alt="Element 1"
          style={{ width: "80px", height: "auto" }}
        />
      </div>

      <div
        className="floating-element slide-right"
        style={{
          top: "100px",
          right: "150px",
          animationDuration: "5s",
          animationDelay: "0.4s",
        }}
      >
        <img
          src={bookele}
          alt="Element 2"
          style={{ width: "90px", height: "auto" }}
        />
      </div>

      <div
        className="floating-element slide-left"
        style={{
          top: "50px",
          left: "100px",
          animationDuration: "6s",
          animationDelay: "0.6s",
        }}
      >
        <img
          src={clockele}
          alt="Element 3"
          style={{ width: "70px", height: "auto" }}
        />
      </div>

      <div
        className="floating-element slide-right"
        style={{
          top: "140px",
          left: "690px",
          animationDuration: "4s",
          animationDelay: "0.8s",
        }}
      >
        <img
          src={diceele}
          alt="Element 4"
          style={{ width: "120px", height: "auto" }}
        />
      </div>

      <div
        className="floating-element slide-right"
        style={{
          top: "370px",
          right: "220px",
          animationDuration: "8s",
          animationDelay: "1s",
        }}
      >
        <img
          src={flowerele}
          alt="Element 5"
          style={{ width: "75px", height: "auto" }}
        />
      </div>

      <div
        className="floating-element slide-right"
        style={{
          top: "500px",
          left: "750px",
          animationDuration: "9s",
          animationDelay: "1.2s",
        }}
      >
        <img
          src={paperele}
          alt="Element 6"
          style={{ width: "65px", height: "auto" }}
        />
      </div>

      <div
        className="floating-element slide-right"
        style={{
          bottom: "40px",
          right: "360px",
          animationDuration: "10s",
          animationDelay: "1.4s",
        }}
      >
        <img
          src={penele}
          alt="Element 7"
          style={{ width: "70px", height: "auto" }}
        />
      </div>

      {/* Back button */}
      <button
        className="button"
        onClick={() => navigate("/")}
        onMouseMove={handleMouseMove}
        style={{
          top: "12px",
          left: "12px",
          padding: "3px 10px 3px 9px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <IoIosArrowBack style={{ fontSize: "1.5rem" }} />
      </button>

      {/* Auth content */}
      <div
        className="auth-content"
        style={{
          fontSize: "1.5rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          paddingLeft: "650px",
        }}
      >
        <h1 style={{ marginBottom: "20px", color: "#dad7b6" }}>
          {activeTab === "login" ? "Login" : "Register"}
        </h1>

        {/* Tabs */}
        <div style={{ display: "flex", marginBottom: "20px", gap: "10px" }}>
          <button
            onClick={() => setActiveTab("login")}
            onMouseEnter={() => setHoveredTab("login")}
            onMouseLeave={() => setHoveredTab(null)}
            style={{
              padding: "10px 20px",
              borderRadius: "25px",
              border: "1px solid #ccc",
              backgroundColor: activeTab === "login" ? "#fff" : "#f0f0f0",
              cursor: "pointer",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              transform:
                hoveredTab === "login" ? "translateY(-5px)" : "translateY(0)",
              boxShadow:
                hoveredTab === "login" ? "0 8px 15px rgba(0,0,0,0.2)" : "none",
            }}
          >
            Login
          </button>

          <button
            onClick={() => setActiveTab("register")}
            onMouseEnter={() => setHoveredTab("register")}
            onMouseLeave={() => setHoveredTab(null)}
            style={{
              padding: "10px 20px",
              borderRadius: "25px",
              border: "1px solid #ccc",
              backgroundColor: activeTab === "register" ? "#fff" : "#f0f0f0",
              cursor: "pointer",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              transform:
                hoveredTab === "register"
                  ? "translateY(-5px)"
                  : "translateY(0)",
              boxShadow:
                hoveredTab === "register"
                  ? "0 8px 15px rgba(0,0,0,0.2)"
                  : "none",
            }}
          >
            Register
          </button>
        </div>

        {/* Google sign-in */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 20px",
            fontSize: "16px",
            borderRadius: "50px",
            border: "none",
            backgroundColor: "#fff",
            color: "#1e1e1e",
            cursor: loading ? "not-allowed" : "pointer",
            marginBottom: "20px",
          }}
        >
          {loading ? (
            "Signing in..."
          ) : (
            <>
              <FcGoogle style={{ fontSize: "1.5rem" }} /> Sign in with Google
            </>
          )}
        </button>

        <p style={{ color: "#dad7b6" }}>
          Or {activeTab === "login" ? "login" : "register"} with email
        </p>

        {/* Email/password form */}
        <form
          onSubmit={handleEmailAuth}
          style={{
            display: "flex",
            flexDirection: "column",
            width: "300px",
            gap: "15px",
            marginTop: "15px",
          }}
        >
          {activeTab === "register" && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                padding: "10px",
                fontSize: "14px",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              padding: "10px",
              fontSize: "14px",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              padding: "10px",
              fontSize: "14px",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "10px",
              fontSize: "16px",
              borderRadius: "5px",
              border: "none",
              backgroundColor: "#4CAF50",
              color: "#fff",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading
              ? activeTab === "register"
                ? "Registering..."
                : "Logging in..."
              : activeTab === "register"
              ? "Register"
              : "Login"}
          </button>
        </form>

        {error && <p style={{ color: "red", marginTop: "15px" }}>{error}</p>}
      </div>
    </div>
  );
};

export default AuthPage;
