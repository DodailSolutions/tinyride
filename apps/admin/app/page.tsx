'use client';

import { useState } from 'react';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { HeroSection } from '@/components/landing/HeroSection';
import { SafetyPillars } from '@/components/landing/SafetyPillars';
import { FareEstimator } from '@/components/landing/FareEstimator';
import { HyderabadSchoolsSection } from '@/components/landing/HyderabadSchoolsSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { FaqAccordion } from '@/components/landing/FaqAccordion';
import { KnowledgeHubSection } from '@/components/landing/KnowledgeHubSection';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { WaitlistModal } from '@/components/landing/WaitlistModal';

export default function LandingPage() {
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [waitlistType, setWaitlistType] = useState<'PARENT' | 'DRIVER' | 'SCHOOL'>('PARENT');
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [selectedSchool, setSelectedSchool] = useState<string>('');

  const handleOpenWaitlist = (
    type: 'PARENT' | 'DRIVER' | 'SCHOOL' = 'PARENT',
    area = '',
    school = ''
  ) => {
    setWaitlistType(type);
    setSelectedArea(area);
    setSelectedSchool(school);
    setWaitlistOpen(true);
  };

  // Structured Data (Schema.org) for Google Knowledge Graph & Local SEO
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'TinyRide by Dodail',
    image: 'https://tinyride.in/brand/tinyride-master-logo.png',
    '@id': 'https://tinyride.in',
    url: 'https://tinyride.in',
    telephone: '+914045678900',
    description: 'School transport coordination platform by Dodail. Little Rides. Big Peace of Mind.',
    priceRange: '₹2500 - ₹4500/month',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Cyber Towers, Hitec City',
      addressLocality: 'Hyderabad',
      addressRegion: 'Telangana',
      postalCode: '500081',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 17.4504,
      longitude: 78.3808,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '06:30',
      closes: '18:30',
    },
    parentOrganization: {
      '@type': 'Organization',
      name: 'Dodail Solutions Private Limited',
      url: 'https://dodail.com',
    },
  };

  const appSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'TinyRide Parent & Driver',
    operatingSystem: 'iOS, Android',
    applicationCategory: 'TravelApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR',
    },
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }}
      />

      {/* Navigation */}
      <LandingHeader onOpenWaitlist={handleOpenWaitlist} />

      {/* Hero Section */}
      <HeroSection onOpenWaitlist={handleOpenWaitlist} />

      {/* Safety Pillars */}
      <SafetyPillars />

      {/* Interactive Fare Estimator */}
      <FareEstimator onOpenWaitlist={handleOpenWaitlist} />

      {/* Partner Schools */}
      <HyderabadSchoolsSection onOpenWaitlist={handleOpenWaitlist} />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Frequently Asked Questions */}
      <FaqAccordion />

      {/* Knowledge Hub / Blog */}
      <KnowledgeHubSection />

      {/* Footer */}
      <LandingFooter />

      {/* Waitlist Modal */}
      <WaitlistModal
        isOpen={waitlistOpen}
        onClose={() => setWaitlistOpen(false)}
        defaultType={waitlistType}
        defaultArea={selectedArea}
        defaultSchool={selectedSchool}
      />
    </main>
  );
}
