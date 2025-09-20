export interface Member {
  id: string;
  userName: string;
  fatherName: string;
  cnic: string;
  event: string;
  role: 'Participant' | 'Volunteer' | 'Organizer' | 'Supervisor';
  approved: boolean;
}

export interface Event {
  id: string;
  name: string;
  organizedBy: string;
  date: string;
  certificateUrl?: string;
  certificateBackgroundColor?: string;
  certificateTextColor?: string;
  organizerSignUrl?: string;
  qrCodeUrl?: string;
}
