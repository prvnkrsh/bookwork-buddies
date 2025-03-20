import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCe6Ranr2GqXGT-wbssGvTwrBqwZAKmRhc",
  authDomain: "familyreads-8d070.firebaseapp.com",
  projectId: "familyreads-8d070",
  storageBucket: "familyreads-8d070.firebasestorage.app",
  messagingSenderId: "962491725065",
  appId: "1:962491725065:web:9e89b4417629c9515bcfd8",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
