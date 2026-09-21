import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://tinyride.in'),
  title: {
    default: 'TinyRide by Dodail — Trusted School Transport Platform in Hyderabad',
    template: '%s | TinyRide by Dodail',
  },
  description:
    'Safe, verified, and transparent school auto & van transport in Hyderabad. Real-time child tracking, police-verified drivers, and transparent monthly subscriptions for DPS, Oakridge, HPS, and Glendale.',
  keywords: [
    'school transport hyderabad',
    'school van gachibowli',
    'school auto kondapur',
    'school cab manikonda',
    'dps gachibowli transport',
    'oakridge international school bus',
    'child safety transport hyderabad',
    'tinyride dodail',
  ],
  authors: [{ name: 'Dodail Solutions Private Limited', url: 'https://dodail.com' }],
  creator: 'Dodail Solutions Private Limited',
  publisher: 'Dodail Solutions Private Limited',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'TinyRide by Dodail — Little Rides. Big Peace of Mind.',
    description:
      'Connecting Hyderabad parents with police-verified school auto & van drivers. Zero overcrowding, real-time trip milestones, and monthly digital billing.',
    url: 'https://tinyride.in',
    siteName: 'TinyRide',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TinyRide by Dodail — School Transport Hyderabad',
    description: 'Little Rides. Big Peace of Mind. 100% Police Verified Drivers & Real-time Child Boarding Milestones.',
    creator: '@DodailSolutions',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://tinyride.in',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
