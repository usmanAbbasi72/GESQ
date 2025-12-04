
import type { Member, Event } from './types';
import { firestore } from './firebase'; // Use firestore instance
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';

// Helper function to convert snapshot to array
const snapshotToArray = (snapshot: any) => {
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
};

export async function getMembers(): Promise<Member[]> {
    if (!firestore) return [];
    const membersCol = collection(firestore, 'members');
    const memberSnapshot = await getDocs(membersCol);
    return snapshotToArray(memberSnapshot);
}

export async function getPendingMembers(): Promise<(Omit<Member, 'approved'> & { id: string })[]> {
    if (!firestore) return [];
    const pendingMembersCol = collection(firestore, 'pendingMembers');
    const pendingMemberSnapshot = await getDocs(pendingMembersCol);
    return snapshotToArray(pendingMemberSnapshot);
}

export async function getEvents(): Promise<Event[]> {
    if (!firestore) return [];
    const eventsCol = collection(firestore, 'events');
    const eventSnapshot = await getDocs(eventsCol);
    return snapshotToArray(eventSnapshot);
}

export async function getMemberById(id: string): Promise<Member | undefined> {
    if (!firestore) return undefined;
    const memberDoc = doc(firestore, 'members', id);
    const memberSnapshot = await getDoc(memberDoc);
    if (memberSnapshot.exists()) {
        return { ...memberSnapshot.data(), id: memberSnapshot.id } as Member;
    }
    return undefined;
}

export async function getEventByName(name: string): Promise<Event | undefined> {
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
