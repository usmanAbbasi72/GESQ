'use client';

import { useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import { Download, Award } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Certificate from '@/components/certificate';
import type { Member, Event } from '@/lib/types';

interface CertificateDisplayProps {
  member: Member;
  event: Event;
  verificationUrl: string;
}

export function CertificateDisplay({ member, event, verificationUrl }: CertificateDisplayProps) {
  const { toast } = useToast();
  const certificateRef = useRef<HTMLDivElement>(null);

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

  return (
    <>
      <Separator />
      <div className="space-y-2 text-center">
        <h3 className="text-xl font-semibold flex items-center justify-center gap-2">
          <Award className="text-primary"/> Digital Certificate
        </h3>
      </div>
      <Certificate member={member} event={event} verificationUrl={verificationUrl} ref={certificateRef} />
      <div className="text-center pt-4 flex justify-center">
        <Button onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download Certificate
        </Button>
      </div>
    </>
  );
}
