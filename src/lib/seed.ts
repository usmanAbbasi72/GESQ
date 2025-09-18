// DO NOT MODIFY THIS FILE
// This file is used to seed the database with initial data.
// To run this script, run `npm run seed` in your terminal.

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  "projectId": "studio-3766857156-b0e75",
  "appId": "1:810566605670:web:2874eb227af6b8405a06a7",
  "storageBucket": "studio-3766857156-b0e75.firebasestorage.app",
  "apiKey": "AIzaSyBOGlG8Yuc7OsRtMvfxAJzAhjmClOKDMXQ",
  "authDomain": "studio-3766857156-b0e75.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "810566605670"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const events = [
    {
        id: "EVT001",
        name: "Annual Tree Plantation 2024",
        date: "2024-08-15",
        organizedBy: "Green Environmental Society",
        purpose: "To increase green cover in the city."
    },
    {
        id: "EVT002",
        name: "Beach Cleanup Drive",
        date: "2024-09-22",
        organizedBy: "Green Environmental Society",
        purpose: "To clean and preserve our coastal ecosystems."
    },
];

const members = [
    {
        id: "GES101",
        userName: "Ahmed Khan",
        fatherName: "Zahid Khan",
        cnic: "42201-1234567-1",
        role: "Participant",
        approved: true,
        event: "Annual Tree Plantation 2024"
    },
    {
        id: "GES102",
        userName: "Fatima Ali",
        fatherName: "Ali Raza",
        cnic: "42201-2345678-2",
        role: "Volunteer",
        approved: true,
        event: "Annual Tree Plantation 2024"
    },
    {
        id: "GES103",
        userName: "Bilal Ahmed",
        fatherName: "Mushtaq Ahmed",
        cnic: "42201-3456789-3",
        role: "Organizer",
        approved: true,
        event: "Annual Tree Plantation 2024"
    },
];

const pendingMembers = [
    {
        userName: "Sana Javed",
        fatherName: "Javed Iqbal",
        cnic: "42201-4567890-4",
        role: "Participant"
    },
    {
        userName: "Usman Malik",
        fatherName: "Malik Shah",
        cnic: "42201-5678901-5",
        role: "Volunteer"
    }
]


async function seedDatabase() {
    console.log('Seeding database...');
    try {
        // Seed events
        const eventPromises = events.map(async (eventData) => {
            const { id, ...data } = eventData;
            await setDoc(doc(db, 'events', id), data);
            console.log(`Seeded event: ${id}`);
        });

        // Seed members
        const memberPromises = members.map(async (memberData) => {
            const { id, ...data } = memberData;
            await setDoc(doc(db, 'members', id), data);
             console.log(`Seeded member: ${id}`);
        });
        
        // Seed pending members
        const pendingPromises = pendingMembers.map(async (memberData) => {
            // Firestore will auto-generate an ID for pending members
            const newDocRef = doc(collection(db, 'pendingMembers'));
            await setDoc(newDocRef, memberData);
            console.log(`Seeded pending member: ${memberData.cnic}`);
        });
        
        await Promise.all([...eventPromises, ...memberPromises, ...pendingPromises]);
        console.log('Database seeding completed successfully!');
    } catch (error) {
        console.error('Error seeding database:', error);
    }
}

seedDatabase().then(() => {
    // Manually exit the process after a short delay
    setTimeout(() => process.exit(0), 1000);
});
