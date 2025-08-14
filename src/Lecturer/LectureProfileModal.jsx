import React, { useState, useEffect } from "react";
import '../Homepage.css';
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "../firebase";

const db = getFirestore(app);


function LecturerProfileModal ({ onClose }) {
    // const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [lecturerData, setLecturerData] = useState(null);

     useEffect(() => {
          const fetchLecturerData = async () =>{
            const tutorId = localStorage.getItem("tutorId");
            if(!tutorId) return;
    
            const docRef = doc(db, "tutorInfo", tutorId);
            const docSnap = await getDoc(docRef)
    
            if (docSnap.exists()){
              setLecturerData(docSnap.data());
            }
          };
    
          fetchLecturerData();
        }, []);
    if(!lecturerData) return <div>Loading...</div>

    return (
         <div className="profile-modal-backdrop">
                        <div className="profile-modal">
                        <button className="close-button" onClick={onClose}>X</button>     
            
                          <h2>Personal Profile</h2> 
                          <hr style={{ width: '100%', border: '0.5px solid black', margin: '1rem 0' }} />
                          
                          <div>Full name</div>
                          <div style={{fontWeight: 'bold'}}>{lecturerData.name}</div>

                          <hr/>
                          <div>Date of Birth</div>
                          <div style={{fontWeight: 'bold'}}>{lecturerData.dateOfBirth?.toDate().toDateString()}</div>


                          <hr/>
                          <div>ID Number</div>
                          <div style={{fontWeight: 'bold'}}>{localStorage.getItem('tutorId')}</div>

                          <hr/>
                          <div>Department</div>
                          <div style={{fontWeight: 'bold'}}>{lecturerData.department}</div>
                       
                          
                          <hr/>
                          <div>College</div>
                          <div style={{fontWeight: 'bold'}}>{lecturerData.college}</div>
                       

                        </div>

                          

                      </div>
    );
}

export default LecturerProfileModal;