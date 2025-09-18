import type { Member, Event } from './types';
import { db } from './firebase';
import { ref, get, child } from 'firebase/database';

// Helper function to convert snapshot to array
const snapshotToArray = (snapshot: any) => {
    const returnArr: any[] = [];
    snapshot.forEach((childSnapshot: any) => {
        const item = childSnapshot.val();
        item.id = childSnapshot.key;
        returnArr.push(item);
    });
    return returnArr;
};

const snapshotToObjectArray = (snapshot: any) => {
    if (!snapshot.exists()) return [];
    const data = snapshot.val();
    return Object.keys(data).map(key => ({ ...data[key], id: key }));
};

export async function getMembers(): Promise<Member[]> {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, 'members'));
    return snapshotToObjectArray(snapshot);
}

export async function getPendingMembers(): Promise<(Omit<Member, 'approved' | 'id' | 'event'> & { id: string })[]> {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, 'pendingMembers'));
    return snapshotToObjectArray(snapshot);
}

export async function getEvents(): Promise<Event[]> {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, 'events'));
    return snapshotToObjectArray(snapshot);
}

export async function getMemberById(id: string): Promise<Member | undefined> {
    const dbRef = ref(db, `members/${id}`);
    const snapshot = await get(dbRef);
    if (snapshot.exists()) {
        return { ...snapshot.val(), id: snapshot.key } as Member;
    }
    return undefined;
}

export async function getEventByName(name: string): Promise<Event | undefined> {
    if (!name) return undefined;
    const eventsRef = ref(db, 'events');
    const snapshot = await get(eventsRef);
    if (snapshot.exists()) {
        const events = snapshot.val();
        const eventId = Object.keys(events).find(key => events[key].name === name);
        if (eventId) {
            return { ...events[eventId], id: eventId } as Event;
        }
    }
    return undefined;
}
