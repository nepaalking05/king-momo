import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB7C2ghmuEwf4x6MiaUkFo56bH_vuZouJk",
  authDomain: "king-momo.firebaseapp.com",
  projectId: "king-momo",
  storageBucket: "king-momo.firebasestorage.app",
  messagingSenderId: "619973711912",
  appId: "1:619973711912:web:6a2fa6071c37e2bc37fd1d",
  measurementId: "G-LLCVEWNTY8"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
