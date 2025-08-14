import React from "react";
import Navbar from "./Navbar";
import Offcanvas from "./Offcanvas";
import "./Homepage.css";
import ProfileModal from "./ProfileModal";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEyeSlash, FaEye } from "react-icons/fa";
import { fetchTutorDetails,changeStudentPassword, fetchStudentData } from "./firebaseFunctions"; 
import tutorImages from './tutorImages';
import img1 from './assets/001.png';
import Modals from "./components/Modals";

import { getAuth, signOut } from "firebase/auth";
import Footer from "./Footer";
import HomeButton from "./HomeButton";


function KnowYourTutor () {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const navigate = useNavigate();
    const [isLogoutOpen, setIsLogoutOpen] = useState(false);
    const [isChangePassword, setIsChangePassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    // const [password, setPassword] = useState('');
    const [tutor, setTutor] = useState(null);
    const [error, setError] = useState(null);
    const referenceNumber = localStorage.getItem('referenceNumber');

     const [oldPassword, setOldPassword] = useState('');
        const [newPassword, setNewPassword] = useState('');
        const [confirmNewPassword, setConfirmNewPassword] = useState('');
        const [passwordError, setPasswordError] = useState('');
        const [passwordSuccess, setPasswordSuccess] = useState('');
        const [tutorId, setTutorId] = useState('');

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
             fetchStudentData(referenceNumber).then(data => {
                if (data?.tutorId) {
                    setTutorId(data.tutorId);
                    
                  }
            
                if(data?.fullName) {
               const first = data.fullName;
               setFirstName(first);
               localStorage.setItem('fullName', data.fullName)
              }
             })
          }
        }, []);
    
        useEffect(() => {
            async function loadTutor() {
                const result = await fetchTutorDetails(referenceNumber);
                if (result.success) {
                    console.log("Tutor ID:", result.data.tutorId); // Add this line
                    setTutor(result.data);
                    
                } else {
                    setError(result.message);
                }
            }
            loadTutor();
        }, [referenceNumber]);
        
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

            <div className="tutor-info" style={{backgroundColor:'rgba(255, 255, 255, 0.57)', }}>
                <div>Meet your Academic Tutor</div>
                {tutor ? (
                    <>
                        <div>{tutor.name}</div>
                        <img
                            className="tutor-pic"
                            alt="Tutor"
                            src={tutorImages[tutorId]}
                            />

                        <div>Department: {tutor.department},</div>
                        <div>{tutor.college}</div>
                        <hr style={{color: 'white'}} />

                        <div style={{marginTop: '30px'}}>PROFILE</div>
                        <hr style={{color: 'white'}} />
                        <p>{tutor.profile}</p>

                    </>
                ) : (
                    <p>{error ? error : "Loading tutor details..."}</p>
                )}
            </div>

        </div>
           <Footer />
        </>
    );
}

export default KnowYourTutor;