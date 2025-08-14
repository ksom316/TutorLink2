// functions/firebaseFunctions.js
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { getFirestore, setDoc,getDocs, writeBatch, query, where, deleteDoc, doc, getDoc, updateDoc, collection, addDoc, serverTimestamp, Timestamp} from 'firebase/firestore';
import { app } from './firebase';
import { httpsCallable, getFunctions } from "firebase/functions";
import emailjs from '@emailjs/browser';
// import { Configuration, OpenAIApi } from "openai";
import Sentiment from 'sentiment';
import axios from "axios";
import {sendPasswordResetEmail } from "firebase/auth";
import { getMessaging, getToken } from "firebase/messaging";

const sentiment = new Sentiment();


const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);

/**
 * Handles student sign-up. Validates student record by reference number,
 * ensures not already signed up, and creates Firebase Auth account.
 * @param {string} name 
 * @param {string} email 
 * @param {string} password 
 * @param {string} referenceNumber 
 * @param {string} schedulePath
 * @returns {Promise<{ success: boolean, message: string }>}
 *  @returns {Promise<Date[]>} 
 */


export function analyzeSentiment(text) {
  const result = sentiment.analyze(text);
  return result; // result.score < 0 is negative
}

export async function signUpStudent(name, username, email, password, referenceNumber) {
  try {
    const docRef = doc(db, 'StudentRecords', referenceNumber);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { success: false, message: 'Reference number not found in records.' };
    }

    const studentData = docSnap.data();

    if (studentData.hasSignedUp) {
      return { success: false, message: 'Account already exists for this reference number.' };
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Update Student Record
    await updateDoc(docRef, {
      username: username,
      hasSignedUp: true,
      email: email,
      authUid: userCredential.user.uid
    });

    // ✅ Create an empty Chat collection
    const chatId = `${referenceNumber}_${studentData.tutorId}`;
    const chatDocRef = doc(db, 'Chats', chatId);

  
      await setDoc(chatDocRef, {
        bot_status: true,
      });

    const messagesCollectionRef = collection(chatDocRef, 'messages');
    await setDoc(doc(messagesCollectionRef), {
      text1: "Chat initialized",
      timestamp: new Date(),
      systemGenerated: true
    });

    // ✅ Send welcome email using EmailJS
    const templateParams = {
      to_email: email,
      subject: "Welcome to TutorLink!",
      message: `Hello ${name},\n\nWelcome to TutorLink! Your student account has been successfully created. You can now schedule meetings, chat with your academic tutor, and manage your academic journey with ease.\n\nBest regards,\nTutorLink Team`
    };

    const serviceID = "service_fmay9jr";
    const templateID = "template_v35geeo";
    const userID = "oa3rP-PFcN-TWGHq8";

    await emailjs.send(serviceID, templateID, templateParams, userID);

    return { success: true, message: 'Sign-up successful! A welcome email has been sent.' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}


export const saveFcmToken = async (userId) => {
  try {
    const messaging = getMessaging();
    const token = await getToken(messaging, {
      vapidKey: "BFe3eGdnGniA_wXCsvzSoNe6GL_ZX49rydDrVBhfpNKvgIS_vDD7n7gkZumg4ZDR-Yk0tUdbu4o7naYmHC0Llio",
    });

    if (token) {
      await setDoc(doc(db, "fcmTokens", userId), { token });
    }
  } catch (error) {
    alert("Error getting FCM token:", error);
  }
};
  
export async function signUpLecturer(name, username, email, password, tutorId) {
  try {
    const docRef = doc(db, 'tutorInfo', tutorId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { success: false, message: 'Tutor ID not found in records.' };
    }

    const lecturerData = docSnap.data();

    if (lecturerData.hasSignedUp) {
      return { success: false, message: 'Account already exists for this tutor ID.' };
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    await updateDoc(docRef, {
      username: username,
      hasSignedUp: true,
      email: email,
      authUid: userCredential.user.uid
    });

    // Fetch all students assigned to this tutor
    const studentsRef = collection(db, 'StudentRecords');
    const studentsSnapshot = await getDocs(studentsRef);

    for (const studentDoc of studentsSnapshot.docs) {
      const studentData = studentDoc.data();
      const referenceNumber = studentDoc.id;

      if (studentData.tutorId === tutorId) {
        const chatId = `${referenceNumber}_${tutorId}`;
        const chatDocRef = doc(db, 'Chats', chatId);

        const chatExists = await getDoc(chatDocRef);

        if (!chatExists.exists()) {
          await setDoc(chatDocRef, {
              bot_status: true
            }); 

          const messagesCollectionRef = collection(db, 'Chats', chatId, 'messages');
          await addDoc(messagesCollectionRef, {
            text1: "Chat initialized",
            timestamp: new Date(),
            systemGenerated: true
          });
        }
      }
    }

    // ✅ Send welcome email to lecturer
    const templateParams = {
      to_email: email,
      subject: "Welcome to TutorLink (Lecturer)",
      message: `Dear ${name},\n\nWelcome to TutorLink! Your lecturer account has been successfully created. You can now view your assigned students, schedule meetings, and communicate directly with them via the platform.\n\nBest regards,\nTutorLink Team`
    };

    const serviceID = "service_fmay9jr";
    const templateID = "template_v35geeo";
    const userID = "oa3rP-PFcN-TWGHq8";

    await emailjs.send(serviceID, templateID, templateParams, userID);

    return { success: true, message: 'Sign-up successful! Chats initialized and welcome email sent.' };

  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function loginStudent(name, referenceNumber, password) {
    const docRef = doc(db, 'StudentRecords', referenceNumber);
  
    try {
      const docSnap = await getDoc(docRef);
  
      if (!docSnap.exists()) {
        return { success: false, message: 'No such student found' };
      }
  
      const studentData = docSnap.data();
  
      if (studentData.username !== name) {
        return { success: false, message: 'Invalid student name' };
      }
  
      const studentEmail = studentData.email;
      const auth = getAuth();
  
      try {
        const userCredential = await signInWithEmailAndPassword(auth, studentEmail, password);
        return { success: true, user: userCredential.user };
      } catch (authError) {
        return { success: false, message: 'Invalid password: ' + authError.message };
      }
    } catch (error) {
      return { success: false, message: 'Error logging in: ' + error.message };
    }
  }


  export async function loginLecturer(name, tutorId, password) {
    const docRef = doc(db, 'tutorInfo', tutorId);
  
    try {
      const docSnap = await getDoc(docRef);
  
      if (!docSnap.exists()) {
        return { success: false, message: 'No such lecturer found' };
      }
  
      const lecturerData = docSnap.data();


      if (lecturerData.username !== name) {
        return { success: false, message: 'Invalid lecturer name' };
      }
  
      

      const lecturerEmail = lecturerData.email;
      const auth = getAuth();
  
      try {
        const userCredential = await signInWithEmailAndPassword(auth, lecturerEmail, password);
        return { success: true, user: userCredential.user };
      } catch (authError) {
        return { success: false, message: 'Invalid password: ' + authError.message };
      }
    } catch (error) {
      return { success: false, message: 'Error logging in: ' + error.message };
    }
  }
  

  export async function fetchStudentData(referenceNumber) {
    

    try{
        const docRef = doc(db, "StudentRecords", referenceNumber);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const studentData = docSnap.data();
            return studentData;
        }
        else {
            throw new Error('Student not found');
        }
    } catch (error) {
        console.error('Error getting student data: ', error)
        return { success: false, message: 'Error getting student data: ' + error.message};
    }

  }

  export async function fetchLecturerData(tutorId) {
    

    try{
        const docRef = doc(db, "tutorInfo", tutorId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const lecturerData = docSnap.data();
            return lecturerData;
        }
        else {
            throw new Error('Lecturer not found');
        }
    } catch (error) {
        console.error('Error getting lecturer data: ', error)
        return { success: false, message: 'Error getting lecturer data: ' + error.message};
    }

  }

  export async function changeStudentPassword(currentPassword, newPassword) {
    const auth = getAuth();
    const user = auth.currentUser;
  
    if (!user) {
      return { success: false, message: 'No user is currently logged in.' };
    }
  
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      return { success: true, message: 'Password updated successfully.' };
    } catch (error) {
      console.error('Password update error:', error);
  
      let errorMessage = 'Password update failed.';
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'The current password is incorrect.';
      } else if (error.code === 'auth/user-token-expired') {
        errorMessage = 'Session expired. Please log out and sign in again.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many attempts. Please try again later.';
      }
  
      return { success: false, message: errorMessage };
    }
  }
  

  
  export async function fetchTutorDetails(referenceNumber) {
    const db = getFirestore(app);
  
    try {
      const studentRef = doc(db, 'StudentRecords', referenceNumber);
      const studentSnap = await getDoc(studentRef);
  
      if (!studentSnap.exists()) {
        throw new Error('Student record not found');
      }
  
      const studentData = studentSnap.data();
      const tutorId = studentData.tutorId;
  
      if (!tutorId) {
        throw new Error('Tutor ID not found in student record');
      }
  
      const tutorRef = doc(db, 'tutorInfo', tutorId);
      const tutorSnap = await getDoc(tutorRef);
  
      if (!tutorSnap.exists()) {
        throw new Error('Tutor record not found');
      }
  
      return { success: true, data: tutorSnap.data() };
    } catch (error) {
      console.error('Error fetching tutor details:', error);
      return { success: false, message: error.message };
    }
  }

export async function sendMessage(referenceNumber, text) {
  try {
    const studentRef = doc(db, 'StudentRecords', referenceNumber);
    const studentSnap = await getDoc(studentRef);

    if (!studentSnap.exists()) {
      throw new Error('Student record not found');
    }

    const studentData = studentSnap.data();
    const tutorId = studentData.tutorId;
    const chatId = `${referenceNumber}_${tutorId}`;
    const messagesRef = collection(db, 'Chats', chatId, 'messages');
    const studentName = studentData.fullName;


    // 🔍 Step 1: Analyze sentiment
    const sentimentResult = analyzeSentiment(text);
    const sentimentScore = sentimentResult.score;

    // 💬 Step 2: Add message with sentiment score
    await addDoc(messagesRef, {
      sender: referenceNumber,
      text,
      timestamp: serverTimestamp(),
      seen: false,
      sentimentScore, // Optional: also save sentiment label later
    });

    // ⚠️ Step 3: Alert tutor if sentiment is negative
    if (sentimentScore < 0) {
      const alertsRef = collection(db, 'Alerts');
      await addDoc(alertsRef, {
        tutorId,
        referenceNumber,
        studentName,
        message: `⚠️ A student may be struggling: "${text}"`,
        timestamp: serverTimestamp(),
        status: 'unread'
        
      });
    }

    return { success: true };

  } catch (error) {
    console.error('Error sending message: ', error);
    return { success: false, message: error.message };
  }
}

// export async function markMessagesAsSeen(referenceNumber, tutorId) {
//   try {
//     const chatId = `${referenceNumber}_${tutorId}`;
//     const messagesRef = collection(db, 'Chats', chatId, 'messages');

//     const q = query(
//       messagesRef,
//       where('sender', '==', referenceNumber), // student sent the message
//       where('seen', '==', false)
//     );

//     const snapshot = await getDocs(q);

//     if (!snapshot.empty) {
//       const batch = writeBatch(db);
//       snapshot.forEach((docSnap) => {
//         batch.update(docSnap.ref, { seen: true });
//       });
//       await batch.commit();
//     }

//     return { success: true };
//   } catch (error) {
//     console.error('Error marking messages as seen:', error);
//     return { success: false, message: error.message };
//   }
// }

export async function fetchLecturerEmail(tutorId) {
  try {
    const tutorDocRef = doc(db, "tutorInfo", tutorId);
    const tutorDocSnap = await getDoc(tutorDocRef);

    if (tutorDocSnap.exists()) {
      const tutorData = tutorDocSnap.data();
      return { success: true, email: tutorData.email };
    } else {
      return { success: false, message: "Tutor info not found" };
    }
  } catch (error) {
    console.error("Error fetching tutor email:", error);
    return { success: false, message: error.message };
  }
}

export async function sendMessageL(tutorId, referenceNumber, text) {
  try {
    const studentRef = doc(db, 'StudentRecords', referenceNumber);
    const studentSnap = await getDoc(studentRef);

    if (!studentSnap.exists()) {
      throw new Error('Student record not found');
    }

    // const studentData = studentSnap.data();
    // const studentTutorId = studentData.tutorId; // use this to form chat ID

    const chatId = `${referenceNumber}_${tutorId}`;
    const messagesRef = collection(db, 'Chats', chatId, 'messages');

    await addDoc(messagesRef, {
      sender: tutorId, // sender is the lecturer
      text,
      timestamp: serverTimestamp(),
      seen: false,
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending message: ', error);
    return { success: false, message: error.message };
  }
}

export const markMessagesAsSeen = async (referenceNumber, tutorId) => {
  const chatId = `${referenceNumber}_${tutorId}`;
  const metadataRef = doc(db, 'Chats', chatId, 'metadata');

  await setDoc(metadataRef, {
    tutorLastSeen: serverTimestamp()
  }, { merge: true }); // only update the tutorLastSeen field
};

export async function checkExistingSchedule(schedulePath) {
    const scheduleRef = doc(db, "Schedules", schedulePath);
    const scheduleDoc = await getDoc(scheduleRef);

    if (scheduleDoc.exists()) {
        const { date, status, type } = scheduleDoc.data();

        if (status === "confirmed") {
            return {
                exists: true,
                status: "confirmed",
                message: `You already have a meeting scheduled on ${date.toDate().toLocaleString()}.    
                TYPE: ${type}`,
            };
        } else if (status === "unconfirmed") {
            const requestDate = date.toDate();
            const expirationDate = new Date(requestDate.getTime() + 5 * 24 * 60 * 60 * 1000); // +5 days

            if (new Date() > expirationDate) {
                // Delete expired request
                await deleteDoc(scheduleRef);
                return {
                    exists: false,
                    status: "expired",
                    message: "Your previous unconfirmed request has expired. You may now request a new meeting.",
                };
            } else {
                return {
                    exists: true,
                    status: "unconfirmed",
                    message: `You already have a pending meeting request. Please wait for your academic tutor to confirm it, or wait until ${expirationDate.toLocaleString()} to request a new one.`,
                };
            }
        }
    }

    // No meeting exists
    return { exists: false, status: "none" };
}


export async function createMeetingRequest(schedulePath, type, referenceNumber) {
  try {
    // Save meeting request in Firestore as before
    await setDoc(doc(db, "Schedules", schedulePath), {
      type: type,
      status: "unconfirmed",
      date: new Date(),
      location: ""
    });

    // Fetch student document
    const studentDoc = await getDoc(doc(db, "StudentRecords", referenceNumber));
    if (!studentDoc.exists()) {
      alert("Student record not found.");
      return { success: false };
    }

    const studentData = studentDoc.data();
    const tutorId = studentData.tutorId;

    // Fetch tutor document
    const tutorDoc = await getDoc(doc(db, "tutorInfo", tutorId));
    if (!tutorDoc.exists()) {
      alert("Tutor info not found.");
      return { success: false };
    }

    const tutorData = tutorDoc.data();
    const tutorEmail = tutorData.email;

    if (!tutorEmail) {
      alert("Tutor email is missing.");
      return { success: false };
    }

    // Send email via EmailJS
    const templateParams = {
      to_email: tutorEmail,
      subject: "New Meeting Request",
      message: `${studentData.fullName} has requested a ${type} meeting. Please review and confirm it in the system.`
    };

    const result = await emailjs.send(
      'service_fmay9jr',    // replace with your EmailJS service ID
      'template_v35geeo',   // replace with your EmailJS template ID
      templateParams,
      'oa3rP-PFcN-TWGHq8'        // replace with your EmailJS user ID
    );

    if (result.status === 200) {
      return { success: true };
    } else {
      alert("Email failed to send.");
      return { success: false };
    }

  } catch (error) {
    alert("An error occurred:\n" + (error.message || JSON.stringify(error)));
    return { success: false, error };
  }
}

export async function createMeetingS(schedulePath, type, date, location, meetingLink) {
  try {
    const scheduleRef = doc(db, "Schedules", schedulePath);
    const scheduleSnap = await getDoc(scheduleRef);

    // Extract referenceNumber from schedulePath (assumes first 8 chars before underscore)
    const referenceNumber = schedulePath.split('_')[0];

    // Fetch student document to get email
    const studentDoc = await getDoc(doc(db, "StudentRecords", referenceNumber));
    if (!studentDoc.exists()) {
      console.error("Student record not found for reference:", referenceNumber);
      return { success: false, message: "Student record not found." };
    }
    const studentData = studentDoc.data();
    const studentEmail = studentData.email;

    if (!studentEmail) {
      console.error("Student email missing for reference:", referenceNumber);
      return { success: false, message: "Student email missing." };
    }

    if (scheduleSnap.exists()) {
      // Update existing meeting
      await updateDoc(scheduleRef, {
        status: "confirmed",
        type,
        date,
        location,
        meetingLink
      });
    } else {
      // Create new meeting doc
      await setDoc(scheduleRef, {
        type,
        status: "confirmed",
        date,
        location,
        meetingLink
      });
    }

    // Convert Firestore Timestamp to JS Date and format it nicely
    const jsDate = date.toDate ? date.toDate() : new Date(date);
    const formattedDate = jsDate.toLocaleString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true
    });

    // Send email with formatted date string
    const templateParams = {
      to_email: studentEmail,
      subject: "Meeting Confirmed",
      message: `Your meeting for ${type} has been confirmed on ${formattedDate} at ${location}. 
      ${meetingLink ? `Join here: ${meetingLink}` : ""}`
    };

    const serviceID = "service_fmay9jr";
    const templateID = "template_v35geeo";
    const userID = "oa3rP-PFcN-TWGHq8";

    await emailjs.send(serviceID, templateID, templateParams, userID);

    return { success: true, message: "Meeting confirmed and email sent." };

  } catch (error) {
    console.error("Error processing meeting request or sending email:", error);
    return { success: false, error: error.message };
  }
}


export async function cancelMeeting(schedulePath) {
  try {
    const scheduleRef = doc(db, "Schedules", schedulePath);
    const scheduleSnap = await getDoc(scheduleRef);

    if (!scheduleSnap.exists()) {
      return { success: false, message: "Schedule does not exist." };
    }

    const scheduleData = scheduleSnap.data();

    // Extract reference number
    const referenceNumber = schedulePath.split("_")[0];

    // Get student email
    const studentDoc = await getDoc(doc(db, "StudentRecords", referenceNumber));
    if (!studentDoc.exists()) {
      return { success: false, message: "Student record not found." };
    }

    const studentData = studentDoc.data();
    const studentEmail = studentData.email;

    if (!studentEmail) {
      return { success: false, message: "Student email missing." };
    }

    // Cancel meeting
    await updateDoc(scheduleRef, {
      status: "cancelled",
      cancelledAt: Timestamp.now()
    });

    // Determine message
    let formattedDate = "";
    if (scheduleData.date?.toDate) {
      const jsDate = scheduleData.date.toDate();
      formattedDate = jsDate.toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      });
    }

    const wasConfirmed = scheduleData.status === "confirmed";

    const message = wasConfirmed && formattedDate
      ? `Your ${scheduleData.type || "meeting"} scheduled for ${formattedDate} has been cancelled.`
      : `The meeting that was being arranged for you has been cancelled. You can either request a new one or speak to your lecturer for more details.`;

    // Send email
    const templateParams = {
      to_email: studentEmail,
      subject: "Meeting Cancelled",
      message: message
    };

    const serviceID = "service_fmay9jr";
    const templateID = "template_v35geeo";
    const userID = "oa3rP-PFcN-TWGHq8";

    await emailjs.send(serviceID, templateID, templateParams, userID);

    return { success: true, message: "Meeting cancelled and email sent." };
  } catch (error) {
    console.error("Error cancelling meeting:", error);
    return { success: false, error: error.message };
  }
}

export async function createMeetingR(schedulePath, type, date, location) {
    try {
        const scheduleRef = doc(db, "Schedules", schedulePath);
        const scheduleSnap = await getDoc(scheduleRef);

        if (scheduleSnap.exists()) {
            const scheduleData = scheduleSnap.data();

            if (scheduleData.status === "unconfirmed") {
                // Update existing unconfirmed meeting to confirmed and add new fields
                await updateDoc(scheduleRef, {
                    status: "confirmed",
                    type: type,
                    date: date,
                    location: location
                });
                return { success: true, message: "Meeting updated to confirmed." };
            } else {
                return { success: false, message: "Meeting already exists and is confirmed." };
            }
        } else {
            // Create a new meeting since none exists
            await setDoc(scheduleRef, {
                type: type,
                status: "confirmed",
                date: date,
                location: location
            });
            return { success: true, message: "New meeting created and confirmed." };
        }
    } catch (error) {
        console.error("Error processing meeting request:", error);
        return { success: false, error: error.message };
    }
}



export async function createMeeting(schedulePath, type, date, location, link = "") {
  try {
    const scheduleRef = doc(db, "Schedules", schedulePath);
    const scheduleSnap = await getDoc(scheduleRef);

    const meetingData = {
      status: "confirmed",
      type,
      date,
      location,
    };

    if (type === "virtual") {
      meetingData.link = link;
    }

    // Extract reference number (first part before underscore)
    const referenceNumber = schedulePath.split("_")[0];
    const studentDoc = await getDoc(doc(db, "StudentRecords", referenceNumber));
    if (!studentDoc.exists()) {
      return { success: false, message: "Student record not found." };
    }

    const studentData = studentDoc.data();
    const studentEmail = studentData.email;

    if (!studentEmail) {
      return { success: false, message: "Student email missing." };
    }

    // Format date
    const jsDate = date.toDate ? date.toDate() : new Date(date); // Handles Firestore Timestamp or JS Date
    const formattedDate = jsDate.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    let actionMessage = "";
    if (scheduleSnap.exists()) {
      const scheduleData = scheduleSnap.data();

      if (scheduleData.status === "confirmed") {
        return {
          success: false,
          code: "ALREADY_CONFIRMED",
          message: "A confirmed meeting already exists.",
        };
      }

      if (scheduleData.status === "unconfirmed") {
        await updateDoc(scheduleRef, meetingData);
        actionMessage = "Meeting updated to confirmed.";
      }

      if (scheduleData.status === "cancelled") {
        await setDoc(scheduleRef, meetingData);
        actionMessage = "New meeting created.";
      }
    } else {
      await setDoc(scheduleRef, meetingData);
      actionMessage = "New meeting created and confirmed.";
    }

    // Send email via EmailJS
    const emailMessage = `Your academic tutor has scheduled a meeting(${type}) with you on ${formattedDate} at ${location}
    ${link ? `Join here: ${link}` : ""}`;

    const templateParams = {
      to_email: studentEmail,
      subject: "New Meeting Scheduled",
      message: emailMessage,
    };

    const serviceID = "service_fmay9jr";
    const templateID = "template_v35geeo";
    const userID = "oa3rP-PFcN-TWGHq8";

    await emailjs.send(serviceID, templateID, templateParams, userID);

    return { success: true, message: `${actionMessage} Email sent to student.` };
  } catch (error) {
    console.error("Error processing meeting request or sending email:", error);
    return { success: false, error: error.message };
  }
}
export async function checkForExistingMeeting(schedulePath) {
    try {
      const scheduleRef = doc(db, "Schedules", schedulePath);
      const scheduleSnap = await getDoc(scheduleRef);
  
      if (scheduleSnap.exists()) {
        const scheduleData = scheduleSnap.data();
        
        if (scheduleData.status === "confirmed") {
          return { success: false, message: "A confirmed meeting already exists." };
        }
      }
  
      return { success: true };
    } catch (error) {
      console.error("Error checking for existing meeting:", error);
      return { success: false, error: error.message };
    }
  }
  

export const deleteOldUnconfirmedSchedules = async () => {
    const now = Date.now();
    const fiveDaysInMillis = 5 * 24 * 60 * 60 * 1000;
  
    try {
      const snapshot = await getDocs(collection(db, 'Schedules'));
  
      snapshot.forEach(async (docSnap) => {
        const data = docSnap.data();
        const scheduleDate = data.date?.toMillis?.();
  
        if (
          data.status === 'unconfirmed' &&
          scheduleDate &&
          now - scheduleDate > fiveDaysInMillis
        ) {
          await deleteDoc(doc(db, 'Schedules', docSnap.id));
          console.log(`Deleted: ${docSnap.id}`);
        }
      });
    } catch (error) {
      console.error('Error deleting old unconfirmed schedules:', error);
    }
  };

  export const updatePastSchedules = async () => {
    try {
      const now = new Date();
      const schedulesRef = collection(db, "Schedules");
      const querySnapshot = await getDocs(schedulesRef);
  
      const updates = [];
  
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const date = data.date?.toDate?.();
        if (data.status === "confirmed" && date && date < now) {
          const scheduleRef = doc(db, "Schedules", docSnap.id);
          updates.push(updateDoc(scheduleRef, { status: "past" }));
        }
      });
  
      await Promise.all(updates);
      console.log("Updated past schedules.");
    } catch (error) {
      console.error("Error updating schedules:", error);
    }
  };


  export async function fetchConfirmedScheduleDates(referenceNumber, tutorId) {
    const docRef = doc(db, 'Schedules', `${referenceNumber}_${tutorId}`);
    const snapshot = await getDoc(docRef);

    const confirmedDates = [];

    if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.status === 'confirmed' && data.date) {
            confirmedDates.push(data.date.toDate()); // Corrected
        }
    }

    return confirmedDates;
}



export async function fetchLecturerConfirmed(tutorId) {
  const schedulesRef = collection(db, 'Schedules');
  const snapshot = await getDocs(schedulesRef);

  const confirmedSchedules = [];

  for (const docSnap of snapshot.docs) {
    const docId = docSnap.id; // format: referenceNumber_tutorId
    const extractedTutorId = docId.slice(9); // assuming referenceNumber is 8 digits + underscore
    const data = docSnap.data();

    if (extractedTutorId === tutorId && data.status === "confirmed") {
      const referenceNumber = docId.slice(0, 8); // extract student reference number
      const studentRef = doc(db, "StudentRecords", referenceNumber);
      const studentSnap = await getDoc(studentRef);

      const studentName = studentSnap.exists() ? studentSnap.data().fullName : "Unknown Student";

      confirmedSchedules.push({
        id: docId,
        ...data,
        studentName
      });
    }
  }

  return confirmedSchedules;
}



export async function getSchedule(schedulePath) {
    const scheduleRef = doc(db, "Schedules", schedulePath);
    const scheduleDoc = await getDoc(scheduleRef);

    if (scheduleDoc.exists()) {
        const scheduleDetails = scheduleDoc.data();
        // Return the schedule regardless of status
        return scheduleDetails; 
    }

    return null; // return null if not found
}


export async function getLecturerSchedules(tutorId) {
  const schedulesRef = collection(db, "Schedules");
  const querySnapshot = await getDocs(schedulesRef);
  const schedules = [];

  for (const docSnap of querySnapshot.docs) {
    const docId = docSnap.id;
    const scheduleData = docSnap.data();

    // Split doc ID into reference number and tutor ID
    const [refNumberPart, tutorIdPart] = docId.split("_");

    if (
      tutorIdPart === tutorId &&
      /^\d{8}$/.test(refNumberPart) // ensure refNumber is 8 digits
    ) {
      // Fetch student name from StudentRecords using reference number
      try {
        const studentDocRef = doc(db, "StudentRecords", refNumberPart);
        const studentDoc = await getDoc(studentDocRef);

        let fullName = "Unknown Student";
        if (studentDoc.exists()) {
          const studentData = studentDoc.data();
          fullName = studentData.fullName || fullName;
        }

        schedules.push({
          id: docId,
          studentName: fullName,
          ...scheduleData,
        });

      } catch (error) {
        console.error(`Error fetching student data for ${refNumberPart}:`, error);
      }
    }
  }

  return schedules; // Now includes studentName in each schedule
}

export const getUnreadMessageCount = async (referenceNumber, tutorId) => {
  try {
    const chatId = `${referenceNumber}_${tutorId}`;
    const messagesRef = collection(db, "Chats", chatId, "messages");

    const querySnapshot = await getDocs(messagesRef);

    let count = 0;
    querySnapshot.forEach((doc) => {
      const message = doc.data();

      // Only count messages not sent by the tutor and not seen
      if (message.sender !== tutorId && message.seen === false) {
        count++;
      }
    });

    return count;

  } catch (error) {
    console.error("Error fetching unread messages:", error);
    return 0;
  }
};

export async function getStudents(tutorId) {
    const colRef = collection(db, "StudentRecords");
    const snapshot = await getDocs(colRef);

    const students = [];

    snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.tutorId === tutorId) {
            students.push({ id: doc.id, ...data });
        }
    });

    return students;
}

const motivationalMessages = [
  "Believe in yourself and all that you are.",
  "Stay consistent — progress is built daily.",
  "Keep pushing, you’re doing great!",
  "Your potential is endless.",
  "Don’t watch the clock; do what it does. Keep going.",
  "Success is the sum of small efforts repeated daily.",
  "You’ve got this. Keep moving forward!",
  "Dream big, work hard, stay focused.",
  "Mistakes are proof that you’re trying.",
  "Every step forward is progress, no matter how small.",
  "Doubt kills more dreams than failure ever will.",
  "Discipline is choosing what you want most over what you want now.",
  "You are capable of amazing things.",
  "Progress, not perfection.",
  "The only way to fail is to give up.",
  "Don’t be afraid to start over. It's a new opportunity to build better.",
  "Push yourself, because no one else is going to do it for you.",
  "Small progress each day adds up to big results.",
  "Winners are not those who never fail, but those who never quit.",
  "If it doesn’t challenge you, it won’t change you.",
  "Hard work beats talent when talent doesn’t work hard.",
  "Turn your 'I can’t' into 'I will'."
];


function getRandomMessage() {
  const index = Math.floor(Math.random() * motivationalMessages.length);
  return motivationalMessages[index];
}

export async function runMotivationBot() {
  try {
    const studentsSnapshot = await getDocs(collection(db, "StudentRecords"));
    const today = new Date();
    let count = 0;

    for (const docSnap of studentsSnapshot.docs) {
      const student = docSnap.data();
      const refNumber = docSnap.id;
      const tutorId = student.tutorId;

      const lastSent = student.lastMotivationSent?.toDate?.() || new Date("2000-01-01");
      const diffDays = (today - lastSent) / (1000 * 60 * 60 * 24);

      if (true) {
        const message = getRandomMessage();

        await sendMessageL(tutorId, refNumber, message);
        await updateDoc(doc(db, "StudentRecords", refNumber), {
          lastMotivationSent: Timestamp.now()
        });

        count++;
      }
    }

    alert(`✅ Motivation Bot ran successfully.\nMessages sent to ${count} student(s).`);
  } catch (error) {
    alert(`❌ Error running bot: ${error.message}`);
  }
}

export function getSuggestedReply(message) {
  const lowerMsg = message.toLowerCase();

  if (lowerMsg.includes("meeting") && lowerMsg.includes("schedule")) {
    return "Sure, I'm happy to schedule a meeting. What time works best for you?";
  }

   if (lowerMsg.includes("meeting") ) {
    return "Sure, I'm happy to schedule a meeting. What time works best for you?";
  }

  if (lowerMsg.includes("available") || lowerMsg.includes("free")) {
    return "Yes, I'm available. Please suggest a time.";
  }

  if (lowerMsg.includes("thanks") || lowerMsg.includes("thank you")) {
    return "You're welcome! Let me know if you need anything else.";
  }

  if (lowerMsg.includes("not working") || lowerMsg.includes("problem")) {
    return "I'm sorry to hear that. Can you please explain the issue in more detail?";
  }

  if (lowerMsg.includes("deadline") || lowerMsg.includes("submit")) {
    return "Please make sure to check the submission portal or ask the course rep.";
  }

  if (lowerMsg.includes("late") && lowerMsg.includes("submit")) {
    return "If it's late, please notify your lecturer and explain the situation.";
  }

  if (lowerMsg.includes("topic") || lowerMsg.includes("explain")) {
    return "Sure, I can help. Which topic are you referring to?";
  }

  if (lowerMsg.includes("help") || lowerMsg.includes("assist")) {
    return "I'm here to help. What exactly do you need assistance with?";
  }

  if (lowerMsg.includes("missed class") || lowerMsg.includes("absent")) {
    return "No worries. You can ask your classmates or tutor for a quick recap.";
  }

  if (lowerMsg.includes("supervisor")) {
    return "You can find your supervisor's name and contact on your profile.";
  }

  if (lowerMsg.includes("project") || lowerMsg.includes("group work")) {
    return "Let me know if you’re having issues with your project so I can assist.";
  }

  if (lowerMsg.includes("exam") || lowerMsg.includes("test")) {
    return "Make sure to check the schedule and prepare thoroughly. You've got this!";
  }

  if (lowerMsg.includes("report") || lowerMsg.includes("write up")) {
    return "Remember to follow the proper format and check for plagiarism before submission.";
  }

  if (lowerMsg.includes("grade") || lowerMsg.includes("marks")) {
    return "Grades will be released soon. Please be patient or check with your tutor.";
  }

  if (lowerMsg.includes("login") || lowerMsg.includes("sign in")) {
    return "Try resetting your password or contacting support if the issue persists.";
  }

  if (lowerMsg.includes("portal") || lowerMsg.includes("platform")) {
    return "Please specify the exact issue you’re having with the portal.";
  }

  if (lowerMsg.includes("confused") || lowerMsg.includes("don't understand")) {
    return "That’s okay. Let me know where you're stuck and I’ll explain.";
  }

  if (lowerMsg.includes("revision") || lowerMsg.includes("study tips")) {
    return "Stay consistent, break tasks into chunks, and take short breaks.";
  }

  if (lowerMsg.includes("notes") || lowerMsg.includes("materials")) {
    return "You can ask your tutor or classmates for notes or check the resources section.";
  }

  if (lowerMsg.includes("change time") || lowerMsg.includes("reschedule")) {
    return "Sure, let me know your preferred time and I’ll see if it works.";

  }

  return null; // No match
}

export async function checkInactiveStudents(tutorId) {
  const inactiveStudents = [];

  try {
    // 1. Fetch all students assigned to the tutor
    const studentsQuery = query(
      collection(db, "StudentRecords"),
      where("tutorId", "==", tutorId)
    );
    const studentSnapshots = await getDocs(studentsQuery);

    const now = Date.now();
    const THRESHOLD_DAYS = 7; // days of inactivity allowed

    for (const studentDoc of studentSnapshots.docs) {
      const student = studentDoc.data();
      const referenceNumber = studentDoc.id;

      // 2. Check for upcoming schedules
      const scheduleDocRef = doc(db, "Schedules", `${referenceNumber}_${tutorId}`);
      const scheduleDoc = await getDoc(scheduleDocRef);

      const hasUpcomingSchedule =
        scheduleDoc.exists() &&
        scheduleDoc.data().status === "confirmed" &&
        new Date(scheduleDoc.data().selectedDate).getTime() > now;

      // 3. Check latest chat activity
      const chatDocRef = doc(db, "Chats", `${referenceNumber}_${tutorId}`);
      const chatDoc = await getDoc(chatDocRef);

      let lastSeenTime = chatDoc.exists() && chatDoc.data().lastSeenS
        ? chatDoc.data().lastSeenS.toDate().getTime()
        : 0;

      const daysSinceChat = (now - lastSeenTime) / (1000 * 60 * 60 * 24);

      if (!hasUpcomingSchedule && daysSinceChat > THRESHOLD_DAYS) {
        inactiveStudents.push({
          referenceNumber,
          fullName: student.fullName,
          daysSinceChat: Math.floor(daysSinceChat)
        });
      }
    }

    return inactiveStudents;
  } catch (err) {
    console.error("Error checking inactive students:", err);
    return [];
  }
}

// export async function handleStudentMessageWithBot(referenceNumber, messageText, tutorId) {
//  const botReplies = {
//     "hi": "Hi there! How can I help you today?",
//     "hello": "Hello! How can I help you today?",
//     "hey": "Hey! How can I help you today?",
//     "good morning": "Good morning!  How can I assist?",
//     "good afternoon": "Good afternoon! How can I assist?",
//     "good evening": "Good evening!  How can I assist?",
//     "deadline": "Make sure to check your academic calendar or ask your lecturer for clarification.",
//     "schedule": "You can schedule a meeting using the scheduling feature in the app.",
//     "missed": "Sorry to hear that. Let your lecturer know as soon as possible.",
//     "help": "I'm here to help. Please be specific about the topic you need help with.",
//     "class": "Make sure to attend your sessions and let your lecturer know if you missed one.",
//     "assignment": "Double-check your assignment details and submit it before the deadline.",
//     "exam": "Make sure you're aware of the exam timetable. Prepare well!",
//     "project": "Group or individual? Let your lecturer know if you're facing issues.",
//     "supervisor": "Your assigned supervisor is listed in your profile.",
//     "timetable": "You can view your timetable under the 'Schedules' section.",
//     "topic": "Let me know the topic you need help with, and I’ll try to guide you.",
//     "grade": "Grades will be posted once they are available. Check your portal.",
//     "marks": "If you have questions about your marks, contact your tutor directly.",
//     "feedback": "Constructive feedback helps you grow. Ask your lecturer if you need more clarity.",
//     "report": "Be sure to follow the format and submit by the deadline.",
//     "presentation": "Prepare your slides and practice your speech. You've got this!",
//     "recommendation": "Ask your lecturer politely and give them enough time to respond.",
//     "absence": "If you missed a session, check in with your lecturer for a recap.",
//     "late": "It’s better to be honest. Let your lecturer know the reason.",
//     "confused": "That’s okay. Let me know which part confuses you.",
//     "resources": "Check the 'Resources' tab or ask your lecturer for materials.",
//     "login": "If you're having trouble logging in, try resetting your password or contact support.",
//     "forgot": "If you forgot something important, check your notes or ask a peer for help.",
//     "thank you": "You're welcome! Let me know if there's anything else.",
//     "assist": "Sure! I'm here to assist with your academic needs.What kind of academic assistance do you need?",
//   "assistance": "What kind of academic assistance do you need?",
//   "support": "I’m here to support you. How can I help?",
//   "guidance": "Happy to offer some guidance. What's your question?",
//   "study": "Try to set a schedule and stick to your study plan!",
//   "reading": "Reading regularly will help boost your comprehension.",
//   "materials": "Ask your tutor or check the resources section.",
//   "lecture": "Did you attend the lecture or need notes from a peer?",
//   "note": "Organize your notes by topic to make revision easier.",
//   "submit": "Make sure to submit your work before the deadline!",
//   "submission": "Check your dashboard for upcoming submissions.",
//   "deadline extended": "Only your tutor can confirm deadline extensions.",
//   "conflict": "Try to calmly discuss it with your lecturer.",
//   "complain": "You can report concerns via the feedback system.",
//   "app issue": "Try restarting the app or contact support.",
//   "browser": "We recommend using a modern browser like Chrome or Edge.",
//   "navigation": "Use the menu icon to access different sections.",
//   "chat": "This is the chat section — how can I help?",
//   "message": "Type your message and hit send!",
//   "typing": "Take your time. I’m here to help when you’re ready.",
//   "late submission": "You might need to explain the reason to your tutor.",
//   "plagiarism": "Make sure your work is original and cited properly.",
//   "format": "APA and MLA are common — follow your assignment guide.",
//   "group": "You can collaborate via group chats if enabled.",
//   "individual": "Make sure to complete your part on time!",
//   "log out": "You can log out from the profile menu.",
//   "profile": "View or update your info in the profile section.",
//   "marks delay": "Sometimes grading takes time — be patient.",
//   "exam date": "Check the exam schedule or ask your lecturer.",
//   "revision": "Try breaking your study into manageable sessions.",
//   "motivation": "You’ve come this far — keep pushing!",
//   "time": "Use your time wisely, and don't procrastinate!",
//   "reminder": "Set study reminders to stay on track.",
//   "goal": "What’s your goal? I can help you get there.",
//   "plan": "Planning your tasks makes studying easier.",
//   "calm": "Take a deep breath. You've got this.",
//   "feedback request": "You can ask your tutor politely for feedback.",
//   "problem": "Let me know the problem. I’ll try to help.",
//   "doubt": "No doubt is too small. What’s confusing you?",
//   "project help": "Clarify the scope of your project with your supervisor.",
//   "where": "Could you clarify where exactly you’re stuck?",
//   "how": "Happy to walk you through it. What would you like to know?",
//   "why": "Let’s explore the reasoning together.",
//   "who": "Check your tutor assignment in the profile section.",
//   "when": "Check the schedule section for dates and times.",
//   "error": "Try refreshing the page or check your connection.",
//   "bug": "Please report technical issues to support.",
//   "slow": "Sometimes performance may lag — try again shortly.",
//   "clear": "Please rephrase your question if it's unclear.",
//   "internet": "A stable internet connection helps for meetings and chats.",
//   "wifi": "Try switching networks or restarting your router.",
//   "disconnect": "Sorry! Try reloading the page or app.",
//   "call": "Live calls may not be supported; use chat or video options if available.",
//   "video": "Use video meetings for more interactive sessions.",
//   "audio": "Use a headset for clearer audio during meetings.",
//   "link": "Your meeting or resource link should be shared by your tutor.",
//   "invite": "Tutors can invite students to virtual meetings.",
//   "join": "Click the meeting link in your schedule to join.",
//   "start": "Your tutor will start the session once ready.",
//   "late join": "It’s okay — just let your tutor know.",
//   "no reply": "Your tutor might be busy. Try again later.",
//   "waiting": "Hang in there! You’ll get a response soon.",
//   "new": "Looking for something new? Tell me more.",
//   "repeat": "Could you repeat that? I didn't catch it.",
//   "reschedule": "You can propose a new time through chat.",
//   "approve": "Your tutor needs to approve the request.",
//   "reject": "If rejected, your tutor might be unavailable at that time.",
//   "accepted": "Great! Your meeting has been accepted.",
//   "declined": "Try proposing a different time.",
//   "working": "Keep going! You’re doing great work.",
//   "break": "Short breaks help refresh your mind.",
//   "energy": "Stay hydrated and energized for better focus.",
//   "sleep": "Don’t forget to get enough rest — it helps memory.",
//   "eat": "Healthy snacks can boost brainpower!",
//   "hydrate": "Drink water — your brain loves it.",
//   "stress": "Try deep breathing or take a walk. You’re not alone.",
//   "anxious": "It’s okay to feel this way. Just take things step-by-step.",
//   "panic": "Let’s breathe and work through this together.",
//   "challenge": "Challenges help you grow. Let’s tackle it together.",
//   "success": "Every small win counts — you’re on the path to success.",
//   "focus": "Avoid distractions — you’ve got this!",
//   "distraction": "Try putting your phone away during study sessions.",
//   "explain": "I'd be happy to explain further.",
//   "clarify": "Let’s clarify that topic together.",
//   "detail": "Want more details? Tell me which part to expand on.",
//   "thank": "Glad to help! 😊",
//   "goodbye": "Goodbye! Don’t forget to study!",
//   "bye": "Bye! Come back any time.",
//   "see you": "See you soon! Stay focused!",
//   "later": "Talk to you later — keep learning!",
//   "meeting": "Sure, I'm happy to schedule a meeting. What time works best for you?",
//   "meet": "Sure, I'm happy to schedule a meeting. What time works best for you?"

    
//   };

//   // Normalize message
//   const cleanedMessage = messageText.toLowerCase().replace(/[.,?!]/g, '');

//   let responseText = null;

//   for (const keyword in botReplies) {
//     if (cleanedMessage.includes(keyword)) {
//       responseText = botReplies[keyword];
//       break;
//     }
//   }

//   const chatId = `${referenceNumber}_${tutorId}`;
//   const messagesRef = collection(db, "Chats", chatId, "messages");

//   if (responseText) {
//     // Save bot response
//     await addDoc(messagesRef, {
//       text: responseText,
//       sender: "bot",
//       timestamp: serverTimestamp(),
//       seen: false,
//       handledBy: "bot"
//     });
//   } else {
//     // Notify lecturer that student needs manual reply
//     const alertRef = doc(collection(db, "Alerts"));
//     await setDoc(alertRef, {
//       type: "manual_response_needed",
//       tutorId,
//       studentRef: referenceNumber,
//       messageText,
//       timestamp: serverTimestamp(),
//       status: "unread"
//     });
//   }
// }
export async function handleStudentMessageWithBot(referenceNumber, messageText, tutorId) {
  const chatId = `${referenceNumber}_${tutorId}`;
  const messagesRef = collection(db, "Chats", chatId, "messages");

  try {
    const response = await axios.post("http://localhost:5000/bot", {
      message: messageText
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const botReply = response.data.reply;
    const manualRequired = response.data.manual_required;

    if (botReply) {
      await addDoc(messagesRef, {
        text: botReply,
        sender: "bot",
        timestamp: serverTimestamp(),
        seen: false,
        handledBy: manualRequired ? "manual" : "bot"
      });
    }

    if (manualRequired) {
      const alertRef = doc(collection(db, "Alerts"));
      await setDoc(alertRef, {
        type: "manual_response_needed",
        tutorId,
        studentRef: referenceNumber,
        messageText,
        timestamp: serverTimestamp(),
        status: "unread"
      });
    }

  } catch (err) {
    console.error("Bot error:", err.message || err);

    const alertRef = doc(collection(db, "Alerts"));
    await setDoc(alertRef, {
      type: "manual_response_needed",
      tutorId,
      studentRef: referenceNumber,
      messageText,
      timestamp: serverTimestamp(),
      status: "unread"
    });
  }
}

export function requestNotificationPermission() {
  if ("Notification" in window) {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        console.log("Notification permission granted.");
      } else {
        console.warn("Notification permission denied.");
      }
    });
  }
}

export async function sendPasswordReset(email) {
  const auth = getAuth();

  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true, message: "Password reset email sent." };
  } catch (error) {
    return { success: false, message: error.message };
  }
}