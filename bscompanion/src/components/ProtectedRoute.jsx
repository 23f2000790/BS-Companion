import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/auth");
        return;
      }

      try {
        // Verify token validity by fetching user
        await axios.get("http://localhost:5000/getuser", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // If successful, stay on the page (children will render)
      } catch (err) {
        localStorage.removeItem("token");
        navigate("/auth");
      } finally {
        setChecking(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (checking) {
    return (
      <div className="loader-container">
        <div className="spinner"></div>
        <h3 className="loading-text">Checking authentication...</h3>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
