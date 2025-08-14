import React from "react";
import { getAuth, signOut } from "firebase/auth";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import ProfileModal from "../ProfileModal";


    
const Modals = ({
  isProfileOpen,
  
  setIsProfileOpen,
  isLogoutOpen,
  setIsLogoutOpen,
  isChangePassword,
  setIsChangePassword,
  oldPassword,
  setOldPassword,
  newPassword,
  setNewPassword,
  confirmNewPassword,
  setConfirmNewPassword,
  showPassword,
  setShowPassword,
  passwordError,
  passwordSuccess,
  handleChangePassword
}) => {
  const navigate = useNavigate();

  const resetChangePasswordModal = () => {
  setOldPassword("");
  setNewPassword("");
  setConfirmNewPassword("");
  setShowPassword(false);
  setIsChangePassword(false); // Close the modal
};

    

  return (

    
    <>
      {/* Profile Modal */}
      {isProfileOpen && <ProfileModal onClose={() => setIsProfileOpen(false)} />}

      {/* Logout Modal */}
      {isLogoutOpen && (
        <div className="meeting-modal-backdrop">
          <div className="meeting-modal">
            <button className="close-button" onClick={resetChangePasswordModal}>X</button>

            <h2>Log out</h2>
            <hr style={{ width: "100%", border: "0.5px solid black", margin: "1rem 0" }} />

            <div>Are you sure you want to log out?</div>
            <div style={{ position: "relative" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  position: "absolute",
                  top: "50px",
                  left: "30px",
                }}
              >
                <button
                  className="homepage-buttons"
                  onClick={async () => {
                    const auth = getAuth();
                    try {
                      await signOut(auth);
                      localStorage.clear();
                      setIsLogoutOpen(false);
                      navigate("/");
                    } catch (error) {
                      console.error("Logout failed:", error.message);
                    }
                  }}
                  style={{ marginRight: "50px" }}
                >
                  Yes
                </button>
                <button className="homepage-buttons" onClick={() => setIsLogoutOpen(false)}>
                  No
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isChangePassword && (
    <div className="modal-backdrop1">
    <div className="modal1">
      <button className="close-button" onClick={() => setIsChangePassword(false)}>X</button>

      <h2 style={{color: "black" }}>Change Password</h2>
      <hr style={{ width: "100%", border: "0.5px solid black", margin: "1rem 0" }} />

      <form onSubmit={handleChangePassword}>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <label>Enter your old password:</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
            <span className="toggle-visibility" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <label>Type your new password:</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <span className="toggle-visibility" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <label>Type your new password again:</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
            />
            <span className="toggle-visibility" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {passwordError && <div style={{ color: "red" }}>{passwordError}</div>}
          {passwordSuccess && <div style={{ color: "green" }}>{passwordSuccess}</div>}

          <button type="submit">Set new password</button>
        </div>
      </form>
    </div>
  </div>
)}

    </>
  );
};

export default Modals;
