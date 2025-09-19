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
  onAssetsLoaded: () => void;
}

const Certificate = React.forwardRef<HTMLDivElement, CertificateProps>(({ member, event, verificationUrl, onAssetsLoaded }, ref) => {
  const fallbackImage = PlaceHolderImages.find((img) => img.id === 'certificate');
  const certificateImage = event.certificateUrl || fallbackImage?.imageUrl;

  const textColor = event.certificateTextColor || 'hsl(var(--foreground))';
  const primaryColor = event.certificateTextColor || 'hsl(var(--primary))';
  const accentColor = event.certificateTextColor || 'hsl(var(--accent-foreground))';
  const accentBgColor = event.certificateTextColor ? 'hsla(0, 0%, 100%, 0.15)' : 'hsl(var(--accent))';
  const borderColor = event.certificateTextColor || 'hsl(var(--foreground))';
  
  const handleAssetLoad = () => {
    onAssetsLoaded();
  }

  return (
    <div 
      ref={ref} 
      className="w-full max-w-3xl mx-auto aspect-[12/8] relative rounded-lg overflow-hidden shadow-2xl border-4 border-primary/50"
      style={{ backgroundColor: event.certificateBackgroundColor || 'hsl(var(--background))' }}
    >
      {certificateImage && (
        <img
          src={certificateImage}
          alt={event.name || "Certificate background"}
          crossOrigin="anonymous" // Required for html2canvas
          onLoad={handleAssetLoad}
          onError={handleAssetLoad} // Also call on error to not block downloading
          className="absolute inset-0 w-full h-full object-cover"
          data-ai-hint="certificate background"
        />
      )}
       <div 
          className="absolute inset-0"
          style={{ backgroundColor: certificateImage ? 'rgba(0,0,0,0.3)' : 'transparent' }}
        />

      <div className="absolute inset-0 flex flex-col items-center justify-between p-2 sm:p-6 md:p-8 text-center font-serif" style={{ color: textColor }}>
        
        {/* Top Section */}
        <div className="w-full flex justify-between items-start">
            <div className="flex items-center gap-2 md:gap-3">
              <Leaf className="w-6 h-6 md:w-10 md:h-10" style={{ color: primaryColor }} />
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold font-headline" style={{ color: primaryColor }}>
                Green Environmental Society
              </h2>
            </div>
            
            <div className="flex flex-col items-center text-[8px] sm:text-xs md:text-sm">
                {event.qrCodeUrl ? (
                    <div className="p-1 bg-white rounded-md border border-primary/50">
                        <img src={event.qrCodeUrl} alt="QR Code" className='h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16' crossOrigin='anonymous' onLoad={handleAssetLoad} onError={handleAssetLoad}/>
                    </div>
                ) : (
                    verificationUrl && <QRCodeDisplay url={verificationUrl} size={64} />
                )}
                <p className="font-bold mt-1">Verification ID</p>
                <p>{member.id}</p>
            </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col items-center -mt-8">
            <p className="text-xs sm:text-base md:text-lg">This certificate is proudly presented to</p>
            <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold my-1 md:my-4 font-headline tracking-wide" style={{ color: primaryColor }}>
              {member.userName}
            </h1>
            <p className="text-xs sm:text-base md:text-lg">for their active role as a</p>
            <p className="text-base sm:text-xl md:text-2xl lg:text-3xl font-semibold my-1 md:my-2 px-2 py-0.5 md:px-4 md:py-1 rounded-md" style={{ color: accentColor, backgroundColor: accentBgColor }}>
              {member.role}
            </p>
            <p className="text-xs sm:text-base md:text-lg">in the</p>
            <h3 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-semibold mt-1 md:mt-2" style={{ color: primaryColor }}>
              {event.name}
            </h3>
        </div>

        {/* Footer Section */}
        <div className="w-full flex justify-between items-end text-[8px] sm:text-xs md:text-sm pt-4">
          <div className='flex-1 flex flex-col items-center'>
            {event.organizerSignUrl ? (
              <img src={event.organizerSignUrl} alt="Organizer Signature" className="h-6 sm:h-8 md:h-10 w-auto object-contain" crossOrigin='anonymous' onLoad={handleAssetLoad} onError={handleAssetLoad}/>
            ) : <div className="h-6 sm:h-8 md:h-10"/>}
            <p className="font-bold border-t pt-1 mt-1 w-full" style={{ borderColor: borderColor }}>Organizer's Signature</p>
            <p className="w-full truncate px-1">{event.organizedBy}</p>
          </div>

          <div className='flex-1 flex flex-col items-center'>
            <div className="h-6 smh-8 md:h-10" />
            <p className="font-bold border-t pt-1 mt-1 w-full" style={{ borderColor: borderColor }}>Event Date</p>
            <p>{new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
      </div>
    </div>
  );
});

Certificate.displayName = 'Certificate';

export default Certificate;
