import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signUpStudent, signUpLecturer } from "./firebaseFunctions";
import "./Login.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function SignUp() {
  const [role, setRole] = useState("Student");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [referenceOrTutorId, setReferenceOrTutorId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      let result;

      if (role === "Student") {
        result = await signUpStudent(name, username, email, password, referenceOrTutorId);
      } else {
        result = await signUpLecturer(name, username, email, password, referenceOrTutorId);
      }

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/Login");
        }, 2000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Sign up failed. Please try again.");
    }

    setIsLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-header">TutorLink</h1>
        <h2 className="login-title">Create an Account</h2>
        <p className="login-subtitle">
          Join us to connect with your academic partner.
        </p>

        <form onSubmit={handleSignUp} className="login-form">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email Address"
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

          <div className="role-label">
            <label style={{ display: "block", textAlign: "left", marginBottom: "0.5rem" }}>
              Sign up as:
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
          {success && <p className="success-text">✅ Sign-up successful! Redirecting...</p>}

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        <p className="footer-text">
          Already have an account?
          <div className="sign-up" onClick={() => navigate("/Login")}>
            {" "}
            Log in
          </div>
        </p>
        <p className="footer-text">© {new Date().getFullYear()} TutorLink</p>
      </div>
    </div>
  );
}

export default SignUp;
