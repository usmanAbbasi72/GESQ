
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, FirebaseApp, FirebaseOptions } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

// Your web app's Firebase configuration using environment variables
const firebaseConfig: FirebaseOptions = {
  "projectId": "studio-3766857156-b0e75",
  "appId": "1:810566605670:web:2874eb227af6b8405a06a7",
  "apiKey": "AIzaSyBOGlG8Yuc7OsRtMvfxAJzAhjmClOKDMXQ",
  "authDomain": "studio-3766857156-b0e75.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "810566605670",
  "storageBucket": "studio-3766857156-b0e75.appspot.com"
};

// Singleton instances
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let firestore: Firestore | undefined;

function initializeFirebase() {
  if (typeof window !== 'undefined') {
    if (!getApps().length) {
      try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        firestore = getFirestore(app);
      } catch (e) {
        console.error("Failed to initialize Firebase", e);
      }
    } else {
      app = getApp();
      auth = getAuth(app);
      firestore = getFirestore(app);
    }
  }
  return { app, auth, firestore };
}

export { initializeFirebase };
