import React from "react";
import Navbar from "./Navbar";
import Offcanvas from "./Offcanvas";
import './Homepage.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faComments } from "@fortawesome/free-regular-svg-icons";
import { faChalkboardTeacher, faExclamation, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { faPeopleArrows } from "@fortawesome/free-solid-svg-icons";
import { FaEyeSlash } from "react-icons/fa";
import { FaEye } from "react-icons/fa";
import ProfileModal from "./ProfileModal";
import { useState } from "react";

function ProjectSupervisor () {
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isLogoutOpen, setIsLogoutOpen] = useState(false);
    const [isChangePassword, setIsChangePassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState('');
    
    return (
        <>
           <Navbar>
                <button class="btn btn-primary"  style={{backgroundColor: 'rgb(4, 10, 34)', marginRight:'20px'}} type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasWithBothOptions" aria-controls="offcanvasWithBothOptions">☰</button>
                <div>
                <h2 style={{color: 'rgb(4,10,34)'}}>TutorLink - Student Portal</h2>

                </div>
                
                <div className="user">
                        <div className="username">
                            Username
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
         
          <div className="main">
          <div>  
                { isProfileOpen && <ProfileModal onClose={ () =>  setIsLogoutOpen(false)} />       
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
                                                            <button className="homepage-buttons" onClick={() => {setIsLogoutOpen(false); navigate('/Login')}} style={{marginRight: " 50px"}}>Yes</button>
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
            </div>
          <div className="container d-flex flex-column justify-content-center align-items-center min-vh-100">
             <div className="d-flex justify-content-center flex-wrap gap-3">
                <div className="card text-bg-warning mb-3 text-white fixed-card">
                  <FontAwesomeIcon icon={faChalkboardTeacher} size="2x" style={{ margin: "10px" }} />
                  <div className="card-body d-flex flex-column" onClick={() => navigate('/KnowYourTutor')}>
                    <h5 className="card-title">Know Your Academic Tutor</h5>
                    <p className="card-text">Discover more information about your academic tutor</p>
                  </div>
                </div>
            
                <div className="card text-bg-warning mb-3 text-white fixed-card" onClick={() => navigate('/Chat')}>
                  <FontAwesomeIcon icon={faComments} size="2x" style={{ margin: "10px" }} />
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title">Chat With Your Academic Tutor</h5>
                    <p className="card-text">An opportunity to have a conversation with your academic tutor.</p>
                  </div>
                </div>
            
                <div className="card text-bg-warning mb-3 text-white fixed-card" onClick={ () => navigate('/Schedule-Meeting')}>
                  <FontAwesomeIcon icon={faPeopleArrows} size="2x" style={{ margin: "10px" }} />
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title">Schedule Meeting</h5>
                    <p className="card-text">Schedule a date to meet your Tutor</p>
                  </div>
                </div>
              </div>
              </div>
          </div>
        </>
    );
}

export default ProjectSupervisor;

