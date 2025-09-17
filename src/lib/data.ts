import type { Member, Event } from './types';
import { db } from './firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

export async function getMembers(): Promise<Member[]> {
    const querySnapshot = await getDocs(collection(db, "members"));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Member));
}

export async function getPendingMembers(): Promise<Omit<Member, 'approved' | 'id'>[]> {
    const querySnapshot = await getDocs(collection(db, "pendingMembers"));
    return querySnapshot.docs.map(doc => doc.data() as Omit<Member, 'approved' | 'id'>);
}

export async function getEvents(): Promise<Event[]> {
    const querySnapshot = await getDocs(collection(db, "events"));
    return querySnapshot.docs.map(doc => doc.data() as Event);
}


export async function getMemberById(id: string): Promise<Member | undefined> {
  const docRef = doc(db, "members", id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Member;
  } else {
    return undefined;
  }
}

export async function getEventByName(name: string): Promise<Event | undefined> {
    const querySnapshot = await getDocs(collection(db, "events"));
    const events = querySnapshot.docs.map(doc => doc.data() as Event);
    return events.find(event => event.name.toLowerCase() === name.toLowerCase());
}
