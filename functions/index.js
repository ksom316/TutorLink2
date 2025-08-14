const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const logger = require("firebase-functions/logger");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, arrayRemove } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");

initializeApp();

module.exports.sendMessageNotification = onDocumentCreated(
  "Chats/{chatId}/messages/{messageId}",
  async (event) => {
    try {
      const message = event.data?.data();
      logger.info("Message data:", message);

      if (message?.seen) return;

      const [studentId, tutorId] = event.params.chatId.split("_");
      logger.info("studentId:", studentId, "tutorId:", tutorId);

      const firestore = getFirestore();

      // Get tutor tokens
      const tutorDoc = await firestore.collection("tutorInfo").doc(tutorId).get();
      const tutorTokens = tutorDoc.data()?.fcmTokens || [];
      const tutorName = tutorDoc.data()?.name || "Your tutor";

      // Get student tokens
      const studentDoc = await firestore.collection("StudentRecords").doc(studentId).get();
      const studentTokens = studentDoc.data()?.fcmTokens || [];
      const studentName = studentDoc.data()?.fullName || "A student";

      const messaging = getMessaging();

      // Helper function to send to tokens & remove invalids
      async function sendToTokens(tokens, notification) {
        for (const token of tokens) {
          try {
            await messaging.send({
              token,
              notification,
            });
          } catch (error) {
            logger.error(`Error sending notification to token ${token}:`, error);
            if (error.code === 'messaging/registration-token-not-registered') {
              // Remove invalid token from both StudentRecords and tutorInfo just in case
              await firestore.collection("tutorInfo").doc(tutorId).update({
                fcmTokens: arrayRemove(token),
              });
              await firestore.collection("StudentRecords").doc(studentId).update({
                fcmTokens: arrayRemove(token),
              });
              logger.info(`Removed invalid token ${token}`);
            }
          }
        }
      }

      // Send notification to tutor tokens
      if (tutorTokens.length) {
        await sendToTokens(tutorTokens, {
          title: `📩 TUTORLINK: New message from ${studentName}`,
          body: message?.text || "You’ve received a new message."
        });
        logger.info("Notifications sent to tutor tokens");
      } else {
        logger.warn("No tutor tokens found");
      }

      // Send notification to student tokens (e.g. tutor replying)
      if (studentTokens.length) {
        await sendToTokens(studentTokens, {
          title: `📩 TUTORLINK: New message from ${tutorName}`,
          body: message?.text || "You’ve received a new message."
        });
        logger.info("Notifications sent to student tokens");
      } else {
        logger.warn("No student tokens found");
      }

    } catch (error) {
      logger.error("Error in sendMessageNotification:", error);
    }
  }
);
