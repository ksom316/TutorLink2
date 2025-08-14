import React, { useState, useEffect, useRef } from "react";
import Navbar from "../Navbar";
import LecturerOffcanvas from "./LecturerOffcanvas";
import LecturerProfileModal from "./LectureProfileModal";
import { useNavigate, useLocation } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Footer from "../Footer";

import {
  doc,
  collection,
  query,
  orderBy,
  onSnapshot,
  getDoc,
  getDocs,
  updateDoc,
  where,
  setDoc
} from "firebase/firestore";
import { db } from "../firebase";

import { serverTimestamp, writeBatch, deleteDoc} from "firebase/firestore";

import {
  changeStudentPassword,
  sendMessageL,
  fetchLecturerData,
  getSuggestedReply
} from "../firebaseFunctions";
import '../Homepage.css';
import tutorLink from '../assets/tutorLink.png';
import { getAuth, signOut } from "firebase/auth";
import HomeButton from "../HomeButton";


function LecturerChat() {
const bottomRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const locationRef = useRef(location.pathname);
  useEffect(() => {
        locationRef.current = location.pathname;
      }, [location]);

    // User/Tutor Info
  const tutorId = localStorage.getItem('tutorId');
  const referenceNumber = localStorage.getItem('reference');
  // const studentName = localStorage.getItem('studentName');


  // Chat State
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [firstName, setFirstName] = useState("");
  const [studentName, setStudentName] = useState("");
  const [suggestedReply, setSuggestedReply] = useState("");

  // Modals
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isChangePassword, setIsChangePassword] = useState(false);

  // Password Change UI State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // ============ Fetch First Name ============
  useEffect(() => {
    if (tutorId) {
      fetchLecturerData(tutorId).then(data => {
        if (data?.name) {
          const first = data.name;
          setFirstName(first);
          localStorage.setItem('name', data.name);
        }
      });
    }
  }, []);

  // ============ Fetch Student Name ============
  useEffect(() => {
    const referenceNumber = localStorage.getItem('reference');
    if (referenceNumber) {
      const fetchStudentData = async () => {
        const docRef = doc(db, "StudentRecords", referenceNumber);
        const docSnap = await getDoc(docRef);
        const name = docSnap.data()?.fullName;
        setStudentName(name);
      };
      fetchStudentData();
    }
  }, []);


    // Chat Listener and Seen Marking
   
     // ============ Chat Setup & Presence ============
useEffect(() => {
  if (!tutorId) return;

  const userRef = doc(db, "tutorInfo", tutorId);
  let unsubscribe;

  const fetchDataAndSubscribe = async () => {
    try {
      // ✅ Mark tutor as currently in chat
      await updateDoc(userRef, { currentlyInChat: true });

      if (!referenceNumber) return;

      const chatId = `${referenceNumber}_${tutorId}`;
      const chatDocRef = doc(db, "Chats", chatId);
      const messagesRef = collection(db, "Chats", chatId, "messages");
      const q = query(messagesRef, orderBy("timestamp", "asc"));

      // ✅ Check if chat document exists before updating
      const chatDocSnap = await getDoc(chatDocRef);
      if (!chatDocSnap.exists()) {
        console.warn("Chat document doesn't exist. Skipping subscription.");
        setMessages([]); // optional fallback
        return;
      }

      await updateDoc(chatDocRef, { lastSeen: serverTimestamp() });

      // ✅ Listen to messages
     unsubscribe = onSnapshot(q, async (querySnapshot) => {
  const msgs = [];

  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    if (data?.text && data?.sender) {
      msgs.push({ id: docSnap.id, ...data });
    }
  });

  setMessages(msgs);

  // ✅ Suggested Reply
  if (msgs.length > 0) {
    const lastMsg = msgs[msgs.length - 1];
    if (lastMsg.sender === tutorId) {
      const suggestion = getSuggestedReply(lastMsg.text);
      setSuggestedReply(suggestion || "");
    } else {
      setSuggestedReply("");
    }
  }

  // ✅ LIVE pathname check avoids stale updates on navigation
  if (locationRef.current === '/LecturerChat') {
    const batch = writeBatch(db);

    msgs.forEach((msg) => {
      if (msg.sender !== tutorId && !msg.seen) {
        const msgRef = doc(db, "Chats", chatId, "messages", msg.id);
        batch.update(msgRef, { seen: true });
      }
    });

    const alertsQuery = query(
      collection(db, "Alerts"),
      where("tutorId", "==", tutorId),
      where("status", "==", "unread")
    );

    const alertsSnapshot = await getDocs(alertsQuery);
    alertsSnapshot.forEach(async (alertDoc) => {
      try {
        const alertRef = alertDoc.ref;
        await updateDoc(alertRef, { status: "read" });
        await deleteDoc(alertRef);
      } catch (error) {
        console.error(`Alert update/delete failed: ${alertDoc.id}`, error);
      }
    });

    batch.commit().catch((err) => {
      console.error("Failed to commit seen updates:", err);
    });
  }
});

    } catch (err) {
      console.error("Error in fetchDataAndSubscribe:", err);
    }
  };

  fetchDataAndSubscribe();


  return () => {
    if (unsubscribe) unsubscribe();
    updateDoc(userRef, { currentlyInChat: false }).catch(console.error);
  };
}, [location.pathname]);

   
     const handleSend = async () => {
      if (inputText.trim() !== "") {
        await sendMessageL(tutorId, referenceNumber, inputText);
        setInputText("");
      }
    };
  
    
  // Handle Password Change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      setPasswordError("Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError("New passwords do not match.");
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
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

const getCurrentBotStatus = async () => {
  const chatId = `${referenceNumber}_${tutorId}`;
  const chatRef = doc(db, "Chats", chatId);
  const chatSnap = await getDoc(chatRef);
  if (chatSnap.exists()) {
    return chatSnap.data().bot_status ?? true;
  }
  return true;
};


const handleToggleBot = async (e) => {
  const newStatus = e.target.checked;
  const chatId = `${referenceNumber}_${tutorId}`;
  const chatRef = doc(db, "Chats", chatId);

  try {
    await updateDoc(chatRef, {
      bot_status: newStatus
    });
    setBotStatus(newStatus); // update UI
  } catch (error) {
    console.error("Error updating bot status:", error);
  }
};




const [botStatus, setBotStatus] = useState(null); // use null initially


useEffect(() => {
  if (!tutorId || !referenceNumber) return;

  const fetchStatus = async () => {
    try {
      const chatId = `${referenceNumber}_${tutorId}`;
      const chatRef = doc(db, "Chats", chatId);
      const chatSnap = await getDoc(chatRef);

      if (chatSnap.exists()) {
        const status = chatSnap.data().bot_status;
        setBotStatus(typeof status === "boolean" ? status : true); // default to true if undefined
      } else {
        console.warn("Chat document not found.");
        setBotStatus(true); // fallback default
      }
    } catch (error) {
      console.error("Error fetching bot status:", error);
      setBotStatus(true); // safe fallback
    }
  };

  fetchStatus();
}, [tutorId, referenceNumber]);





const formatTimestamp = (timestamp) => {
            if (!timestamp) return "";
            const date = timestamp.toDate();
            return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
          };

          
useEffect(() => {
  if (!tutorId) return;

  const userRef = doc(db, "tutorInfo", tutorId);

  if (location.pathname === '/LecturerChat') {
    updateDoc(userRef, { currentlyInChat: true }).catch(console.error);
  } else {
    updateDoc(userRef, { currentlyInChat: false }).catch(console.error);
  }

  return () => {
    updateDoc(userRef, { currentlyInChat: false }).catch(console.error);
  };
}, [location.pathname]);


        return (
        <>
        <Navbar>
            <button className="btn btn-primary" style={{backgroundColor: 'rgb(4, 10, 34)', marginRight:'20px'}} type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasWithBothOptions" aria-controls="offcanvasWithBothOptions">☰</button>
            <div>
              <h2 style={{color: 'white'}}>TutorLink-Chat</h2>
              
            </div>
            <div className="user">
                <div className="username">{firstName}</div>
                <div className="btn-group">
                    <button type="button" className="btn btn-primary dropdown-toggle" style={{backgroundColor: 'rgb(4, 10, 34)'}} data-bs-toggle="dropdown" aria-expanded="false"></button>
                    <ul className="dropdown-menu">
                        <li><div className="dropdown-item" onClick={() => setIsProfileOpen(true)}>Profile</div></li>
                        <li><div className="dropdown-item" onClick={() => navigate('/LHelp') }>Help</div></li>
                        <li><div class="dropdown-item" onClick={() => {setIsLogoutOpen(true)}} >Logout</div></li>
                        <li><div class="dropdown-item"  onClick={() => {setIsChangePassword(true)}} >Change Password</div></li>
                     </ul>
                </div>
            </div>
        </Navbar>
        <div>  
        { isProfileOpen && <LecturerProfileModal onClose={ () => setIsProfileOpen(false)} />       
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
                                                    <button className="close-button" onClick={() => { setIsChangePassword(false); setOldPassword(''), setConfirmNewPassword(''), setNewPassword('')}}>X</button>     
                                        
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
        <LecturerOffcanvas />
    </div>
      

        <div className="chat-box">
         <HomeButton />
        
        <div className="chat-area">
 <div className="chat-name d-flex justify-content-between align-items-center px-3 py-2" style={{ width: '100%' }}>
  {/* Left side: Profile + name */}
  <div className="d-flex align-items-center">
    <img className="profile" src={tutorLink} alt="Profile" />
    <span style={{ marginLeft: '10px', fontWeight: 'bold', fontSize: '18px' }}>
      Texting with {studentName}
    </span>
  </div>

  {/* Right side: Bot Assistant Toggle */}
  <div className="bot-toggle-box d-flex align-items-center px-3 py-1 bg-light rounded shadow-sm" style={{ gap: '10px' }}>
    <span className="fw-bold text-dark">Bot Assistant</span>
    <span className="text-muted">Off</span>
    <div className="form-check form-switch m-0">
      <input
        className="form-check-input"
        type="checkbox"
        id="botToggle"
        checked={botStatus}
        onChange={handleToggleBot}
      />
    </div>
    <span className="text-muted">On</span>
  </div>
</div>






<div className="chat-messages">
  {messages.map((msg, index) => {
    const lastTutorMsgIndex = [...messages]
      .map((m, i) => ({ ...m, i }))
      .reverse()
      .find(m => m.sender === tutorId)?.i;

    const isLastTutorMessage = index === lastTutorMsgIndex;

  return (
     <div
        key={index}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: (msg.sender === tutorId || msg.sender === "bot") ? 'flex-end' : 'flex-start',
          marginBottom: isLastTutorMessage ? 20 : 10,
        }}
      >
         {/* Timestamp */}
    <div
      style={{
        fontSize: '11px',
        color: '#ccc',
        marginBottom: 3,
        alignSelf: (msg?.sender === tutorId || msg?.sender === "bot") ? 'flex-end' : 'flex-start'
      }}
    >
      {formatTimestamp(msg?.timestamp)}
    </div>

        {msg.sender === "bot" && (
          <div
            style={{
              alignSelf: 'flex-end',
              fontSize: '12px',
              fontWeight: 'bold',
              marginBottom: '2px',
              color: 'lightgreen'
            }}
          >
            TutorBot
          </div>
        )}

         {msg.sender === referenceNumber && (
          <div
            style={{
              alignSelf: 'flex-start',
              fontSize: '12px',
              fontWeight: 'bold',
              marginBottom: '2px',
              color: 'lightgreen'
            }}
          >
            {studentName}
          </div>
        )}
     <div className={`chat-message ${(msg.sender === tutorId || msg.sender === "bot") ? 'sent' : 'received'}`}>
      {msg.text}
      <div ref={bottomRef} />
     </div>

        {isLastTutorMessage && (
          <div
            className="seen-status"
            style={{
              fontSize: '12px',
              color: msg.seen ? 'white' : 'gray',
              marginTop: 4,
            }}
          >
            {msg.seen ? (
              <>
                <FaEye style={{ marginRight: 4 }} /> Seen
              </>
            ) : (
              <>
                <FaEyeSlash style={{ marginRight: 4 }} /> Unseen
              </>
            )}
          </div>
        )}
      </div>
    );
  })}
</div>

  {suggestedReply && (
  <div
    className="alert alert-info"
    style={{
      maxWidth: "80%",
      margin: "10px auto",
      cursor: "pointer",
      borderRadius: "8px",
      padding: "8px 12px",
      backgroundColor: "#d9edf7",
      color: "#31708f",
      fontSize: "14px"
    }}
    onClick={() => setInputText(suggestedReply)}
  >
    💡 <strong>Suggested Reply:</strong> {suggestedReply}
    <br />
    <small style={{ color: "#555" }}>Click to insert into chat box</small>
  </div>
)}


  <div className="chat-input-area">
  <input
  type="text"
  value={inputText}
  onChange={(e) => setInputText(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  }}
/>

    <button onClick={handleSend}>Send</button>
  </div>



</div>




        </div>
        <Footer />
        </>
    );
}

export default LecturerChat;
