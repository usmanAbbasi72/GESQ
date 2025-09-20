
'use client';

import * as React from 'react';
import { getMembers as fetchMembers, getEvents as fetchEvents, getPendingMembers as fetchPendingMembers } from '@/lib/data';
import { db } from '@/lib/firebase';
import { ref, set, remove, push, onValue } from 'firebase/database';
import type { Member, Event } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, PlusCircle, Users, CheckSquare, Calendar, Settings, Award, Eye, Loader2, Search, ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight, LayoutDashboard, UserCheck, UserX } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SidebarProvider, Sidebar, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarHeader, SidebarTrigger, SidebarContent, SidebarFooter } from '@/components/ui/sidebar';
import Certificate from '@/components/certificate';
import { Checkbox } from '@/components/ui/checkbox';

type PendingMember = Omit<Member, 'approved'> & { id: string };

type DashboardView = 'overview' | 'members' | 'pending' | 'events' | 'certificates' | 'settings';

const sampleMember: Member = {
  id: 'GES-SAMPLE',
  userName: 'John Doe',
  fatherName: 'Richard Doe',
  cnic: '00000-0000000-0',
  email: 'john.doe@example.com',
  role: 'Participant',
  approved: true,
  event: '',
};

const ITEMS_PER_PAGE = 10;

export default function AdminDashboard() {
  const { toast } = useToast();
  const [members, setMembers] = React.useState<Member[]>([]);
  const [pendingMembers, setPendingMembers] = React.useState<PendingMember[]>([]);
  const [events, setEvents] = React.useState<Event[]>([]);
  const [dbStatus, setDbStatus] = React.useState(false);
  const [view, setView] = React.useState<DashboardView>('overview');
  const [isLoading, setIsLoading] = React.useState(true);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const [searchQuery, setSearchQuery] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [selectedPending, setSelectedPending] = React.useState<string[]>([]);

  const [previewEvent, setPreviewEvent] = React.useState<Event | null>(null);

  React.useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
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
      } finally {
        setIsLoading(false);
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
  const [newMemberEmail, setNewMemberEmail] = React.useState('');
  const [newMemberRole, setNewMemberRole] = React.useState<'Participant' | 'Volunteer' | 'Organizer' | 'Supervisor'>('Participant');
  const [newMemberEvent, setNewMemberEvent] = React.useState('');
  
  const [editingMember, setEditingMember] = React.useState<Member | null>(null);
  const [isEditMemberOpen, setIsEditMemberOpen] = React.useState(false);

  const [editingPendingMember, setEditingPendingMember] = React.useState<PendingMember | null>(null);
  const [isEditPendingMemberOpen, setIsEditPendingMemberOpen] = React.useState(false);

  const [editingEvent, setEditingEvent] = React.useState<Event | null>(null);
  const [isEditEventOpen, setIsEditEventOpen] = React.useState(false);
  
  const [isAddEventOpen, setIsAddEventOpen] = React.useState(false);
  const [newEventData, setNewEventData] = React.useState<Partial<Omit<Event, 'id'>>>({
    name: '',
    date: '',
    organizedBy: '',
    certificateUrl: '',
    certificateBackgroundColor: '#ffffff',
    certificateTextColor: '#000000',
    organizerSignUrl: '',
    qrCodeUrl: '',
  });

  const handleApprove = async (pendingMember: PendingMember) => {
    setIsProcessing(true);
    try {
      const newMemberId = `GES${String(members.length + pendingMembers.length + 101).padStart(3, '0')}`;
      const newMember: Omit<Member, 'id'> = {
        userName: pendingMember.userName,
        fatherName: pendingMember.fatherName,
        cnic: pendingMember.cnic,
        email: pendingMember.email,
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
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (pendingMemberId: string) => {
    setIsProcessing(true);
    const memberToReject = pendingMembers.find(m => m.id === pendingMemberId);
    try {
      const pendingMemberRef = ref(db, `pendingMembers/${pendingMemberId}`);
      await remove(pendingMemberRef);

      setPendingMembers(prev => prev.filter(m => m.id !== pendingMemberId));
      toast({ title: 'Member Rejected', description: `${memberToReject?.userName || 'Member'} has been rejected.`, variant: 'destructive' });
    } catch (e) {
      console.error("Error rejecting member:", e);
      toast({ title: 'Error', description: 'Failed to reject member.', variant: 'destructive' });
    } finally {
        setIsProcessing(false);
    }
  };
  
  const handleBulkActions = async (action: 'approve' | 'reject') => {
    setIsProcessing(true);
    const selected = pendingMembers.filter(m => selectedPending.includes(m.id));
    if (selected.length === 0) {
      toast({ title: 'No members selected', description: 'Please select members to perform this action.', variant: 'destructive' });
      setIsProcessing(false);
      return;
    }
    
    try {
      if (action === 'approve') {
        const approvalPromises = selected.map(async (member) => {
          const newMemberId = `GES${String(members.length + pendingMembers.length + 101 + Math.random()).padStart(3, '0')}`;
          const newMember: Omit<Member, 'id'> = {
            userName: member.userName, fatherName: member.fatherName, cnic: member.cnic,
            email: member.email, role: member.role, approved: true, event: member.event || '',
          };
          await set(ref(db, `members/${newMemberId}`), newMember);
          await remove(ref(db, `pendingMembers/${member.id}`));
          return { ...newMember, id: newMemberId };
        });
        const newApprovedMembers = await Promise.all(approvalPromises);

        setMembers(prev => [...prev, ...newApprovedMembers]);
        setPendingMembers(prev => prev.filter(m => !selectedPending.includes(m.id)));
        toast({ title: 'Bulk Approve Successful', description: `${selected.length} members have been approved.` });

      } else if (action === 'reject') {
        const rejectionPromises = selected.map(member => remove(ref(db, `pendingMembers/${member.id}`)));
        await Promise.all(rejectionPromises);

        setPendingMembers(prev => prev.filter(m => !selectedPending.includes(m.id)));
        toast({ title: 'Bulk Reject Successful', description: `${selected.length} members have been rejected.`, variant: 'destructive' });
      }
      setSelectedPending([]);
    } catch (e) {
      console.error(`Error during bulk ${action}:`, e);
      toast({ title: `Bulk ${action} failed`, description: 'An error occurred. Please try again.', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (member: Member) => {
    setIsProcessing(true);
    try {
      const memberRef = ref(db, `members/${member.id}`);
      await remove(memberRef);
      setMembers(prev => prev.filter(m => m.id !== member.id));
      toast({ title: 'Member Deleted', description: `${member.userName} has been deleted.`, variant: 'destructive' });
    } catch (e) {
       toast({ title: 'Error', description: 'Failed to delete member.', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleDeleteEvent = async (event: Event) => {
    setIsProcessing(true);
    try {
      const eventRef = ref(db, `events/${event.id}`);
      await remove(eventRef);
      setEvents(prev => prev.filter(e => e.id !== event.id));
      toast({ title: 'Event Deleted', description: `${event.name} has been deleted.`, variant: 'destructive' });
    } catch(e) {
      toast({ title: 'Error', description: 'Failed to delete event.', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddMember = async () => {
    if (!newMemberName || !newMemberFatherName || !newMemberCnic || !newMemberEmail || !newMemberRole || !newMemberEvent) {
      toast({ title: 'Error', description: 'Please fill out all fields.', variant: 'destructive' });
      return;
    }
    
    const newPendingMemberData = {
      userName: newMemberName,
      fatherName: newMemberFatherName,
      cnic: newMemberCnic,
      email: newMemberEmail,
      role: newMemberRole,
      event: newMemberEvent,
    };
    
    setIsProcessing(true);
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
        setNewMemberEmail('');
        setNewMemberRole('Participant');
        setNewMemberEvent('');
    } catch (e) {
      console.error("Error adding member:", e);
      toast({ title: 'Error', description: 'Failed to add member.', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenEditMember = (member: Member) => {
    setEditingMember({ ...member });
    setIsEditMemberOpen(true);
  };

  const handleUpdateMember = async () => {
    if (!editingMember) return;
    setIsProcessing(true);
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
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenEditPendingMember = (member: PendingMember) => {
    setEditingPendingMember({ ...member });
    setIsEditPendingMemberOpen(true);
  };

  const handleUpdatePendingMember = async () => {
    if (!editingPendingMember) return;
    setIsProcessing(true);
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
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleOpenEditEvent = (event: Event) => {
    setEditingEvent({ ...event });
    setIsEditEventOpen(true);
  };

  const handleUpdateEvent = async () => {
    if (!editingEvent) return;
    setIsProcessing(true);
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
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleAddEvent = async () => {
    if (!newEventData.name || !newEventData.date || !newEventData.organizedBy) {
      toast({ title: 'Error', description: 'Please fill out name, date, and organizer.', variant: 'destructive' });
      return;
    }
    const finalNewEventData = {
      ...newEventData,
    };
    setIsProcessing(true);
    try {
      const eventsRef = ref(db, 'events');
      const newEventRef = push(eventsRef);
      await set(newEventRef, finalNewEventData);

      const newEventWithId: Event = { ...finalNewEventData, id: newEventRef.key! } as Event;
      setEvents(prevEvents => [...prevEvents, newEventWithId]); 

      setIsAddEventOpen(false);
      toast({ title: "Event Added", description: `${finalNewEventData.name} has been created.` });
      // Reset form
      setNewEventData({
        name: '', date: '', organizedBy: '', certificateUrl: '',
        certificateBackgroundColor: '#ffffff', certificateTextColor: '#000000',
        organizerSignUrl: '', qrCodeUrl: '',
      });
    } catch (e) {
      console.error("Error adding event: ", e);
      toast({ title: 'Error', description: 'Failed to add event.', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredMembers = members.filter(member =>
    member.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.cnic.includes(searchQuery)
  );

  const filteredPendingMembers = pendingMembers.filter(member =>
    member.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.cnic.includes(searchQuery)
  );

  const getPaginatedData = <T,>(data: T[]) => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return data.slice(startIndex, endIndex);
  };
  
  const PaginationControls = ({ totalItems }: { totalItems: number }) => {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-end space-x-2 py-4">
        <span className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </span>
        <Button variant="outline" size="sm" onClick={() => setCurrentPage(1)} disabled={currentPage === 1 || isProcessing}>
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1 || isProcessing}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || isProcessing}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages || isProcessing}>
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  React.useEffect(() => {
    setCurrentPage(1);
    setSelectedPending([]);
  }, [view, searchQuery]);
  
  const renderContent = () => {
    if (isLoading) {
      return (
         <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    switch(view) {
      case 'overview':
        return (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{members.length}</div>
                  <p className="text-xs text-muted-foreground">approved members</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                  <CheckSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingMembers.length}</div>
                  <p className="text-xs text-muted-foreground">members awaiting approval</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{events.length}</div>
                   <p className="text-xs text-muted-foreground">events organized</p>
                </CardContent>
              </Card>
          </div>
        );
      case 'members':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Approved Members</CardTitle>
              <CardDescription>List of all verified participants and staff.</CardDescription>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search by name, ID, or CNIC..." className="pl-8" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
            </CardHeader>
            <CardContent>
              <Table className="hidden md:table">
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden lg:table-cell">Email</TableHead>
                    <TableHead className="hidden lg:table-cell">CNIC</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getPaginatedData(filteredMembers).map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.id}</TableCell>
                      <TableCell>{member.userName}</TableCell>
                      <TableCell className="hidden lg:table-cell">{member.email}</TableCell>
                      <TableCell className="hidden lg:table-cell">{member.cnic}</TableCell>
                      <TableCell><Badge variant="outline">{member.role}</Badge></TableCell>
                      <TableCell>{member.event || 'N/A'}</TableCell>
                      <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0" disabled={isProcessing}><span className="sr-only">Open menu</span><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                               <DropdownMenuItem onClick={() => handleOpenEditMember(member)} disabled={isProcessing}>Edit</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(member)} disabled={isProcessing}>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <PaginationControls totalItems={filteredMembers.length} />
              <div className="grid gap-4 md:hidden">
                {getPaginatedData(filteredMembers).map(member => (
                  <Card key={member.id} className="p-4">
                     <div className="flex items-center justify-between">
                        <div className="font-medium">{member.userName}</div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0" disabled={isProcessing}><span className="sr-only">Open menu</span><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                               <DropdownMenuItem onClick={() => handleOpenEditMember(member)} disabled={isProcessing}>Edit</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(member)} disabled={isProcessing}>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                      </div>
                      <div className="text-sm text-muted-foreground">{member.id} &middot; {member.email}</div>
                      <div className="text-sm text-muted-foreground">{member.cnic}</div>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="outline">{member.role}</Badge>
                        <div className="text-sm">{member.event || 'N/A'}</div>
                      </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      case 'pending':
        return (
           <Card>
            <CardHeader>
              <CardTitle>Pending Members</CardTitle>
              <CardDescription>List of members awaiting approval.</CardDescription>
              <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input type="search" placeholder="Search by name or CNIC..." className="pl-8" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                  </div>
                  <div className="flex gap-2">
                      <Button onClick={() => handleBulkActions('approve')} disabled={selectedPending.length === 0 || isProcessing}>
                        {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <UserCheck className="mr-2 h-4 w-4" />}
                         Approve Selected
                      </Button>
                      <Button variant="destructive" onClick={() => handleBulkActions('reject')} disabled={selectedPending.length === 0 || isProcessing}>
                         {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <UserX className="mr-2 h-4 w-4" />}
                         Reject Selected
                      </Button>
                  </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table className="hidden md:table">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox
                        checked={selectedPending.length > 0 && selectedPending.length === getPaginatedData(filteredPendingMembers).length}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedPending(getPaginatedData(filteredPendingMembers).map(m => m.id));
                          } else {
                            setSelectedPending([]);
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden lg:table-cell">Email</TableHead>
                    <TableHead className="hidden lg:table-cell">CNIC</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getPaginatedData(filteredPendingMembers).map((member) => (
                    <TableRow key={member.id} data-state={selectedPending.includes(member.id) && "selected"}>
                      <TableCell>
                        <Checkbox
                           checked={selectedPending.includes(member.id)}
                           onCheckedChange={(checked) => {
                            setSelectedPending(prev => checked ? [...prev, member.id] : prev.filter(id => id !== member.id));
                           }}
                        />
                      </TableCell>
                      <TableCell>{member.userName}</TableCell>
                      <TableCell className="hidden lg:table-cell">{member.email}</TableCell>
                      <TableCell className="hidden lg:table-cell">{member.cnic}</TableCell>
                      <TableCell><Badge variant="secondary">{member.role}</Badge></TableCell>
                      <TableCell>{member.event || 'N/A'}</TableCell>
                       <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0" disabled={isProcessing}><span className="sr-only">Open menu</span><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleApprove(member)} disabled={isProcessing}>Approve</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleOpenEditPendingMember(member)} disabled={isProcessing}>Edit</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleReject(member.id)} disabled={isProcessing}>Reject</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <PaginationControls totalItems={filteredPendingMembers.length} />
              <div className="grid gap-4 md:hidden">
                 {getPaginatedData(filteredPendingMembers).map(member => (
                  <Card key={member.id} className="p-4" data-state={selectedPending.includes(member.id) && "selected"}>
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <Checkbox
                             checked={selectedPending.includes(member.id)}
                             onCheckedChange={(checked) => {
                               setSelectedPending(prev => checked ? [...prev, member.id] : prev.filter(id => id !== member.id));
                             }}
                           />
                           <span className="font-medium">{member.userName}</span>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0" disabled={isProcessing}><span className="sr-only">Open menu</span><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleApprove(member)} disabled={isProcessing}>Approve</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleOpenEditPendingMember(member)} disabled={isProcessing}>Edit</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleReject(member.id)} disabled={isProcessing}>Reject</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                      </div>
                      <div className="text-sm text-muted-foreground ml-10">{member.email}</div>
                      <div className="text-sm text-muted-foreground ml-10">{member.cnic}</div>
                      <div className="flex items-center justify-between mt-2 ml-10">
                        <Badge variant="secondary">{member.role}</Badge>
                         <div className="text-sm">{member.event || 'N/A'}</div>
                      </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      case 'events':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Events</CardTitle>
              <CardDescription>List of all organized events. Edit an event to customize its certificate.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table className="hidden md:table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="hidden lg:table-cell">Organizer</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">{event.name}</TableCell>
                      <TableCell>{event.date}</TableCell>
                      <TableCell className="hidden lg:table-cell">{event.organizedBy}</TableCell>
                      <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0" disabled={isProcessing}><span className="sr-only">Open menu</span><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleOpenEditEvent(event)} disabled={isProcessing}>Edit Certificate</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDeleteEvent(event)} disabled={isProcessing}>Delete Event</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="grid gap-4 md:hidden">
                {events.map(event => (
                  <Card key={event.id} className="p-4">
                     <div className="flex items-center justify-between">
                        <div className="font-medium">{event.name}</div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0" disabled={isProcessing}><span className="sr-only">Open menu</span><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleOpenEditEvent(event)} disabled={isProcessing}>Edit Certificate</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDeleteEvent(event)} disabled={isProcessing}>Delete Event</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                      </div>
                      <div className="text-sm text-muted-foreground">{event.date} &middot; {event.organizedBy}</div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      case 'certificates':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Certificate Settings</CardTitle>
              <CardDescription>Manage certificate templates for events. Go to the Events tab to edit specific templates.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event Name</TableHead>
                    <TableHead>Certificate BG Image</TableHead>
                    <TableHead className="text-right w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium truncate">{event.name}</TableCell>
                      <TableCell className="truncate">
                        {event.certificateUrl ? (
                          <a href={event.certificateUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">
                            {event.certificateUrl}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">Default Template</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => setPreviewEvent(event)} disabled={isProcessing}>
                          <Eye className="mr-2 h-4 w-4" />
                           Preview
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );
        case 'settings':
          return (
             <Card>
                <CardHeader>
                  <CardTitle>Settings</CardTitle>
                  <CardDescription>Application settings and database status.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <span className={`h-3 w-3 rounded-full ${dbStatus ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="text-sm font-medium">Database Status: {dbStatus ? 'Connected' : 'Disconnected'}</span>
                  </div>
                </CardContent>
              </Card>
          )
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
      <Sidebar>
        <SidebarHeader>
          <h1 className="text-xl font-semibold font-headline text-white md:text-inherit">Admin Panel</h1>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => setView('overview')} isActive={view === 'overview'} className="text-white md:text-inherit">
                <LayoutDashboard/>
                Overview
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => setView('members')} isActive={view === 'members'} className="text-white md:text-inherit">
                <Users/>
                Approved Members
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => setView('pending')} isActive={view === 'pending'} className="text-white md:text-inherit">
                <CheckSquare />
                Pending Members
                {pendingMembers.length > 0 && <Badge className="ml-auto">{pendingMembers.length}</Badge>}
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => setView('events')} isActive={view === 'events'} className="text-white md:text-inherit">
                <Calendar />
                Events
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton onClick={() => setView('certificates')} isActive={view === 'certificates'} className="text-white md:text-inherit">
                <Award />
                Certificates
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
           <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setView('settings')} isActive={view === 'settings'} className="text-white md:text-inherit">
                    <Settings />
                    Settings
                </SidebarMenuButton>
            </SidebarMenuItem>
           </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="p-4 sm:p-6 lg:p-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-headline">
                  {view === 'overview' && 'Overview'}
                  {view === 'members' && 'Approved Members'}
                  {view === 'pending' && 'Pending Members'}
                  {view === 'events' && 'Events'}
                  {view === 'certificates' && 'Certificates'}
                  {view === 'settings' && 'Settings'}
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground">Manage your GreenPass system.</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
                <DialogTrigger asChild>
                  <Button disabled={isProcessing}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Member
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
                      <Label htmlFor="email" className="text-right">Email</Label>
                      <Input id="email" type="email" value={newMemberEmail} onChange={(e) => setNewMemberEmail(e.target.value)} className="col-span-3" />
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
                    <Button onClick={handleAddMember} disabled={isProcessing}>
                      {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Member
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" disabled={isProcessing}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Add New Event</DialogTitle>
                    <DialogDescription>
                      Fill in the details to create a new event and customize its certificate.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-6">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="event-name" className="text-right">Name</Label>
                      <Input id="event-name" value={newEventData.name ?? ''} onChange={(e) => setNewEventData(p => ({...p, name: e.target.value}))} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="event-date" className="text-right">Date</Label>
                      <Input id="event-date" type="date" value={newEventData.date ?? ''} onChange={(e) => setNewEventData(p => ({...p, date: e.target.value}))} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="event-organizer" className="text-right">Organizer</Label>
                      <Input id="event-organizer" value={newEventData.organizedBy ?? ''} onChange={(e) => setNewEventData(p => ({...p, organizedBy: e.target.value}))} className="col-span-3" />
                    </div>
                    <Card>
                      <CardHeader>
                        <CardTitle className='text-lg'>Certificate Design</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="event-cert-url" className="text-right">Background URL</Label>
                          <Input id="event-cert-url" value={newEventData.certificateUrl ?? ''} onChange={(e) => setNewEventData(p => ({...p, certificateUrl: e.target.value}))} className="col-span-3" placeholder="https://picsum.photos/seed/cert/1200/800" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="event-cert-bg-color" className="text-right">BG Color</Label>
                          <Input id="event-cert-bg-color" type="color" value={newEventData.certificateBackgroundColor ?? '#ffffff'} onChange={(e) => setNewEventData(p => ({...p, certificateBackgroundColor: e.target.value}))} className="col-span-3 h-10 p-1" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="event-cert-text-color" className="text-right">Text Color</Label>
                          <Input id="event-cert-text-color" type="color" value={newEventData.certificateTextColor ?? '#000000'} onChange={(e) => setNewEventData(p => ({...p, certificateTextColor: e.target.value}))} className="col-span-3 h-10 p-1" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="event-cert-sign-url" className="text-right">Signature URL</Label>
                          <Input id="event-cert-sign-url" value={newEventData.organizerSignUrl ?? ''} onChange={(e) => setNewEventData(p => ({...p, organizerSignUrl: e.target.value}))} className="col-span-3" placeholder="URL for organizer's signature image" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="event-cert-qr-url" className="text-right">QR Code URL</Label>
                          <Input id="event-cert-qr-url" value={newEventData.qrCodeUrl ?? ''} onChange={(e) => setNewEventData(p => ({...p, qrCodeUrl: e.target.value}))} className="col-span-3" placeholder="URL for a custom QR code image" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddEvent} disabled={isProcessing}>
                      {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Event
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          {renderContent()}
        </div>
      </SidebarInset>
      </div>

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
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input id="email" type="email" value={editingMember.email} onChange={e => setEditingMember({...editingMember, email: e.target.value})} className="col-span-3" />
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
            <Button onClick={handleUpdateMember} disabled={isProcessing}>
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save changes
            </Button>
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
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input id="email" type="email" value={editingPendingMember.email} onChange={e => setEditingPendingMember(prev => prev ? {...prev, email: e.target.value} : null)} className="col-span-3" />
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
            <Button onClick={handleUpdatePendingMember} disabled={isProcessing}>
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog */}
       <Dialog open={isEditEventOpen} onOpenChange={setIsEditEventOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Event & Certificate</DialogTitle>
          </DialogHeader>
          {editingEvent && (
            <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-6">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" value={editingEvent.name ?? ''} onChange={(e) => setEditingEvent(prev => prev ? {...prev, name: e.target.value} : null)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">Date</Label>
                <Input id="date" type="date" value={editingEvent.date ?? ''} onChange={(e) => setEditingEvent(prev => prev ? {...prev, date: e.target.value} : null)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="organizedBy" className="text-right">Organizer</Label>
                <Input id="organizedBy" value={editingEvent.organizedBy ?? ''} onChange={(e) => setEditingEvent(prev => prev ? {...prev, organizedBy: e.target.value} : null)} className="col-span-3" />
              </div>
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>Certificate Design</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="certificateUrl" className="text-right">Background URL</Label>
                    <Input id="certificateUrl" value={editingEvent.certificateUrl ?? ''} onChange={(e) => setEditingEvent(prev => prev ? {...prev, certificateUrl: e.target.value} : null)} className="col-span-3" placeholder="https://picsum.photos/seed/cert/1200/800" />
                  </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="certificateBgColor" className="text-right">BG Color</Label>
                    <Input id="certificateBgColor" type="color" value={editingEvent.certificateBackgroundColor ?? '#FFFFFF'} onChange={(e) => setEditingEvent(prev => prev ? {...prev, certificateBackgroundColor: e.target.value} : null)} className="col-span-3 h-10 p-1" />
                  </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="certificateTextColor" className="text-right">Text Color</Label>
                    <Input id="certificateTextColor" type="color" value={editingEvent.certificateTextColor ?? '#000000'} onChange={(e) => setEditingEvent(prev => prev ? {...prev, certificateTextColor: e.target.value} : null)} className="col-span-3 h-10 p-1" />
                  </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="organizerSignUrl" className="text-right">Signature URL</Label>
                    <Input id="organizerSignUrl" value={editingEvent.organizerSignUrl ?? ''} onChange={(e) => setEditingEvent(prev => prev ? {...prev, organizerSignUrl: e.target.value} : null)} className="col-span-3" placeholder="URL for organizer's signature image" />
                  </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="qrCodeUrl" className="text-right">QR Code URL</Label>
                    <Input id="qrCodeUrl" value={editingEvent.qrCodeUrl ?? ''} onChange={(e) => setEditingEvent(prev => prev ? {...prev, qrCodeUrl: e.target.value} : null)} className="col-span-3" placeholder="URL for custom QR code image" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleUpdateEvent} disabled={isProcessing}>
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Certificate Preview Dialog */}
      <Dialog open={!!previewEvent} onOpenChange={(isOpen) => !isOpen && setPreviewEvent(null)}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Certificate Preview: {previewEvent?.name}</DialogTitle>
            <DialogDescription>This is a sample of how the certificate will look for this event.</DialogDescription>
          </DialogHeader>
          {previewEvent && (
             <div className="my-4">
                <Certificate 
                    member={{...sampleMember, event: previewEvent.name}} 
                    event={previewEvent} 
                    verificationUrl={`https://gesq.netlify.app/verify/${sampleMember.id}`} 
                    onAssetsLoaded={() => {}}
                />
             </div>
          )}
          <DialogFooter>
              <Button variant="outline" onClick={() => setPreviewEvent(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
