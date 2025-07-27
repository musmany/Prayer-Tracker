// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  GeoPoint,
  addDoc,
  deleteDoc,
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// TODO: Replace with your actual Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyD0XbAhxM_BoJnHOhwJMlQ8TgUStg9Z5Zk",
  authDomain: "namaz-30eae.firebaseapp.com",
  projectId: "namaz-30eae",
  storageBucket: "namaz-30eae.firebasestorage.app",
  messagingSenderId: "711725767696",
  appId: "1:711725767696:web:53c30f583cc75bdbce7e95"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

// Firestore References
const getUserSettingsRef = (uid) => doc(db, "users", uid, "settings", "location");
const getJamatTimingsRef = (uid) => doc(db, "users", uid, "settings", "jamatTimings");
const getPrayerDayRef = (uid, dateStr) => doc(db, "users", uid, "prayers", dateStr); // daily record

// Exports
export {
  auth,
  db,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  GeoPoint,
  addDoc,
  deleteDoc,
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  Timestamp,
  getUserSettingsRef,
  getJamatTimingsRef,
  getPrayerDayRef
};
