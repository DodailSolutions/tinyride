import { Shield, Lock, EyeOff, FileBadge, PhoneCall, AlertOctagon } from 'lucide-react';

export function SafetyPillars() {
  const pillars = [
    {
      icon: FileBadge,
      title: 'Telangana Commercial Driving Badge',
      description:
        'We mandate official commercial transport driver endorsements from Telangana RTA. Novice or private license holders are strictly prohibited.',
    },
    {
      icon: Shield,
      title: 'Police Clearance Certificate (PCC)',
      description:
        'Every driver partner must submit a verified Police Clearance Certificate from Hyderabad or Cyberabad Police Commissionerates.',
    },
    {
      icon: EyeOff,
      title: 'Zero In-Motion Phone Distraction',
      description:
        'Our driver app restricts interaction while vehicles are in motion. Pickups and drops are confirmed strictly when the vehicle is safely stopped.',
    },
    {
      icon: Lock,
      title: 'DPDPA Child Privacy & Encryption',
      description:
        'Child coordinates, school schedules, and guardian contacts are shielded by PostgreSQL Row Level Security (RLS). No public tracking links or unmoderated groups.',
    },
    {
      icon: AlertOctagon,
      title: 'Strict Capacity Guardrails',
      description:
        'Our database rejects bookings once route limits are reached (max 4-6 for Autos, max 8-12 for Vans). Overcrowding is physically and digitally impossible.',
    },
    {
      icon: PhoneCall,
      title: '24/7 Hyderabad Operations Hotline',
      description:
        'In the event of road waterlogging, minor delays, or vehicle issues, our central control desk (+91 40 4567 8900) coordinates immediate assistance.',
    },
  ];

  return (
    <section id="safety" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            Transparent Processes & Standards
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-brand-navy-900">
            Accountable School Commute Standards
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Trust is earned through transparent processes, verified information and dependable communication. TinyRide aligns with Telangana Motor Vehicle Rules and established school transport norms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-lg hover:border-brand-orange-500/30 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-navy-900 text-brand-orange-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
