import React, { useState, useEffect } from "react";
import './Homepage.css';
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "./firebase";

const db = getFirestore(app);


function ProfileModal ({ onClose }) {
    // const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [studentData, setStudentData] = useState(null);

    useEffect(() => {
      const fetchStudentData = async () =>{
        const referenceNumber = localStorage.getItem("referenceNumber")
        if(!referenceNumber) return;

        const docRef = doc(db, "StudentRecords", referenceNumber);
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()){
          setStudentData(docSnap.data());
        }
      };

      fetchStudentData();
    }, []);

    if(!studentData) return <div>Loading...</div>
    return (
         <div className="profile-modal-backdrop">
                        <div className="profile-modal">
                        <button className="close-button" onClick={onClose}>X</button>     
            
                          <h2>Personal Profile</h2> 
                          <hr style={{ width: '100%', border: '0.5px solid black', margin: '1rem 0' }} />
                          
                          <div>Full name</div>
                          <div style={{fontWeight: 'bold'}}>{studentData.fullName}</div>

                          <hr/>
                          <div>Date of Birth</div>
                          <div style={{fontWeight: 'bold'}}>{studentData.dateOfBirth?.toDate().toDateString()}</div>

                          <hr/>
                          <div>ID Number</div>
                          <div style={{fontWeight: 'bold'}}>{studentData.studentId}</div>

                          <hr/>
                          <div>Reference Number</div>
                          <div style={{fontWeight: 'bold'}}>{localStorage.getItem('referenceNumber')}</div>

                          <hr/>
                          <div>Programme of Study</div>
                          <div style={{fontWeight: 'bold'}}>{studentData.course}</div>



                        </div>
                      </div>
    );
}

export default ProfileModal;