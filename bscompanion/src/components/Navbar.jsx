import React from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const handleMouseMove = (e) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    button.style.setProperty("--x", `${x}px`);
    button.style.setProperty("--y", `${y}px`);
  };

  return (
    <div className="navbar-container">
      <div className="navbar-buttons">
        <button
          className="button nav-button"
          onMouseMove={handleMouseMove}
        >
          BS Documents
        </button>
        <button
          className="button nav-button"
          onMouseMove={handleMouseMove}
        >
          About
        </button>
        <button
          className="button nav-button"
          onMouseMove={handleMouseMove}
          onClick={() => navigate("/auth")}
        >
          SignIn
        </button>
      </div>
    </div>
  );
};

export default Navbar;
