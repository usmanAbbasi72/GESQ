import type { Member, Event } from './types';

export const members: Member[] = [
  { id: 'GES001', userName: 'Arslan Ahmed', fatherName: 'Mehmood Ahmed', cnic: '12345-6789012-3', event: 'Tree Plantation Drive 2024', role: 'Volunteer', approved: true },
  { id: 'GES002', userName: 'Fatima Ali', fatherName: 'Zulfiqar Ali', cnic: '23456-7890123-4', event: 'Beach Cleanup Day', role: 'Participant', approved: true },
  { id: 'GES003', userName: 'Bilal Khan', fatherName: 'Imran Khan', cnic: '34567-8901234-5', event: 'Tree Plantation Drive 2024', role: 'Organizer', approved: true },
  { id: 'GES004', userName: 'Sana Iqbal', fatherName: 'Javed Iqbal', cnic: '45678-9012345-6', event: 'Recycling Awareness Campaign', role: 'Volunteer', approved: true },
];

export const pendingMembers: Omit<Member, 'approved' | 'id'>[] = [
   { userName: 'Zainab Bibi', fatherName: 'Ghulam Rasool', cnic: '56789-0123456-7', event: 'Beach Cleanup Day', role: 'Participant' },
];

export const events: Event[] = [
  { name: 'Tree Plantation Drive 2024', organizedBy: 'Green Environmental Society', date: '2024-08-15', purpose: 'To increase green cover in the urban areas and combat climate change.' },
  { name: 'Beach Cleanup Day', organizedBy: 'Green Environmental Society & Local Community', date: '2024-07-20', purpose: 'To clean up local beaches and raise awareness about marine pollution.' },
  { name: 'Recycling Awareness Campaign', organizedBy: 'Green Environmental Society', date: '2024-09-05', purpose: 'To educate the public on the importance of recycling and proper waste management.' },
];

export function getMemberById(id: string): Member | undefined {
  return members.find(member => member.id.toLowerCase() === id.toLowerCase());
}

export function getEventByName(name: string): Event | undefined {
  return events.find(event => event.name.toLowerCase() === name.toLowerCase());
}
