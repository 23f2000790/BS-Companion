import React, { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  const LogoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const getUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/getuser", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const email = res.data.email;
      const username = res.data.name;
      const userid = res.data._id;
      console.log(email, username, userid);
    } catch (err) {
      console.error(
        "Error fetching profile:",
        err.response?.data || err.message
      );
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  return (
    <div>
      <h1>Profile</h1>
      <p>Check console for profile data</p>
      <button onClick={LogoutUser}>Logout</button>
    </div>
  );
};

export default Dashboard;
