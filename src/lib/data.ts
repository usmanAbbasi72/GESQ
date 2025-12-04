
import type { Member, Event } from './types';
import { initializeFirebase } from './firebase'; 
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';

// Helper function to convert snapshot to array
const snapshotToArray = (snapshot: any) => {
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
};

export async function getMembers(approved?: boolean): Promise<Member[]> {
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
    const { firestore } = initializeFirebase();
    if (!firestore) return [];
    const eventsCol = collection(firestore, 'events');
    const eventSnapshot = await getDocs(eventsCol);
    return snapshotToArray(eventSnapshot);
}

export async function getMemberById(id: string): Promise<Member | undefined> {
    const { firestore } = initializeFirebase();
    if (!firestore) return undefined;
    const memberDoc = doc(firestore, 'members', id);
    const memberSnapshot = await getDoc(memberDoc);
    if (memberSnapshot.exists() && memberSnapshot.data().approved) {
        return { ...memberSnapshot.data(), id: memberSnapshot.id } as Member;
    }
    return undefined;
}

export async function getEventByName(name: string): Promise<Event | undefined> {
    const { firestore } = initializeFirebase();
    if (!name || !firestore) return undefined;
    const eventsCol = collection(firestore, 'events');
    const q = query(eventsCol, where("name", "==", name));
    const eventSnapshot = await getDocs(q);
    if (!eventSnapshot.empty) {
        const eventDoc = eventSnapshot.docs[0];
        return { ...eventDoc.data(), id: eventDoc.id } as Event;
    }
    return undefined;
}
