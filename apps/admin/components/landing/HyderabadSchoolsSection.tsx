import { School, Clock, MapPin, Bus, CheckCircle2 } from 'lucide-react';

interface HyderabadSchoolsSectionProps {
  onOpenWaitlist: (type?: 'PARENT' | 'DRIVER' | 'SCHOOL', defaultArea?: string, defaultSchool?: string) => void;
}


const PILOT_SCHOOLS = [
  {
    name: 'Delhi Public School (DPS)',
    campus: 'Gachibowli Campus',
    area: 'Khajaguda / Gachibowli',
    morningBell: '08:15 AM',
    afternoonBell: '03:15 PM',
    activeRoutes: 4,
    tags: ['CBSE', 'Auto & Van Service'],
  },
  {
    name: 'Oakridge International School',
    campus: 'Einstein Campus',
    area: 'Nanakramguda / Manikonda',
    morningBell: '08:30 AM',
    afternoonBell: '03:30 PM',
    activeRoutes: 3,
    tags: ['IB / Cambridge', 'Dedicated Van Service'],
  },
  {
    name: 'The Hyderabad Public School',
    campus: 'Begumpet Heritage Campus',
    area: 'Begumpet / Prakash Nagar',
    morningBell: '08:00 AM',
    afternoonBell: '02:45 PM',
    activeRoutes: 2,
    tags: ['ICSE', 'Auto Shuttle'],
  },
  {
    name: 'Glendale Academy International',
    campus: 'Sun City Campus',
    area: 'Bandlaguda Jagir / Sun City',
    morningBell: '08:20 AM',
    afternoonBell: '03:10 PM',
    activeRoutes: 2,
    tags: ['CBSE / CIE', 'Auto & Van Service'],
  },
];

export function HyderabadSchoolsSection({ onOpenWaitlist }: HyderabadSchoolsSectionProps) {
  return (
    <section id="schools" className="py-24 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-navy-100 text-brand-navy-900 text-xs font-bold uppercase tracking-wider mb-3">
              <School className="w-3.5 h-3.5" />
              Pilot Coverage
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
              Partner & Verified Hyderabad Schools
            </h2>
            <p className="text-sm text-slate-600 mt-2 max-w-xl">
              We coordinate directly with school transport desks to align arrival windows with morning assembly and evening dismissal bell times.
            </p>
          </div>

          <button
            onClick={() => onOpenWaitlist('SCHOOL')}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-white border border-slate-300 text-slate-800 hover:bg-slate-100 transition-colors shadow-sm self-start md:self-auto"
          >
            Register Your School Campus →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PILOT_SCHOOLS.map((school, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{school.name}</h3>
                    <p className="text-xs text-brand-orange-600 font-semibold mt-0.5">{school.campus}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Active Pilot
                  </span>
                </div>

                <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {school.area}
                </p>

                <div className="flex flex-wrap gap-1.5 mt-4">
                  {school.tags.map((t, idx) => (
                    <span key={idx} className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-slate-700 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-brand-orange-500" />
                    Bell: {school.morningBell}
                  </span>
                </div>

                <button
                  onClick={() => onOpenWaitlist('PARENT', undefined, school.name)}
                  className="text-xs font-bold text-brand-navy-900 hover:text-brand-orange-600 transition-colors"
                >
                  View Routes →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
