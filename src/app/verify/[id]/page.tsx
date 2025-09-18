import { getMemberById, getEventByName } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckCircle2, XCircle, Home, User, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Member, Event } from '@/lib/types';
import { CertificateDisplay } from '@/components/certificate-display';
import { headers } from 'next/headers';

async function getMemberData(id: string): Promise<{ member: Member | undefined; event: Event | undefined }> {
  const member = await getMemberById(id);
  if (!member) {
    return { member: undefined, event: undefined };
  }
  const event = await getEventByName(member.event);
  return { member, event };
}

export default async function VerifyPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { member, event } = await getMemberData(id);

  const headersList = headers();
  const host = headersList.get('host') || '';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const verificationUrl = `${protocol}://${host}/verify/${id}`;


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
          
          {event && <CertificateDisplay member={member} event={event} verificationUrl={verificationUrl} />}

          <div className="text-center pt-4 flex justify-center">
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
