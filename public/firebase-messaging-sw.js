// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
// Update these with your project configuration
firebase.initializeApp({
  apiKey: "AIzaSyCYTNxpalSZZZcJgly489th0y4qiz6ZGhg",
  authDomain: "homeservice-9800b.firebaseapp.com",
  projectId: "homeservice-9800b",
  storageBucket: "homeservice-9800b.firebasestorage.app",
  messagingSenderId: "569099359259",
  appId: "1:569099359259:web:4fcaba583d0a280f0414be"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || '/logo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
