import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import './Homepage.css'
import Navbar from './Navbar'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faComments } from "@fortawesome/free-regular-svg-icons";
import { faChalkboardTeacher, faExclamation, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { faPeopleArrows } from "@fortawesome/free-solid-svg-icons";
import { FaCalendarAlt } from "react-icons/fa";
import { FaExclamation } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import { FaEye } from "react-icons/fa";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import ProfileModal from "./ProfileModal";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import Offcanvas from "./Offcanvas";
import { fetchStudentData, changeStudentPassword,getSchedule } from "./firebaseFunctions";
import { getDocs, doc, query, onSnapshot, orderBy, collection} from "firebase/firestore";
import { db, messaging } from "./firebase";
import { getAuth, signOut } from "firebase/auth";
import Footer from "./Footer";
import bg from './assets/background.jpg'
import Modals from "./components/Modals";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { updateDoc } from "firebase/firestore";
import { arrayUnion } from "firebase/firestore";

function requestNotificationPermission() {
  if ("Notification" in window) {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        console.log("✅ Notification permission granted");
      }
    });
  }
}

// function showNotification(title, body) {
//   if (Notification.permission === "granted") {
//     new Notification(`📢 TutorLink – ${title}`, {
//       body,
//       icon: '../assets/tutorLink.png'
//     });
//   }
// }

function Homepage () {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const navigate = useNavigate();
    const [isLogoutOpen, setIsLogoutOpen] = useState(false);
    const [isChangePassword, setIsChangePassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState('');
    const referenceNumber = localStorage.getItem('referenceNumber');
    
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');


useEffect(() => {
  async function requestPermissionAndGetToken() {
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        const messaging = getMessaging();

        // Get FCM token for the student device/browser
        const token = await getToken(messaging, {
          vapidKey: "BFe3eGdnGniA_wXCsvzSoNe6GL_ZX49rydDrVBhfpNKvgIS_vDD7n7gkZumg4ZDR-Yk0tUdbu4o7naYmHC0Llio",
        });

        if (token) {
          const studentId = localStorage.getItem("referenceNumber");
          if (studentId) {
            const studentDocRef = doc(db, "StudentRecords", studentId);
            // Add the token to the fcmTokens array (create if doesn't exist)
            await updateDoc(studentDocRef, {
              fcmTokens: arrayUnion(token),
            });
            console.log("FCM token added to Firestore array");
          }
        }

        // Listen for messages when app is in foreground
        onMessage(messaging, (payload) => {
          console.log("Message received in foreground:", payload);

          if (Notification.permission === "granted") {
            new Notification(payload.notification.title, {
              body: payload.notification.body,
              icon: payload.notification.icon || "/default-icon.png",
            });
          }
        });
      } else {
        console.warn("Notification permission not granted");
      }
    } catch (err) {
      console.error("Error getting permission or token:", err);
    }
  }

  requestPermissionAndGetToken();
}, []);

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
    
    const resetChangePasswordModal = () => {
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setPasswordError("");
      setPasswordSuccess("");
      setShowPassword(false);
      setIsChangePassword(false); // Close modal
    };
   
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

    const [hasSchedule, setHasSchedule] = useState(false);
   
    useEffect(() => {
      const checkSchedule = async () => {
        const referenceNumber = localStorage.getItem("referenceNumber");
    
        if (referenceNumber) {
          try {
            const studentData = await fetchStudentData(referenceNumber);
            const tutorId = studentData.tutorId;
            const schedulePath = `${referenceNumber}_${tutorId}`;
    
            const schedule = await getSchedule(schedulePath);
    
            // Only set to true if schedule exists and is confirmed
            setHasSchedule(schedule && schedule.status === "confirmed");
          } catch (error) {
            console.error("Error checking schedule:", error);
          }
        }
      };
    
      checkSchedule();
    }, []);
    
    
const [unreadCount, setUnreadCount] = useState(0);
const initialLoadRef = useRef(true);

useEffect(() => {
  const referenceNumber = localStorage.getItem("referenceNumber");
  if (!referenceNumber) return;

  const listenForUnreadMessages = async () => {
    try {
      const studentData = await fetchStudentData(referenceNumber);
      const tutorId = studentData.tutorId;
      const chatId = `${referenceNumber}_${tutorId}`;
      const messagesRef = collection(db, "Chats", chatId, "messages");

      const q = query(messagesRef, orderBy("timestamp", "desc"));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        let unreadTotal = 0;
        const newMessages = [];

        snapshot.forEach((doc) => {
          const msg = doc.data();
          if (msg.seen === false && msg.sender !== referenceNumber) {
            unreadTotal++;
          }
        });

        // ✅ Update total unread count for badge
        setUnreadCount(unreadTotal);

        // ✅ Now check for *just added* messages to trigger notifications
        if (!initialLoadRef.current) {
          snapshot.docChanges().forEach((change) => {
            const msg = change.doc.data();
            if (change.type === "added" && msg.seen === false && msg.sender !== referenceNumber) {
              newMessages.push(msg);
            }
          });

          if (newMessages.length === 1) {
            showNotification("📨 New message from academic tutor:", newMessages[0].text);
          } else if (newMessages.length > 1) {
            showNotification(`📨 ${newMessages.length} new messages`, "You’ve received multiple new messages.");
          }
        }

        initialLoadRef.current = false;
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Error setting up listener:", error);
    }
  };

  requestNotificationPermission();
  listenForUnreadMessages();
}, []);





    return(
        <> 
        <Navbar >
         <button class="btn btn-primary"  style={{backgroundColor: 'rgb(4, 10, 34)', marginRight:'20px'}} type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasWithBothOptions" aria-controls="offcanvasWithBothOptions">☰</button>
           <div>
           <h2 style={{color: 'rgb(255, 255, 255)'}}>TutorLink - Student Portal</h2>
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

            <div className="main11">
           
            <div >
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
  

  {/* Text content */}
  <div style={{ textAlign: 'left' }}>
    <div style={{ fontSize: '40px', fontWeight: 'bold', marginLeft:'30px' }}>
       <strong>Status Summary:</strong>
    </div>
    <div style={{ fontSize: '20px', color: '#ccc',marginLeft:'30px' }}>
      You have {hasSchedule ? 1 : 0} confirmed schedule{hasSchedule ? '' : 's'} <em>(use Calendar or Schedules to view)</em> and {unreadCount} unread message{unreadCount === 1 ? '' : 's'}.
    </div>
    <div style={{ marginTop: '8px', fontSize: '14px', color: '#ffeeba' }}>
      
    </div>
  </div>
</div>

                    <div className="container d-flex flex-column justify-content-center align-items-center min-vh-100">
  {/* First row */}
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
      <div className="card-body d-flex flex-column" onClick={() => navigate('/KnowYourTutor')}>
        <h5 style={{ color: "#FFA500", fontWeight: "bold" }}>My Academic Tutor</h5>
        <p className="card-text">Discover more information about your academic tutor</p>
        <button
          onClick={() => navigate("/KnowYourTutor")}
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
          Know Your Tutor →
        </button>

      </div>
    </div>
    <div
      className="card text-white" style={{
      backgroundColor: "#0f1e3c",
      borderRadius: "16px",
      width: "380px",
      padding: "20px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
      position: "relative" }}  
>
  
  {/* Unread Badge */}
  {unreadCount > 0 && (
    <div style={{
      position: "absolute",
      top: "10px",
      left: "10px",
      backgroundColor: "red",
      color: "white",
      borderRadius: "50%",
      width: "24px",
      height: "24px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontSize: "14px",
      fontWeight: "bold",
      zIndex: 10
    }}>
      {unreadCount}
    </div>
  )}

  <FontAwesomeIcon icon={faComments} size="2x" style={{ margin: "10px", color: "#2CE5C3" }} />
  <div className="card-body d-flex flex-column"  onClick={() => { navigate('/Chat'); } }>
    <h5 className="card-title" style={{ color: "#2CE5C3", fontWeight: "bold" }}>Chat</h5>
    <p className="card-text">An opportunity to have a conversation with your academic tutor.</p>
    <button
      onClick={() => navigate("/Chat")}
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
      Chat With Your Academic Tutor →
    </button>

  </div>
</div>

 {/* Second row */}
  <div className="d-flex justify-content-center flex-wrap gap-3 mt-4"  >
       <div  className="card text-white" style={{
          backgroundColor: "#0f1e3c",
          borderRadius: "16px",
          width: "380px",
          padding: "20px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          position: "relative" }}  onClick={ () => navigate('/ScheduleMeeting')}>
      <FontAwesomeIcon icon={faPeopleArrows} size="2x" style={{ margin: "10px", color:'#FFA76A' }} />
      <div className="card-body d-flex flex-column">
        <h5 className="card-title" style={{color: '#FFA76A'}}>Schedule Meeting</h5>
        <p className="card-text">Schedule a date to meet your Tutor</p>
        <button
          onClick={() => navigate("/ScheduleMeeting")}
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
          Book a Meeting With Your Tutor →
        </button>
      </div>
    </div>

    {/* <div className="card text-bg-warning mb-3 text-white fixed-card" onClick={() => navigate('/Notification')} >
      <FontAwesomeIcon icon={faExclamationCircle} size="2x" style={{ margin: "10px" }} />
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">Notifications</h5>
        <p className="card-text">Get notified about upcoming meetings and chats</p>
      </div>
    </div> */}

    {/* <div className="card text-bg-warning mb-3 text-white fixed-card">
      <FontAwesomeIcon icon={faUser} size="2x" style={{ margin: "10px" }} />
      <div className="card-body d-flex flex-column" onClick={() => navigate('/ProjectSupervisor')}>
        <h5 className="card-title">Project Supervisor</h5>
        <p className="card-text">Chat with your supervisor, submit proposals and many more</p>
      </div>
    </div>
     */}
        <div
      className="card text-white" style={{
          backgroundColor: "#0f1e3c",
          borderRadius: "16px",
          width: "380px",
          padding: "20px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          position: "relative" }}
          onClick={() => navigate('/Schedules')}
    >
      {/* Show badge if a schedule exists */}
      {hasSchedule && (
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
          1
        </div>
      )}

      <FontAwesomeIcon icon={faCalendarAlt} size="2x" style={{ margin: "10px", color:'#FFA76A' }} />
      <div className="card-body d-flex flex-column">
        <h5 className="card-title" style={{color:'#FFA76A'}}>Schedules</h5>
        <p className="card-text">View upcoming virtual and in-person meetings</p>
          <button
          onClick={() => navigate("/Schedules")}
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
          View Schedules →
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
       {/* Show badge if a schedule exists */}
       {hasSchedule && (
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
          1
        </div>
      )}
      <FontAwesomeIcon icon={faCalendarAlt} size="2x" style={{ margin: "10px", color:'#6C63FF' }} />

      <div className="card-body d-flex flex-column" onClick={() => navigate('/Calendar')}>
        <h5 className="card-title" style={{color:'#6C63FF'}}>Calendar</h5>
        <p className="card-text">View your calendar to know about upcoming events</p>
        <button
          onClick={() => navigate("/Schedules")}
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

</div>
                    

            </div>

            
             <footer className="footer1">
             <p>© {new Date().getFullYear()} TutorLink. All rights reserved.</p>
             </footer>
            </div>
            </div>
        </>
 
    );
}

export default Homepage;
