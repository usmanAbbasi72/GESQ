'use client';

import * as React from 'react';
import { members as initialMembers, events as initialEvents, pendingMembers as initialPendingMembers } from '@/lib/data';
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

export default function AdminDashboard() {
  const { toast } = useToast();
  const [members, setMembers] = React.useState<Member[]>(initialMembers);
  const [pendingMembers, setPendingMembers] = React.useState<(Omit<Member, 'id' | 'approved'> & { originalCnic: string })[]>(initialPendingMembers.map(m => ({ ...m, originalCnic: m.cnic })));
  const [events, setEvents] = React.useState<Event[]>(initialEvents);

  const [isAddMemberOpen, setIsAddMemberOpen] = React.useState(false);
  const [newMemberName, setNewMemberName] = React.useState('');
  const [newMemberEvent, setNewMemberEvent] = React.useState('');
  const [newMemberRole, setNewMemberRole] = React.useState<'Participant' | 'Volunteer' | 'Organizer'>('Participant');
  
  const [editingMember, setEditingMember] = React.useState<Member | null>(null);
  const [isEditMemberOpen, setIsEditMemberOpen] = React.useState(false);

  const [editingPendingMember, setEditingPendingMember] = React.useState<(Omit<Member, 'id' | 'approved'> & { originalCnic: string }) | null>(null);
  const [isEditPendingMemberOpen, setIsEditPendingMemberOpen] = React.useState(false);

  const [editingEvent, setEditingEvent] = React.useState<Event | null>(null);
  const [isEditEventOpen, setIsEditEventOpen] = React.useState(false);


  const handleApprove = (pendingMember: Omit<Member, 'id' | 'approved'>) => {
    const newMember: Member = {
      ...pendingMember,
      id: `GES${String(members.length + 10).padStart(3, '0')}`,
      approved: true,
    };
    setMembers([...members, newMember]);
    setPendingMembers(pendingMembers.filter(m => m.cnic !== pendingMember.cnic));
    toast({ title: 'Member Approved', description: `${pendingMember.userName} has been approved.` });
  };

  const handleReject = (pendingMember: Omit<Member, 'id' | 'approved'>) => {
    setPendingMembers(pendingMembers.filter(m => m.cnic !== pendingMember.cnic));
    toast({ title: 'Member Rejected', description: `${pendingMember.userName} has been rejected.`, variant: 'destructive' });
  };
  
  const handleDelete = (member: Member) => {
    setMembers(members.filter(m => m.id !== member.id));
    toast({ title: 'Member Deleted', description: `${member.userName} has been deleted.`, variant: 'destructive' });
  };
  
  const handleDeleteEvent = (event: Event) => {
    setEvents(events.filter(e => e.name !== event.name));
    toast({ title: 'Event Deleted', description: `${event.name} has been deleted.`, variant: 'destructive' });
  };

  const handleAddMember = () => {
    if (!newMemberName || !newMemberEvent || !newMemberRole) {
      toast({ title: 'Error', description: 'Please fill out all fields.', variant: 'destructive' });
      return;
    }
    
    const newPendingMember = {
      userName: newMemberName,
      fatherName: 'N/A', // Father's name and CNIC are not in the form
      cnic: `N/A-${Math.random().toString(36).substring(7)}`, // Add a random value to avoid collisions on key
      event: newMemberEvent,
      role: newMemberRole,
    };

    setPendingMembers([...pendingMembers, { ...newPendingMember, originalCnic: newPendingMember.cnic }]);
    setIsAddMemberOpen(false);
    toast({ title: "Member Added", description: `${newMemberName} has been added to the pending list.`});
    // Reset form
    setNewMemberName('');
    setNewMemberEvent('');
    setNewMemberRole('Participant');
  };

  const handleOpenEditMember = (member: Member) => {
    setEditingMember({ ...member });
    setIsEditMemberOpen(true);
  };

  const handleUpdateMember = () => {
    if (!editingMember) return;
    setMembers(members.map(m => (m.id === editingMember.id ? editingMember : m)));
    setIsEditMemberOpen(false);
    setEditingMember(null);
    toast({ title: "Changes Saved", description: `Details for ${editingMember.userName} have been updated.` });
  };

  const handleOpenEditPendingMember = (member: Omit<Member, 'id' | 'approved'> & { originalCnic: string }) => {
    setEditingPendingMember({ ...member });
    setIsEditPendingMemberOpen(true);
  };

  const handleUpdatePendingMember = () => {
    if (!editingPendingMember) return;
    setPendingMembers(pendingMembers.map(m => (m.originalCnic === editingPendingMember.originalCnic ? editingPendingMember : m)));
    setIsEditPendingMemberOpen(false);
    setEditingPendingMember(null);
    toast({ title: "Changes Saved", description: `Details for ${editingPendingMember.userName} have been updated.` });
  };
  
  const handleOpenEditEvent = (event: Event) => {
    setEditingEvent({ ...event });
    setIsEditEventOpen(true);
  };

  const handleUpdateEvent = () => {
    if (!editingEvent) return;
    setEvents(events.map(e => (e.name === editingEvent.name ? editingEvent : e)));
    setIsEditEventOpen(false);
    setEditingEvent(null);
    toast({ title: "Changes Saved", description: `Details for ${editingEvent.name} have been updated.` });
  };

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage members and events for GreenPass.</p>
        </div>
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
                <Label htmlFor="event" className="text-right">Event</Label>
                <Select onValueChange={setNewMemberEvent} value={newMemberEvent}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select an event" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map(event => (
                      <SelectItem key={event.name} value={event.name}>{event.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddMember}>Save Member</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
                    <TableHead>Event</TableHead>
                    <TableHead>Role</TableHead>
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
                      <TableCell>{member.event}</TableCell>
                      <TableCell><Badge variant="outline">{member.role}</Badge></TableCell>
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
                    <TableHead>Event</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingMembers.map((member) => (
                    <TableRow key={member.originalCnic}>
                      <TableCell>{member.userName}</TableCell>
                      <TableCell>{member.fatherName}</TableCell>
                      <TableCell>{member.cnic}</TableCell>
                      <TableCell>{member.event}</TableCell>
                      <TableCell><Badge variant="secondary">{member.role}</Badge></TableCell>
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
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.name}>
                      <TableCell className="font-medium">{event.name}</TableCell>
                      <TableCell>{event.date}</TableCell>
                      <TableCell>{event.organizedBy}</TableCell>
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
                 <Select onValueChange={(value) => setEditingMember({...editingMember, event: value})} value={editingMember.event}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select an event" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map(event => (
                      <SelectItem key={event.name} value={event.name}>{event.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">Role</Label>
                <Select onValueChange={(value) => setEditingMember({...editingMember, role: value as any})} value={editingMember.role}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Participant">Participant</SelectItem>
                    <SelectItem value="Volunteer">Volunteer</SelectItem>
                    <SelectItem value="Organizer">Organizer</SelectItem>
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
                <Input id="name" value={editingPendingMember.userName} onChange={e => setEditingPendingMember({...editingPendingMember, userName: e.target.value})} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="fatherName" className="text-right">Father's Name</Label>
                <Input id="fatherName" value={editingPendingMember.fatherName} onChange={e => setEditingPendingMember({...editingPendingMember, fatherName: e.target.value})} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cnic" className="text-right">CNIC</Label>
                <Input id="cnic" value={editingPendingMember.cnic} onChange={e => setEditingPendingMember({...editingPendingMember, cnic: e.target.value})} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="event" className="text-right">Event</Label>
                <Select onValueChange={(value) => setEditingPendingMember({...editingPendingMember, event: value})} value={editingPendingMember.event}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select an event" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map(event => (
                      <SelectItem key={event.name} value={event.name}>{event.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">Role</Label>
                <Select onValueChange={(value) => setEditingPendingMember({...editingPendingMember, role: value as any})} value={editingPendingMember.role}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Participant">Participant</SelectItem>
                    <SelectItem value="Volunteer">Volunteer</SelectItem>
                    <SelectItem value="Organizer">Organizer</SelectItem>
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
                <Input id="name" value={editingEvent.name} onChange={(e) => setEditingEvent({...editingEvent, name: e.target.value })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">Date</Label>
                <Input id="date" value={editingEvent.date} onChange={(e) => setEditingEvent({...editingEvent, date: e.target.value })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="organizedBy" className="text-right">Organizer</Label>
                <Input id="organizedBy" value={editingEvent.organizedBy} onChange={(e) => setEditingEvent({...editingEvent, organizedBy: e.target.value })} className="col-span-3" />
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
