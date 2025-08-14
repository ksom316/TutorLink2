importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js");

// Initialize Firebase app in the service worker (same config as your app)
firebase.initializeApp({
  apiKey: "AIzaSyAG2iU7DwcNEXgjZzq5sw1mrgF21_enGGc",
  authDomain: "tutorlink2-43914.firebaseapp.com",
  projectId: "tutorlink2-43914",
  storageBucket: "tutorlink2-43914.firebasestorage.app",
  messagingSenderId: "809157396819",
  appId: "1:809157396819:web:a45f7f359658b3e29b79a6",
});

// const firebaseConfig = {
//   apiKey: "AIzaSyAG2iU7DwcNEXgjZzq5sw1mrgF21_enGGc",
//   authDomain: "tutorlink2-43914.firebaseapp.com",
//   projectId: "tutorlink2-43914",
//   storageBucket: "tutorlink2-43914.firebasestorage.app",
//   messagingSenderId: "809157396819",
//   appId: "1:809157396819:web:a45f7f359658b3e29b79a6",
//   measurementId: "G-LK9GX6ELJ0"
// };
// Retrieve messaging instance
const messaging = firebase.messaging();

// Handle background message
messaging.onBackgroundMessage((payload) => {
  console.log("Received background message ", payload);
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: payload.notification.icon
  });
});