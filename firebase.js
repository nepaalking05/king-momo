// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB7C2ghmuEwf4x6MiaUkFo56bH_vuZouJk",
  authDomain: "king-momo.firebaseapp.com",
  projectId: "king-momo",
  storageBucket: "king-momo.firebasestorage.app",
  messagingSenderId: "619973711912",
  appId: "1:619973711912:web:6a2fa6071c37e2bc37fd1d",
  measurementId: "G-LLCVEWNTY8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);