import React from "react";
import Navbar from "./Navbar";
import './Homepage.css';
import Offcanvas from "./Offcanvas";
import ProfileModal from "./ProfileModal";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEyeSlash } from "react-icons/fa";
import { FaEye } from "react-icons/fa";
import { fetchStudentData, fetchTutorDetails, getSchedule, changeStudentPassword } from "./firebaseFunctions";
import { getAuth, signOut } from "firebase/auth";

function Notifications () {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const navigate = useNavigate();
    const [isLogoutOpen, setIsLogoutOpen] = useState(false);
    const [isChangePassword, setIsChangePassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState('');
    const [tutorName, setTutorName] = useState('');
    const [schedule, setSchedule] = useState(null);

        const [oldPassword, setOldPassword] = useState('');
        const [newPassword, setNewPassword] = useState('');
        const [confirmNewPassword, setConfirmNewPassword] = useState('');
        const [passwordError, setPasswordError] = useState('');
        const [passwordSuccess, setPasswordSuccess] = useState('');
        const handleChangePassword = async (e) => {
          e.preventDefault();
        
          setPasswordError('');
          setPasswordSuccess('');
        
          if (!oldPassword || !newPassword || !confirmNewPassword) {
            setPasswordError('Please fill in all fields.');
            return;
          }
        
          if (newPassword !== confirmNewPassword) {
            setPasswordError('New passwords do not match.');
            return;
          }
        
          const result = await changeStudentPassword(oldPassword, newPassword);
        
          if (result.success) {
            setPasswordSuccess(result.message);
            setOldPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
          } else {
            setPasswordError(result.message);
          }
        };
    
    
    useEffect(() => {
            const loadStudentAndSchedule = async () => {
                const referenceNumber = localStorage.getItem("referenceNumber");
                if (referenceNumber) {
                    try {
                        const data = await fetchStudentData(referenceNumber);
                        
                        
                        const tutorId = data.tutorId;
                        const path = `${referenceNumber}_${tutorId}`;
        
                        const tutorData = await fetchTutorDetails(referenceNumber);
                        if (tutorData.success) {
                        setTutorName(tutorData.data.name);
                        }
                        const fetchedSchedule = await getSchedule(path);
                        console.log("Fetched schedule:", fetchedSchedule); // ✅ Debug
                        setSchedule(fetchedSchedule);
                    } catch (error) {
                        console.error("Error fetching data:", error);
                    }
                }
            };
        
            loadStudentAndSchedule();
        }, []);
        
       const [firstName, setFirstName] = useState ('');
        useEffect(() => {
          const referenceNumber = localStorage.getItem('referenceNumber');
          if (referenceNumber) {
             fetchStudentData(referenceNumber).then(data => {
              if(data?.fullName) {
               const first = data.fullName;
               setFirstName(first);
               localStorage.setItem('fullName', data.fullName)
              }
             })
          }
        }, []);

    return (
        <>
        <Navbar>
         <button class="btn btn-primary"  style={{backgroundColor: 'rgb(4, 10, 34)', marginRight:'20px'}} type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasWithBothOptions" aria-controls="offcanvasWithBothOptions">☰</button>
           <div>
           <h2 style={{color: 'rgb(4,10,34)'}}>TutorLink - Student Portal</h2>

           </div>
           
           <div className="user">
                <div className="username">
                    {firstName}
                </div>
                <div class="btn-group">
                    <button type="button" class="btn btn-primary dropdown-toggle" style={{backgroundColor: 'rgb(4, 10, 34)'}} data-bs-toggle="dropdown" aria-expanded="false">
                    </button>
                    <ul class="dropdown-menu">
                        <li><div class="dropdown-item" onClick={() => {setIsProfileOpen(true)}}>Profile</div></li>
                        <li><div class="dropdown-item" onClick={() => navigate('/Help')}>Help</div></li>
                        <li><div class="dropdown-item" onClick={() => {setIsLogoutOpen(true)}} >Logout</div></li>
                        <li><div class="dropdown-item"  onClick={() => {setIsChangePassword(true)}} >Change Password</div></li>
                       
                
                    </ul>
                </div>
            </div>
        </Navbar>
        
        <div className="main " style={{display: 'flex', justifyContent:'center'}}>
        <div>  
                { isProfileOpen && <ProfileModal onClose={ () =>  setIsProfileOpen(false)} />       
                }    
                { isLogoutOpen && (
                                            <>
                                                <div className="meeting-modal-backdrop">
                                                        <div className="meeting-modal">
                                                        <button className="close-button" onClick={() => setInPerson(false)}>X</button>     
                                            
                                                        <h2>Log out</h2> 
                                                        <hr style={{ width: '100%', border: '0.5px solid black', margin: '1rem 0' }} />
                                                        
                                                        <div>Are you sure you want to log out?</div>
                                                        <div style={{position: 'relative'}}>
                                                            <div style={{display: 'flex', justifyContent: 'center', position: 'absolute', top:'50px', left: '30px' }}>
                                                            <button 
                                                                className="homepage-buttons" 
                                                                onClick
                                                              ={async () => {
                                                                  const auth = getAuth();
                                                                  try {
                                                                    await signOut(auth); // 🔐 Proper logout
                                                                    localStorage.clear(); // Optional: Clear app-specific localStorage
                                                                    setIsLogoutOpen(false); 
                                                                    navigate('/Login');
                                                                  } catch (error) {
                                                                    console.error("Logout failed:", error.message);
                                                                  }
                                                                }} 
                                                                style={{ marginRight: "50px" }}
                                                              >
                                                                Yes
                                                              </button>
                                                                                                                          <button className="homepage-buttons" onClick={() => setIsLogoutOpen(false)}>No</button>
                                                            </div>
                                                        </div>
                                                        </div>
                                                </div>     
                                            </>
                                        )}
                
                                        { isChangePassword && (
                                            <div className="modal-backdrop">
                                                            <div className="modal">
                                                            <button className="close-button" onClick={() => { setIsChangePassword(false);}}>X</button>     
                                                
                                                              <h2 style={{marginRight: '20px'}}>Change Password</h2> 
                                                              <hr style={{ width: '100%', border: '0.5px solid black', margin: '1rem 0' }} />
                                                 
                                                           <form onSubmit={handleChangePassword}>
                                                                <div style={{ display: 'flex', flexDirection: 'column', width: '300px', textAlign: 'left' }}>
                  
                                                                  <label>Enter your old password:</label>
                                                                  <div className="password-wrapper" style={{ marginBottom: '20px' }}>
                                                                    <input
                                                                      type={showPassword ? 'text' : 'password'}
                                                                      value={oldPassword}
                                                                      onChange={(e) => setOldPassword(e.target.value)}
                                                                      style={{ height: '30px', width: '90%', marginRight: '5px' }}
                                                                    />
                                                                    <span className="toggle-visibility" onClick={() => setShowPassword(!showPassword)}>
                                                                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                                                                    </span>
                                                                  </div>
                  
                                                                  <label>Type your new password:</label>
                                                                  <div className="password-wrapper" style={{ marginBottom: '20px' }}>
                                                                    <input
                                                                      type={showPassword ? 'text' : 'password'}
                                                                      value={newPassword}
                                                                      onChange={(e) => setNewPassword(e.target.value)}
                                                                      style={{ height: '30px', width: '90%', marginRight: '5px' }}
                                                                    />
                                                                    <span className="toggle-visibility" onClick={() => setShowPassword(!showPassword)}>
                                                                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                                                                    </span>
                                                                  </div>
                  
                                                                  <label>Type your new password again:</label>
                                                                  <div className="password-wrapper" style={{ marginBottom: '20px' }}>
                                                                    <input
                                                                      type={showPassword ? 'text' : 'password'}
                                                                      value={confirmNewPassword}
                                                                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                                                                      style={{ height: '30px', width: '90%', marginRight: '5px' }}
                                                                    />
                                                                    <span className="toggle-visibility" onClick={() => setShowPassword(!showPassword)}>
                                                                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                                                                    </span>
                                                                  </div>
                  
                                                                  {passwordError && <div style={{ color: 'red' }}>{passwordError}</div>}
                                                                  {passwordSuccess && <div style={{ color: 'green' }}>{passwordSuccess}</div>}
                  
                                                                  <button style={{ marginTop: '20px', width: '100%' }} type="submit">Set new password</button>
                                                                </div>
                                                              </form>
                  
                                                            </div>
                                                          </div>
                                        )
                
                                        }
                <Offcanvas />
        </div>

        <div className="notification-container">
        <div style={{fontSize: '20px', margin: '10px 0 40px 0'}}>
          You have {schedule ? "1" : "0"} notification{schedule ? "" : "s"}
        </div>

            <div style={{display: 'flex', flex: 'start', marginLeft: '10px', fontSize: '20px'}}>Notifications</div>
            {schedule && tutorName ? (
  <div className="notification">
    You have a meeting with your academic tutor <strong>{tutorName}</strong> on{" "}
    <strong>{schedule.date.toDate().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })}</strong>.
  </div>
) : (
  <div className="notification">
    You currently have no scheduled meetings.
  </div>
)}

        </div>
        </div>
        </>
    );
}

export default Notifications;