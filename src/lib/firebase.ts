// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "studio-3766857156-b0e75",
  "appId": "1:810566605670:web:2874eb227af6b8405a06a7",
  "storageBucket": "studio-3766857156-b0e75.firebasestorage.app",
  "apiKey": "AIzaSyBOGlG8Yuc7OsRtMvfxAJzAhjmClOKDMXQ",
  "authDomain": "studio-3766857156-b0e75.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "810566605670",
  "databaseURL": "https://studio-3766857156-b0e75-default-rtdb.firebaseio.com"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getDatabase(app);

export { app, db };
