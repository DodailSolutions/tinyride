import Link from 'next/link';
import { ArrowLeft, Clock, ShieldCheck, Share2, MapPin, CheckCircle2 } from 'lucide-react';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { ARTICLES_DATA } from '@/components/landing/KnowledgeHubSection';

interface ArticleDetail {
  slug: string;
  title: string;
  category: string;
  readTime: string;
  date: string;
  author: string;
  content: string[];
}

const ARTICLES_FULL: Record<string, ArticleDetail> = {
  'hyderabad-school-transport-safety-rules-2026': {
    slug: 'hyderabad-school-transport-safety-rules-2026',
    title: 'Telangana School Vehicle Safety Guidelines: What Every Hyderabad Parent Must Know',
    category: 'Parent Safety Guide',
    readTime: '4 min read',
    date: '21 Sep 2026',
    author: 'Dodail Central Safety Committee',
    content: [
      'School transportation safety in Hyderabad has witnessed critical regulatory enhancements under the Telangana Motor Vehicle Rules and guidelines issued by the Supreme Court of India. With thousands of children commuting every morning to campuses across Gachibowli, Begumpet, and Hitec City, parents must know their legal rights and the minimum statutory requirements for school vehicles.',
      '1. Commercial Driving License & Yellow Badge: Any driver operating a school auto-rickshaw or van must hold a valid commercial transport driving license endorsed by the Telangana Regional Transport Authority (RTA). Private DL holders are strictly prohibited from ferrying students on commercial terms.',
      '2. Police Clearance Certificate (PCC): Under Hyderabad and Cyberabad Police Commissionerate safety directives, all commercial school drivers must possess a clean background clearance verifying no prior criminal or rash driving convictions.',
      '3. Mandatory Seating Capacity Limits: A standard 3-wheeler passenger auto-rickshaw is licensed to carry a maximum of 4 to 6 schoolchildren (under 12 years of age). Overloading autos with 8 to 10 children is a punishable offense that risks suspension of vehicle registration. School vans (e.g. Maruti Eeco, Force Winger) are similarly bound to their approved RTA seating chart.',
      '4. Annual Vehicle Fitness Certificate (FC) & Insurance: Every school vehicle must display an updated fitness certificate issued by the RTA testing station, certifying brake efficiency, steering integrity, fire extinguisher availability, and emergency exit visibility.',
      'TinyRide by Dodail enforces these standards digitally through rigorous human-in-the-loop document audits. Drivers without verified police clearance and vehicle fitness cannot receive student assignments on our platform.',
    ],
  },
  'how-tinyride-protects-student-data': {
    slug: 'how-tinyride-protects-student-data',
    title: 'Child Privacy in School Logistics: How TinyRide Protects Student Locations',
    category: 'Privacy & Tech',
    readTime: '3 min read',
    date: '19 Sep 2026',
    author: 'Dodail Cybersecurity Team',
    content: [
      'In an era where technology has entered every facet of daily life, child data privacy is paramount. Many informal school transport operators rely on unmoderated WhatsApp groups or generic public GPS tracking links to update parents. While well-intentioned, these practices expose sensitive information—such as home addresses, daily pickup routines, and children’s photographs—to unauthorized individuals.',
      'The Digital Personal Data Protection Act (DPDPA 2023) mandates that data fiduciaries implement technical measures to protect minors’ personal identifiers. TinyRide by Dodail was engineered with privacy-by-design principles from the ground up.',
      '1. PostgreSQL Row Level Security (RLS): In TinyRide’s database, child records are isolated using strict RLS policies. A driver can only view children assigned to their specific active route during operating hours. Unassigned drivers have zero visibility.',
      '2. No Public Tracking URLs: TinyRide does not generate public, unauthenticated tracking links. Real-time boarding milestone updates are delivered via authenticated WebSockets and private push notifications directly to verified parents.',
      '3. Secure Private Document Storage: Driver Aadhaar numbers, driving licenses, and vehicle permits are stored in encrypted private Supabase Storage buckets, accessible only to authorized operations personnel through short-lived signed URLs.',
    ],
  },
  'school-auto-vs-school-van-hyderabad-comparison': {
    slug: 'school-auto-vs-school-van-hyderabad-comparison',
    title: 'School Auto vs. School Van: Choosing the Right Commute in Cyberabad',
    category: 'Commute Comparison',
    readTime: '5 min read',
    date: '15 Sep 2026',
    author: 'TinyRide Logistics Research',
    content: [
      'When planning school commutes in congested Hyderabad corridors like Gachibowli, Kondapur, and Manikonda, parents often weigh the pros and cons of school auto-rickshaws versus multi-seater school vans.',
      'School Autos (3-4 Kids Max): Best suited for shorter distances (under 4 km) and dense inner residential streets where vans encounter narrow lanes or tight U-turns. Autos offer quicker turnaround times and fewer intermediate pickup stops.',
      'School Vans (8-12 Kids Max): Best suited for longer commutes (5 to 10 km) along arterial routes such as the Outer Ring Road (ORR) service roads, Financial District, and Begumpet. Vans provide enclosed cabin comfort, air conditioning, and enhanced suspension for longer transit periods.',
      'At TinyRide, both autos and vans adhere to the same uncompromising safety vetting, verified drivers, transparent monthly fees, and real-time pickup/drop notifications.',
    ],
  },
};

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = ARTICLES_FULL[slug] || {
    slug,
    title: 'School Transport Safety & Compliance in Hyderabad',
    category: 'Safety Guide',
    readTime: '4 min read',
    date: '21 Sep 2026',
    author: 'Dodail Safety Committee',
    content: [
      'Comprehensive safety documentation and Telangana RTA compliance protocols for school vehicles.',
      'For more details or to request a dedicated route for your school, join our waitlist.',
    ],
  };

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    author: {
      '@type': 'Organization',
      name: article.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Dodail Solutions Private Limited',
      url: 'https://dodail.com',
    },
    datePublished: '2026-09-21',
    description: article.content[0],
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Article Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <LandingHeader />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link
          href="/#blog"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-orange-600 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Knowledge Hub
        </Link>

        <header className="space-y-4 pb-8 border-b border-slate-200">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-brand-orange-50 text-brand-orange-600">
            {article.category}
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2">
            <span className="font-semibold text-slate-700">By {article.author}</span>
            <span>•</span>
            <span>{article.date}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {article.readTime}
            </span>
          </div>
        </header>

        {/* Article Body */}
        <article className="prose prose-slate max-w-none py-10 space-y-6 text-sm sm:text-base text-slate-700 leading-relaxed">
          {article.content.map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </article>

        {/* Regulatory Callout Box */}
        <div className="p-6 rounded-2xl bg-brand-navy-900 text-white space-y-4 mt-8">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base text-white">Dodail Hyderabad Safety Commitment</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            TinyRide strictly implements Telangana Motor Vehicles Rules 1989 and Supreme Court guidelines. Every vehicle undergoes physical inspection and driver credentials verification before route publication.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-brand-orange-500 text-white hover:bg-brand-orange-600 transition-colors"
            >
              Explore Verified Routes in Hyderabad →
            </Link>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
