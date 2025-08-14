import React from "react";
import Navbar from "./Navbar";
import Offcanvas from "./Offcanvas";
import ProfileModal from './ProfileModal';
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import './Homepage.css' ;
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { FaEyeSlash } from "react-icons/fa";
import { FaEye } from "react-icons/fa";
import { getAuth, signOut } from "firebase/auth";
import { changeStudentPassword, fetchStudentData } from "./firebaseFunctions";
import Footer from "./Footer";

function Help () {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const navigate = useNavigate();
     const [isLogoutOpen, setIsLogoutOpen] = useState(false);
        const [isChangePassword, setIsChangePassword] = useState(false);
        const [showPassword, setShowPassword] = useState(false);
        const [password, setPassword] = useState('');
        
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
           

    return(
        <>
      <Navbar>
        <button class="btn btn-primary"  style={{backgroundColor: 'rgb(4, 10, 34)', marginRight:'20px'}} type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasWithBothOptions" aria-controls="offcanvasWithBothOptions">☰</button>
           <div>
           <h2 style={{color: 'white'}}>TutorLink - Student Portal</h2>
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

      <div className="main7">
      <div className="accordion-container">  
        { isProfileOpen && <ProfileModal onClose={ () => setIsProfileOpen(false)} />       
        }    
        { isLogoutOpen && (
                                    <>
                                        <div className="meeting-modal-backdrop">
                                                <div className="meeting-modal">
                                                <button className="close-button" onClick={() =>  setIsLogoutOpen(false)}>X</button>     
                                    
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
                                         
                                                      <form>
                                                        <div style = {{ display: 'flex', flexDirection: 'column', width: '300px', textAlign: 'left'}}>
                                                         
                                                          <label htmlFor='password'>Enter your old password: </label>
                                                            <div className="password-wrapper" style={{marginBottom: '20px'}}>
                                                              <input style={{height: '30px', width:'90%', marginRight:'5px'}}
                                                                type={showPassword ? 'text' : "password"}
                    
                                                                value={password}
                                                                onChange={(e) => setPassword(e.target.value)}
                                                                />
                                                                <span className="toggle-visibility" onClick={() => setShowPassword(!showPassword)}>
                                                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                                                                </span>
                                                            </div>  
        
                                                            <label htmlFor='password'>Type your new password: </label>
                                                            <div className="password-wrapper" style={{marginBottom: '20px'}}>
                                                              <input style={{height: '30px', width:'90%', marginRight:'5px'}}
                                                                type={showPassword ? 'text' : "password"}
                                                                // placeholder="Enter your password"
                                                                value={password}
                                                                onChange={(e) => setPassword(e.target.value)}
                                                                />
                                                                <span className="toggle-visibility" onClick={() => setShowPassword(!showPassword)}>
                                                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                                                                </span>
                                                            </div>  
        
                                                            <label htmlFor='password'>Type your new password again: </label>
                                                            <div className="password-wrapper" style={{marginBottom: '20px'}}>
                                                              <input style={{height: '30px', width:'90%', marginRight:'5px'}}
                                                                type={showPassword ? 'text' : "password"}
                                                                // placeholder="Enter your password"
                                                                value={password}
                                                                onChange={(e) => setPassword(e.target.value)}
                                                                />
                                                                <span className="toggle-visibility" onClick={() => setShowPassword(!showPassword)}>
                                                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                                                                </span>
                                                            </div>  
                                        
                                                          <button style={{marginTop: ' 20px', width: ' 100%'}}>Set new password</button>
                                                          
                                                        </div>
                                                       </form>
                                                    </div>
                                                  </div>
                                )
        
                                }
        <Offcanvas />
        <div>
        <h1>Frequently Asked Questions
        </h1>
        <div class="accordion" id="accordionExample">
            <div class="accordion-item">
                <h2 class="accordion-header">
                <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                    What is TutorLink?
                </button>
                </h2>
                <div id="collapseOne" class="accordion-collapse collapse show" data-bs-parent="#accordionExample">
                <div class="accordion-body">
                    <strong>TutorLink</strong> is a platform that allows students to know their academic tutors and project supervisors and vice versa. Students can now schedule meetings without having to see the lecturer first. Lecturers too are able to know all the students who have them as their academic tutor and even have a live chat with them using the TutorLink platform 
                </div>
                </div>
            </div>
            <div class="accordion-item">
                <h2 class="accordion-header">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                    Who can use Tutorlink?
                </button>
                </h2>
                <div id="collapseTwo" class="accordion-collapse collapse" data-bs-parent="#accordionExample">
                <div class="accordion-body">
                 TutorLink is available to all students and lecturers 
                  </div>
                </div>
            </div>
           
            <div class="accordion-item">
                <h2 class="accordion-header">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                    Can I message a lecturer after sending a meeting request?
                </button>
                </h2>
                <div id="collapseThree" class="accordion-collapse collapse" data-bs-parent="#accordionExample">
                <div class="accordion-body">
                   Yes, you can use the chat section to further communicate with your lecturers to negotiate meeting times and find out why some meeting requests were rejected.
                </div>
                </div>
            </div>

            <div class="accordion-item">
                <h2 class="accordion-header">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse4" aria-expanded="false" aria-controls="collapse4">
                    Is there customer support?
                </button>
                </h2>
                <div id="collapse4" class="accordion-collapse collapse" data-bs-parent="#accordionExample">
                <div class="accordion-body">
                        Absolutely. You can email us directly at <address>ksom316@gmail.com.</address>
                </div>
                </div>
            </div>
        </div>
        </div>
    </div>
      </div>
        <Footer />
      </>
    );
}

export default Help