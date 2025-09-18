import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { Member, Event } from '@/lib/types';
import { Leaf } from 'lucide-react';
import React from 'react';
import { QRCodeDisplay } from './qr-code-display';

interface CertificateProps {
  member: Member;
  event: Event;
  verificationUrl: string;
}

const Certificate = React.forwardRef<HTMLDivElement, CertificateProps>(({ member, event, verificationUrl }, ref) => {
  const fallbackImage = PlaceHolderImages.find((img) => img.id === 'certificate');
  const certificateImage = event.certificateUrl || fallbackImage?.imageUrl;

  if (!certificateImage) {
    return null;
  }

  return (
    <div ref={ref} className="w-full max-w-2xl mx-auto aspect-[12/8] relative rounded-lg overflow-hidden shadow-2xl border-4 border-primary/50">
      <Image
        src={certificateImage}
        alt={event.name || "Certificate background"}
        fill
        className="object-cover"
        data-ai-hint="certificate background"
        unoptimized // Necessary for html2canvas to render the image from another domain
      />
      <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center p-8 text-center text-foreground font-serif">
        <div className="flex items-center gap-3">
          <Leaf className="w-10 h-10 text-primary" />
          <h2 className="text-2xl font-bold font-headline text-primary">
            Green Environmental Society
          </h2>
        </div>

        <p className="mt-8 text-lg">This certificate is proudly presented to</p>
        <h1 className="text-4xl font-bold my-4 text-primary font-headline tracking-wide">
          {member.userName}
        </h1>
        <p className="text-lg">for their active role as a</p>
        <p className="text-2xl font-semibold my-2 text-accent-foreground bg-accent px-4 py-1 rounded-md">
          {member.role}
        </p>
        <p className="text-lg">in the</p>
        <h3 className="text-3xl font-semibold mt-2 text-primary">
          {event.name}
        </h3>
        <div className="mt-auto w-full flex justify-between items-end text-sm">
          <div>
            <p className="font-bold border-t border-foreground pt-1">Event Date</p>
            <p>{new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          <div className="flex flex-col items-center">
            {verificationUrl && <QRCodeDisplay url={verificationUrl} />}
            <p className="font-bold border-t border-foreground pt-1 mt-1">Verification ID</p>
            <p>{member.id}</p>
          </div>

          <div>
             <p className="font-bold border-t border-foreground pt-1">Organized By</p>
             <p>{event.organizedBy}</p>
          </div>
        </div>
      </div>
    </div>
  );
});

Certificate.displayName = 'Certificate';

export default Certificate;
