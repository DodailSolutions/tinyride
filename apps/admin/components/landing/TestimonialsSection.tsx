import { Star, Quote } from 'lucide-react';

export function TestimonialsSection() {
  const reviews = [
    {
      name: 'Pooja Deshmukh',
      relation: 'Mother of Aarav (3rd Std)',
      school: 'DPS Gachibowli',
      area: 'Kondapur, Hyderabad',
      text: 'Before TinyRide, we were always anxious about whether our local auto driver would turn up on time or overcrowd the auto with 8 kids. With TinyRide, Ramesh uncle is verified, courteous, and the real-time boarding alerts give us total peace of mind!',
    },
    {
      name: 'K. V. S. Murthy',
      relation: 'Father of Sanya (5th Std)',
      school: 'Oakridge International School',
      area: 'Manikonda, Hyderabad',
      text: 'Clean vehicles, verified drivers who do not use their phones while driving, and transparent monthly UPI subscriptions through Razorpay. No cash haggling or sudden fee spikes mid-term.',
    },
    {
      name: 'Dr. Farhan Ali',
      relation: 'Parent & Pediatrician',
      school: 'Glendale Academy Sun City',
      area: 'Sun City, Hyderabad',
      text: 'The strict seating capacity constraint was what convinced me. No cramming students beyond RTA regulations. Our daughter arrives at school fresh and relaxed every morning.',
    },
  ];

  return (
    <section className="py-24 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orange-50 text-brand-orange-600 text-xs font-bold uppercase tracking-wider mb-3">
            Real Parent Stories
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            Trusted by Hyderabad Parents
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            See how TinyRide is bringing safety, reliability, and peace of mind to daily school commutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((r, i) => (
            <div
              key={i}
              className="p-8 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between hover:shadow-lg transition-shadow"
            >
              <div>
                {/* 5 Stars */}
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>

                <Quote className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-xs text-slate-700 leading-relaxed italic">
                  "{r.text}"
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200">
                <p className="font-bold text-sm text-slate-900">{r.name}</p>
                <p className="text-xs text-slate-500">{r.relation}</p>
                <p className="text-[11px] font-semibold text-brand-orange-600 mt-0.5">
                  {r.school} • {r.area}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
