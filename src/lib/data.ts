
import type { Member, Event } from './types';
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { collection, getDocs, doc, getDoc, query, where, getFirestore } from 'firebase/firestore';

// Main authenticated instance for admin use
import { initializeFirebase } from './firebase'; 

// --- Secondary, public-only Firebase App for Verification ---
// This ensures that public-facing data fetching is explicitly unauthenticated,
// allowing Firestore security rules to be evaluated correctly for public users.
const PUBLIC_FIREBASE_APP_NAME = 'publicApp';

function getPublicApp() {
  const apps = getApps();
  const publicApp = apps.find(app => app.name === PUBLIC_FIREBASE_APP_NAME);
  if (publicApp) {
    return publicApp;
  }

  // Your web app's Firebase configuration
  const firebaseConfig = {
    "projectId": "studio-3766857156-b0e75",
    "appId": "1:810566605670:web:2874eb227af6b8405a06a7",
    "apiKey": "AIzaSyBOGlG8Yuc7OsRtMvfxAJzAhjmClOKDMXQ",
    "authDomain": "studio-3766857156-b0e75.firebaseapp.com",
    "measurementId": "",
    "messagingSenderId": "810566605670",
    "storageBucket": "studio-3766857156-b0e75.appspot.com"
  };

  return initializeApp(firebaseConfig, PUBLIC_FIREBASE_APP_NAME);
}
// -------------------------------------------------------------


// Helper function to convert snapshot to array
const snapshotToArray = (snapshot: any) => {
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
};

export async function getMembers(approved?: boolean): Promise<Member[]> {
    // Uses the primary, authenticated instance for admin dashboard
    const { firestore } = initializeFirebase();
    if (!firestore) return [];
    
    const membersCol = collection(firestore, 'members');
    let q = query(membersCol);

    if (approved !== undefined) {
        q = query(membersCol, where("approved", "==", approved));
    }
    
    const memberSnapshot = await getDocs(q);
    const members = snapshotToArray(memberSnapshot);

    // Sort members to ensure consistent ordering for ID generation
    members.sort((a: Member, b: Member) => {
        const aNum = parseInt(a.id.split('-')[1] || '0', 10);
        const bNum = parseInt(b.id.split('-')[1] || '0', 10);
        return aNum - bNum;
    });

    return members;
}


export async function getEvents(): Promise<Event[]> {
    // Uses the primary, authenticated instance for admin dashboard
    const { firestore } = initializeFirebase();
    if (!firestore) return [];
    const eventsCol = collection(firestore, 'events');
    const eventSnapshot = await getDocs(eventsCol);
    return snapshotToArray(eventSnapshot);
}

export async function getMemberById(id: string): Promise<Member | undefined> {
    // Uses the dedicated public instance for verification
    try {
        const publicApp = getPublicApp();
        const publicFirestore = getFirestore(publicApp);
        
        const memberDocRef = doc(publicFirestore, 'members', id);
        const memberSnapshot = await getDoc(memberDocRef);
        
        if (memberSnapshot.exists()) {
            // The security rule `allow get: if resource.data.approved == true;` ensures
            // we only get here for approved members. No extra client-side check is needed.
            return { ...memberSnapshot.data(), id: memberSnapshot.id } as Member;
        }
    } catch (error) {
        console.error("Error fetching member by ID:", error);
    }

    return undefined;
}

export async function getEventByName(name: string): Promise<Event | undefined> {
    // Can use either public or private, let's use public for consistency on the verification page.
     try {
        const publicApp = getPublicApp();
        const publicFirestore = getFirestore(publicApp);
        
        if (!name) return undefined;
        
        const eventsCol = collection(publicFirestore, 'events');
        const q = query(eventsCol, where("name", "==", name));
        const eventSnapshot = await getDocs(q);
        
        if (!eventSnapshot.empty) {
            const eventDoc = eventSnapshot.docs[0];
            return { ...eventDoc.data(), id: eventDoc.id } as Event;
        }
    } catch (error) {
        console.error("Error fetching event by name:", error);
    }
    
    return undefined;
}
