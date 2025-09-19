import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { ref, push, set } from 'firebase/database';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userName, fatherName, cnic, role, event } = body;

    // Basic validation
    if (!userName || !fatherName || !cnic || !role) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const newPendingMemberData = {
      userName,
      fatherName,
      cnic,
      role,
      event: event || '', // Handle optional event field
    };

    const pendingMembersRef = ref(db, 'pendingMembers');
    const newMemberRef = push(pendingMembersRef);
    await set(newMemberRef, newPendingMemberData);

    return NextResponse.json({ message: 'Pending member added successfully', id: newMemberRef.key }, { status: 201 });

  } catch (error) {
    console.error('Error adding pending member:', error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
