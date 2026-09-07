// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCYTNxpalSZZZcJgly489th0y4qiz6ZGhg",
  authDomain: "homeservice-9800b.firebaseapp.com",
  projectId: "homeservice-9800b",
  storageBucket: "homeservice-9800b.firebasestorage.app",
  messagingSenderId: "569099359259",
  appId: "1:569099359259:web:4fcaba583d0a280f0414be",
  measurementId: "G-NXS3XQR1K7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
