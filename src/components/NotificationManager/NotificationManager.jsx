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
            vapidKey: 'BBelyRiCvjgt49ASAUpNZv-vsTNZ73Ql3rMSYsPOxHGeKJt5NkDvG8szz7EWOoVnMKg5nChe7w7Qun7uQu6ObzE'
          });

          if (currentToken) {
            console.log('FCM Token:', currentToken);
            // Save the token to the user's document in Firestore as an array
            const { arrayUnion } = await import('firebase/firestore');
            await setDoc(doc(db, 'users', user.uid), {
              fcmTokens: arrayUnion(currentToken)
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

    const triggerWelcomeBack = async (user) => {
      // Check session storage so we only welcome them once per browser session
      if (!sessionStorage.getItem('welcomed_back')) {
        sessionStorage.setItem('welcomed_back', 'true');
        
        try {
          const { collection, addDoc } = await import('firebase/firestore');
          // Add a document to the notifications collection to trigger the Cloud Function
          await addDoc(collection(db, 'notifications'), {
            userId: user.uid,
            title: 'Welcome Back! 👋',
            body: `Great to see you again, ${user.displayName || 'User'}!`,
            createdAt: new Date().toISOString()
          });
          console.log("Triggered welcome back notification.");
        } catch (error) {
          console.error("Could not trigger welcome back:", error);
        }
      }
    };

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await requestNotificationPermission(user);
        
        // Wait 3 seconds to ensure token is saved, then trigger the welcome notification
        setTimeout(() => triggerWelcomeBack(user), 3000);
      }
    });

    // Listen for foreground messages
    const unsubscribeMessage = onMessage(messaging, (payload) => {
      console.log('Message received in foreground. ', payload);
      
      // Even if the tab is open, force a native system notification instead of an alert box
      if (Notification.permission === 'granted') {
        new Notification(payload.notification.title, {
          body: payload.notification.body,
          icon: '/logo.png' // Optional: add your logo here
        });
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeMessage();
    };
  }, []);

  // This component doesn't render anything visible
  return null;
}
