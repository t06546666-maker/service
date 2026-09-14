const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { defineSecret } = require('firebase-functions/params');

admin.initializeApp();

// Define the Google AI Studio Secret
const geminiApiKey = defineSecret('GEMINI_API_KEY');

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

// Callable Function: Securely connect to Google AI Studio using Secret Manager
exports.askAIAssistant = functions.runWith({ secrets: [geminiApiKey] }).https.onCall(async (data, context) => {
  // Optional: Enforce authentication (uncomment if you only want logged-in users to use the AI)
  // if (!context.auth) {
  //   throw new functions.https.HttpsError('unauthenticated', 'You must be logged in to use the AI.');
  // }

  const userMessage = data.message;
  if (!userMessage) {
    throw new functions.https.HttpsError('invalid-argument', 'Message is required.');
  }

  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    
    // Retrieve the secure key from Secret Manager at runtime!
    const genAI = new GoogleGenerativeAI(geminiApiKey.value());
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are a helpful assistant for a Home Services app. 
      A user is going to describe a problem in their home. 
      Your job is to:
      1. Briefly diagnose what the likely issue is.
      2. Tell them exactly what kind of professional they need to hire (e.g., Plumber, Electrician, Carpenter).
      Keep your response friendly, concise, and under 3 sentences.
      
      User's problem: "${userMessage}"`;

    const result = await model.generateContent(prompt);
    const text = await result.response.text();

    return { response: text };
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw new functions.https.HttpsError('internal', 'AI is currently unavailable. Check your Secret Manager API key.');
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

// Example of a Firebase Storage Trigger (Runs automatically when a file is uploaded)
exports.onImageUploaded = functions.storage.object().onFinalize(async (object) => {
  // Get file details
  const filePath = object.name; // e.g., 'portfolios/professional123/image.jpg'
  const contentType = object.contentType; // e.g., 'image/jpeg'
  const size = object.size;

  console.log(`New file uploaded to Storage: ${filePath}`);
  console.log(`Type: ${contentType} | Size: ${(size / 1024 / 1024).toFixed(2)} MB`);

  // Exit if this is triggered on a file that is not an image
  if (!contentType.startsWith('image/')) {
    console.log('This is not an image. Skipping.');
    return null;
  }

  // To prevent an infinite loop, you must exit if the file has already been compressed
  if (object.metadata && object.metadata.compressed === 'true') {
    console.log('Image is already compressed. Skipping.');
    return null;
  }

  const path = require('path');
  const os = require('os');
  const fs = require('fs');
  const sharp = require('sharp');

  const bucket = admin.storage().bucket(object.bucket);
  const fileName = path.basename(filePath);

  // Define temporary file paths on the Cloud Function container
  const tempFilePath = path.join(os.tmpdir(), fileName);
  const compressedFileName = `temp_${fileName}`;
  const tempCompressedPath = path.join(os.tmpdir(), compressedFileName);

  try {
    // 1. Download the original image from Firebase Storage to the temporary directory
    console.log(`Downloading ${fileName} for compression...`);
    await bucket.file(filePath).download({ destination: tempFilePath });

    // 2. Compress and resize the image using 'sharp'
    console.log(`Compressing ${fileName}...`);
    await sharp(tempFilePath)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true }) // Max 800x800
      .jpeg({ quality: 80 }) // 80% quality JPEG compression
      .toFile(tempCompressedPath);

    // 3. Upload the compressed image back, OVERWRITING the original in Storage!
    console.log(`Overwriting original image at ${filePath}...`);
    await bucket.upload(tempCompressedPath, {
      destination: filePath,
      metadata: { 
        contentType: 'image/jpeg',
        metadata: { compressed: 'true' } // THIS PREVENTS THE INFINITE LOOP!
      }
    });

    // 4. Clean up the temporary files to prevent memory leaks
    fs.unlinkSync(tempFilePath);
    fs.unlinkSync(tempCompressedPath);

    console.log('Compression successful!');
  } catch (error) {
    console.error('Error compressing image:', error);
    // Clean up in case of error
    if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
    if (fs.existsSync(tempCompressedPath)) fs.unlinkSync(tempCompressedPath);
  }

  return null;
});
