// src/components/HomeButton.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./HomeButton.css";

function HomeButton() {
  const navigate = useNavigate();

  const handleClick = () => {
    const referenceNumber = localStorage.getItem("referenceNumber");
    const tutorId = localStorage.getItem("tutorId");

    if (referenceNumber) {
      navigate("/Homepage");
    } else if (tutorId) {
      navigate("/LecturerHome");
    } else {
      navigate("/"); // fallback to login
    }
  };

  return (
    <div className="home-button" onClick={handleClick}>
       ← Back to Homepage
    </div>
  );
}

export default HomeButton;
