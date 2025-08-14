import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import '../Homepage.css';
import Navbar from '../Navbar'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faComments } from "@fortawesome/free-regular-svg-icons";
import { faChalkboardTeacher, faExclamation, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { faPeopleArrows } from "@fortawesome/free-solid-svg-icons";
import { FaCalendarAlt } from "react-icons/fa";
import { FaExclamation } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import { FaEye } from "react-icons/fa";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import LecturerOffcanvas from "./LecturerOffcanvas";
import LecturerProfileModal from "./LectureProfileModal";
import { changeStudentPassword, getLecturerSchedules, getStudents, getUnreadMessageCount, checkInactiveStudents } from "../firebaseFunctions";
import { doc, getDoc, collection, query, where, getDocs, Timestamp, onSnapshot, orderBy, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../firebase";
import { getAuth, signOut } from "firebase/auth";
import Footer from "../Footer";
import Modals from "../components/ModalsL";
// import tutorLink from '../assets/tutorLink.png';
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { messaging } from "../firebase";







function showNotification(title, body) {
  if (Notification.permission === "granted") {
    new Notification(`📢 TutorLink – ${title}`, {
      body,
      icon: '../assets/tutorLink.png'
    });
  }
}




function LecturerHome () {

    const [alerts, setAlerts] = useState([]);
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
        const [inactiveList, setInactiveList] = useState([]);
        const [showInactiveAlert, setShowInactiveAlert] = useState(true);
        const messaging = getMessaging();
         
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
      const [lecturerName, setLecturerName] = useState('');

      
          useEffect(() => {
          const fetchAlerts = async () => {
            const tutorId = localStorage.getItem('tutorId');
            if (!tutorId) return;

            try {
              const alertsRef = collection(db, 'Alerts');
              const q = query(alertsRef, where('tutorId', '==', tutorId), where('status', '==', 'unread'));
              const alertsSnapshot = await getDocs(q);
              const alertData = alertsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
              setAlerts(alertData);
            } catch (error) {
              console.error("Error fetching alerts:", error);
            }
          };

          fetchAlerts();
        }, []);

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
        
                    const [scheduleCount, setScheduleCount] = useState(0);
                    const tutorId = localStorage.getItem('tutorId');
                    const [calendarCount, setCalendarCount] = useState(0);

                    useEffect(() => {
                      const fetchScheduleCount = async () => {
                        if (tutorId) {
                          const schedules = await getLecturerSchedules(tutorId);
                    
                          // Filter schedules where status is "confirmed" or "unconfirmed"
                          const filteredSchedules = schedules.filter(schedule =>
                            schedule.status === "confirmed" || schedule.status === "unconfirmed"
                          );

                          const calendarSchedules = schedules.filter(schedule =>
                            schedule.status === "confirmed"
                          );
                    
                          setScheduleCount(filteredSchedules.length);
                          setCalendarCount(calendarSchedules.length)
                        }
                      };
                    
                      fetchScheduleCount();
                    }, []);
                    
const [totalUnreadMessages, setTotalUnreadMessages] = useState(0);
const initialLoadRef = useRef(true); // for notification gating

useEffect(() => {
  async function setupFCM() {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        console.warn("Notification permission not granted");
        return;
      }

      const messaging = getMessaging();

      const token = await getToken(messaging, {
        vapidKey: "BFe3eGdnGniA_wXCsvzSoNe6GL_ZX49rydDrVBhfpNKvgIS_vDD7n7gkZumg4ZDR-Yk0tUdbu4o7naYmHC0Llio",
      });

      if (token) {
        console.log("Fresh FCM token:", token);
        if (tutorId) {
          const tutorDocRef = doc(db, "tutorInfo", tutorId);
          await updateDoc(tutorDocRef, {
            fcmTokens: arrayUnion(token), // <-- This saves tokens in an array field
          });
          console.log("FCM token saved to Firestore array");
        }
      }

      // Foreground message handler
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log("Message received in foreground:", payload);
        if (payload?.notification && Notification.permission === "granted") {
          new Notification(payload.notification.title, {
            body: payload.notification.body,
            icon: payload.notification.icon || "/default-icon.png",
          });
        }
      });

      return unsubscribe; // cleanup on unmount
    } catch (err) {
      console.error("Error setting up FCM:", err);
    }
  }

  const unsubscribePromise = setupFCM();

  return () => {
    unsubscribePromise.then(unsub => {
      if (typeof unsub === "function") unsub();
    });
  };
}, [tutorId]); // <-- Dependency array as expected

useEffect(() => {
  const tutorId = localStorage.getItem("tutorId");
  if (!tutorId) return;

  const unsubscribes = [];

  const setupListeners = async () => {
    try {
      const students = await getStudents(tutorId);
      const unreadMap = {}; // store per-student unread counts

      students.forEach((student) => {
        const chatId = `${student.id}_${tutorId}`;
        const messagesRef = collection(db, "Chats", chatId, "messages");
        const q = query(messagesRef, orderBy("timestamp", "desc"));

        const unsub = onSnapshot(q, (snapshot) => {
          let unreadCount = 0;
          const newMessages = [];

          snapshot.forEach((doc) => {
            const msg = doc.data();
            if (msg.seen === false && msg.sender === student.id) {
              unreadCount++;
            }
          });

          // 📦 Save per-student unread count
          unreadMap[student.id] = unreadCount;

          // ✅ Recalculate totalUnreadMessages from all students
          const totalUnread = Object.values(unreadMap).reduce((sum, count) => sum + count, 0);
          setTotalUnreadMessages(totalUnread);

          // 🔔 Handle notifications
          if (!initialLoadRef.current) {
            snapshot.docChanges().forEach((change) => {
              const msg = change.doc.data();
              if (
                change.type === "added" &&
                msg.sender === student.id &&
                msg.seen === false
              ) {
                newMessages.push(msg);
              }
            });


          }
        });

        unsubscribes.push(unsub);
      });

      initialLoadRef.current = false;
    } catch (error) {
      console.error("Error setting up listeners:", error);
    }
  };

  // Notification.requestPermission();
  setupListeners();

  return () => {
    unsubscribes.forEach((unsub) => unsub());
  };
}, []);

             


                       useEffect(() => {
                        const fetchInactive = async () => {
                          const results = await checkInactiveStudents(tutorId);
                          setInactiveList(results);
                        };

                        if (tutorId) fetchInactive();
                      }, [tutorId]);


    return(
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

           
            <div className="main11">
            <div className="main">
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
                    <LecturerOffcanvas />
                    <div className="st-summary" style={{
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: '#0f1e3c',
                        color: 'white',
                        borderRadius: '12px',
                        padding: '20px',
                        width: '800px',
                        height: '200px',
                        margin: '20px auto',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                      }}>
                        <div style={{ textAlign: 'left' }}>
    <div style={{ fontSize: '40px', fontWeight: 'bold', marginLeft:'30px' }}>

                  <strong>Status Summary:</strong> 
                  </div>
                  <div style={{ fontSize: '20px', color: '#ccc',marginLeft:'30px' }}>
                  You have {scheduleCount > 0 ? scheduleCount : 0} schedule{scheduleCount === 1 ? '' : 's'} <em>(Go to Schedules to for more details / Go to Calendar to view confirmed schedules )</em>, {totalUnreadMessages} unread chat message{totalUnreadMessages === 1 ? '' : 's'}.
                  </div>
                   <div style={{ marginTop: '8px', fontSize: '14px', color: '#ffeeba' }}>     
    </div>
                       
  </div>
                </div>

{alerts.filter(alert => alert.status === 'unread' && !alert.type).length > 0 && (
  <div className="studentAlerts"
    style={{
      backgroundColor: "#0f1e3c",
      color: 'white',
      padding: '15px',
      borderRadius: '5px',
      margin: '20px auto',
      width: '80%',
      border: '1px solid #ffeeba'
    }}
  >
    {/* <div className="studentAlerts"> */}
    <h5 style={{ textAlign: 'center' }}>⚠️ Unread Student Alerts</h5>
    <div className="accordion" id="alertAccordion">
      {alerts
        .filter(alert => alert.status === 'unread' && !alert.type)
        .map((alert, index) => (
          <div className="accordion-item" key={alert.id}>
            <h2 className="accordion-header">
              <button
                className={`accordion-button ${index !== 0 ? 'collapsed' : ''}`}
                type="button"
                data-bs-toggle="collapse"
                data-bs-target={`#collapseAlert${index}`}
                aria-expanded={index === 0 ? 'true' : 'false'}
                aria-controls={`collapseAlert${index}`}
                style={{
                  backgroundColor: "darkred",
                  color: 'white',
                  fontSize: '0.95rem',
                }}
              >
                📌 Alert {index + 1}
              </button>
            </h2>
            <div
              id={`collapseAlert${index}`}
              className={`accordion-collapse collapse ${index === 0 ? 'show' : ''}`}
              data-bs-parent="#alertAccordion"
            >
              <div className="accordion-body" style={{ fontSize: '0.9rem' }}>
                {alert.message}
                <br />
                <small><strong>Alert sent on:</strong> {new Date(alert.timestamp?.seconds * 1000).toLocaleString()}</small><br />
                <small><strong>Student Name:</strong> {alert.studentName}</small><br />
                <small><strong>Reference Number:</strong> {alert.referenceNumber}</small>
                
              </div>
            </div>
          </div>
        ))}
    </div>
  </div>
  // </div>
)}



{inactiveList.length > 0 && showInactiveAlert && (
  // <div className="inactive">
  <div
    className="alert alert-warning inactive"
    style={{
      backgroundColor: "#0f1e3c",
      color: "white",
      padding: "15px",
      borderRadius: "5px",
      margin: "20px auto",
      width: "80%",
      textAlign: "center",
      border: "1px solid #ffeeba",
      borderRadius: "10px",
      position: "relative",
    }}
    
  >

    <h5>Inactive Students</h5>
    <ul>
      {inactiveList.map((student, index) => (
        <li key={index}>
          {student.fullName} hasn’t interacted{" "}
          {student.daysSinceChat > 180
            ? "in a very long time"
            : `in ${student.daysSinceChat} days`}
        </li>
      ))}
    </ul>
    <button
      onClick={() => setShowInactiveAlert(false)}
      style={{
        position: "absolute",
        top: "10px",
        right: "15px",
        background: "transparent",
        border: "none",
        fontSize: "16px",
        color: "white",
        cursor: "pointer",
      }}
    >
      ✖
    </button>
  </div>
  // </div>

)}

                    <div className="container d-flex flex-column justify-content-center align-items-center min-vh-100">
  {/* First row */}
  <div className="d-flex justify-content-center flex-wrap gap-3">

  </div>
                
  <div className="d-flex justify-content-center flex-wrap gap-3">
   

    
    <div className="card text-white" style={{
      backgroundColor: "#0f1e3c",
      borderRadius: "16px",
      width: "380px",
      padding: "20px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
      position: "relative"
    }}>
          <FontAwesomeIcon icon={faChalkboardTeacher} size="2x" style={{ margin: "10px",  color: "#FFA500" }} />
          <div className="card-body d-flex flex-column" onClick={() => navigate('/KnowYourStudents')}>
            <h5 style={{ color: "#FFA500", fontWeight: "bold" }}>My Students</h5>
            <p className="card-text">Discover more information about your academic tutor</p>
            <button
              onClick={() => navigate("/KnowYourStudents")}
              style={{
                marginTop: "15px",
                backgroundColor: "#FFA500",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "10px 15px",
                width: "100%",
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              Know Your Students →
            </button>
    
          </div>
        </div>

    <div className="card text-white" style={{
      backgroundColor: "#0f1e3c",
      borderRadius: "16px",
      width: "380px",
      padding: "20px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
      position: "relative" }} onClick={() => navigate('/ChatWithStudents')}>
  
        {/* Badge for unread messages */}
        {totalUnreadMessages > 0 && (
          <div style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            backgroundColor: "red",
            color: "white",
            borderRadius: "50%",
            width: "25px",
            height: "25px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px",
            fontWeight: "bold",
            zIndex: 1
          }}>
            {totalUnreadMessages}
          </div>
        )}

        <FontAwesomeIcon icon={faComments} size="2x" style={{ margin: "10px", color: "#2CE5C3" }} />
        <div className="card-body d-flex flex-column">
          <h5 className="card-title" style={{color: "#2CE5C3"}}>Chat With Your Students</h5>
          <p className="card-text">Have a conversation with your students and discuss meeting schedules with them</p>
          <button
          onClick={() => navigate("/ChatWithStudents")}
          style={{
            marginTop: "15px",
            backgroundColor: "#2CE5C3",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "10px 15px",
            width: "100%",
            fontWeight: "bold",
            cursor: "pointer"
          }}
          >
      Chat With Your Students →
      </button>
        </div>
      </div>

{/* Second row */}
  <div className="d-flex justify-content-center flex-wrap gap-3 mt-4"  >
  <div className="card text-white" style={{
          backgroundColor: "#0f1e3c",
          borderRadius: "16px",
          width: "380px",
          padding: "20px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          position: "relative" }}  onClick={ () => navigate('/LecturerMeeting')}>
      <FontAwesomeIcon icon={faPeopleArrows} size="2x" style={{ margin: "10px", color:'#FFA76A' }} />
      <div className="card-body d-flex flex-column">
        <h5 className="card-title" style={{color:'#FFA76A'}}>Schedule a Meeting With Your Students</h5>
        <p className="card-text">Schedule a date to meet your students</p>
         <button
          onClick={() => navigate("/LecturerMeeting")}
          style={{
            marginTop: "15px",
            backgroundColor: "#FFA76A",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "10px 15px",
            width: "100%",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          Schedule Meeting  →
        </button>
      </div>
    </div>

    {/* <div className="card text-bg-warning mb-3 text-white fixed-card" onClick={() => navigate('/NotificationsL')} >
      <FontAwesomeIcon icon={faExclamationCircle} size="2x" style={{ margin: "10px" }} />
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">Notifications</h5>
        <p className="card-text">Get notified about upcoming meetings and chats</p>
      </div>
    </div> */}

    {/* <div className="card text-bg-warning mb-3 text-white fixed-card">
      <FontAwesomeIcon icon={faUser} size="2x" style={{ margin: "10px" }} />
      <div className="card-body d-flex flex-column" onClick={() => navigate('/ProjectSupervisor')}>
        <h5 className="card-title">Project Supervising</h5>
        <p className="card-text">Manage students' mini projects and final year projects</p>
      </div>
    </div> */}

  <div className="card text-white" style={{
          backgroundColor: "#0f1e3c",
          borderRadius: "16px",
          width: "380px",
          padding: "20px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          position: "relative" }}  onClick={() => navigate('/LecturerSchedules')}>
  {/* Badge */}
  {scheduleCount > 0 && (
    <div style={{
      position: "absolute",
      top: "10px",
      left: "10px",
      backgroundColor: "red",
      color: "white",
      borderRadius: "50%",
      width: "25px",
      height: "25px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "14px",
      fontWeight: "bold"
    }}>
      {scheduleCount}
    </div>
  )}

  <FontAwesomeIcon icon={faCalendarAlt} size="2x" style={{ margin: "10px", color:'#FFA76A' }} />
  <div className="card-body d-flex flex-column">
    <h5 className="card-title" style={{color:'#FFA76A'}}>Schedules</h5>
    <p className="card-text">View upcoming virtual and in-person meetings</p>
    <button
          onClick={() => navigate("/LecturerSchedules")}
          style={{
            marginTop: "15px",
            backgroundColor: "#FFA76A",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "10px 15px",
            width: "100%",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          View Schedules  →
        </button>
  </div>
</div>

            

  </div>

        <div className="card text-white" style={{
          backgroundColor: "#0f1e3c",
          borderRadius: "16px",
          width: "380px",
          padding: "20px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          position: "relative" }}>

              {/* Badge */}
        {calendarCount > 0 && (
          <div style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            backgroundColor: "red",
            color: "white",
            borderRadius: "50%",
            width: "25px",
            height: "25px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px",
            fontWeight: "bold"
          }}>
            {calendarCount}
          </div>
        )}

      <FontAwesomeIcon icon={faCalendarAlt} size="2x" style={{ margin: "10px", color:'#6C63FF' }} />
      <div className="card-body d-flex flex-column" onClick={() => navigate('/LecturerCalendar')}>
        <h5 className="card-title" style={{color:'#6C63FF'}}>Calendar</h5>
        <p className="card-text">View your calendar to know about upcoming events and meetings</p>
         <button
          onClick={() => navigate("/LecturerCalendar")}
          style={{
            marginTop: "15px",
            backgroundColor: "#6C63FF",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "10px 15px",
            width: "100%",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          View Calendar →
        </button>
      </div>
    </div>

  </div>

 

            


  {/* <div className="p-4 bg-warning-subtle border rounded"> */}

 {/* {alerts.length > 0 && (
  <div
    className="card text-bg-warning mb-3 text-white fixed-card"
    style={{ width: '80%', marginTop: '20px' }}
  >
    <div className="card-body">
      <h4 className="card-title">⚠️ Student Alerts</h4>
      <ul style={{ paddingLeft: '1.2rem' }}>
        {alerts.map(alert => (
          <li key={alert.id} style={{ fontSize: '0.95rem' }}>
            {alert.message}
            <br />
            <small>{new Date(alert.timestamp?.seconds * 1000).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
  </div>
)} */}

{/* </div> */}

</div>
                    
</div>
            </div>
            <Footer />
       
        </>
 
    );
}

export default LecturerHome;
