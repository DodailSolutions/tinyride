/**
 * TinyRide AI-004 Approved FAQ Knowledge Base
 *
 * Official verified facts and regulatory guidelines used for prompt grounding.
 * The assistant must NEVER contradict these facts or fabricate claims beyond them.
 */

export interface FAQItem {
  id: string;
  category: 'platform' | 'pricing' | 'safety' | 'vehicles' | 'schools' | 'refunds' | 'support';
  question: string;
  summary: string;
  keywords: string[];
}

export const APPROVED_FAQS: FAQItem[] = [
  {
    id: 'faq-platform',
    category: 'platform',
    question: 'What is TinyRide?',
    summary:
      'TinyRide is a school-transport coordination platform by Dodail that connects parents with independently operated, verified school auto and van drivers in Hyderabad. TinyRide provides route tracking, attendance verification, and transparent coordination.',
    keywords: ['tinyride', 'dodail', 'what is', 'service', 'about'],
  },
  {
    id: 'faq-pilot-schools',
    category: 'schools',
    question: 'Which schools are currently covered in the pilot?',
    summary:
      'TinyRide pilot covers 5 premier schools in Western Hyderabad: 1) Hyderabad Public School (Begumpet), 2) Oakridge International (Gachibowli), 3) Delhi Public School (Khajaguda), 4) CHIREC International (Kondapur), and 5) Glendale Academy (Sun City).',
    keywords: ['schools', 'pilot', 'hps', 'oakridge', 'dps', 'chirec', 'glendale', 'hyderabad', 'coverage'],
  },
  {
    id: 'faq-pricing-plans',
    category: 'pricing',
    question: 'How much does TinyRide cost?',
    summary:
      'TinyRide route subscriptions range between ₹2,500 and ₹4,500 per month per child, determined by one-way or round-trip distance, vehicle category (Auto or Van), and school bell schedule. Subscriptions are billed monthly in advance with zero surge pricing.',
    keywords: ['price', 'pricing', 'cost', 'fee', 'charge', 'rate', 'monthly', 'surge'],
  },
  {
    id: 'faq-refund-policy',
    category: 'refunds',
    question: 'What is TinyRide’s cancellation and refund policy?',
    summary:
      '100% full refund is issued if a subscription is cancelled before the 1st day of the billing month. For mid-month cancellations, a minimum 5 business days advance notice is required, and unused days will be credited or refunded according to route capacity rules.',
    keywords: ['refund', 'cancel', 'cancellation', 'money back', 'dispute', 'holiday'],
  },
  {
    id: 'faq-driver-verification',
    category: 'safety',
    question: 'How are drivers verified?',
    summary:
      'All drivers undergo a mandatory 4-point verification before onboarding: 1) Valid Commercial Driving License & Badge, 2) Aadhaar KYC, 3) Telangana Police Verification Certificate, and 4) In-person vehicle inspection with annual RTA fitness certificate.',
    keywords: ['driver', 'verification', 'police', 'kyc', 'background', 'check', 'license', 'badge'],
  },
  {
    id: 'faq-vehicle-capacity',
    category: 'vehicles',
    question: 'What are the vehicle capacity limits?',
    summary:
      'Under Telangana Motor Vehicles regulations: School Auto-rickshaws are legally capped at 4 to 6 children. School Vans (e.g. Maruti Eeco) are legally capped at 12 to 14 children. TinyRide enforces zero overcrowding.',
    keywords: ['capacity', 'seats', 'overcrowding', 'auto', 'van', 'limit', 'rules', 'telangana'],
  },
  {
    id: 'faq-emergency-support',
    category: 'support',
    question: 'How do I contact emergency support?',
    summary:
      'For active ride emergencies or breakdowns, our 24/7 Operations Command Center is available immediately at +91 40 4567 8900. For civic emergencies, dial 112 directly.',
    keywords: ['emergency', 'urgent', 'hotline', 'phone', 'contact', 'breakdown', 'accident', 'call', '112'],
  },
];

/**
 * Build ground-truth system instructions embedding platform rules,
 * anti-hallucination guardrails, and permitted context.
 */
export function buildGroundTruthPrompt(
  permittedContextJson: string,
  userRole: string
): string {
  const faqText = APPROVED_FAQS.map(
    (f) => `Q: ${f.question}\nA: ${f.summary}`
  ).join('\n\n');

  return `You are TinyRide Assistant, an AI customer support specialist for TinyRide by Dodail (school transport coordination in Hyderabad).

AUTHENTICATED CALLER ROLE: ${userRole.toUpperCase()}

PERMITTED USER CONTEXT (Strict database ground truth):
${permittedContextJson}

APPROVED PLATFORM KNOWLEDGE BASE:
${faqText}

STRICT ANTI-HALLUCINATION GUARDRAILS:
1. NEVER fabricate payment status, trip status, driver names, vehicle numbers, or arrival times.
2. If the user asks about their booking, ride, payment, or child:
   - ONLY cite information present in the PERMITTED USER CONTEXT above.
   - If a booking, payment, or active trip is NOT in the context, clearly state: "No active record found in your account. Please check the Bookings or Billing tab in your app."
3. NEVER make promises regarding refunds, customized routes, or driver assignments. State TinyRide policies objectively.
4. If the user expresses distress about an active accident, lost child, injury, or severe vehicle breakdown, output an emergency guidance message with the hotline number (+91 40 4567 8900) and indicate escalation.
5. If the user demands a refund, disputes a charge, or makes a payment complaint, inform them that their request has been logged for Operations review and explain the standard 5-day notice policy.
6. Tone: Reassuring, polite, professional, concise (under 120 words).`;
}
