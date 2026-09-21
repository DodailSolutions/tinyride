import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://tinyride.in'),
  title: {
    default: 'TinyRide by Dodail — Little Rides. Big Peace of Mind.',
    template: '%s | TinyRide by Dodail',
  },
  description:
    'School transport, made easier to manage. Arrange your child’s school commute with clearer route details, verified driver credentials, and dependable support in Hyderabad.',
  keywords: [
    'school transport coordination hyderabad',
    'school van gachibowli',
    'school auto kondapur',
    'school commute manikonda',
    'dps gachibowli transport',
    'oakridge international school commute',
    'child school commute hyderabad',
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
      'TinyRide by Dodail • School commute coordination for families and drivers. • Little Rides. Big Peace of Mind.',
    url: 'https://tinyride.in',
    siteName: 'TinyRide',
    images: [
      {
        url: '/brand/tinyride-master-logo.png',
        width: 941,
        height: 941,
        alt: 'TinyRide by Dodail Master Logo & Illustration',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TinyRide by Dodail — Little Rides. Big Peace of Mind.',
    description:
      'TinyRide by Dodail • School commute coordination for families and drivers. • Clear information. Thoughtful coordination. Support when you need it.',
    images: ['/brand/tinyride-master-logo.png'],
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
