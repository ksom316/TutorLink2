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
import { getStudents, changeStudentPassword } from "../firebaseFunctions";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { getAuth, signOut } from "firebase/auth";
import Footer from '../Footer';
import HomeButton from "../HomeButton";
import Modals from "../components/ModalsL";

function KnowYourStudents () {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const navigate = useNavigate();
    const [isLogoutOpen, setIsLogoutOpen] = useState(false);
    const [isChangePassword, setIsChangePassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState('');
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [lecturerName, setLecturerName] = useState('');
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
              setStudents(data); // Save to state
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
    
    
    return (
        <>
        <Navbar>
         <button class="btn btn-primary"  style={{backgroundColor: 'rgb(4, 10, 34)', marginRight:'20px'}} type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasWithBothOptions" aria-controls="offcanvasWithBothOptions">☰</button>
           <div>
           <h2 style={{color: 'white'}}>TutorLink - Student Portal</h2>

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
        You are an Academic Tutor for {students.length} student(s)
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


        <table class="table table-striped">
            <thead>
                <tr>
                <th scope="col">#</th>
                <th scope="col">Name</th>
                <th scope="col">Year</th>
                <th scope="col">Index Number</th>
                <th scope="col">Reference Number</th>

                </tr>
            </thead>
            <tbody>
            {filteredStudents.length === 0 ? (

                <tr>
                <td colSpan="5" style={{ textAlign: 'center' }}>No students assigned</td>
                </tr>
            ) : (
                filteredStudents.map((student, index) => (
                <tr key={student.id}>
                    <th scope="row">{index + 1}</th>
                    <td>{student.fullName}</td>
                    <td>{student.year}</td>
                    <td>{student.studentId}</td>
                    <td>{student.id}</td>
                </tr>
                ))
            )}
            </tbody>

        </table>
    

        </div>
        </div>
            <Footer />
            
        </>
    );
}

export default KnowYourStudents;