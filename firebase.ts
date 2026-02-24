// Import the functions you need from the SDKs you need
import { initializeApp,getApps,getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAkuv2jYxx8Voia09uCgKt5EQwr2geb_AI",
  authDomain: "vyapara-mithra-otp.firebaseapp.com",
  projectId: "vyapara-mithra-otp",
  storageBucket: "vyapara-mithra-otp.firebasestorage.app",
  messagingSenderId: "79912266411",
  appId: "1:79912266411:web:98a1d1b69f3489e18425ee"
};

// Initialize Firebase
const app=getApps().length===0?initializeApp(firebaseConfig):getApp();
const auth=getAuth(app);
auth.useDeviceLanguage();
export {auth};