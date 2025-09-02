import React from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  const LogoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div>
      <h1>Profile</h1>
      <p>This is your dashboard</p>
      <button onClick={LogoutUser}>Logout</button>
    </div>
  );
};

export default Dashboard;
