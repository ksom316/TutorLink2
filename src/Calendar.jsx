import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './Homepage.css';
import Navbar from './Navbar';
import Offcanvas from './Offcanvas';
import ProfileModal from './ProfileModal';
import { useNavigate } from 'react-router-dom';
import { FaEyeSlash } from "react-icons/fa";
import { FaEye } from "react-icons/fa";
import { fetchTutorDetails,fetchConfirmedScheduleDates, fetchLecturerConfirmed, fetchStudentData, getStudents } from './firebaseFunctions';
import LecturerProfileModal from './Lecturer/LectureProfileModal';
import { doc, getDoc } from "firebase/firestore";
import { db } from './firebase'; 
import Offcanvas1 from './Lecturer/LecturerOffcanvas';
import { getAuth, signOut } from "firebase/auth";
import Footer from './Footer';
import HomeButton from './HomeButton';
import Modals from './components/Modals';
import { changeStudentPassword } from './firebaseFunctions';

function Calendar1() {
  const [date, setDate] = useState(new Date());
  const [isProfileOpen, setIsProfileOpen] = useState(false);
   const [isLogoutOpen, setIsLogoutOpen] = useState(false);
    const [isChangePassword, setIsChangePassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const [highlightedDates, setHighlightedDates] = useState ([]);
    const tutorId = localStorage.getItem('tutorId');
     const [firstName, setFirstName] = useState('');
     const [lecturerName, setLecturerName] = useState('')
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
            setPasswordError("");
            setPasswordSuccess("");
            setShowPassword(false);
          } else {
            setPasswordError(result.message);
          }
        };
    

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
          

              if (tutorId) {
                  const fetchLecturerData = async () =>{
                              // const tutorId = localStorage.getItem("tutorId");
                              // if(!tutorId) return;
                      
                              const docRef = doc(db, "tutorInfo", tutorId);
                              const docSnap = await getDoc(docRef)
                              const name = docSnap.data().name
                              // if (docSnap.exists()){
                                setLecturerName(name);
                              // }
                            };
                      
                            fetchLecturerData();
              }
            }, []);

            useEffect(() => {
              const loadStudentAndSchedule = async () => {
                const referenceNumber = localStorage.getItem("referenceNumber");
                const storedTutorId = localStorage.getItem("tutorId");
            
                let allHighlightedDates = [];
            
                if (referenceNumber) {
                  try {
                    const studentData = await fetchStudentData(referenceNumber);
                    const tutorId = studentData.tutorId;
            
                    // Get tutor name
                    const docRef = doc(db, "tutorInfo", tutorId);
                    const docSnap = await getDoc(docRef);
            
                    let tutorName = "Unknown Tutor";
                    if (docSnap.exists()) {
                      tutorName = docSnap.data().name;
                    }
            
                    // Fetch student's confirmed meeting dates
                    const dates = await fetchConfirmedScheduleDates(referenceNumber, tutorId);
                    const formattedDates = dates.map(date => ({
                      dateString: date.toDateString(),
                      name: tutorName
                    }));
            
                    allHighlightedDates = [...allHighlightedDates, ...formattedDates];
                  } catch (error) {
                    console.error("Error fetching student data:", error);
                  }
                }
            
                // if (storedTutorId) {
                //   try {
                //     const data = await fetchLecturerConfirmed(storedTutorId);
            
                //     const lecturerDates = data
                //       .map(schedule => {
                //         const scheduleDate = schedule.date?.toDate();
                //         return scheduleDate
                //           ? {
                //               dateString: scheduleDate.toDateString(),
                //               name: schedule.studentName
                //             }
                //           : null;
                //       })
                //       .filter(Boolean);
            
                //     allHighlightedDates = [...allHighlightedDates, ...lecturerDates];
                //   } catch (error) {
                //     console.error("Error fetching lecturer confirmed schedules:", error);
                //   }
                // }
            
                setHighlightedDates(allHighlightedDates);
              };
            
              loadStudentAndSchedule();
            }, []);
               
        const tileClassName = ({ date, view }) => {
        if (
          view === 'month' &&
          highlightedDates.some(d => d.dateString === date.toDateString())
        ) {
          return 'highlight'; 
        }
        return null;
      };


    const tileDisabled = ({ date, view }) => {
      // Disable all non-highlighted dates
      return view === 'month' && !highlightedDates.some(m => m.date.toDateString() === date.toDateString());
    };
  

  return (
    <>
     <Navbar>
         <button class="btn btn-primary"  style={{backgroundColor: 'rgb(4, 10, 34)', marginRight:'20px'}} type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasWithBothOptions" aria-controls="offcanvasWithBothOptions">☰</button>
           <div>
           <h2 style={{color: 'white'}}>{`TutorLink -  Student Portal`}</h2>
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
                        <li>
                            <div 
                              className="dropdown-item" 
                              onClick={() => navigate('/Help')}
                            >
                              Help
                            </div>
                          </li>
                        <li><div class="dropdown-item" onClick={() => {setIsLogoutOpen(true)}} >Logout</div></li>
                        <li><div class="dropdown-item"  onClick={() => {setIsChangePassword(true)}} >Change Password</div></li>
                      
                
                    </ul>
                </div>
            </div>
        </Navbar>
         
      
           
    <div className='main'>
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
    { ( lecturerName ? (<Offcanvas1 />) :  ( <Offcanvas />) )}
    <div className="calendar-wrapper">
      <h2 className="calendar-heading">C A L E N D A R</h2>

      <div className="calendar-container">
        <Calendar
          // onChange={setDate}
          value={date}
          tileClassName={tileClassName}
          tileDisabled={() => false}

        />
      </div>

      <p className="selected-date">Today is: <strong>{date.toDateString()}</strong></p>
        {/* ✅ Highlighted Dates Output */}
        <div className="highlighted-dates-list" style={{ marginTop: '20px' }}>
          <h5>Highlighted Dates (Confirmed Meetings):</h5>
         {highlightedDates.length > 0 ? (
            <ul>
              {highlightedDates.map((d, index) => (
                <li key={index}>
                  {d.dateString} — {d.name}
                </li>
              ))}
            </ul>
          ) : (
            <p>No confirmed meetings to show.</p>
          )}

        </div>
    </div>
    </div>
   <Footer />
    </>
  );
}

export default Calendar1;
