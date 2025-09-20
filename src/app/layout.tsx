import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/header';
import { AuthProvider } from '@/context/auth-context';

const siteUrl = process.env.NEXT_PUBLIC_VERCEL_URL
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  : 'http://localhost:3000';


export const metadata: Metadata = {
  title: {
    default: 'GreenPass Certificate Verification',
    template: '%s | GreenPass',
  },
  description: 'Verify participation and roles in events organized by the Green Environmental Society. Instantly check the authenticity of any certificate.',
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: 'GreenPass Certificate Verification',
    description: 'Authentic certificate verification for Green Environmental Society events.',
    url: siteUrl,
    siteName: 'GreenPass',
    images: [
      {
        url: '/og-image.png', // Must be an absolute URL
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GreenPass Certificate Verification',
    description: 'Authentic certificate verification for Green Environmental Society events.',
    images: ['/og-image.png'], // Must be an absolute URL
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <div className="relative flex min-h-screen flex-col bg-background">
            <Header />
            <main className="flex-1">{children}</main>
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
