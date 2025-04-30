// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyChp44Q9N6K6iqUgSqDfL88p9tGK6a1uyE",
  authDomain: "things-for-rent.firebaseapp.com",
  projectId: "things-for-rent",
  storageBucket: "things-for-rent.appspot.com", // Corrected storage bucket domain
  messagingSenderId: "876659536007",
  appId: "1:876659536007:web:c3673db94349991c06c822",
  measurementId: "G-1XMGYHZ5LG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

console.log("Firebase initialized and services exported from firebase-config.js");

export { app, auth, db, storage };

