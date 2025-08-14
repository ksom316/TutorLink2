import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginStudent, loginLecturer } from "./firebaseFunctions";
import "./Login.css"; // make sure CSS is updated too
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { sendPasswordReset } from "./firebaseFunctions";
import { saveFcmToken } from "./firebaseFunctions";


function Login() {
  const [role, setRole] = useState("Student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referenceOrTutorId, setReferenceOrTutorId] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resetMessage, setResetMessage] = useState(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");




  const navigate = useNavigate();

  const handleForgotPassword = async () => {
  if (!email) {
    setResetMessage("Please enter your email to reset your password.");
    return;
  }

  const result = await sendPasswordReset(email);

  setResetMessage(result.message);
};


  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
        const result = role === "Student"
          ? await loginStudent(email, referenceOrTutorId, password)
          : await loginLecturer(email, referenceOrTutorId, password);

      if (result.success) {
         await saveFcmToken(referenceOrTutorId);
        localStorage.setItem(
          role === "Student" ? "referenceNumber" : "tutorId",
          referenceOrTutorId
        );
        navigate(role === "Student" ? "/Homepage" : "/LecturerHome");
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    }

    setIsLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-header">TutorLink</h1>
        <h2 className="login-title">Welcome!</h2>
        <p className="login-subtitle">
          Sign in to connect with your academic partner.
        </p>
        <form onSubmit={handleLogin} className="login-form">
          <input
            type="text"
            placeholder="Username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder={role === "Student" ? "Reference Number" : "Tutor ID"}
            value={referenceOrTutorId}
            onChange={(e) => setReferenceOrTutorId(e.target.value)}
            required
          />

          <div className="password-input">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </span>
          </div>

          <p
            className="forgot-password"
            onClick={() => setShowResetModal(true)}
            style={{ cursor: "pointer", color: "#007BFF", marginTop: "10px" }}
          >
            Forgot Password?
          </p>


        
          <div className="role-label">
  <label style={{ display: "block", textAlign: "left", marginBottom: "0.5rem" }}>
    Login as:
  </label>
  <div className="role-selector">
    <label>
      <input
        type="radio"
        value="Student"
        checked={role === "Student"}
        onChange={() => setRole("Student")}
      />{" "}
      Student
    </label>
    <label>
      <input
        type="radio"
        value="Tutor"
        checked={role === "Tutor"}
        onChange={() => setRole("Tutor")}
      />{" "}
      Tutor
    </label>
  </div>
</div>

          {error && <p className="error-text">{error}</p>}
          {resetMessage && <p className="info-text">{resetMessage}</p>}


          <button type="submit" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

      {showResetModal && (
        <div className="modal-overlay">
          <div className="modal">
            {/* Close X in top-right corner */}
            <button
              className="modal-close-x"
              onClick={() => {
                setShowResetModal(false);
                setResetMessage(null);
                setResetEmail("");
              }}
            >
              &times;
            </button>

            <h3>Reset Password</h3>
            <input
              type="email"
              placeholder="Enter your email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              required
            />
            <button
              onClick={async () => {
                const result = await sendPasswordReset(resetEmail);
                setResetMessage(result.message);
              }}
            >
              Send Reset Link
            </button>
            {resetMessage && <p className="info-text">{resetMessage}</p>}

            <button
              className="close-btn"
              onClick={() => {
                setShowResetModal(false);
                setResetMessage(null);
                setResetEmail("");
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}


        <p className="footer-text">Don't have an account?<div className="sign-up" onClick={() => navigate('/SignUp')}> Sign up</div></p>

        <p className="footer-text">© {new Date().getFullYear()} TutorLink</p>
      </div>
    </div>
  );
}

export default Login;
