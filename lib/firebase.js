// lib/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCcKBkL9gAen_KFRp-leTpKWQh0lthNiYI",                   // 🔁 замени на свои значения
  authDomain: "cargo-777.firebaseapp.com",
  projectId: "cargo-777",
  storageBucket: "cargo-777.firebasestorage.app",
  messagingSenderId: "469852459393",
  appId: "1:469852459393:web:623dec708be5c1a16ad880",
   measurementId: "G-L7H3C52BEP"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
