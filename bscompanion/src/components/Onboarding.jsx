import React, { useState, useEffect } from "react";
import { State, City } from "country-state-city";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const levels = {
  Foundational: [
    "Math 1",
    "English 1",
    "Computational Thinking",
    "Statistics 1",
    "Math 2",
    "English 2",
    "Programming in Python",
    "Statistics 2",
  ],
  Diploma: [
    "PDSA",
    "DBMS",
    "BDM",
    "TDS",
    "System Commands",
    "MAD 1",
    "MAD 2",
    "MLF",
    "MLT",
    "MLP",
    "Business Analytics",
    "JAVA",
  ],
};

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const Onboarding = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  const [form, setForm] = useState({
    username: "",
    state: "",
    city: "",
    currentLevel: "",
    subjects: [],
    bloodGroup: "",
  });

  // ✅ Fetch Indian states on mount
  useEffect(() => {
    setLoadingStates(true);
    const indianStates = State.getStatesOfCountry("IN"); // Use ISO code for India
    setStates(indianStates);
    setLoadingStates(false);
  }, []);

  // ✅ Fetch cities based on selected state
  useEffect(() => {
    if (!form.state) {
      setCities([]);
      return;
    }
    setLoadingCities(true);
    const selectedCities = City.getCitiesOfState("IN", form.state);
    setCities(selectedCities);
    setLoadingCities(false);
  }, [form.state]);

  // ✅ Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/useronboarding", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="onboarding">
      <div className="onboarding-wrapper">
        <div
          style={{ padding: "30px", display: "flex", justifyContent: "center" }}
          className="onboarding-form"
        >
          <div style={{ width: "450px" }}>
            <h1 style={{ marginBottom: "20px", color: "#dad8b6" }}>
              Welcome! Tell us more about you
            </h1>
            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "15px" }}
            >
              {/* Username */}
              <input
                type="text"
                placeholder="How would you like to be called?"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="input-box"
                required
              />

              {/* State Dropdown */}
              <select
                value={form.state}
                onChange={(e) =>
                  setForm({ ...form, state: e.target.value, city: "" })
                }
                className="input-box"
                required
              >
                <option value="">Select State / UT</option>
                {loadingStates ? (
                  <option>Loading...</option>
                ) : (
                  states.map((state) => (
                    <option key={state.isoCode} value={state.isoCode}>
                      {state.name}
                    </option>
                  ))
                )}
              </select>

              {/* City Dropdown */}
              <select
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="input-box"
                disabled={!form.state}
                required
              >
                <option value="">
                  {loadingCities
                    ? "Loading..."
                    : form.state
                    ? "Select City / Town"
                    : "Select State First"}
                </option>
                {cities.map((city) => (
                  <option key={city.name} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>

              {/* Current Level */}
              <select
                value={form.currentLevel}
                onChange={(e) =>
                  setForm({
                    ...form,
                    currentLevel: e.target.value,
                    subjects: [],
                  })
                }
                className="input-box"
                required
              >
                <option value="">Select Current Level</option>
                {Object.keys(levels).map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>

              {/* Subjects */}
              {form.currentLevel && (
                <div style={{ color: "#dad8b6" }}>
                  <p style={{ marginBottom: "5px" }}>Subjects Opted:</p>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "5px",
                      marginLeft: "5px",
                    }}
                  >
                    {levels[form.currentLevel].map((subject) => (
                      <label key={subject} style={{ cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          value={subject}
                          checked={form.subjects.includes(subject)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setForm({
                                ...form,
                                subjects: [...form.subjects, subject],
                              });
                            } else {
                              setForm({
                                ...form,
                                subjects: form.subjects.filter(
                                  (s) => s !== subject
                                ),
                              });
                            }
                          }}
                        />{" "}
                        {subject}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Blood Group + Tooltip */}
              <div className="blood-container">
                <select
                  value={form.bloodGroup}
                  onChange={(e) =>
                    setForm({ ...form, bloodGroup: e.target.value })
                  }
                  className="input-box"
                  required
                >
                  <option value="">Select Blood Group</option>
                  {bloodGroups.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>

                {/* Tooltip */}
                <div className="tooltip-container">
                  <div className="tooltip-icon">i</div>
                  <span className="tooltip-text">
                    We ask this so that in case of an emergency, users from your
                    city with the same blood group can be notified.
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button type="submit" className="submit-btn">
                Continue
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
