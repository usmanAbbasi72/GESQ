// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, FirebaseOptions, FirebaseApp } from "firebase/app";
import { getDatabase, Database } from "firebase/database";
import { getAuth, Auth } from "firebase/auth";

// Your web app's Firebase configuration using environment variables
export const firebaseConfig: FirebaseOptions = {
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
export function isFirebaseConfigValid(config: FirebaseOptions): boolean {
  return !!(
    config.apiKey &&
    config.authDomain &&
    config.databaseURL &&
    config.projectId &&
    config.storageBucket &&
    config.messagingSenderId &&
    config.appId
  );
}

// Initialize Firebase
let app: FirebaseApp | undefined;
let db: Database | undefined;
let auth: Auth | undefined;

const configIsValid = isFirebaseConfigValid(firebaseConfig);

if (configIsValid) {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  db = getDatabase(app);
  auth = getAuth(app);
} else {
  // In a client-side context, this will appear in the browser console.
  // In a server-side context (like `seed.ts`), this will appear in the terminal.
  console.error("Firebase config is invalid. Make sure all required NEXT_PUBLIC_ environment variables are set.");
}


export { app, db, auth };
