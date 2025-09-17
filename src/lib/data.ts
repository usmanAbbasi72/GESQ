import type { Member, Event } from './types';
import { db } from './firebase';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';

export async function getMembers(): Promise<Member[]> {
    const querySnapshot = await getDocs(collection(db, "members"));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Member));
}

export async function getPendingMembers(): Promise<(Omit<Member, 'approved' | 'id' | 'event'>)[]> {
    const querySnapshot = await getDocs(collection(db, "pendingMembers"));
    return querySnapshot.docs.map(doc => doc.data() as Omit<Member, 'approved' | 'id' | 'event'>);
}

export async function getEvents(): Promise<Event[]> {
    const querySnapshot = await getDocs(collection(db, "events"));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
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
    if (!name) return undefined;
    const q = query(collection(db, "events"), where("name", "==", name));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        return { id: docSnap.id, ...docSnap.data() } as Event;
    }
    return undefined;
}
