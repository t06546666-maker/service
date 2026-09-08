import React, { useEffect } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { doc, setDoc } from 'firebase/firestore';
import { messaging, db, auth } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function NotificationManager() {
  useEffect(() => {
    // We only request permission and get token if messaging is supported and initialized
    if (!messaging) return;

    const requestNotificationPermission = async (user) => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('Notification permission granted.');
          // NOTE: You must replace 'YOUR_VAPID_KEY_HERE' with your actual VAPID key 
          // from Firebase Console -> Project Settings -> Cloud Messaging -> Web Configuration
          const currentToken = await getToken(messaging, { 
            vapidKey: 'YOUR_VAPID_KEY_HERE' 
          });

          if (currentToken) {
            console.log('FCM Token:', currentToken);
            // Save the token to the user's document in Firestore
            await setDoc(doc(db, 'users', user.uid), {
              fcmToken: currentToken
            }, { merge: true });
          } else {
            console.log('No registration token available. Request permission to generate one.');
          }
        } else {
          console.log('Unable to get permission to notify.');
        }
      } catch (error) {
        console.error('An error occurred while retrieving token. ', error);
      }
    };

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        requestNotificationPermission(user);
      }
    });

    // Listen for foreground messages
    const unsubscribeMessage = onMessage(messaging, (payload) => {
      console.log('Message received in foreground. ', payload);
      // You can customize how foreground notifications look here
      // E.g., showing a custom toast or alert
      alert(`${payload.notification.title}: ${payload.notification.body}`);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeMessage();
    };
  }, []);

  // This component doesn't render anything visible
  return null;
}
