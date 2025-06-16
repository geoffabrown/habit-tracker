// Import the functions you need from the SDKs you need
// src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBZUonw7tij4js_0BpW6s269xYrrpVHNKc",
    authDomain: "habit-tracker-00943419.firebaseapp.com",
    projectId: "habit-tracker-00943419",
    storageBucket: "habit-tracker-00943419.firebasestorage.app",
    messagingSenderId: "20810395633",
    appId: "1:20810395633:web:84bb07dd67aeea3cf85e50"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
