import React from "react";
import './Homepage.css';
import Navbar from "./Navbar";
import Offcanvas from "./Offcanvas";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPeopleArrows } from "@fortawesome/free-solid-svg-icons";
import ProfileModal from "./ProfileModal";
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { faVideo } from "@fortawesome/free-solid-svg-icons";
import { FaEyeSlash } from "react-icons/fa";
import { FaEye } from "react-icons/fa";
import { fetchStudentData, checkExistingSchedule,createMeetingRequest, changeStudentPassword } from "./firebaseFunctions";
import { getAuth, signOut } from "firebase/auth";
import Footer from "./Footer";
import HomeButton from "./HomeButton";
import Modals from "./components/Modals";

function ScheduleMeeting() {    
    const [inPerson, setInPerson] = useState(false);
    const [virtual, setVirtual] = useState(false);
    const [inPersonConfirm, setInPersonConfirm] = useState(false);
    const [virtualConfirm, setVirtualConfirm] = useState(false);
    const [hasExistingSchedule, setHasExistingSchedule] = useState(false);
    const [existingScheduleMessage, setExistingScheduleMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isLogoutOpen, setIsLogoutOpen] = useState(false);
    const [isChangePassword, setIsChangePassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState('');

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
        const referenceNumber = localStorage.getItem('referenceNumber');
    
        if (referenceNumber) {
            fetchStudentData(referenceNumber).then(async (data) => {
                if (data?.tutorId) {
                    const tutorId = data.tutorId;
                    const schedulePath = `${referenceNumber}_${tutorId}`;
    
                    const result = await checkExistingSchedule(schedulePath);
                    if (result.exists) {
                        setHasExistingSchedule(true);
                        setExistingScheduleMessage(result.message);
                    } else if (result.status === "expired") {
                        setHasExistingSchedule(false);
                        setExistingScheduleMessage(result.message); // Still show the message
                    }
                }
                setIsLoading(false); // ✅ Stop loading once data is fetched
            });
        } else {
            setIsLoading(false); // ✅ Stop loading if no reference number
        }
    }, []);
    
    

    const [firstName, setFirstName] = useState ('');
    const [username, setUsername] = useState ('');
    useEffect(() => {
      const referenceNumber = localStorage.getItem('referenceNumber');
      if (referenceNumber) {
         fetchStudentData(referenceNumber).then(data => {
          if(data?.fullName) {
           const first = data.fullName;
           setFirstName(first);
           localStorage.setItem('fullName', data.fullName)
          }

          if(data?.username) {
           const username = data.username;
           setUsername(username);
           localStorage.setItem('fullName', data.username)
          }
         })
      }
    }, []);
      
      
    return (
        <>
            <Navbar>
                <button class="btn btn-primary"  style={{backgroundColor: 'rgb(4, 10, 34)', marginRight:'20px'}} type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasWithBothOptions" aria-controls="offcanvasWithBothOptions">☰</button>
                <div>
                 <h2 style={{color: 'white'}}>TutorLink - Student Portal</h2>


                </div>
                
                <div className="user">
                        <div className="username">
                        {username}
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
          
            <div className="main-kyt">
                <HomeButton />
             {  isLoading ? (
                <div style={{ color: "white", fontSize: "24px", textAlign: "center", marginTop: "100px" }}>
                <div className="spinner-border text-light" role="status" style={{ width: "3rem", height: "3rem" }}>
                    <span className="visually-hidden">Loading...</span>
                </div>
                <div>Checking for scheduled meetings...</div>
                </div>
            )  : ( <>
                   <Modals
                        isProfileOpen={isProfileOpen}
                        setIsProfileOpen={setIsProfileOpen}
                        isLogoutOpen={isLogoutOpen}
                        setIsLogoutOpen={setIsLogoutOpen}
                        isChangePassword={isChangePassword}
                        setIsChangePassword={setIsChangePassword}
                        oldPassword={oldPassword}
                        setOldPassword={setOldPassword}
                        newPassword={newPassword}
                        setNewPassword={setNewPassword}
                        confirmNewPassword={confirmNewPassword}
                        setConfirmNewPassword={setConfirmNewPassword}
                        showPassword={showPassword}
                        setShowPassword={setShowPassword}
                        passwordError={passwordError}
                        passwordSuccess={passwordSuccess}
                        handleChangePassword={handleChangePassword}
                    />
                <Offcanvas />
            <div className="request" style={{color: 'white'}}>Request a meeting with your Academic Tutor</div>
           
            {!hasExistingSchedule && (
                <>
                    <h3>How would you like to meet your academic tutor?</h3>
                    <div className="meeting-type">
                        <div className="d-flex justify-content-center flex-wrap gap-3">
                            <div className="card glass-card mb-3 fixed-card"  onClick={() => {
                                setInPerson(true);
                                setVirtual(false);
                                setInPersonConfirm(false);
                                setVirtualConfirm(false);
                            }}>
                                <FontAwesomeIcon icon={faPeopleArrows} size="2x" style={{ margin: "10px" }} />
                                <div className="card-body d-flex flex-column">
                                    <h5 className="card-title">In Person</h5>
                                    <p className="card-text">Meet your academic tutor face-to-face at a specific location and time</p>
                                </div>
                            </div>
            
                            <div className="card glass-card mb-3 fixed-card" onClick={() => {
                                setVirtual(true);
                                setInPerson(false);
                                setVirtualConfirm(false);
                                setInPersonConfirm(false);
                            }}>
                                <FontAwesomeIcon icon={faVideo} size="2x" style={{ margin: "10px" }} />
                                <div className="card-body d-flex flex-column">
                                    <h5 className="card-title">Virtually</h5>
                                    <p className="card-text">Meet your academic tutor on a video call</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
            
                {hasExistingSchedule && (
                    <div style={{ fontSize: "30px", fontWeight: "bold" }}>
                    {existingScheduleMessage}
                   </div>
                )}


                {inPerson && !inPersonConfirm && (
                    <div className="meeting-modal-backdrop">
                        <div className="meeting-modal">
                            <button className="close-button" onClick={() => setInPerson(false)}>X</button>
                            <h2>In Person Meeting Request</h2>
                            <hr />
                            <div>Click confirm to send the request to your tutor</div>
                            <div className="modal-actions">
                            <button className="homepage-buttons" style={{marginRight:"90px", marginTop: "70px", marginLeft:"20px"}} onClick={async () => {
                                const referenceNumber = localStorage.getItem('referenceNumber');
                                const studentData = await fetchStudentData(referenceNumber);

                                if (studentData?.tutorId) {
                                    const tutorId = studentData.tutorId;
                                    const schedulePath = `${referenceNumber}_${tutorId}`;

                                    const result = await createMeetingRequest(schedulePath, "in-person", referenceNumber);

                                    
                                    if (result.success) {
                                        setInPersonConfirm(true);
                                    } else {
                                        alert("Failed to request meeting. Please try again.");
                                    }
                                }}}>
                                Confirm
                                </button>
                                <button className="homepage-buttons" onClick={() => setInPerson(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}

                {inPerson && inPersonConfirm && (
            
                <div className="meeting-modal-backdrop">
                    <div className="meeting-modal">
                        <button className="close-button" onClick={() =>{ {setHasExistingSchedule(true), setVirtualConfirm(false), setVirtual(false),window.location.reload(); }}}>X</button>
                        <h2>Your in-person meeting request has <br/>been sent</h2>
                        <hr />
                        <div>Wait for your tutor to confirm the meeting, date, location and time.</div>
                        <div className="modal-actions">
                            <button className="homepage-buttons" style={{marginLeft:"150px", marginTop: "30px"}} onClick={() => {
                                setHasExistingSchedule(true);
                                setInPerson(false);
                                setInPersonConfirm(false);
                                window.location.reload();
                            }}>Okay</button>
                        </div>
                    </div>
                </div>
            )}
                {virtual && !virtualConfirm && (
                    <div className="meeting-modal-backdrop">
                        <div className="meeting-modal">
                            <button className="close-button" onClick={() => setVirtual(false)}>X</button>
                            <h2>Virtual Meeting Request</h2>
                            <hr />
                            <div>Click confirm to send the request to your tutor</div>
                            <div className="modal-actions">
                            <button className="homepage-buttons" style={{marginRight:"90px", marginTop: "70px", marginLeft:"20px"}} onClick={async () => {
                                  const referenceNumber = localStorage.getItem('referenceNumber');
                                    const studentData = await fetchStudentData(referenceNumber);

                                    if (studentData?.tutorId) {
                                        const tutorId = studentData.tutorId;
                                        const schedulePath = `${referenceNumber}_${tutorId}`;

                                        const result = await createMeetingRequest(schedulePath, "virtual", referenceNumber);
                                        

                                        if (result.success) {
                                            setVirtualConfirm(true);
                                        } else {
                                            alert("Failed to request meeting. Please try again.");
                                        }
                                    }
                                }}>
                                    Confirm
                                    </button>
                                <button className="homepage-buttons" onClick={() => setVirtual(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}

                {virtual && virtualConfirm && (
                    <div className="meeting-modal-backdrop">
                        <div className="meeting-modal">
                            <button className="close-button" onClick={() =>{ {setHasExistingSchedule(true), setVirtualConfirm(false), setVirtual(false),window.location.reload(); }}}>X</button>
                            <h2>Your virtual meeting request has <br/>been sent</h2>
                            <hr />
                            <div>Wait for your tutor to confirm the meeting, date, and time.</div>
                            <div className="modal-actions">
                                <button className="homepage-buttons" style={{marginLeft:"150px", marginTop: "50px"}} onClick={() => {
                                    setHasExistingSchedule(true);
                                    setVirtual(false);
                                    setVirtualConfirm(false);
                                    window.location.reload();
                                }}>Okay</button>
                            </div>
                        </div>
                    </div>
                )}

            </> )} </div>
           <Footer />
        </>
    );
}

export default ScheduleMeeting;