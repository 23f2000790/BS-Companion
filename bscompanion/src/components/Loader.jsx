import React from "react";
import { Pinwheel } from "ldrs/react";
import "ldrs/react/Pinwheel.css";

const Loader = ({ text }) => {
  return (
    <div className="loader-container">
      <Pinwheel size="55" stroke="4" speed="0.9" color="#dad8b6" />
      <h3 className="loading-text">{text}</h3>
    </div>
  );
};

export default Loader;
