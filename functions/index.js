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

// Example of a Callable HTTP Function that can be called from React
exports.myCallableFunction = functions.https.onCall(async (data, context) => {
  // 1. (Optional) Ensure the user is authenticated before allowing them to run this
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }

  const userId = context.auth.uid;
  
  // 2. Access variables passed from your React app
  const passedMessage = data.message;

  try {
    // 3. Do some backend work here (e.g., talk to a database, send an email, etc.)
    console.log(`User ${userId} sent a message: ${passedMessage}`);

    // 4. Return data back to your React app
    return {
      success: true,
      response: `Hello User ${userId}! The server received your message: ${passedMessage}`
    };
  } catch (error) {
    // Return a structured error back to the frontend
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Example of a Firebase Auth Trigger (Runs automatically when a user signs up)
exports.onUserCreated = functions.auth.user().onCreate(async (user) => {
  const uid = user.uid;
  const email = user.email || 'No email provided';
  const phone = user.phoneNumber || 'No phone provided';
  const displayName = user.displayName || 'New User';

  console.log(`New user signed up! UID: ${uid}, Email: ${email}, Phone: ${phone}`);

  // You can execute automated background tasks here, such as:
  // 1. Sending a welcome email via an external provider (like SendGrid)
  // 2. Setting custom claims for role-based access
  // 3. Pushing a "Welcome" notification to their feed
  
  // Example: Let's create a welcome notification for them automatically!
  try {
    await admin.firestore().collection('notifications').add({
      userId: uid,
      title: "Welcome to KL09 Home Service!",
      body: "We are so glad you joined us. Start searching for professionals today!",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'pending'
    });
    console.log(`Welcome notification generated for ${uid}`);
  } catch (err) {
    console.error("Error creating welcome notification:", err);
  }

  return null;
});

// Trigger when a user is deleted from Firebase Authentication
exports.onUserDeleted = functions.auth.user().onDelete(async (user) => {
  const uid = user.uid;
  
  try {
    // 1. Fetch the user's existing data from the 'users' collection
    const userDocRef = admin.firestore().collection('users').doc(uid);
    const userDoc = await userDocRef.get();
    
    let additionalData = {};
    if (userDoc.exists) {
      additionalData = userDoc.data();
      
      // Clean up: delete the user from the active 'users' collection
      await userDocRef.delete();
    }

    // 2. Archive all their details in the 'deleted_users' collection
    await admin.firestore().collection('deleted_users').doc(uid).set({
      authUid: uid,
      authEmail: user.email || 'No email',
      authPhone: user.phoneNumber || 'No phone',
      authDisplayName: user.displayName || 'No name',
      deletedAt: admin.firestore.FieldValue.serverTimestamp(),
      // Spread all their original database profile information here
      originalProfileData: additionalData 
    });

    console.log(`Successfully archived and cleaned up deleted user: ${uid}`);
  } catch (error) {
    console.error(`Error archiving deleted user ${uid}:`, error);
  }
  
  return null;
});
