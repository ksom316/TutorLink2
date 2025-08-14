// testFCM.cjs
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const registrationToken = "crKtFWd-bWKj9bc9qH8I4P:APA91bFHPzxaVj_7C77sU-E9eKEFdCWJ3s3Vprkw_oSb-6EmdYEPTvVRfAsMxg22dABhmJq3fL_GQxdOqLq3NUY5qEZzx8QZgy5XnEpuGXPeBLw1R7Z_NXk";

const message = {
  token: registrationToken,
  notification: {
    title: "Test Notification",
    body: "Hello from FCM!"
  }
};

admin.messaging().send(message)
  .then(response => {
    console.log("Successfully sent message:", response);
  })
  .catch(error => {
    console.error("Error sending message:", error);
  });


