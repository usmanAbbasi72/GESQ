// DO NOT MODIFY THIS FILE
// This file is used to seed the database with initial data.
// To run this script, run `npm run seed` in your terminal.
import 'dotenv/config'
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set } from 'firebase/database';
import { firebaseConfig, isFirebaseConfigValid } from './firebase';

if (!isFirebaseConfigValid(firebaseConfig)) {
    console.error('Firebase config is invalid. Make sure all required NEXT_PUBLIC_ environment variables are set in your .env file before running the seed script.');
    process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const events = {
    "EVT001": {
        name: "Annual Tree Plantation 2024",
        date: "2024-08-15",
        organizedBy: "Green Environmental Society",
        purpose: "To increase green cover in the city."
    },
    "EVT002": {
        name: "Beach Cleanup Drive",
        date: "2024-09-22",
        organizedBy: "Green Environmental Society",
        purpose: "To clean and preserve our coastal ecosystems."
    },
};

const members = {
    "GES101": {
        userName: "Ahmed Khan",
        fatherName: "Zahid Khan",
        cnic: "42201-1234567-1",
        role: "Participant",
        approved: true,
        event: "Annual Tree Plantation 2024"
    },
    "GES102": {
        userName: "Fatima Ali",
        fatherName: "Ali Raza",
        cnic: "42201-2345678-2",
        role: "Volunteer",
        approved: true,
        event: "Annual Tree Plantation 2024"
    },
    "GES103": {
        userName: "Bilal Ahmed",
        fatherName: "Mushtaq Ahmed",
        cnic: "42201-3456789-3",
        role: "Organizer",
        approved: true,
        event: "Annual Tree Plantation 2024"
    },
};

const pendingMembers = {
    "PEND001": {
        userName: "Sana Javed",
        fatherName: "Javed Iqbal",
        cnic: "42201-4567890-4",
        role: "Participant",
        event: "Beach Cleanup Drive",
    },
    "PEND002": {
        userName: "Usman Malik",
        fatherName: "Malik Shah",
        cnic: "42201-5678901-5",
        role: "Volunteer",
        event: "Beach Cleanup Drive",
    }
};

async function seedDatabase() {
    console.log('Seeding Realtime Database...');
    try {
        const rootRef = ref(db);
        await set(rootRef, {
            events,
            members,
            pendingMembers
        });
        console.log('Database seeding completed successfully!');
    } catch (error) {
        console.error('Error seeding database:', error);
    }
}

seedDatabase().then(() => {
    setTimeout(() => process.exit(0), 1000);
});
