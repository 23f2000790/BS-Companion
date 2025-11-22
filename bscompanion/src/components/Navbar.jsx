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
    <div className="navbar" style={{ zIndex: 100 }}>
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
  );
};

export default Navbar;
