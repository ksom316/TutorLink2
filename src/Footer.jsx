// src/components/Footer.jsx
import React from "react";
import "./Footer.css"; // optional, for styling

function Footer() {
  return (
    <footer className="footer">
      <p>© {new Date().getFullYear()} TutorLink. All rights reserved.</p>
      {/* Optional: Add more links below */}
      {/* <div className="footer-links">
        <a href="/privacy">Privacy Policy</a>
        <a href="/terms">Terms of Use</a>
        <a href="/contact">Contact Us</a>
      </div> */}
    </footer>
  );
}

export default Footer;
