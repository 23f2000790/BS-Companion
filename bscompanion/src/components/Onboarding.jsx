import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Onboarding = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ age: "", gender: "", interests: "" });
  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/user/update", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>Welcome! Tell us more about you</h1>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", width: "300px" }}
      >
        <input
          type="number"
          placeholder="Age"
          value={form.age}
          onChange={(e) => setForm({ ...form, age: e.target.value })}
        />
        <select
          value={form.gender}
          onChange={(e) => setForm({ ...form, gender: e.target.value })}
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
        <input
          type="text"
          placeholder="Interests"
          value={form.interests}
          onChange={(e) => setForm({ ...form, interests: e.target.value })}
        />
        <button type="submit" style={{ marginTop: "10px" }}>
          Continue
        </button>
      </form>
    </div>
  );
};

export default Onboarding;
