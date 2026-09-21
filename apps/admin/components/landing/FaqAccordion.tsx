'use client';

import { HelpCircle, ChevronDown } from 'lucide-react';

export const FAQ_DATA = [
  {
    question: 'How are TinyRide school drivers verified in Hyderabad?',
    answer:
      'Every driver undergoes a comprehensive 4-step check: (1) Commercial Transport Driving License validation with Telangana RTA, (2) Telangana Police Clearance Certificate (PCC), (3) Annual Vehicle Fitness Certificate (FC) and third-party commercial insurance audit, and (4) Personal interview and road safety vetting by Dodail Operations. We maintain zero automatic approvals.',
  },
  {
    question: 'Are vehicles allowed to carry excess schoolchildren?',
    answer:
      'Strictly NO. TinyRide strictly enforces Telangana Motor Vehicle Regulations: maximum 4-6 children in an Auto-rickshaw and 8-12 children in a school van. Our automated booking system locks route capacity at the database level to prevent overselling.',
  },
  {
    question: 'How do monthly payments work with Razorpay?',
    answer:
      'Parents pay a fixed monthly fee online via Razorpay using UPI (Google Pay, PhonePe, Paytm), Credit/Debit cards, or NetBanking. Invoices are generated 5 days prior to month-end. You receive automated digital receipts with zero cash handling.',
  },
  {
    question: 'How do parents track their child during the school trip?',
    answer:
      'Parents receive real-time push and SMS notifications when the morning trip begins, when their child is safely boarded at home, and when the driver confirms safe handover at the school gate. Real-time status is visible on the TinyRide Parent Mobile App.',
  },
  {
    question: 'What happens if a child is sick or absent from school?',
    answer:
      'Parents can tap "Mark Absent" in the TinyRide Parent App before 07:00 AM. The driver’s schedule is automatically updated, avoiding unnecessary waiting time and keeping the morning route punctual.',
  },
  {
    question: 'Which areas in Hyderabad does the TinyRide pilot cover?',
    answer:
      'Our initial launch covers Cyberabad and Hyderabad Central, specifically Gachibowli, Kondapur, Madhapur, Manikonda, Puppalguda, Begumpet, and Sun City, servicing partner schools including DPS Gachibowli, Oakridge International, HPS Begumpet, and Glendale Academy.',
  },
];

export function FaqAccordion() {
  // Schema.org FAQPage structured data
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_DATA.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <section id="faqs" className="py-24 bg-slate-50 border-t border-slate-200">
      {/* Schema.org FAQPage JSON-LD for Google Rich Results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-brand-orange-50 text-brand-orange-600 text-xs font-bold uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            Got Questions?
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Everything you need to know about safety, verification, pricing, and daily school commutes.
          </p>
        </div>

        <div className="space-y-4">
          {FAQ_DATA.map((faq, i) => (
            <details
              key={i}
              className="group p-5 bg-white rounded-2xl border border-slate-200 shadow-sm transition-all open:ring-1 open:ring-brand-orange-500/50"
            >
              <summary className="flex items-center justify-between cursor-pointer list-none text-sm font-bold text-slate-900 select-none">
                <span>{faq.question}</span>
                <span className="ml-4 transition-transform group-open:rotate-180 text-slate-400 group-hover:text-brand-orange-500">
                  <ChevronDown className="w-5 h-5" />
                </span>
              </summary>
              <p className="mt-3 text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
