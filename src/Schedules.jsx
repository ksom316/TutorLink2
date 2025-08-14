import React from "react";
import Navbar from "./Navbar";
import "./Homepage.css";
import Offcanvas from "./Offcanvas";
import LecturerProfileModal from "./Lecturer/LectureProfileModal";
import ProfileModal from "./ProfileModal";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEyeSlash } from "react-icons/fa";
import { FaEye } from "react-icons/fa";
import { FaSearch } from "react-icons/fa";
import { getSchedule, fetchTutorDetails, fetchStudentData, changeStudentPassword } from "./firebaseFunctions";
import { getAuth, signOut } from "firebase/auth";
import Footer from "./Footer";
import HomeButton from "./HomeButton";
import Modals from "./components/Modals";

function Schedules () {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const navigate = useNavigate();
    const [isLogoutOpen, setIsLogoutOpen] = useState(false);
    const [isChangePassword, setIsChangePassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState('');
    const [tutorName, setTutorName] = useState('');
    const [schedule, setSchedule] = useState(null); 
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
        
    
    
   
  useEffect(() => {
    const loadStudentAndSchedule = async () => {
        const referenceNumber = localStorage.getItem("referenceNumber");
        if (referenceNumber) {
            try {
                const data = await fetchStudentData(referenceNumber);
                const tutorId = data.tutorId;
                const path = `${referenceNumber}_${tutorId}`;

                const tutorData = await fetchTutorDetails(referenceNumber);
                if (tutorData.success) {
                    setTutorName(tutorData.data.name);
                }

                const fetchedSchedule = await getSchedule(path);

                // ✅ Only set schedule if it is confirmed
                if (fetchedSchedule && fetchedSchedule.status === "confirmed") {
                    setSchedule(fetchedSchedule);
                } else {
                    console.log("No confirmed schedule found.");
                    setSchedule(null); // or leave unchanged depending on your logic
                }

            } catch (error) {
                console.error("Error fetching data:", error);
            }
        }
    };

    loadStudentAndSchedule();
}, []);

    
      
   
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
                                <li><div class="dropdown-item" onClick={() => navigate('/Help')}>Help</div></li>
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
        
        
        <div className="table-container">
        <div style={{margin: '20px 20px  20px 0', fontSize: '22px',display: 'flex', flex: 'flex-start'}}>
        You have {schedule ? 1 : 0} upcoming schedule(s)


        </div>
        {/* <div className="search-bar-wrapper">
            <div className="search-bar">
            <input
                type="text"
                placeholder="Search students..."
                // value={searchTerm}
                // onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="search-icon" />
        </div> */}
        {/* </div> */}
        
        <caption style={{color: 'white', display: 'flex', flex: 'flex-center', fontSize: '30px'}}>Schedule List</caption>


        <table class="table table-striped">
            <thead>
                <tr>
                <th scope="col">#</th>
                <th scope="col">Lecturer Name</th>
                <th scope="col">Meeting Type</th>
                <th scope="col">Meeting Date</th>
                <th scope="col">Meeting time</th>
                <th scope="col">Location</th>
                <th scope="col">Meeting Link</th>



                </tr>
            </thead>
            <tbody> {schedule ? (
             <tr> 
                <th scope="row">1</th>
                 <td>{tutorName}</td>
                 <td>{schedule.type}</td> <td>{schedule.date ? new Date(schedule.date.toDate()).toLocaleDateString() : 'N/A'}</td>
                 <td>{schedule.date ? new Date(schedule.date.toDate()).toLocaleTimeString() : 'N/A'}</td>
                 <td>{schedule.location || 'N/A'}</td> 
                 <td>{schedule.meetingLink || 'N/A'}</td> 

            </tr> ) :
                ( <tr> <td colSpan="7">No upcoming schedules</td> </tr> )} </tbody>

        </table>

        </div>
        </div>
        <Footer />
        </>
    );
}
export default Schedules;