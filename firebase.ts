// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAOh5SwFiz3QGfw-LJbtNeoKAAXpIW_Zm8",
  authDomain: "vyapara-mithra-82b4f.firebaseapp.com",
  projectId: "vyapara-mithra-82b4f",
  storageBucket: "vyapara-mithra-82b4f.firebasestorage.app",
  messagingSenderId: "755264343993",
  appId: "1:755264343993:web:b49ad4aafa41cc9b3a7068",
  measurementId: "G-4YTVQSVZN0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);