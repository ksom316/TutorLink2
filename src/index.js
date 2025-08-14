const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.notifyUserOnMessage = functions.firestore
  .document("Chats/{chatId}/messages/{messageId}")
  .onCreate(async (snap, context) => {
    const message = snap.data();
    const { chatId } = context.params;
    const { sender, text } = message;

    // Extract referenceNumber and tutorId from chatId
    const [referenceNumber, tutorId] = chatId.split("_");

    // Determine receiver based on sender
    let receiver;
    if (sender === referenceNumber) {
      receiver = tutorId;
    } else if (sender === tutorId) {
      receiver = referenceNumber;
    } else {
      console.warn("Sender does not match either ID in chatId:", sender);
      return;
    }

    // Get FCM token for the receiver
    const tokenDoc = await admin.firestore().collection("fcmTokens").doc(receiver).get();

    if (!tokenDoc.exists) {
      console.log("No FCM token found for receiver:", receiver);
      return;
    }

    const token = tokenDoc.data().token;

    const payload = {
      notification: {
        title: "📨 New message",
        body: text.length > 100 ? text.slice(0, 100) + "..." : text,
      },
      data: {
        chatId,
      },
    };

    // Send push notification
    try {
      await admin.messaging().sendToDevice(token, payload);
      console.log(`Notification sent to ${receiver}`);
    } catch (error) {
      console.error("Error sending FCM notification:", error);
    }
  });
