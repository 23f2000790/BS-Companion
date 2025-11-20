import React, { useState } from "react";
import axios from "axios";
import { signInWithGoogle } from "../firebase";
import { useNavigate } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import { FcGoogle } from "react-icons/fc";

// Floating elements
import benchele from "../assets/images/benchele.png";
import bookele from "../assets/images/bookele.png";
import clockele from "../assets/images/clockele.png";
import diceele from "../assets/images/diceele.png";
import flowerele from "../assets/images/flowerele.png";
import paperele from "../assets/images/paperele.png";
import penele from "../assets/images/penele.png";

const AuthPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleMouseMove = (e) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    button.style.setProperty("--x", `${x}px`);
    button.style.setProperty("--y", `${y}px`);
  };

  const handleAuthSuccess = async (token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    navigate("/dashboard");
  };

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

      const { token, user } = res.data;
      await handleAuthSuccess(token, user);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError("Google sign-in failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      {/* Floating elements */}
      {[
        {
          src: benchele,
          style: {
            bottom: "50px",
            left: "140px",
            width: "80px",
            animationDuration: "7s",
            animationDelay: "0.2s",
          },
        },
        {
          src: bookele,
          style: {
            top: "100px",
            right: "150px",
            width: "90px",
            animationDuration: "5s",
            animationDelay: "0.4s",
          },
        },
        {
          src: clockele,
          style: {
            top: "50px",
            left: "100px",
            width: "70px",
            animationDuration: "6s",
            animationDelay: "0.6s",
          },
        },
        {
          src: diceele,
          style: {
            top: "140px",
            left: "690px",
            width: "120px",
            animationDuration: "4s",
            animationDelay: "0.8s",
          },
        },
        {
          src: flowerele,
          style: {
            top: "370px",
            right: "220px",
            width: "75px",
            animationDuration: "6s",
            animationDelay: "1s",
          },
        },
        {
          src: paperele,
          style: {
            top: "500px",
            left: "750px",
            width: "65px",
            animationDuration: "7s",
            animationDelay: "1.2s",
          },
        },
        {
          src: penele,
          style: {
            bottom: "20px",
            right: "360px",
            width: "70px",
            animationDuration: "5s",
            animationDelay: "1.4s",
          },
        },
      ].map((el, idx) => (
        <div
          key={idx}
          className={`floating-element ${
            idx % 2 === 0 ? "slide-left" : "slide-right"
          }`}
          style={el.style}
        >
          <img
            src={el.src}
            alt={`Element ${idx + 1}`}
            style={{ width: el.style.width }}
          />
        </div>
      ))}

      {/* Back button */}
      <button
        className="button"
        onClick={() => navigate("/")}
        onMouseMove={handleMouseMove}
        style={{
          top: "12px",
          left: "12px",
          padding: "3px 10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <IoIosArrowBack style={{ fontSize: "1.5rem", color: "#1e1e1e" }} />
      </button>

      {/* Auth content */}
      <div
        className="auth-content"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          paddingLeft: "650px",
          width: "100%",
        }}
      >
        <h1 style={{ marginBottom: "20px", color: "#dad7b6" }}>
          Sign In
        </h1>

        {/* Google sign-in */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "12px 24px",
            fontSize: "16px",
            borderRadius: "50px",
            border: "none",
            backgroundColor: "#fff",
            color: "#1e1e1e",
            cursor: loading ? "not-allowed" : "pointer",
            marginBottom: "20px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            transition: "transform 0.2s ease",
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
          onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
        >
          {loading ? (
            "Signing in..."
          ) : (
            <>
              <FcGoogle style={{ fontSize: "1.5rem" }} /> Sign in with Google
            </>
          )}
        </button>

        {error && <p style={{ color: "red", marginTop: "15px" }}>{error}</p>}
      </div>
    </div>
  );
};

export default AuthPage;
