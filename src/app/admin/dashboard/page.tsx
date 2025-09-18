'use client';

import * as React from 'react';
import { getMembers as fetchMembers, getEvents as fetchEvents, getPendingMembers as fetchPendingMembers } from '@/lib/data';
import { db } from '@/lib/firebase';
import { ref, set, remove, push, onValue } from 'firebase/database';
import type { Member, Event } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type PendingMember = Omit<Member, 'approved'> & { id: string };

export default function AdminDashboard() {
  const { toast } = useToast();
  const [members, setMembers] = React.useState<Member[]>([]);
  const [pendingMembers, setPendingMembers] = React.useState<PendingMember[]>([]);
  const [events, setEvents] = React.useState<Event[]>([]);
  const [dbStatus, setDbStatus] = React.useState(false);
  
  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [membersData, pendingData, eventsData] = await Promise.all([
          fetchMembers(),
          fetchPendingMembers(),
          fetchEvents(),
        ]);
        setMembers(membersData);
        setPendingMembers(pendingData);
        setEvents(eventsData);
      } catch (error) {
        console.error("Error loading data: ", error);
        toast({ title: 'Error Loading Data', description: 'Could not fetch data from the database. Please check your connection and security rules.', variant: 'destructive' });
      }
    };
    loadData();

    const connectedRef = ref(db, '.info/connected');
    const unsubscribe = onValue(connectedRef, (snap) => {
      setDbStatus(snap.val() === true);
    });

    return () => {
      unsubscribe();
    };
  }, [toast]);

  const [isAddMemberOpen, setIsAddMemberOpen] = React.useState(false);
  const [newMemberName, setNewMemberName] = React.useState('');
  const [newMemberFatherName, setNewMemberFatherName] = React.useState('');
  const [newMemberCnic, setNewMemberCnic] = React.useState('');
  const [newMemberRole, setNewMemberRole] = React.useState<'Participant' | 'Volunteer' | 'Organizer' | 'Supervisor'>('Participant');
  const [newMemberEvent, setNewMemberEvent] = React.useState('');
  
  const [editingMember, setEditingMember] = React.useState<Member | null>(null);
  const [isEditMemberOpen, setIsEditMemberOpen] = React.useState(false);

  const [editingPendingMember, setEditingPendingMember] = React.useState<PendingMember | null>(null);
  const [isEditPendingMemberOpen, setIsEditPendingMemberOpen] = React.useState(false);

  const [editingEvent, setEditingEvent] = React.useState<Event | null>(null);
  const [isEditEventOpen, setIsEditEventOpen] = React.useState(false);
  
  const [isAddEventOpen, setIsAddEventOpen] = React.useState(false);
  const [newEventName, setNewEventName] = React.useState('');
  const [newEventDate, setNewEventDate] = React.useState('');
  const [newEventOrganizer, setNewEventOrganizer] = React.useState('');
  const [newEventCertificateUrl, setNewEventCertificateUrl] = React.useState('');

  const handleApprove = async (pendingMember: PendingMember) => {
    try {
      const newMemberId = `GES${String(members.length + pendingMembers.length + 101).padStart(3, '0')}`;
      const newMember: Omit<Member, 'id'> = {
        userName: pendingMember.userName,
        fatherName: pendingMember.fatherName,
        cnic: pendingMember.cnic,
        role: pendingMember.role,
        approved: true,
        event: pendingMember.event || '',
      };
      
      const memberRef = ref(db, `members/${newMemberId}`);
      await set(memberRef, newMember);
      
      const pendingMemberRef = ref(db, `pendingMembers/${pendingMember.id}`);
      await remove(pendingMemberRef);

      setMembers(prev => [...prev, { ...newMember, id: newMemberId }]);
      setPendingMembers(prev => prev.filter(m => m.id !== pendingMember.id));

      toast({ title: 'Member Approved', description: `${pendingMember.userName} has been approved.` });
    } catch(e) {
      console.error("Error approving member:", e);
      toast({ title: 'Error', description: 'Failed to approve member.', variant: 'destructive' });
    }
  };

  const handleReject = async (pendingMember: PendingMember) => {
    try {
      const pendingMemberRef = ref(db, `pendingMembers/${pendingMember.id}`);
      await remove(pendingMemberRef);

      setPendingMembers(prev => prev.filter(m => m.id !== pendingMember.id));
      toast({ title: 'Member Rejected', description: `${pendingMember.userName} has been rejected.`, variant: 'destructive' });
    } catch (e) {
      console.error("Error rejecting member:", e);
      toast({ title: 'Error', description: 'Failed to reject member.', variant: 'destructive' });
    }
  };
  
  const handleDelete = async (member: Member) => {
    try {
      const memberRef = ref(db, `members/${member.id}`);
      await remove(memberRef);
      setMembers(prev => prev.filter(m => m.id !== member.id));
      toast({ title: 'Member Deleted', description: `${member.userName} has been deleted.`, variant: 'destructive' });
    } catch (e) {
       toast({ title: 'Error', description: 'Failed to delete member.', variant: 'destructive' });
    }
  };
  
  const handleDeleteEvent = async (event: Event) => {
    try {
      const eventRef = ref(db, `events/${event.id}`);
      await remove(eventRef);
      setEvents(prev => prev.filter(e => e.id !== event.id));
      toast({ title: 'Event Deleted', description: `${event.name} has been deleted.`, variant: 'destructive' });
    } catch(e) {
      toast({ title: 'Error', description: 'Failed to delete event.', variant: 'destructive' });
    }
  };

  const handleAddMember = async () => {
    if (!newMemberName || !newMemberFatherName || !newMemberCnic || !newMemberRole || !newMemberEvent) {
      toast({ title: 'Error', description: 'Please fill out all fields.', variant: 'destructive' });
      return;
    }
    
    const newPendingMemberData = {
      userName: newMemberName,
      fatherName: newMemberFatherName,
      cnic: newMemberCnic,
      role: newMemberRole,
      event: newMemberEvent,
    };
    
    try {
        const pendingMembersRef = ref(db, 'pendingMembers');
        const newMemberRef = push(pendingMembersRef);
        await set(newMemberRef, newPendingMemberData);

        const newMemberWithId = { ...newPendingMemberData, id: newMemberRef.key! };
        setPendingMembers(prev => [...prev, newMemberWithId]);

        setIsAddMemberOpen(false);
        toast({ title: "Member Added", description: `${newMemberName} is pending approval.`});
        // Reset form
        setNewMemberName('');
        setNewMemberFatherName('');
        setNewMemberCnic('');
        setNewMemberRole('Participant');
        setNewMemberEvent('');
    } catch (e) {
      console.error("Error adding member:", e);
      toast({ title: 'Error', description: 'Failed to add member.', variant: 'destructive' });
    }
  };

  const handleOpenEditMember = (member: Member) => {
    setEditingMember({ ...member });
    setIsEditMemberOpen(true);
  };

  const handleUpdateMember = async () => {
    if (!editingMember) return;
    try {
      const { id, ...memberToSave } = editingMember;
      const memberRef = ref(db, `members/${id}`);
      await set(memberRef, memberToSave);

      setMembers(prev => prev.map(m => (m.id === editingMember.id ? editingMember : m)));
      setIsEditMemberOpen(false);
      setEditingMember(null);
      toast({ title: "Changes Saved", description: `Details for ${editingMember.userName} have been updated.` });
    } catch(e) {
      console.error("Error updating member:", e);
      toast({ title: 'Error', description: 'Failed to update member.', variant: 'destructive' });
    }
  };

  const handleOpenEditPendingMember = (member: PendingMember) => {
    setEditingPendingMember({ ...member });
    setIsEditPendingMemberOpen(true);
  };

  const handleUpdatePendingMember = async () => {
    if (!editingPendingMember) return;
    try {
      const { id, ...memberToSave } = editingPendingMember;
      const pendingMemberRef = ref(db, `pendingMembers/${id}`);
      await set(pendingMemberRef, memberToSave);

      setPendingMembers(prev => prev.map(m => 
        m.id === editingPendingMember.id 
        ? editingPendingMember 
        : m
      ));
      setIsEditPendingMemberOpen(false);
      setEditingPendingMember(null);
      toast({ title: "Changes Saved", description: `Details for ${editingPendingMember.userName} have been updated.` });
    } catch(e) {
       console.error("Error updating pending member:", e);
       toast({ title: 'Error', description: 'Failed to update member.', variant: 'destructive' });
    }
  };
  
  const handleOpenEditEvent = (event: Event) => {
    setEditingEvent({ ...event });
    setIsEditEventOpen(true);
  };

  const handleUpdateEvent = async () => {
    if (!editingEvent) return;
     try {
      const { id, ...eventToSave } = editingEvent;
      const eventRef = ref(db, `events/${id}`);
      await set(eventRef, eventToSave);

      setEvents(prev => prev.map(e => (e.id === editingEvent.id ? editingEvent : e)));
      setIsEditEventOpen(false);
      setEditingEvent(null);
      toast({ title: "Changes Saved", description: `Details for ${editingEvent.name} have been updated.` });
    } catch(e) {
      console.error("Error updating event:", e);
      toast({ title: 'Error', description: 'Failed to update event.', variant: 'destructive' });
    }
  };
  
  const handleAddEvent = async () => {
    if (!newEventName || !newEventDate || !newEventOrganizer) {
      toast({ title: 'Error', description: 'Please fill out all fields.', variant: 'destructive' });
      return;
    }
    const newEventData = {
      name: newEventName,
      date: newEventDate,
      organizedBy: newEventOrganizer,
      purpose: '', // Default purpose
      certificateUrl: newEventCertificateUrl || '',
    };
    try {
      const eventsRef = ref(db, 'events');
      const newEventRef = push(eventsRef);
      await set(newEventRef, newEventData);

      const newEventWithId: Event = { ...newEventData, id: newEventRef.key! };
      setEvents(prevEvents => [...prevEvents, newEventWithId]); 

      setIsAddEventOpen(false);
      toast({ title: "Event Added", description: `${newEventName} has been created.` });
      // Reset form
      setNewEventName('');
      setNewEventDate('');
      setNewEventOrganizer('');
      setNewEventCertificateUrl('');
    } catch (e) {
      console.error("Error adding event: ", e);
      toast({ title: 'Error', description: 'Failed to add event.', variant: 'destructive' });
    }
  };

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-4">
             <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
             <div className="flex items-center gap-2">
                <span className={`h-3 w-3 rounded-full ${dbStatus ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="text-sm font-medium text-muted-foreground">{dbStatus ? 'Connected' : 'Disconnected'}</span>
              </div>
          </div>
          <p className="text-muted-foreground">Manage members and events for GreenPass.</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Member</DialogTitle>
                <DialogDescription>
                  Fill in the details to add a new member. The member will be added to the pending list for approval.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Name</Label>
                  <Input id="name" value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="fatherName" className="text-right">Father's Name</Label>
                  <Input id="fatherName" value={newMemberFatherName} onChange={(e) => setNewMemberFatherName(e.target.value)} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="cnic" className="text-right">CNIC</Label>
                  <Input id="cnic" value={newMemberCnic} onChange={(e) => setNewMemberCnic(e.target.value)} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">Role</Label>
                   <Select onValueChange={(value) => setNewMemberRole(value as any)} value={newMemberRole}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Participant">Participant</SelectItem>
                      <SelectItem value="Volunteer">Volunteer</SelectItem>
                      <SelectItem value="Organizer">Organizer</SelectItem>
                      <SelectItem value="Supervisor">Supervisor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="event-add-member" className="text-right">Event</Label>
                   <Select onValueChange={(value) => setNewMemberEvent(value)} value={newMemberEvent}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select an event" />
                    </SelectTrigger>
                    <SelectContent>
                      {events.map(event => (
                        <SelectItem key={event.id} value={event.name}>{event.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddMember}>Save Member</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Event
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Event</DialogTitle>
                <DialogDescription>
                  Fill in the details to create a new event.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="event-name" className="text-right">Name</Label>
                  <Input id="event-name" value={newEventName} onChange={(e) => setNewEventName(e.target.value)} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="event-date" className="text-right">Date</Label>
                  <Input id="event-date" type="date" value={newEventDate} onChange={(e) => setNewEventDate(e.target.value)} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="event-organizer" className="text-right">Organizer</Label>
                  <Input id="event-organizer" value={newEventOrganizer} onChange={(e) => setNewEventOrganizer(e.target.value)} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="event-cert-url" className="text-right">Certificate URL</Label>
                  <Input id="event-cert-url" value={newEventCertificateUrl} onChange={(e) => setNewEventCertificateUrl(e.target.value)} className="col-span-3" placeholder="https://picsum.photos/seed/cert/1200/800" />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddEvent}>Save Event</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="members">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="members">Approved Members</TabsTrigger>
          <TabsTrigger value="pending">Pending Members</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
        </TabsList>
        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>Approved Members</CardTitle>
              <CardDescription>List of all verified participants and staff.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Father's Name</TableHead>
                    <TableHead>CNIC</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.id}</TableCell>
                      <TableCell>{member.userName}</TableCell>
                      <TableCell>{member.fatherName}</TableCell>
                      <TableCell>{member.cnic}</TableCell>
                      <TableCell><Badge variant="outline">{member.role}</Badge></TableCell>
                      <TableCell>{member.event || 'N/A'}</TableCell>
                      <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Open menu</span><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                               <DropdownMenuItem onClick={() => handleOpenEditMember(member)}>Edit</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(member)}>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="pending">
           <Card>
            <CardHeader>
              <CardTitle>Pending Members</CardTitle>
              <CardDescription>List of members awaiting approval.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Father's Name</TableHead>
                    <TableHead>CNIC</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>{member.userName}</TableCell>
                      <TableCell>{member.fatherName}</TableCell>
                      <TableCell>{member.cnic}</TableCell>
                      <TableCell><Badge variant="secondary">{member.role}</Badge></TableCell>
                      <TableCell>{member.event || 'N/A'}</TableCell>
                       <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Open menu</span><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleApprove(member)}>Approve</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleOpenEditPendingMember(member)}>Edit</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleReject(member)}>Reject</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Events</CardTitle>
              <CardDescription>List of all organized events.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Organizer</TableHead>
                    <TableHead>Certificate URL</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">{event.name}</TableCell>
                      <TableCell>{event.date}</TableCell>
                      <TableCell>{event.organizedBy}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{event.certificateUrl || 'Not set'}</TableCell>
                      <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Open menu</span><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleOpenEditEvent(event)}>Edit</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDeleteEvent(event)}>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Edit Approved Member Dialog */}
      <Dialog open={isEditMemberOpen} onOpenChange={setIsEditMemberOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Member</DialogTitle>
          </DialogHeader>
          {editingMember && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" value={editingMember.userName} onChange={e => setEditingMember({...editingMember, userName: e.target.value})} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="fatherName" className="text-right">Father's Name</Label>
                <Input id="fatherName" value={editingMember.fatherName} onChange={e => setEditingMember({...editingMember, fatherName: e.target.value})} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cnic" className="text-right">CNIC</Label>
                <Input id="cnic" value={editingMember.cnic} onChange={e => setEditingMember({...editingMember, cnic: e.target.value})} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="event" className="text-right">Event</Label>
                 <Select onValueChange={(value) => setEditingMember(prev => prev ? {...prev, event: value === 'none' ? '' : value} : null)} value={editingMember.event || 'none'}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select an event" />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value="none">N/A</SelectItem>
                    {events.map(event => (
                      <SelectItem key={event.id} value={event.name}>{event.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">Role</Label>
                <Select onValueChange={(value) => setEditingMember(prev => prev ? {...prev, role: value as any} : null)} value={editingMember.role}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Participant">Participant</SelectItem>
                    <SelectItem value="Volunteer">Volunteer</SelectItem>
                    <SelectItem value="Organizer">Organizer</SelectItem>
                    <SelectItem value="Supervisor">Supervisor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleUpdateMember}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Pending Member Dialog */}
      <Dialog open={isEditPendingMemberOpen} onOpenChange={setIsEditPendingMemberOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Pending Member</DialogTitle>
          </DialogHeader>
          {editingPendingMember && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" value={editingPendingMember.userName} onChange={e => setEditingPendingMember(prev => prev ? {...prev, userName: e.target.value} : null)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="fatherName" className="text-right">Father's Name</Label>
                <Input id="fatherName" value={editingPendingMember.fatherName} onChange={e => setEditingPendingMember(prev => prev ? {...prev, fatherName: e.target.value} : null)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cnic" className="text-right">CNIC</Label>
                <Input id="cnic" value={editingPendingMember.cnic} onChange={e => setEditingPendingMember(prev => prev ? {...prev, cnic: e.target.value} : null)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">Role</Label>
                <Select onValueChange={(value) => setEditingPendingMember(prev => prev ? {...prev, role: value as any} : null)} value={editingPendingMember.role}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Participant">Participant</SelectItem>
                    <SelectItem value="Volunteer">Volunteer</SelectItem>
                    <SelectItem value="Organizer">Organizer</SelectItem>
                    <SelectItem value="Supervisor">Supervisor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="event-edit-pending" className="text-right">Event</Label>
                 <Select onValueChange={(value) => setEditingPendingMember(prev => prev ? {...prev, event: value === 'none' ? '' : value} : null)} value={editingPendingMember.event || 'none'}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select an event" />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value="none">N/A</SelectItem>
                    {events.map(event => (
                      <SelectItem key={event.id} value={event.name}>{event.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleUpdatePendingMember}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog */}
       <Dialog open={isEditEventOpen} onOpenChange={setIsEditEventOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          {editingEvent && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" value={editingEvent.name} onChange={(e) => setEditingEvent(prev => prev ? {...prev, name: e.target.value} : null)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">Date</Label>
                <Input id="date" type="date" value={editingEvent.date} onChange={(e) => setEditingEvent(prev => prev ? {...prev, date: e.target.value} : null)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="organizedBy" className="text-right">Organizer</Label>
                <Input id="organizedBy" value={editingEvent.organizedBy} onChange={(e) => setEditingEvent(prev => prev ? {...prev, organizedBy: e.target.value} : null)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="certificateUrl" className="text-right">Certificate URL</Label>
                <Input id="certificateUrl" value={editingEvent.certificateUrl || ''} onChange={(e) => setEditingEvent(prev => prev ? {...prev, certificateUrl: e.target.value} : null)} className="col-span-3" placeholder="https://picsum.photos/seed/cert/1200/800" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleUpdateEvent}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
