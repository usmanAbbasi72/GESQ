
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, FirebaseApp, FirebaseOptions } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

// Your web app's Firebase configuration using environment variables
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Function to check if the firebase config is valid
function isFirebaseConfigValid(config: FirebaseOptions): boolean {
  return !!(
    config.apiKey &&
    config.authDomain &&
    config.projectId &&
    config.storageBucket &&
    config.messagingSenderId &&
    config.appId
  );
}

// Singleton instances
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let firestore: Firestore | undefined;

function initializeFirebase() {
  if (typeof window !== 'undefined') {
    if (!app) {
      if (isFirebaseConfigValid(firebaseConfig)) {
        try {
          app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
          auth = getAuth(app);
          firestore = getFirestore(app);
        } catch (e) {
          console.error("Failed to initialize Firebase", e);
        }
      } else {
        console.error("Firebase config is invalid. Make sure all required environment variables are set.");
      }
    }
  }
  return { app, auth, firestore };
}

export { initializeFirebase };
