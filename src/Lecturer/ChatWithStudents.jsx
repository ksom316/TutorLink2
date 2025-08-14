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
import { getStudents, changeStudentPassword, getUnreadMessageCount, runMotivationBot } from "../firebaseFunctions";
import { getDoc, doc, getDocs, collection, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { getAuth, signOut } from "firebase/auth";
import Footer from "../Footer";
import HomeButton from "../HomeButton";
import Modals from "../components/ModalsL";

function ChatWithStudents () {
  const [alerts, setAlerts] = useState([]);

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

    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const navigate = useNavigate();
    const [isLogoutOpen, setIsLogoutOpen] = useState(false);
    const [isChangePassword, setIsChangePassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState('');
     const [students, setStudents] = useState([]);
        const [searchTerm, setSearchTerm] = useState('');
    
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
           

     
               const [unreadCounts, setUnreadCounts] = useState({});
        
const filteredStudents = students
  .filter(student =>
    student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.id?.toLowerCase().includes(searchTerm.toLowerCase())
  )
  .sort((a, b) => {
    const unreadA = unreadCounts[a.id] || 0;
    const unreadB = unreadCounts[b.id] || 0;
    return unreadB - unreadA; // Descending order
  });

        

        const [lecturerName, setLecturerName] = useState('');
        
        useEffect(() => {
                 const tutorId = localStorage.getItem('tutorId');
   
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
                const tutorId = localStorage.getItem("tutorId");
                if (!tutorId) return;
              
                const loadStudentsAndUnread = async () => {
                  try {
                    const studentsData = await getStudents(tutorId);
                    setStudents(studentsData);
              
                    // Fetch unread counts in parallel
                    const countsArray = await Promise.all(
                      studentsData.map((student) =>
                        getUnreadMessageCount(student.id, tutorId)
                      )
                    );
              
                    const counts = {};
                    studentsData.forEach((student, index) => {
                      counts[student.id] = countsArray[index];
                    });
              
                    setUnreadCounts(counts);
                  } catch (error) {
                    console.error("Error fetching data:", error);
                  }
                };
              
                loadStudentsAndUnread();
              }, []);
              
              
    
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
        
        
        <div className="table-container">
        <div style={{margin: '20px 20px  20px 0', fontSize: '22px',display: 'flex', flex: 'flex-start'}}>
         Select a student to chat with them
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
        <p style={{display: 'flex', flex: 'flex-center', fontSize: '16px'}}>A bot handles some responses for you but some messages need manual responses</p>

        <table class="table table-striped table-hover">
            <thead>
                <tr>
                <th scope="col">#</th>
                <th scope="col">Name</th>
                <th scope="col">Year</th>
                <th scope="col">Index Number</th>
                <th scope="col">Reference Number</th>
                <th scope="col">Unread</th>
                

                </tr>
            </thead>
       
            <tbody>
            {filteredStudents.length === 0 ? (

                <tr>
                <td colSpan="6" style={{ textAlign: 'center' }}>No students assigned</td>
                </tr>
            ) : (
                filteredStudents.map((student, index) => (
                <tr className="chat-r" onClick={() => { navigate('/LecturerChat'); localStorage.setItem('studentName', student.fullName); localStorage.setItem('reference', student.id)}} key={student.id}>
                    <th scope="row">{index + 1}</th>
                    <td>{student.fullName}</td>
                    <td>{student.yearOfStudy}</td>
                    <td>{student.studentId}</td>
                    <td>{student.id}</td>
                    <td>
                    <span className="badge bg-danger">
                      {unreadCounts[student.id] || null}
                    </span>
                    {alerts.some(alert => alert.studentRef === student.id && alert.type === 'manual_response_needed') && (
                      <div style={{ color: '#dc3545', fontSize: '12px', marginTop: '4px' }}>
                        Manual response needed
                      </div>
                    )}
                  </td>

                  

                </tr>
                ))
            )}
            </tbody>
        </table>

        <div className="p-4">
        <h3>📣 Motivation Bot (Sends automatic motivational messages to all students)</h3>
        <button style={{backgroundColor:"rgb(121, 106, 253)", color:'white'}} onClick={runMotivationBot}>Run Motivation Bot</button>
      </div>


        </div>
        <div style={{ marginTop: "20px" }}>
        {filteredStudents.length === 0 && <p>No students found.</p>}


        </div>

        </div>
            <Footer />
        </>
    );
}

export default ChatWithStudents;