import Link from 'next/link';
import { BookOpen, ArrowRight, Clock, Shield } from 'lucide-react';

export const ARTICLES_DATA = [
  {
    slug: 'hyderabad-school-transport-safety-rules-2026',
    title: 'Telangana School Vehicle Safety Guidelines: What Every Hyderabad Parent Must Know',
    excerpt:
      'A comprehensive guide to commercial driver badges, vehicle fitness certificates, and student capacity limits under Telangana RTA rules.',
    category: 'Parent Safety Guide',
    date: '21 Sep 2026',
    readTime: '4 min read',
    tags: ['Telangana RTA', 'Child Safety', 'Auto & Van Rules'],
  },
  {
    slug: 'how-tinyride-protects-student-data',
    title: 'Child Privacy in School Logistics: How TinyRide Protects Student Locations',
    excerpt:
      'Why public GPS tracking links and unsecured WhatsApp group chats compromise child safety, and how our strict PostgreSQL Row Level Security keeps data private.',
    category: 'Privacy & Tech',
    date: '19 Sep 2026',
    readTime: '3 min read',
    tags: ['DPDPA 2023', 'Child Privacy', 'Encryption'],
  },
  {
    slug: 'school-auto-vs-school-van-hyderabad-comparison',
    title: 'School Auto vs. School Van: Choosing the Right Commute in Cyberabad',
    excerpt:
      'Comparing route timings, vehicle safety ergonomics, distance suitability, and monthly costs for primary vs. middle school students.',
    category: 'Commute Comparison',
    date: '15 Sep 2026',
    readTime: '5 min read',
    tags: ['Hyderabad Parents', 'Vehicle Choice', 'Cost Guide'],
  },
];

export function KnowledgeHubSection() {
  return (
    <section id="blog" className="py-24 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-brand-navy-50 text-brand-navy-900 text-xs font-bold uppercase tracking-wider mb-3">
              <BookOpen className="w-3.5 h-3.5" />
              Safety & Regulatory Hub
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
              Hyderabad Parent Knowledge Base
            </h2>
            <p className="text-sm text-slate-600 mt-2 max-w-xl">
              Empowering parents and school transport operators with authoritative legal guides, safety audits, and transit best practices.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {ARTICLES_DATA.map((article) => (
            <article
              key={article.slug}
              className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between hover:shadow-lg transition-shadow"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-3">
                  <span className="text-brand-orange-600 font-bold">{article.category}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {article.readTime}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug hover:text-brand-orange-600 transition-colors">
                  <Link href={`/blog/${article.slug}`}>{article.title}</Link>
                </h3>

                <p className="text-xs text-slate-600 mt-2.5 leading-relaxed line-clamp-3">
                  {article.excerpt}
                </p>

                <div className="flex flex-wrap gap-1.5 mt-4">
                  {article.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-semibold bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs text-slate-400">{article.date}</span>
                <Link
                  href={`/blog/${article.slug}`}
                  className="text-xs font-bold text-brand-navy-900 hover:text-brand-orange-600 inline-flex items-center gap-1 transition-colors"
                >
                  Read Article <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
