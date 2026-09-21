import Link from 'next/link';
import {
  Users,
  ShieldCheck,
  Bus,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function DashboardOverview() {
  const stats = [
    {
      title: 'Active Students',
      value: '42',
      change: '+14% this month',
      icon: Users,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      title: 'Verified Drivers',
      value: '12',
      sub: '8 Autos, 4 Vans',
      icon: ShieldCheck,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      title: 'Active Routes',
      value: '8',
      sub: '94% Seat Utilization',
      icon: Bus,
      color: 'text-brand-orange-600 bg-orange-50',
    },
    {
      title: 'Trip Completion',
      value: '99.2%',
      sub: 'Zero Safety Violations',
      icon: TrendingUp,
      color: 'text-indigo-600 bg-indigo-50',
    },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Hyderabad Operations Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time fleet monitoring, driver verification, and school transport logistics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/routes"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-orange-500 text-white font-medium text-sm hover:bg-brand-orange-600 shadow-sm transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Optimize Routes (OR-Tools)
          </Link>
          <Link
            href="/drivers"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 font-medium text-sm hover:bg-slate-50 shadow-sm transition-colors"
          >
            Review KYC Desk
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {stat.title}
                </span>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                <div className="text-xs font-medium text-emerald-600 mt-1">
                  {stat.change || stat.sub}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Live Shift Monitor */}
        <div className="lg:col-span-2 rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <h2 className="font-semibold text-slate-900 text-base">
                Active School Shift: Morning Pickup
              </h2>
            </div>
            <span className="text-xs font-medium text-slate-500">
              Bell Time Window: 08:00 - 08:30 AM
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {[
              {
                driver: 'Ramesh Goud (Auto TS09UA1234)',
                route: 'Kondapur & Madhapur ➔ DPS Gachibowli',
                students: '4 / 4 Picked',
                status: 'Completed Drop at School Gate',
                time: '08:12 AM',
                badge: 'bg-emerald-100 text-emerald-800',
              },
              {
                driver: 'Mohammed Khaja (Van TS09VB4567)',
                route: 'Manikonda & Puppalguda ➔ Oakridge International',
                students: '8 / 8 Picked',
                status: 'En Route to School (ETA 4 min)',
                time: '08:18 AM',
                badge: 'bg-blue-100 text-blue-800',
              },
              {
                driver: 'V. Krishna (Auto TS07UC8890)',
                route: 'Khajaguda Junction ➔ Glendale Academy',
                students: '3 / 4 Picked',
                status: 'At Stop 4: Telecom Nagar',
                time: '08:19 AM',
                badge: 'bg-amber-100 text-amber-800',
              },
            ].map((trip, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
                <div>
                  <h3 className="font-medium text-sm text-slate-900">{trip.driver}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{trip.route}</p>
                  <p className="text-xs text-slate-600 mt-1 font-medium">
                    Status: <span className="text-slate-800">{trip.status}</span>
                  </p>
                </div>
                <div className="text-right flex flex-col items-end gap-1.5">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${trip.badge}`}>
                    {trip.students}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {trip.time}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-slate-50/70 border-t border-slate-100 text-center">
            <Link
              href="/trips"
              className="text-xs font-semibold text-brand-navy-800 hover:text-brand-orange-500 inline-flex items-center gap-1"
            >
              View Full Hyderabad Live Tracking Board <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right Col: Operations Pending Checklist */}
        <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <h2 className="font-semibold text-slate-900 text-base mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-brand-orange-500" />
              Safety Action Queue
            </h2>

            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-orange-50/70 border border-orange-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-orange-950">Driver KYC Review</span>
                  <span className="text-[11px] font-bold text-orange-600 px-1.5 py-0.5 bg-orange-100 rounded">
                    2 Pending
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  2 new Hyderabad drivers submitted commercial DL and Telangana fitness certificates.
                </p>
                <Link
                  href="/drivers"
                  className="mt-2 text-xs font-semibold text-brand-orange-600 hover:underline inline-block"
                >
                  Verify Documents →
                </Link>
              </div>

              <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-950">Route Optimization</span>
                  <span className="text-[11px] font-bold text-blue-600 px-1.5 py-0.5 bg-blue-100 rounded">
                    Suggested
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Google OR-Tools solver identified a 12% student transit time reduction for DPS Gachibowli morning route.
                </p>
                <Link
                  href="/routes"
                  className="mt-2 text-xs font-semibold text-blue-600 hover:underline inline-block"
                >
                  Review Proposal →
                </Link>
              </div>

              <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-950">Payment Reconciliation</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  All 42 active student subscriptions reconciled against Razorpay Webhook signatures.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-400">
            Pilot Zone: Cyberabad & Hyderabad Central
          </div>
        </div>
      </div>
    </div>
  );
}
