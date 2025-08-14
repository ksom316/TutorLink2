import React from "react";
import Navbar from "../Navbar";
import '../Homepage.css';
import LecturerOffcanvas from "./LecturerOffcanvas";
import LecturerProfileModal from "./LectureProfileModal";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEyeSlash } from "react-icons/fa";
import { FaEye } from "react-icons/fa";
import { FaSearch } from "react-icons/fa";
import { getStudents, createMeeting, getSchedule } from "../firebaseFunctions";
import { Timestamp } from "firebase/firestore";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { checkForExistingMeeting, changeStudentPassword } from "../firebaseFunctions";
import { getAuth, signOut } from "firebase/auth";
import Footer from "../Footer";
import HomeButton from "../HomeButton";
import Modals from "../components/ModalsL";

function LecturerMeeting () {


   
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const navigate = useNavigate();
    const [isLogoutOpen, setIsLogoutOpen] = useState(false);
    const [isChangePassword, setIsChangePassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState('');
    const [meetingModal, setMeetingModal] = useState(false);
    const [inPerson, setInPerson] = useState(false);
    const [virtual, setVirtual] = useState(false);
    const [meetingDate, setMeetingDate] = useState('');
    const [meetingTime, setMeetingTime] = useState('');
    const [meetingLocation, setMeetingLocation] = useState('');
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [path, setPath] = useState('');
    const [confirm, setConfirm] = useState(false);
    const tutorId = localStorage.getItem('tutorId')
    const [hasConfirmedMeeting, setHasConfirmedMeeting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [alreadyConfirmedModal, setAlreadyConfirmedModal] = useState(false);
    const [scheduledStudents, setScheduledStudents] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [lecturerName, setLecturerName] = useState('');
    const [meetingLink, setMeetingLink] = useState('');

    
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

                        if (result && result.success === false) {
                            scheduled.push(student.id); // or student.studentId depending on your schema
                            details.push(schedule.data);
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
      
                  
                
                  const filteredStudents = students.filter(student =>
                    (student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     student.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     student.id?.toLowerCase().includes(searchTerm.toLowerCase()))
                );
       
                const [loading, setLoading] = useState(false); // Add this to your component state

                const handleOpenMeetingModal = async () => {
                    setMeetingModal(true); // Close the meeting modal first
                     
                };
                
    
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
        {loading && (
            <div className="text-center my-3">
                <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
                </div>
            </div>
            )}


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
                                         {meetingModal && !alreadyConfirmedModal && (
                                            <>
                                                <div className="meeting-modal-backdrop">
                                                        <div className="meeting-modal">
                                                        <button className="close-button" onClick={() => setMeetingModal(false)}>X</button>     
                                            
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
                                     {meetingModal && inPerson && (
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

                                                    const result = await createMeeting(path, 'in-person', meetingTimestamp, meetingLocation);

                                                   if (result.success) {
                                                    setConfirm(true);
                                                    } else {
                                                    if (result.code === 'ALREADY_CONFIRMED') {
                                                    setAlreadyConfirmedModal(true); // Show modal
                                                    } else {
                                                    alert(result.message || `Error: ${result.error}`);
                                                    }
                                                    }

                                                    setMeetingModal(false);
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
                                                />
                                                </label>

                                                <label>
                                                Time:
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

                                     {meetingModal && virtual && (
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

                                                    const result = await createMeeting(path, 'virtual', meetingTimestamp, meetingLocation, meetingLink);

                                                    if (result.success) {
                                                    setConfirm(true);
                                                    } else {
                                                    alert(result.message || `Error: ${result.error}`);
                                                    }

                                                    setMeetingModal(false);
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
                                                />
                                                </label>

                                                <label>
                                                Time:
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
                                                         setConfirm(false); window.location.reload;
                                                      }}>Okay</button>
                                                  </div>
                                              </div>
                                          </div>
                                        )}
                <LecturerOffcanvas />

        
        </div>
        
        
        
        <div className="table-container">
        <div style={{margin: '20px 20px  20px 0', fontSize: '22px',display: 'flex', flex: 'flex-start'}}>
         Select a student to schedule a meeting with them
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
        
        <caption style={{color: 'white', display: 'flex', flex: 'flex-center', fontSize: '30px'}}>Student List</caption>


        <table className="table table-bordered">
  <thead>
    <tr>
      <th>#</th>
      <th>Full Name</th>
      <th>Student ID</th>
      <th>Year of Study</th>
      <th>Course</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
    {filteredStudents.map((student, index) => {
      const isScheduled = scheduledStudents.includes(student.id);

      return (
        <tr
          key={index}
          style={{
            backgroundColor: isScheduled ? '#f0f0f0' : 'white',
            cursor: isScheduled ? 'not-allowed' : 'pointer',
            pointerEvents: isScheduled ? 'none' : 'auto',
            opacity: isScheduled ? 0.6 : 1,
          }}
          onClick={() => {
            if (!isScheduled) {
              setPath(`${student.id}_${tutorId}`);
              handleOpenMeetingModal();
            }
          }}
        >
          <td>{index + 1}</td>
          <td>{student.fullName}</td>
          <td>{student.studentId}</td>
          <td>{student.yearOfStudy}</td>
          <td>{student.course}</td>
          <td>
            {isScheduled ? (
              <span className="badge bg-secondary">✅ Scheduled</span>
            ) : (
              <span className="badge bg-success">Available</span>
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

export default LecturerMeeting;