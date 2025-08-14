import React from "react";
import LecturerOffcanvas from "./LecturerOffcanvas";
import LecturerProfileModal from "./LectureProfileModal";
import Navbar from "../Navbar";
import "../Homepage.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEyeSlash } from "react-icons/fa";
import { FaEye } from "react-icons/fa";
import { FaSearch } from "react-icons/fa";
import { getStudents, cancelMeeting, sendMessageL, createMeetingR, createMeeting, checkForExistingMeeting, getSchedule, changeStudentPassword, createMeetingS } from "../firebaseFunctions";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Timestamp } from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import Footer from "../Footer";
import HomeButton from "../HomeButton";
import Modals from "../components/ModalsL";

function LecturerSchedules () {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const navigate = useNavigate();
    const [isLogoutOpen, setIsLogoutOpen] = useState(false);
    const [isChangePassword, setIsChangePassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState('');
    const [cancel, setCancel] = useState(false);
    const [cancelled, setCancelled] = useState(false);
    const [reference, setReference] = useState('');

    const [rescheduling, setRescheduling] = useState(false);
    const [reschedule, setReschedule] = useState(false);
    const [inPerson, setInPerson] = useState(false);
    const [virtual, setVirtual] = useState(false);
    const [meetingDate, setMeetingDate] = useState('');
    const [meetingTime, setMeetingTime] = useState('');
    const [meetingLocation, setMeetingLocation] = useState('');
     const [students, setStudents] = useState([]);
            const [searchTerm, setSearchTerm] = useState('');
        const [meetingModal, setMeetingModal] = useState(false);
        const [path, setPath] = useState('');
        const [confirm, setConfirm] = useState(false);
        const tutorId = localStorage.getItem('tutorId')
        const [hasConfirmedMeeting, setHasConfirmedMeeting] = useState(false);
        const [showModal, setShowModal] = useState(false);
        const [alreadyConfirmedModal, setAlreadyConfirmedModal] = useState(false);
        const [scheduledStudents, setScheduledStudents] = useState([]);
            const [schedules, setSchedules] = useState([]);
            const [meetingLink, setMeetingLink] = useState('');
            const [confirmed, setConfirmed] = useState(false);

            

            const [lecturerName, setLecturerName] = useState('');
                    
                         const [username, setUsername] = useState('');
                                      useEffect(() => {
                                               const tutorId = localStorage.getItem('tutorId');
                                 
                                               if (tutorId) {
                                                   const fetchLecturerData = async () =>{
                                                               // const tutorId = localStorage.getItem("tutorId");
                                                               // if(!tutorId) return;
                                                       
                                                               const docRef = doc(db, "tutorInfo", tutorId);
                                                               const docSnap = await getDoc(docRef)
                                                               const name = docSnap.data().name
                                                               const username = docSnap.data().username
                         
                                                               // if (docSnap.exists()){
                                                                 setLecturerName(name);
                                                                 setUsername(username);
                                                               // }
                                                             };
                                                       
                                                             fetchLecturerData();
                                               }
                                             }, []);
                
              const handleSend = async () => {
               if (inputText.trim() !== "") {
                 await sendMessageL(tutorId, referenceNumber, inputText);
                 setInputText("");
               }
             };
            
          useEffect(() => {
                 const loadStudents = async () => {
                     const tutorId = localStorage.getItem("tutorId");
                     if (tutorId) {
                         try {
                             const data = await getStudents(tutorId);
                             setStudents(data);
             
                             const scheduled = [];
                             const details = [];
                             
                             for (let student of data) {
                                const path = `${student.id}_${tutorId}`;
                                const result = await checkForExistingMeeting(path);
                                const schedule = await getSchedule(path);
                            
                                // If schedule exists (confirmed or unconfirmed)
                                if (schedule) {
                                    scheduled.push(student.id);
                                    details.push(schedule);
                                }
                            }
                            
             
                             setScheduledStudents(scheduled);
                             setSchedules(details);
                         } catch (error) {
                             console.error("Error fetching data:", error);
                         }
                     }
                 };
             
                 loadStudents();
             }, []);

             const refreshSchedules = async () => {
                const tutorId = localStorage.getItem("tutorId");
                if (!tutorId) return;
              
                try {
                  const data = await getStudents(tutorId);
                  setStudents(data);
              
                  const scheduled = [];
                  const details = [];
              
                  for (let student of data) {
                    const path = `${student.id}_${tutorId}`;
                    const result = await checkForExistingMeeting(path);
                    const schedule = await getSchedule(path);
              
                    if (schedule) {
                      scheduled.push(student.id);
                      details.push(schedule);
                    }
                  }
              
                  setScheduledStudents(scheduled);
                  setSchedules(details);
                } catch (error) {
                  console.error("Error refreshing schedules:", error);
                }
              };
              
               
                           
                         
                           const filteredStudents = students.filter(student =>
                             (student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              student.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              student.id?.toLowerCase().includes(searchTerm.toLowerCase()))
                         );
                
                         const [loading, setLoading] = useState(false); // Add this to your component state
         
                         const handleOpenMeetingModal = async () => {
                             setMeetingModal(true); // Close the meeting modal first
                              
                         };

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
                             

      
      const scheduledData = filteredStudents
  .filter(student => scheduledStudents.includes(student.id))
  .map(student => {
    const scheduleIndex = scheduledStudents.indexOf(student.id);
    const schedule = schedules[scheduleIndex];
    return { student, schedule };
  });

const confirmedSchedules = scheduledData.filter(({ schedule }) => schedule?.status === 'confirmed');
const unconfirmedSchedules = scheduledData.filter(({ schedule }) => schedule?.status !== 'confirmed');

const filteredConfirmedSchedules = confirmedSchedules.filter(item => item.schedule?.status !== 'cancelled');
const filteredUnconfirmedSchedules = unconfirmedSchedules.filter(item => item.schedule?.status !== 'cancelled');

    
    return (
        <>
            <Navbar>
                <button class="btn btn-primary"  style={{backgroundColor: 'rgb(4, 10, 34)', marginRight:'20px'}} type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasWithBothOptions" aria-controls="offcanvasWithBothOptions">☰</button>
                <div>
                <h2 style={{color: 'white'}}>TutorLink - Lecturer Portal</h2>
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
                                <li><div class="dropdown-item" onClick={() => navigate('/LHelp')}>Help</div></li>
                                <li><div class="dropdown-item" onClick={() => {setIsLogoutOpen(true)}} >Logout</div></li>
                                <li><div class="dropdown-item"  onClick={() => {setIsChangePassword(true)}} >Change Password</div></li>
                                
                        
                            </ul>
                        </div>
                    </div>
            </Navbar>
            <div className="main3 ">
                <HomeButton />
        <div>  
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
                                        { cancel && (
                                            <>
                                                <div className="meeting-modal-backdrop">
                                                        <div className="meeting-modal">
                                                        <button className="close-button" onClick={() => setCancel(false)}>X</button>     
                                            
                                                        <h2>Cancel meeting</h2> 
                                                        <hr style={{ width: '100%', border: '0.5px solid black', margin: '1rem 0' }} />
                                                        
                                                        <div>Are you sure you want to cancel this meeting?</div>
                                                        <div style={{position: 'relative'}}>
                                                            <div style={{display: 'flex', justifyContent: 'center', position: 'absolute', top:'50px', left: '30px' }}>
                                                            <button className="homepage-buttons"  style={{marginRight: " 50px"}} onClick={async () => {
                                                        await cancelMeeting(path);
                                                        await refreshSchedules(); 
                                                        setCancel(false);
                                                        setCancelled(true);
                                                        }}
                                                        >Yes</button>
                                                            <button className="homepage-buttons" onClick={() => { setCancel(false);}}>No</button>
                                                            </div>
                                                        </div>
                                                        </div>
                                                </div>     
                                            </>
                                        )}
                                        
                                        {cancelled && (
                                              <div className="meeting-modal-backdrop">
                                              <div className="meeting-modal">
                                                  <button className="close-button" onClick={() =>{ {setCancelled(false) }}}>X</button>
                                                  <h2>Your schedule has <br/>been cancelled succesfully</h2>
                                                  <hr />
                                                  {/* <div>Wait for your tutor to confirm the meeting, date, and time.</div> */}
                                                  <div className="modal-actions">
                                                      <button className="homepage-buttons" style={{marginLeft:"150px", marginTop: "50px"}} onClick={() => { 
                                                         setCancelled(false); window.location.reload();
                                                      }}>Okay</button>
                                                  </div>
                                              </div>
                                          </div>
                                        )} 

                                        { reschedule && (
                                            <>
                                                <div className="meeting-modal-backdrop">
                                                        <div className="meeting-modal">
                                                        <button className="close-button" onClick={() => setReschedule(false)}>X</button>     
                                            
                                                        <h2>Schedule Meeting</h2> 
                                                        <hr style={{ width: '100%', border: '0.5px solid black', margin: '1rem 0' }} />
                                                        
                                                        <div>How would you like to meet this student? </div>
                                                        <div style={{position: 'relative'}}>
                                                            <div style={{display: 'flex', justifyContent: 'center', position: 'absolute', top:'50px', left: '30px' }}>
                                                            <button className="homepage-buttons" onClick={() => {setInPerson(true)}} style={{marginRight: " 50px"}}>In Person</button>
                                                            <button className="homepage-buttons" onClick={() => setVirtual(true)}>Virtually </button>
                                                            </div>
                                                        </div>
                                                        </div>
                                                </div>     
                                            </>
                                        )}
                                     {reschedule && inPerson && (
                                        <div className="meeting-modal-backdrop">
                                            <div className="meeting-modal" style={{height: '450px'}}>
                                            <button className="close-button" onClick={() => setInPerson(false)}>X</button>

                                            <h2>In-Person Meeting Schedule</h2>
                                            <hr style={{ width: '100%', border: '0.5px solid black', margin: '1rem 0' }} />

                                              <form
                                                onSubmit={async (e) => {
                                                    e.preventDefault();

                                                    // Combine date and time into a JS Date object
                                                    const combinedDateTime = new Date(`${meetingDate}T${meetingTime}`);

                                                    // Convert to Firestore Timestamp
                                                    const meetingTimestamp = Timestamp.fromDate(combinedDateTime);

                                                    const result = await createMeetingS(path, 'in-person', meetingTimestamp, meetingLocation, "");

                                                    if (result.success) {
                                                    setConfirm(true);
                                                    } else {
                                                  {
                                                    alert(result.message || `Error: ${result.error}`);
                                                    }
                                                    }

                                                    setReschedule(false);
                                                    setInPerson(false);
                                                    setMeetingDate('');
                                                    setMeetingTime('');
                                                    setMeetingLocation('');

                                                }}

                                                style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}
                                                >    
                                                <label>                                           
                                                Date:
                                                <input
                                                    type="date"
                                                    required
                                                    className="form-control"
                                                    value={meetingDate}
                                                    onChange={(e) => setMeetingDate(e.target.value)}
                                                    min={new Date().toISOString().split('T')[0]} 
                                                />
                                                </label>

                                                <label>
                                                Time(24 hr format):
                                                <input
                                                    type="time"
                                                    required
                                                    className="form-control"
                                                    value={meetingTime}
                                                    onChange={(e) => setMeetingTime(e.target.value)}
                                                />
                                                </label>

                                                <label>
                                                Location:
                                                <input
                                                    type="text"
                                                    placeholder="Enter location"
                                                    required
                                                    className="form-control"
                                                    value={meetingLocation}
                                                    onChange={(e) => setMeetingLocation(e.target.value)}
                                                />
                                                </label>

                                                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1rem' }}>
                                                <button type="submit" className="homepage-buttons">Confirm</button>
                                                <button type="button" className="homepage-buttons" onClick={() => setInPerson(false)}>Cancel</button>
                                                </div>
                                            </form>
                                        </div>
                                        </div>
                                        )}
                                     {reschedule && virtual && (
                                        <div className="meeting-modal-backdrop">
                                            <div className="meeting-modal" style={{height: '450px'}}>
                                            <button className="close-button" onClick={() => setVirtual(false)}>X</button>

                                            <h2>Virtual Meeting Schedule</h2>
                                            <hr style={{ width: '100%', border: '0.5px solid black', margin: '1rem 0' }} />

                                           <form
                                            onSubmit={async (e) => {
                                                e.preventDefault();

                                                // Combine date and time into a JS Date object
                                                const combinedDateTime = new Date(`${meetingDate}T${meetingTime}`);

                                                // Convert to Firestore Timestamp
                                                const meetingTimestamp = Timestamp.fromDate(combinedDateTime);

                                                const result = await createMeetingS(path, 'virtual', meetingTimestamp, meetingLocation, meetingLink);

                                                if (result.success) {
                                                setConfirm(true);
                                                } else {
                                                alert(result.message || `Error: ${result.error}`);
                                                }

                                                setReschedule(false);
                                                setVirtual(false);
                                                setMeetingDate(''); setMeetingTime(''); setMeetingLocation('');
                                                setMeetingLink('');

                                            }}
                                            style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}
                                            >

                                            <label>
                                            Date:
                                            <input
                                                type="date"
                                                required
                                                className="form-control"
                                                value={meetingDate}
                                                onChange={(e) => setMeetingDate(e.target.value)}
                                                min={new Date().toISOString().split('T')[0]} 
                                            />
                                            </label>

                                            <label>
                                            Time(24 hr format):
                                            <input
                                                type="time"
                                                required
                                                className="form-control"
                                                value={meetingTime}
                                                onChange={(e) => setMeetingTime(e.target.value)}
                                            />
                                            </label>

                                            <label>
                                                Virtual Meeting Link:
                                                <input
                                                    type="url"
                                                    required
                                                    className="form-control"
                                                    value={meetingLink}
                                                    onChange={(e) => setMeetingLink(e.target.value)}
                                                    placeholder="https://example.com/meeting-link"
                                                />
                                            </label>

                                        

                                            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1rem' }}>
                                            <button type="submit" className="homepage-buttons">Confirm</button>
                                            <button type="button" className="homepage-buttons" onClick={() => setVirtual(false)}>Cancel</button>
                                            </div>
                                        </form>
                                        </div>
                                        </div>
                                        )}

                                            { rescheduling && (
                                            <>
                                                <div className="meeting-modal-backdrop">
                                                        <div className="meeting-modal">
                                                        <button className="close-button" onClick={() => setRescheduling(false)}>X</button>     
                                            
                                                        <h2>Schedule Meeting</h2> 
                                                        <hr style={{ width: '100%', border: '0.5px solid black', margin: '1rem 0' }} />
                                                        
                                                        <div>How would you like to meet this student? </div>
                                                        <div style={{position: 'relative'}}>
                                                            <div style={{display: 'flex', justifyContent: 'center', position: 'absolute', top:'50px', left: '30px' }}>
                                                            <button className="homepage-buttons" onClick={() => {setInPerson(true)}} style={{marginRight: " 50px"}}>In Person</button>
                                                            <button className="homepage-buttons" onClick={() => setVirtual(true)}>Virtually </button>
                                                            </div>
                                                        </div>
                                                        </div>
                                                </div>     
                                            </>
                                        )}
                                     {rescheduling && inPerson && (
                                        <div className="meeting-modal-backdrop">
                                            <div className="meeting-modal" style={{height: '450px'}}>
                                            <button className="close-button" onClick={() => setInPerson(false)}>X</button>

                                            <h2>In-Person Meeting Schedule</h2>
                                            <hr style={{ width: '100%', border: '0.5px solid black', margin: '1rem 0' }} />

                                            <form
                                                onSubmit={async (e) => {
                                                    e.preventDefault();

                                                    // Combine date and time into a JS Date object
                                                    const combinedDateTime = new Date(`${meetingDate}T${meetingTime}`);
                                                    const meetingTimestamp = Timestamp.fromDate(combinedDateTime);

                                                    const result = await createMeetingS(path, 'in-person', meetingTimestamp, meetingLocation, "");

                                                    if (result.success) {
                                                    setConfirmed(true);

                                                    // Format the date/time string
                                                    const formattedDateTime = combinedDateTime.toLocaleString('en-GB', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    });

                                                    // Send message to student with new meeting info
                                                    const message = `Your in-person meeting has been rescheduled to ${formattedDateTime} at ${meetingLocation}.`;
                                                    await sendMessageL(tutorId, reference, message);
                                                    } else {
                                                    alert(result.message || `Error: ${result.error}`);
                                                    }

                                                    setRescheduling(false);
                                                    setInPerson(false);
                                                    setMeetingDate('');
                                                    setMeetingTime('');
                                                    setMeetingLocation('');
                                                }}

                                                style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}
                                                >
                                                <label>                                           
                                                Date:
                                                <input
                                                    type="date"
                                                    required
                                                    className="form-control"
                                                    value={meetingDate}
                                                    onChange={(e) => setMeetingDate(e.target.value)}
                                                    min={new Date().toISOString().split('T')[0]} 
                                                />
                                                </label>

                                                <label>
                                                Time(24 hr format):
                                                <input
                                                    type="time"
                                                    required
                                                    className="form-control"
                                                    value={meetingTime}
                                                    onChange={(e) => setMeetingTime(e.target.value)}
                                                />
                                                </label>

                                                <label>
                                                Location:
                                                <input
                                                    type="text"
                                                    placeholder="Enter location"
                                                    required
                                                    className="form-control"
                                                    value={meetingLocation}
                                                    onChange={(e) => setMeetingLocation(e.target.value)}
                                                />
                                                </label>

                                                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1rem' }}>
                                                <button type="submit" className="homepage-buttons">Confirm</button>
                                                <button type="button" className="homepage-buttons" onClick={() => setInPerson(false)}>Cancel</button>
                                                </div>
                                            </form>
                                        </div>
                                        </div>
                                        )}
                                     {rescheduling && virtual && (
                                        <div className="meeting-modal-backdrop">
                                            <div className="meeting-modal" style={{height: '450px'}}>
                                            <button className="close-button" onClick={() => setVirtual(false)}>X</button>

                                            <h2>Virtual Meeting Schedule</h2>
                                            <hr style={{ width: '100%', border: '0.5px solid black', margin: '1rem 0' }} />

                                            <form
                                                onSubmit={async (e) => {
                                                    e.preventDefault();

                                                    const combinedDateTime = new Date(`${meetingDate}T${meetingTime}`);
                                                    const meetingTimestamp = Timestamp.fromDate(combinedDateTime);

                                                    const result = await createMeetingS(path, 'virtual', meetingTimestamp, meetingLocation, meetingLink);

                                                    if (result.success) {
                                                    setConfirmed(true);

                                                    // Format the date/time nicely
                                                    const formattedDateTime = combinedDateTime.toLocaleString('en-GB', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    });

                                                    // Compose and send message
                                                    const message = `Your virtual meeting has been rescheduled to ${formattedDateTime}. Join using this link: ${meetingLink}`;
                                                    await sendMessageL(tutorId, reference, message);
                                                    } else {
                                                    alert(result.message || `Error: ${result.error}`);
                                                    }

                                                    setRescheduling(false);
                                                    setVirtual(false);
                                                    setMeetingDate('');
                                                    setMeetingTime('');
                                                    setMeetingLocation('');
                                                    setMeetingLink('');
                                                }}
                                                style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}
                                                >


                                            <label>
                                            Date:
                                            <input
                                                type="date"
                                                required
                                                className="form-control"
                                                value={meetingDate}
                                                onChange={(e) => setMeetingDate(e.target.value)}
                                                min={new Date().toISOString().split('T')[0]} 
                                            />
                                            </label>

                                            <label>
                                            Time(24 hr format):
                                            <input
                                                type="time"
                                                required
                                                className="form-control"
                                                value={meetingTime}
                                                onChange={(e) => setMeetingTime(e.target.value)}
                                            />
                                            </label>

                                            <label>
                                                Virtual Meeting Link:
                                                <input
                                                    type="url"
                                                    required
                                                    className="form-control"
                                                    value={meetingLink}
                                                    onChange={(e) => setMeetingLink(e.target.value)}
                                                    placeholder="https://example.com/meeting-link"
                                                />
                                            </label>

                                        

                                            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1rem' }}>
                                            <button type="submit" className="homepage-buttons">Confirm</button>
                                            <button type="button" className="homepage-buttons" onClick={() => setVirtual(false)}>Cancel</button>
                                            </div>
                                        </form>
                                        </div>
                                        </div>
                                        )}


                                        {confirm && (
                                              <div className="meeting-modal-backdrop">
                                              <div className="meeting-modal">
                                                  <button className="close-button" onClick={() =>{ {setConfirm(false) }}}>X</button>
                                                  <h2>Your meeting has <br/>been scheduled succesfully</h2>
                                                  <hr />
                                                  {/* <div>Wait for your tutor to confirm the meeting, date, and time.</div> */}
                                                  <div className="modal-actions">
                                                      <button className="homepage-buttons" style={{marginLeft:"150px", marginTop: "50px"}} onClick={() => { 
                                                         setConfirm(false); window.location.reload();
                                                      }}>Okay</button>
                                                  </div>
                                              </div>
                                          </div>
                                        )}  

                                        
                                            {confirmed && (
                                              <div className="meeting-modal-backdrop">
                                              <div className="meeting-modal">
                                                  <button className="close-button" onClick={() =>{ {setConfirmed(false) }}}>X</button>
                                                  <h2>Your meeting has <br/>been re-scheduled succesfully</h2>
                                                  <hr />
                                                  <p>A chat message has been sent to the student with the new meeting details.</p>
                                                  {/* <div>Wait for your tutor to confirm the meeting, date, and time.</div> */}
                                                  <div className="modal-actions">
                                                      <button className="homepage-buttons" style={{marginLeft:"150px", marginTop: "10px"}} onClick={() => { 
                                                         setConfirmed(false); window.location.reload();
                                                      }}>Okay</button>
                                                  </div>
                                              </div>
                                          </div>
                                        )} 
                
                <LecturerOffcanvas />

        
        </div>
        
        
        
        <div className="table-container">
        <div style={{ margin: '20px 20px 20px 0', fontSize: '22px', display: 'flex', justifyContent: 'flex-start' }}>
        You have {filteredConfirmedSchedules.length} confirmed schedule(s) and {filteredUnconfirmedSchedules.length} unconfirmed schedule(s)
        </div>


        <div className="search-bar-wrapper">
            <div className="search-bar">
            <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="search-icon" />
        </div>
        </div>
        
        <caption style={{color: 'white', display: 'flex', flex: 'flex-center', fontSize: '30px'}}>Schedule List</caption>


        <table class="table table-striped table-hover">
            <thead>
                <tr>
                <th scope="col">#</th>
                <th scope="col">Student Name</th>
                <th scope="col">Meeting Type</th>
                <th scope="col">Meeting Date</th>
                <th scope="col">Meeting time</th>
                <th scope="col">Location</th>
                <th scope="col">Meeting Link</th>
                <th scope="col">Status</th>
                <th scope="col">Actions</th>




                </tr>
            </thead>
            <tbody>
                {[...filteredConfirmedSchedules, ...filteredUnconfirmedSchedules].map(({ student, schedule }, index) => {
                    const isConfirmed = schedule?.status === "confirmed";
                    
                    return (
                    <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{student.fullName}</td>
                        <td>{schedule?.type || 'N/A'}</td>
                        <td>{schedule?.date?.toDate().toLocaleDateString() || 'N/A'}</td>
                        <td>{schedule?.date?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'N/A'}</td>
                        <td>{schedule?.location || 'N/A'}</td>
                        <td>{schedule?.meetingLink || 'N/A'}</td>

                        <td>
                        <span className={`badge ${isConfirmed ? 'bg-success' : 'bg-warning'}`}>
                            {isConfirmed ? 'Confirmed' : 'Unconfirmed'}
                        </span>
                        </td>
                        <td>
                        {isConfirmed ? (
                            <>
                            <button className="btn btn-danger btn-sm me-1 mb-1" onClick={() => { setCancel(true); setPath(`${student.id}_${tutorId}`) }}>Cancel</button>
                            <button className="btn btn-primary btn-sm" onClick={() => { setRescheduling(true); setPath(`${student.id}_${tutorId}`); setReference(student.id) }}>Reschedule</button>
                            </>
                        ) : (
                            <>
                            <button className="btn btn-success btn-sm me-1 mb-1" onClick={() => { setReschedule(true); setPath(`${student.id}_${tutorId}`) }}>Confirm Details</button>
                            <button className="btn btn-danger btn-sm" onClick={() => { setCancel(true); setPath(`${student.id}_${tutorId}`) }}>Cancel</button>
                            </>
                        )}
                        </td>
                    </tr>
                    );
                })}
                </tbody>

        </table>
        </div>
        </div>
        <Footer />
        </>
    );
}
export default LecturerSchedules;