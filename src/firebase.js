import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCLdMbreyQ_ZkxV0d4EWpAYXbKr26cktv0",
  authDomain: "chatpro-2f487.firebaseapp.com",
  projectId: "chatpro-2f487",
  storageBucket: "chatpro-2f487.firebasestorage.app",
  messagingSenderId: "128084015393",
  appId: "1:128084015393:web:1c147b3ce57ca3c6e02660",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
