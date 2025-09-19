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
    <div ref={ref} className="w-full max-w-3xl mx-auto aspect-[12/8] relative rounded-lg overflow-hidden shadow-2xl border-4 border-primary/50">
      <Image
        src={certificateImage}
        alt={event.name || "Certificate background"}
        fill
        className="object-cover"
        data-ai-hint="certificate background"
        unoptimized // Necessary for html2canvas to render the image from another domain
      />
      <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-between p-4 sm:p-6 md:p-8 text-center text-foreground font-serif">
        <div className="flex items-center gap-2 md:gap-3">
          <Leaf className="w-6 h-6 md:w-10 md:h-10 text-primary" />
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold font-headline text-primary">
            Green Environmental Society
          </h2>
        </div>

        <div className="flex flex-col items-center">
            <p className="text-xs sm:text-base md:text-lg">This certificate is proudly presented to</p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold my-1 md:my-4 text-primary font-headline tracking-wide">
              {member.userName}
            </h1>
            <p className="text-xs sm:text-base md:text-lg">for their active role as a</p>
            <p className="text-base sm:text-xl md:text-2xl font-semibold my-1 md:my-2 text-accent-foreground bg-accent px-2 py-0.5 md:px-4 md:py-1 rounded-md">
              {member.role}
            </p>
            <p className="text-xs sm:text-base md:text-lg">in the</p>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold mt-1 md:mt-2 text-primary">
              {event.name}
            </h3>
        </div>

        <div className="w-full flex justify-between items-end text-[10px] sm:text-xs md:text-sm">
          <div className='w-1/3'>
            <p className="font-bold border-t border-foreground pt-1">Event Date</p>
            <p>{new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          <div className="flex flex-col items-center w-1/3">
            {verificationUrl && <QRCodeDisplay url={verificationUrl} />}
            <p className="font-bold border-t border-foreground pt-1 mt-1">Verification ID</p>
            <p>{member.id}</p>
          </div>

          <div className='w-1/3'>
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
