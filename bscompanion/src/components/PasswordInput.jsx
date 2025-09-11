import React, { useState, useMemo } from "react";
import { Check, Eye, EyeOff, X } from "lucide-react";

const PASSWORD_REQUIREMENTS = [
  { regex: /.{8,}/, text: "At least 8 characters" },
  { regex: /[0-9]/, text: "At least 1 number" },
  { regex: /[a-z]/, text: "At least 1 lowercase letter" },
  { regex: /[A-Z]/, text: "At least 1 uppercase letter" },
  { regex: /[!-\/:-@[-`{-~]/, text: "At least 1 special character" },
];

const STRENGTH_CONFIG = {
  colors: {
    0: "#555",
    1: "#f87171",
    2: "#f97316",
    3: "#f59e0b",
    4: "#b45309",
    5: "#10b981",
  },
};

const PasswordInput = ({ value, onChange, showStrength = true }) => {
  const [isVisible, setIsVisible] = useState(false);

  const calculateStrength = useMemo(() => {
    const requirements = PASSWORD_REQUIREMENTS.map((req) => ({
      met: req.regex.test(value),
      text: req.text,
    }));
    return {
      score: requirements.filter((req) => req.met).length,
      requirements,
    };
  }, [value]);

  return (
    <div style={{ width: "100%" }}>
      <div style={{ position: "relative", width: "100%" }}>
        <input
          type={isVisible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Password"
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            backgroundColor: "#1e1e1e",
            color: "#dad7b6",
            outline: "none",
          }}
        />
        <button
          type="button"
          onClick={() => setIsVisible((prev) => !prev)}
          style={{
            position: "absolute",
            right: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#dad7b6",
          }}
        >
          {isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>
      </div>

      {showStrength && (
        <>
          {/* Strength bar */}
          <div
            style={{
              marginTop: "5px",
              height: "6px",
              borderRadius: "3px",
              backgroundColor: "#555",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${(calculateStrength.score / 5) * 100}%`,
                height: "100%",
                borderRadius: "3px",
                transition: "width 0.5s",
                backgroundColor:
                  STRENGTH_CONFIG.colors[calculateStrength.score],
              }}
            />
          </div>

          {/* Requirements list */}
          <ul
            style={{
              marginTop: "4px",
              paddingLeft: "16px",
              color: "#dad7b6",
              fontSize: "12px",
            }}
          >
            {calculateStrength.requirements.map((req, index) => (
              <li
                key={index}
                style={{ display: "flex", alignItems: "center", gap: "4px" }}
              >
                {req.met ? (
                  <Check size={14} color="#10b981" />
                ) : (
                  <X size={14} color="#888" />
                )}
                <span>{req.text}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default PasswordInput;
