import { use, useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Navbar from './Navbar'
import tutorLink from './assets/tutorLink.png';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { BrowserRouter as Router, Routes, Route, useLocation} from 'react-router-dom';
import Homepage from './Homepage';
import Login from './Login';
import Help from './Help'
import KnowYourTutor from './KnowYourTutor'
import Chat from './Chat';
import ScheduleMeeting from './ScheduleMeeting'
import Calendar1 from './Calendar'
import Notifications from './Notification';
import ProjectSupervisor from './ProjectSupervisor'
import LecturerHome from './Lecturer/LecturerHome';
import ProjectSupervising from './Lecturer/ProjectSupervising';
import KnowYourStudents from './Lecturer/KnowYourStudents';
import ChatWithStudents from './Lecturer/ChatWithStudents';
import LecturerMeeting from './Lecturer/LecturerMeeting'
// import Schedules from './Schedules'
import Schedules from './Schedules'
import LecturerSchedules from './Lecturer/LecturerSchedules'
import SignUp from './SignUp'
import Tutorlink from './Tutorlink'
import { deleteOldUnconfirmedSchedules, updatePastSchedules } from './firebaseFunctions'
import LecturerChat from './Lecturer/LecturerChat'
import NotificationsL from './Lecturer/NotificationsL'
import LHelp from './Lecturer/LHelp'
import LecturerCalendar from './Lecturer/LecturerCalendar'
import { getMessaging, getToken, onMessage } from "firebase/messaging";

function App() {







  // const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    if (isOpen){
    document.body.style.overflow = 'hidden';
     } else {
      document.body.style.overflow = 'auto';
     }

      return () => {
        document.body.style.overflow = 'auto';
      };
  }, [isOpen]);

  useEffect(() => {
    deleteOldUnconfirmedSchedules();
    updatePastSchedules();
  }, []);



  const [modalStep, setModalStep] = useState('Question1');
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false);



  return (
    
    <Router>
      <Routes>
        <Route path="/Homepage" element={<Homepage key={useLocation.pathname} />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Help" element={<Help />} />
        <Route path="/LHelp" element={<LHelp />} />
        <Route path="/KnowYourTutor" element={<KnowYourTutor />} />
        <Route path="/Chat" element={<Chat />} />
        <Route path="/ScheduleMeeting" element={<ScheduleMeeting />} />
        <Route path="/Calendar" element={<Calendar1 />} />
        <Route path="/Notification" element={<Notifications />} />
        <Route path="/ProjectSupervisor" element={<ProjectSupervisor />} />
        <Route path="/LecturerHome" element={<LecturerHome />} />
        <Route path="/ProjectSupervising" element={<ProjectSupervising />} />
        <Route path="/KnowYourStudents" element={<KnowYourStudents />} />
        <Route path="/ChatWithStudents" element={<ChatWithStudents />} />
        <Route path="/LecturerMeeting" element={<LecturerMeeting />} />
        <Route path="/Schedules" element={<Schedules />} />
        <Route path="/LecturerSchedules" element={<LecturerSchedules />} />
        <Route path="/SignUp" element={<SignUp />} />
        <Route path="/" element={<Tutorlink />} />
        <Route path="/LecturerChat" element={<LecturerChat />} />
        <Route path="/NotificationsL" element={<NotificationsL />} />
        <Route path="/LecturerCalendar" element={<LecturerCalendar />} />



        

      </Routes>
    </Router>
  );

}

export default App
