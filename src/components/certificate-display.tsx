'use client';

import { useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import { Download, Award, Loader2 } from 'lucide-react';
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
  const [isDownloading, setIsDownloading] = useState(false);
  const [isAssetsLoaded, setIsAssetsLoaded] = useState(false);

  const handleDownload = async () => {
    if (certificateRef.current && isAssetsLoaded) {
      setIsDownloading(true);
      toast({ title: 'Preparing Download', description: 'Generating high-resolution certificate...' });
      
      try {
        // Ensure web fonts are ready
        await document.fonts.ready;

        const canvas = await html2canvas(certificateRef.current, {
          scale: 3, // Increase scale for higher resolution
          useCORS: true,
          backgroundColor: null,
          logging: false, // Disables console logs from html2canvas
        });

        const link = document.createElement('a');
        link.download = `GreenPass_Certificate_${member?.id}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        toast({ title: 'Download Started', description: 'Your certificate is being downloaded.' });
      } catch(err) {
        console.error('oops, something went wrong!', err);
        toast({ title: 'Download Failed', description: 'Could not generate certificate image.', variant: 'destructive'});
      } finally {
        setIsDownloading(false);
      }
    } else if (!isAssetsLoaded) {
       toast({ title: 'Assets still loading', description: 'Please wait a moment for the certificate to fully load before downloading.', variant: 'destructive'});
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
      <Certificate 
        member={member} 
        event={event} 
        verificationUrl={verificationUrl} 
        ref={certificateRef} 
        onAssetsLoaded={() => setIsAssetsLoaded(true)}
      />
      <div className="text-center pt-4 flex justify-center">
        <Button onClick={handleDownload} disabled={isDownloading || !isAssetsLoaded}>
          {isDownloading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {isDownloading ? 'Generating...' : 'Download Certificate'}
        </Button>
      </div>
    </>
  );
}
