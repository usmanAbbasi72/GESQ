
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { Member, Event } from '@/lib/types';
import { Leaf } from 'lucide-react';
import React, { useEffect, useState, useCallback } from 'react';
import { QRCodeDisplay } from './qr-code-display';

interface CertificateProps extends React.HTMLAttributes<HTMLDivElement> {
  member: Member;
  event: Event;
  verificationUrl: string;
}

const Certificate = React.forwardRef<HTMLDivElement, CertificateProps>(({ member, event, verificationUrl, ...props }, ref) => {
  const fallbackImage = PlaceHolderImages.find((img) => img.id === 'certificate');
  
  const assets = {
    bg: event.certificateUrl || fallbackImage?.imageUrl || '',
    sign: event.organizerSignUrl || '',
    qr: event.qrCodeUrl || '',
  };

  const textColor = event.certificateTextColor || 'hsl(var(--foreground))';
  const primaryColor = event.certificateTextColor || 'hsl(var(--primary))';
  const accentColor = event.certificateTextColor ? 'hsla(0, 0%, 100%, 0.85)' : 'hsl(var(--accent-foreground))';
  const accentBgColor = event.certificateTextColor ? 'hsla(0, 0%, 100%, 0.15)' : 'hsl(var(--accent))';
  const borderColor = event.certificateTextColor || 'hsl(var(--foreground))';

  return (
    <div
      {...props}
      ref={ref} 
      className="w-[900px] aspect-[12/8] relative rounded-lg overflow-hidden shadow-2xl border-4 border-primary/50 mx-auto"
      style={{ backgroundColor: event.certificateBackgroundColor || 'hsl(var(--background))' }}
    >
      {assets.bg && (
        <img
          src={assets.bg}
          alt={event.name || "Certificate background"}
          crossOrigin="anonymous" 
          className="absolute inset-0 w-full h-full object-cover"
          data-ai-hint="certificate background"
        />
      )}
       <div 
          className="absolute inset-0"
          style={{ backgroundColor: assets.bg ? 'rgba(0,0,0,0.3)' : 'transparent' }}
        />

      <div className="absolute inset-0 flex flex-col items-center justify-between p-2 sm:p-4 md:p-8 text-center font-serif" style={{ color: textColor }}>
        
        {/* Top Section */}
        <div className="w-full flex justify-between items-start">
            <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
              <Leaf className="w-4 h-4 sm:w-6 h-6 md:w-10 md:h-10" style={{ color: primaryColor }} />
              <h2 className="text-xs sm:text-xl md:text-2xl font-bold font-headline" style={{ color: primaryColor }}>
                Green Environmental Society
              </h2>
            </div>
            
            <div className="flex flex-col items-center text-[6px] sm:text-xs md:text-sm">
                {assets.qr ? (
                    <div className="p-1 bg-white rounded-md border border-primary/50">
                        <img 
                          src={assets.qr} 
                          alt="QR Code" 
                          className='h-8 w-8 sm:h-14 sm:w-14 md:h-16 md:w-16' 
                          crossOrigin='anonymous' 
                        />
                    </div>
                ) : (
                    verificationUrl && <QRCodeDisplay url={verificationUrl} size={64} />
                )}
                <p className="font-bold mt-1">Verification ID</p>
                <p>{member.id}</p>
            </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col items-center -mt-4 sm:-mt-8">
            <p className="text-[8px] sm:text-base md:text-lg">This certificate is proudly presented to</p>
            <h1 className="text-lg sm:text-3xl md:text-4xl lg:text-5xl font-bold my-1 md:my-2 font-headline tracking-wide" style={{ color: primaryColor }}>
              {member.userName}
            </h1>
            <p className="text-[8px] sm:text-base md:text-lg">for their active role as a</p>
            <p className="text-sm sm:text-xl md:text-2xl lg:text-3xl font-semibold my-1 md:my-2 px-2 py-0.5 md:px-4 md:py-1 rounded-md" style={{ color: accentColor, backgroundColor: accentBgColor }}>
              {member.role}
            </p>
            <p className="text-[8px] sm:text-base md:text-lg">in the</p>
            <h3 className="text-base sm:text-2xl md:text-3xl lg:text-4xl font-semibold mt-1 md:mt-2" style={{ color: primaryColor }}>
              {event.name}
            </h3>
        </div>

        {/* Footer Section */}
        <div className="w-full flex justify-between items-end text-[6px] sm:text-xs md:text-sm pt-2 sm:pt-4 gap-4">
          <div className='flex-1 flex flex-col items-center w-full'>
             <div className="h-4 sm:h-8 md:h-12 flex items-center justify-center">
                {assets.sign ? (
                <img 
                    src={assets.sign} 
                    alt="Organizer Signature" 
                    className="h-auto max-h-10 w-auto object-contain" 
                    crossOrigin='anonymous' 
                />
                ) : <div className="h-4 sm:h-8 md:h-10"/>}
            </div>
            <p className="font-bold border-t pt-1 w-full" style={{ borderColor: borderColor }}>Organizer's Signature</p>
            <p className="w-full truncate px-1">{event.organizedBy}</p>
          </div>

          <div className='flex-1 flex flex-col items-center w-full'>
            <div className="h-4 sm:h-8 md:h-12 flex items-center justify-center">
              <span className="font-sans font-bold text-lg">{new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="border-t pt-1 w-full" style={{ borderColor: borderColor }}>
                 <p className="font-bold">Event Date</p>
            </div>
            <div className="w-full truncate px-1">&nbsp;</div>
          </div>
        </div>
      </div>
    </div>
  );
});

Certificate.displayName = 'Certificate';

export default Certificate;
