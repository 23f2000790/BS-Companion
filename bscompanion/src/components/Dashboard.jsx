import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import axios from "axios";

const Dashboard = () => {
  const navigate = useNavigate(); // ✅ Correct place
  const [user, setUser] = useState(null); // ✅ Use lowercase

  useEffect(() => {
    const GetUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }

      try {
        const res = await axios.get("http://localhost:5000/getuser", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const { name, email, city, bloodGroup, currentLevel, subjects, _id } =
          res.data.user;

        setUser({ name, email, city, bloodGroup, currentLevel, subjects, _id });
      } catch (err) {
        console.log("Error fetching user:", err);
      }
    };

    GetUser();
  }, [navigate]); // ✅ Added dependency

  // Show loader until user data is fetched
  if (!user) {
    return <h2>Loading user data...</h2>;
  }

  const LogoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const quizNavigate = (subject) => () => {
    navigate(`/quiz/${subject}`, { state: { userId: user._id } });
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
      <h1>Welcome, {user.name} 👋</h1>
      <p>
        <b>Email:</b> {user.email}
      </p>
      <p>
        <b>City:</b> {user.city}
      </p>
      <p>
        <b>Blood Group:</b> {user.bloodGroup}
      </p>
      <p>
        <b>Current Level:</b> {user.currentLevel}
      </p>
      <p>
        <b>Subjects:</b> {user.subjects?.join(", ")}
      </p>
      {user.subjects.map((subject, index) => (
        <div key={index} className="subject-card">
          <button onClick={quizNavigate(subject)}>{subject}</button>
        </div>
      ))}
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
