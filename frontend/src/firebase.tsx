// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "automate-ai-9c9cc.firebaseapp.com",
  projectId: "automate-ai-9c9cc",
  storageBucket: "automate-ai-9c9cc.firebasestorage.app",
  messagingSenderId: "321944831652",
  appId: "1:321944831652:web:f8dc71c129fad006a7c831"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth= getAuth(app);
export const googleProvider = new GoogleAuthProvider();