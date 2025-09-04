import React from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();

  const LogoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleMouseMove = (e) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    button.style.setProperty("--x", `${x}px`);
    button.style.setProperty("--y", `${y}px`);
  };

  return (
    <div className="dashboard">
      <h1>Profile</h1>
      <p>This is your dashboard</p>
      <button
        onClick={LogoutUser}
        className="button"
        style={{ top: 10, right: 10, scale: 0.8 }}
        onMouseMove={handleMouseMove}
      >
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
