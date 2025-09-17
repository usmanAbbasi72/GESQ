'use client';

import { getMemberById, getEventByName } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckCircle2, XCircle, Home, User, Calendar, Award, Download } from 'lucide-react';
import Certificate from '@/components/certificate';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useEffect, useRef, useState } from 'react';
import type { Member, Event } from '@/lib/types';
import html2canvas from 'html2canvas';
import { useToast } from '@/hooks/use-toast';

export default function VerifyPage({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const [member, setMember] = useState<Member | undefined>(undefined);
  const [event, setEvent] = useState<Event | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const certificateRef = useRef<HTMLDivElement>(null);
  const [id, setId] = useState<string>('');

  useEffect(() => {
    const currentId = params.id;
    if (currentId) {
      setId(currentId);
      const foundMember = getMemberById(currentId);
      setMember(foundMember);
      if (foundMember) {
        const foundEvent = getEventByName(foundMember.event);
        setEvent(foundEvent);
      }
    }
    setLoading(false);
  }, [params]);

  const handleDownload = () => {
    if (certificateRef.current) {
      toast({ title: 'Preparing Download', description: 'Generating high-resolution certificate...' });
      html2canvas(certificateRef.current, {
        scale: 3, // Increase scale for higher resolution
        useCORS: true,
        backgroundColor: null,
      }).then(canvas => {
        const link = document.createElement('a');
        link.download = `GreenPass_Certificate_${member?.id}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        toast({ title: 'Download Started', description: 'Your certificate is being downloaded.' });
      }).catch(err => {
        console.error('oops, something went wrong!', err);
        toast({ title: 'Download Failed', description: 'Could not generate certificate image.', variant: 'destructive'});
      });
    }
  };
  
  if (loading) {
    return (
       <div className="container py-10 text-center">
        <p>Loading member data...</p>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="container py-10">
        <Card className="max-w-md mx-auto">
          <CardHeader className="items-center text-center">
            <XCircle className="w-16 h-16 text-destructive" />
            <CardTitle className="text-2xl">Verification Failed</CardTitle>
            <CardDescription>
              No record found for ID: <strong>{id}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go to Homepage
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const detailItem = ({ label, value }: { label: string; value: string | undefined }) => (
    <div className="flex justify-between items-center text-sm">
      <p className="text-muted-foreground">{label}</p>
      <p className="font-semibold text-right">{value}</p>
    </div>
  );

  return (
    <div className="container py-10">
      <Card className="max-w-3xl mx-auto">
        <CardHeader className="items-center text-center">
          <CheckCircle2 className="w-16 h-16 text-primary" />
          <CardTitle className="text-2xl">Verification Successful</CardTitle>
          <CardDescription>
            This certificate is authentic and verified.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex-row items-center gap-2 space-y-0 pb-2">
                <User className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Member Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {detailItem({ label: 'Name', value: member.userName })}
                {detailItem({ label: 'Father\'s Name', value: member.fatherName })}
                {detailItem({ label: 'CNIC', value: member.cnic })}
                {detailItem({ label: 'Verification ID', value: member.id })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex-row items-center gap-2 space-y-0 pb-2">
                <Calendar className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {detailItem({ label: 'Event', value: event?.name })}
                {detailItem({ label: 'Date', value: event?.date ? new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A' })}
                <div className="flex justify-between items-center text-sm">
                  <p className="text-muted-foreground">Role</p>
                  <Badge variant="secondary">{member.role}</Badge>
                </div>
                {detailItem({ label: 'Organized By', value: event?.organizedBy })}
              </CardContent>
            </Card>
          </div>
          
          <Separator />
          
          <div className="space-y-2 text-center">
             <h3 className="text-xl font-semibold flex items-center justify-center gap-2"><Award className="text-primary"/> Digital Certificate</h3>
          </div>
          {event && <Certificate member={member} event={event} ref={certificateRef} />}

          <div className="text-center pt-4 flex justify-center gap-4">
            <Button onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download Certificate
            </Button>
            <Button asChild variant="outline">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Back to Homepage
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
