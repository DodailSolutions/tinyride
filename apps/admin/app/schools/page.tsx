'use client';

import { School, Clock, Phone, MapPin, Bus, CheckCircle2 } from 'lucide-react';
import { AdminShell } from '@/components/AdminShell';

const SCHOOLS = [

  {
    id: 'sch-1',
    name: 'Delhi Public School (DPS)',
    branch: 'Gachibowli Campus',
    code: 'DPS-GACHIBOWLI',
    address: 'Survey No. 74, Khajaguda Village, Gachibowli, Hyderabad 500008',
    morningBell: '08:15 AM',
    afternoonBell: '03:15 PM',
    contactPerson: 'Mr. Satyanarayana (Transport Lead)',
    phone: '+91 98490 12345',
    activeRoutes: 4,
    studentsCount: 16,
  },
  {
    id: 'sch-2',
    name: 'Oakridge International School',
    branch: 'Einstein Campus, Nanakramguda',
    code: 'OAKRIDGE-GACHIBOWLI',
    address: 'Nanakramguda Road, Cyberabad, Khajaguda, Manikonda, Hyderabad 500008',
    morningBell: '08:30 AM',
    afternoonBell: '03:30 PM',
    contactPerson: 'Ms. Radhika V (Transport Coordinator)',
    phone: '+91 98490 67890',
    activeRoutes: 3,
    studentsCount: 14,
  },
  {
    id: 'sch-3',
    name: 'The Hyderabad Public School (HPS)',
    branch: 'Begumpet Heritage Campus',
    code: 'HPS-BEGUMPET',
    address: '1-11-87 & 88, S.P. Road, Begumpet, Hyderabad 500016',
    morningBell: '08:00 AM',
    afternoonBell: '02:45 PM',
    contactPerson: 'Mr. K. Rao (Admin Officer)',
    phone: '+91 98490 54321',
    activeRoutes: 2,
    studentsCount: 7,
  },
  {
    id: 'sch-4',
    name: 'Glendale Academy International',
    branch: 'Sun City Campus',
    code: 'GLENDALE-SUNCITY',
    address: 'Beside Sun City, Artry Road, Bandlaguda Jagir, Hyderabad 500086',
    morningBell: '08:20 AM',
    afternoonBell: '03:10 PM',
    contactPerson: 'Mr. Imran Khan (Safety Lead)',
    phone: '+91 98490 98765',
    activeRoutes: 2,
    studentsCount: 5,
  },
];

export default function SchoolsPage() {
  return (
    <AdminShell>
      <div className="p-8 space-y-6 max-w-7xl mx-auto w-full">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Partnered Hyderabad Schools
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Registered educational hubs in Cyberabad and Hyderabad Central with synchronized bell times.
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-semibold text-xs border border-emerald-200 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4" /> 4 Active Campuses in Pilot
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SCHOOLS.map((school) => (
          <div
            key={school.id}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-brand-navy-50 text-brand-navy-800">
                    <School className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="font-bold text-base text-slate-900">{school.name}</h2>
                    <p className="text-xs text-brand-orange-600 font-medium">{school.branch}</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold">
                  {school.code}
                </span>
              </div>

              <div className="mt-4 text-xs text-slate-600 space-y-2">
                <p className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                  {school.address}
                </p>
                <p className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {school.contactPerson} ({school.phone})
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1 text-slate-700 font-medium">
                  <Clock className="w-3.5 h-3.5 text-brand-orange-500" />
                  Morning: {school.morningBell}
                </span>
                <span className="flex items-center gap-1 text-slate-700 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Afternoon: {school.afternoonBell}
                </span>
              </div>

              <span className="px-2 py-1 rounded bg-slate-100 text-slate-700 font-bold flex items-center gap-1">
                <Bus className="w-3.5 h-3.5" /> {school.activeRoutes} Routes
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
    </AdminShell>
  );
}

