const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

// Trigger when a new document is added to the "notifications" collection
exports.sendPushNotification = functions.firestore
  .document("notifications/{notificationId}")
  .onCreate(async (snap, context) => {
    const notificationData = snap.data();
  const targetUserId = notificationData.userId;
  const title = notificationData.title;
  const body = notificationData.body;

  if (!targetUserId || !title || !body) {
    console.log("Missing required fields, skipping notification.");
    return null;
  }

  try {
    // 1. Get the target user's profile to find their FCM device token
    const userDoc = await admin.firestore().collection("users").doc(targetUserId).get();
    
    if (!userDoc.exists) {
      console.log(`User ${targetUserId} not found.`);
      return null;
    }

    const userData = userDoc.data();
    const fcmTokens = userData.fcmTokens || [];
    
    // For backwards compatibility, if they have the old string format, add it to array
    if (userData.fcmToken && !fcmTokens.includes(userData.fcmToken)) {
      fcmTokens.push(userData.fcmToken);
    }

    if (fcmTokens.length === 0) {
      console.log(`User ${targetUserId} does not have any FCM tokens saved.`);
      return null;
    }

    // 2. Prepare the notification payload
    const message = {
      notification: {
        title: title,
        body: body,
      },
      tokens: fcmTokens,
      webpush: {
        notification: {
          icon: "/logo.png", // Web notification icon
          click_action: "https://homeservice-9800b.web.app/" // URL to open on click
        }
      }
    };

    // 3. Send the message to all devices
    const response = await admin.messaging().sendEachForMulticast(message);
    console.log("Successfully sent messages:", response.successCount, "success,", response.failureCount, "failures");

    // Optional: Mark notification as sent in Firestore
    await snap.ref.update({ status: 'sent', sentAt: admin.firestore.FieldValue.serverTimestamp() });
    
    return response;
  } catch (error) {
    console.error("Error sending push notification:", error);
    await snap.ref.update({ status: 'error', error: error.message });
    return null;
  }
});
