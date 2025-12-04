
'use client';

import { useRef, useState, useCallback } from 'react';
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
  const certificateWrapperRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [areAssetsLoaded, setAreAssetsLoaded] = useState(false);

  const handleAssetsLoaded = useCallback(() => {
    setAreAssetsLoaded(true);
  }, []);

  const handleDownload = async () => {
    // We are targeting the inner Certificate div for rendering, not the scaling wrapper
    const certificateElement = certificateWrapperRef.current?.querySelector('#certificate-to-print') as HTMLElement | null;

    if (!certificateElement) {
      toast({ title: 'Error', description: 'Certificate element not found.', variant: 'destructive'});
      return;
    }
    if (!areAssetsLoaded) {
       toast({ title: 'Assets still loading', description: 'Please wait for the certificate to fully load before downloading.', variant: 'destructive'});
       return;
    }

    setIsDownloading(true);
    toast({ title: 'Preparing Download', description: 'Generating high-resolution certificate...' });
    
    try {
      // Give browser a moment to render fonts
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(certificateElement, {
        scale: 3, 
        useCORS: true,
        backgroundColor: null,
        logging: false, 
        onclone: (document) => {
          // This is a good place to ensure fonts are loaded in the cloned document if needed
        }
      });

      const link = document.createElement('a');
      link.download = `GreenPass_Certificate_${member?.id}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast({ title: 'Download Started', description: 'Your certificate is being downloaded.' });
    } catch(err) {
      console.error('Oops, something went wrong!', err);
      toast({ title: 'Download Failed', description: 'Could not generate certificate image.', variant: 'destructive'});
    } finally {
      setIsDownloading(false);
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
      <div ref={certificateWrapperRef} className="w-full overflow-x-auto py-4">
        <Certificate 
          id="certificate-to-print"
          member={member} 
          event={event} 
          verificationUrl={verificationUrl} 
          onAssetsLoaded={handleAssetsLoaded}
        />
      </div>
      <div className="text-center pt-4 flex justify-center">
        <Button onClick={handleDownload} disabled={isDownloading || !areAssetsLoaded}>
          {isDownloading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {isDownloading ? 'Generating...' : (areAssetsLoaded ? 'Download Certificate' : 'Loading Assets...')}
        </Button>
      </div>
    </>
  );
}
