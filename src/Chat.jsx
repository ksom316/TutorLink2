import React, { useState, useEffect, useRef } from "react";
import Navbar from "./Navbar";
import Offcanvas from "./Offcanvas";
import './Homepage.css';
import tutorLink from './assets/tutorLink.png'; 
import ProfileModal from './ProfileModal';
import { useNavigate,useLocation } from "react-router-dom";
import { FaEyeSlash } from "react-icons/fa";
import { FaEye } from "react-icons/fa";
import { sendMessage,fetchStudentData } from "./firebaseFunctions";
import { collection, query, orderBy, onSnapshot, doc, serverTimestamp, getDoc, updateDoc, writeBatch, setDoc } from "firebase/firestore";
import { db } from "./firebase"; // make sure you import your Firestore instance
import { fetchTutorDetails, handleStudentMessageWithBot } from "./firebaseFunctions";
import { getAuth, signOut } from "firebase/auth";
import Footer from "./Footer";
import HomeButton from "./HomeButton";
import Modals from "./components/Modals";
import { getMessaging } from "firebase/messaging";

function Chat() {

  
    const bottomRef = useRef(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const referenceNumber = localStorage.getItem('referenceNumber');
    const location = useLocation(); // track the current route
    const [suggestedReply, setSuggestedReply] = useState('');
    const [tutorId, setTutorId] = useState('');
    



    const navigate = useNavigate()
    const handleSend = async () => {
      if (inputText.trim() !== "") {
        await sendMessage(referenceNumber, inputText); // save message

        const chatId = `${referenceNumber}_${tutorId}`;
        const chatDocRef = doc(db, "Chats", chatId);
        const chatSnap = await getDoc(chatDocRef);

        const botStatus = chatSnap.exists() ? chatSnap.data().bot_status : false;

        if (tutorId && botStatus) {
          await handleStudentMessageWithBot(referenceNumber, inputText, tutorId); // bot replies if status is true
        }

        setInputText("");
      }
    };



      const [oldPassword, setOldPassword] = useState('');
         const [newPassword, setNewPassword] = useState('');
         const [confirmNewPassword, setConfirmNewPassword] = useState('');
         const [passwordError, setPasswordError] = useState('');
         const [passwordSuccess, setPasswordSuccess] = useState('');
         const studentName = localStorage.getItem('studentName'); 

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
         

     const [isLogoutOpen, setIsLogoutOpen] = useState(false);
        const [isChangePassword, setIsChangePassword] = useState(false);
        const [showPassword, setShowPassword] = useState(false);
        const [password, setPassword] = useState('');
        const [tutorName, setTutorName] = useState('')
        
         
        useEffect(() => {
          const referenceNumber = localStorage.getItem('referenceNumber');
          if (!referenceNumber) return;
        
          const userRef = doc(db, "StudentRecords", referenceNumber);
          let unsubscribe;
        
          const fetchDataAndSubscribe = async () => {
            // Set presence
            await updateDoc(userRef, { currentlyInChat: true });
        
            const data = await fetchStudentData(referenceNumber);
            const tutorId = data?.tutorId;
            if (!tutorId) return;
            setTutorId(tutorId);
        
            const tutorInfo = await fetchTutorDetails(referenceNumber);
            setTutorName(tutorInfo?.data?.name || '');
        
            const chatId = `${referenceNumber}_${tutorId}`;
            const chatDocRef = doc(db, "Chats", chatId);
            const messagesRef = collection(db, "Chats", chatId, "messages");
            const q = query(messagesRef, orderBy("timestamp", "asc"));
        
            // Update student's last seen
const chatDocSnap = await getDoc(chatDocRef);
if (chatDocSnap.exists()) {
  await updateDoc(chatDocRef, { lastSeenS: serverTimestamp() });
}

        
            unsubscribe = onSnapshot(q, async (querySnapshot) => {
              
              const fetchedMessages = [];
              const batch = writeBatch(db);
              let hasSeenUpdates = false;
        
              querySnapshot.forEach((docSnap) => {
                const msg = docSnap.data();
                if (msg && msg.text && msg.sender) {
    fetchedMessages.push({ id: docSnap.id, ...msg });
  }
        
                if (
                  location.pathname === '/Chat' &&
                  msg.sender !== referenceNumber &&
                  !msg.seen
                ) {
                  const msgRef = doc(db, "Chats", chatId, "messages", docSnap.id);
                  batch.update(msgRef, { seen: true });
                  hasSeenUpdates = true;
                }
              });
        
              setMessages(fetchedMessages);
        
              if (hasSeenUpdates) {
                batch.commit().catch((err) =>
                  console.error("Failed to update seen messages:", err)
                );
              }
            });
          };
        
          fetchDataAndSubscribe();
        
          return () => {
            if (unsubscribe) unsubscribe();
            updateDoc(userRef, { currentlyInChat: false }).catch(console.error);
          };
        }, [location.pathname]);
                                                    
                               
                      
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
              
                  useEffect(() => {
                    if (bottomRef.current) {
                      bottomRef.current.scrollIntoView({ behavior: "smooth" });
                    }
                  }, [messages]);

                useEffect(() => {
                  if (messages.length === 0) return;

                  const lastMsg = messages[messages.length - 1];
                  if (lastMsg.sender !== referenceNumber) {
                    const text = lastMsg.text.toLowerCase();
                    let suggestion = "";

                    if (text.includes("hello") || text.includes("hi")) {
                      suggestion = "Hello! How are you?";
                    } else if (text.includes("submit") || text.includes("assignment")) {
                      suggestion = "Sure, I will submit it soon.";
                    } else if (text.includes("meeting")) {
                      suggestion = "When is the meeting scheduled?";
                    } else if (text.includes("good job") || text.includes("well done")) {
                      suggestion = "Thank you!";
                    } else if (text.includes("can you") || text.includes("please")) {
                      suggestion = "Yes, I can do that.";
                    } else if (text.includes("not clear") || text.includes("explain")) {
                      suggestion = "Sure! Which part would you like me to clarify?";
                    } else if (text.includes("available") || text.includes("free now")) {
                      suggestion = "Yes, I'm free now. Shall we talk?";
                    } else if (text.includes("reschedule") || text.includes("change time")) {
                      suggestion = "Okay, let me know your preferred time.";
                    } else if (text.includes("late") || text.includes("delay")) {
                      suggestion = "Sorry for the delay, I'll try to catch up.";
                    } else if (text.includes("how are you")) {
                      suggestion = "I'm doing great, thanks! Hope you're well too.";
                    } else if (text.includes("thanks") || text.includes("thank you")) {
                      suggestion = "You're welcome!";
                    } else if (text.includes("check") || text.includes("review")) {
                      suggestion = "I'll check and get back to you shortly.";
                    } else if (text.includes("deadline")) {
                      suggestion = "When is the deadline?";
                    } else if (text.includes("project")) {
                      suggestion = "Would you like help with the project?";
                    } else if (text.includes("login") || text.includes("can't access")) {
                      suggestion = "Have you tried resetting your password?";
                    } else if (text.includes("who is your supervisor")) {
                      suggestion = "You can find that info in the profile section.";
                    } else if (text.includes("materials") || text.includes("notes")) {
                      suggestion = "I'll send you the materials I have.";
                    } else if (text.includes("join group")) {
                      suggestion = "Yes, I’d like to join the group.";
                    } else if (text.includes("exam")) {
                      suggestion = "Thanks! I’ll revise and prepare accordingly.";
                    } else if (text.includes("where") && text.includes("submit")) {
                      suggestion = "You can submit it via the student portal.";
                    }

                    setSuggestedReply(suggestion);
                  }
                }, [messages]);

                  const formatTimestamp = (timestamp) => 
                  {
                    if (!timestamp) return "";
                    const date = timestamp.toDate();
                    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                  };
   

    return (
        <>
        <Navbar>
            <button className="btn btn-primary" style={{backgroundColor: 'rgb(4, 10, 34)', marginRight:'20px'}} type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasWithBothOptions" aria-controls="offcanvasWithBothOptions">☰</button>
            <div>
              <h2 style={{color: 'white'}}>TutorLink-Chat</h2>
              
            </div>
            <div className="user">
                <div className="username">{username}</div>
                <div className="btn-group">
                    <button type="button" className="btn btn-primary dropdown-toggle" style={{backgroundColor: 'rgb(4, 10, 34)'}} data-bs-toggle="dropdown" aria-expanded="false"></button>
                    <ul className="dropdown-menu">
                        <li><div className="dropdown-item" onClick={() => setIsProfileOpen(true)}>Profile</div></li>
                        <li><div className="dropdown-item" onClick={() => navigate('/Help') }>Help</div></li>
                        <li><div class="dropdown-item" onClick={() => {setIsLogoutOpen(true)}} >Logout</div></li>
                        <li><div class="dropdown-item"  onClick={() => {setIsChangePassword(true)}} >Change Password</div></li>
                     </ul>
                </div>
            </div>
        </Navbar>
      
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


  <div className="chat-box">
    <HomeButton />

        <div className="chat-area">
  <div className="chat-name">
    <img className="profile" src={tutorLink} alt="Profile" />
    Texting with { tutorName }
  </div>

  <div className="chat-messages">
  {messages.map((msg, index) => {
    const lastStudentMsgIndex = [...messages]
      .map((m, i) => ({ ...m, i }))
      .reverse()
      .find(m => m.sender === referenceNumber)?.i;
  
    const isLastStudentMessage = index === lastStudentMsgIndex;
  
  return (
  <div
    key={index}
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: (msg?.sender === referenceNumber || msg?.sender === "bot") ? 'flex-end' : 'flex-start',
      marginBottom: isLastStudentMessage ? 20 : 10,
    }}
  >
    {/* Timestamp */}
    <div
      style={{
        fontSize: '11px',
        color: '#ccc',
        marginBottom: 3,
        alignSelf: (msg?.sender === referenceNumber) ? 'flex-end' : 'flex-start'
      }}
    >
      {formatTimestamp(msg?.timestamp)}
    </div>

    {/* Label for bot or tutor */}
    {msg?.sender === "bot" && (
      <div style={{ alignSelf: 'flex-start', fontSize: '12px', fontWeight: 'bold', marginBottom: '2px', color: 'lightgreen' }}>
        TutorBot
      </div>
    )}
    {msg?.sender === tutorId && (
      <div style={{ alignSelf: 'flex-start', fontSize: '12px', fontWeight: 'bold', marginBottom: '2px', color: 'lightgreen' }}>
        {tutorName}
      </div>
    )}

    {/* Chat bubble */}
    <div className={`chat-message ${msg?.sender === referenceNumber ? 'sent' : 'received'}`}>
      {msg?.text ?? "Message unavailable"}
      <div ref={bottomRef} />
    </div>

    {/* Seen status */}
    {isLastStudentMessage && (
      <div
        className="seen-status"
        style={{
          fontSize: '12px',
          color: msg?.seen ? 'white' : 'gray',
          marginTop: 4,
          alignSelf: 'flex-end'
        }}
      >
        {msg?.seen ? (
          <>
            <FaEye style={{ marginRight: 4 }} /> Seen by tutor
          </>
        ) : (
          <>
            <FaEyeSlash style={{ marginRight: 4 }} /> Unseen by tutor
          </>
        )}
      </div>
    )}
  </div>
);

  })}
  

</div>

{suggestedReply && messages.length > 0 && messages[messages.length - 1].sender !== referenceNumber && (
  <div
    style={{
      maxWidth: "80%",
      margin: "10px auto",
      cursor: "pointer",
      borderRadius: "8px",
      padding: "8px 12px",
      backgroundColor: "#d9edf7",
      color: "#31708f",
      fontSize: "14px",
    }}
    onClick={() => setInputText(suggestedReply)}
  >
    <strong>💡 Suggested Reply: </strong> {suggestedReply}
    <br />
    <small style={{ color: "#555" }}>Click to insert into chat box</small>
  </div>
)}



  <div className="chat-input-area">
    <input
      type="text"
      placeholder="Type your message..."
      value={inputText}
      onChange={(e) => setInputText(e.target.value)}
      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
    />
    <button onClick={handleSend}>Send</button>
  </div>
</div>
<Offcanvas />

        </div>
        <Footer />
        </>
    );
}

export default Chat;
