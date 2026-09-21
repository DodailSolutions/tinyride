'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShieldCheck,
  Car,
  Users,
  Bus,
  School,
  CalendarCheck,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  LifeBuoy,
  ShieldAlert,
  Globe,
  ExternalLink,
  Sliders,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/drivers', label: 'Driver & KYC Desk', icon: ShieldCheck },
  { href: '/vehicles', label: 'Vehicle Inspection', icon: Car },
  { href: '/parents', label: 'Parents & Students', icon: Users },
  { href: '/schools', label: 'Schools Directory', icon: School },
  { href: '/routes', label: 'Routes & Capacity', icon: Bus },
  { href: '/bookings', label: 'Bookings', icon: CalendarCheck },
  { href: '/payments', label: 'Payments & Ledger', icon: CreditCard },
  { href: '/trips', label: 'Live Trip Monitor', icon: TrendingUp },
  { href: '/incidents', label: 'Safety & Incidents', icon: AlertTriangle },
  { href: '/support', label: 'Support Desk', icon: LifeBuoy },
  { href: '/audit-logs', label: 'Security Audit Logs', icon: ShieldAlert },
  { href: '/cms', label: 'Content Management (CMS)', icon: Sliders },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col bg-brand-navy-900 text-white border-r border-slate-800">
        {/* Brand Header */}
        <div className="p-5 border-b border-brand-navy-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-brand-orange-500 flex items-center justify-center font-bold text-white shadow-md shadow-orange-950/40">
              TR
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-tight text-white">
                TinyRide
              </h1>
              <p className="text-[11px] font-medium text-brand-orange-400 uppercase tracking-wider">
                by Dodail
              </p>
            </div>
          </div>
          <div className="mt-3 px-2.5 py-1 bg-brand-navy-800/80 rounded-md border border-brand-navy-700/50 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Portal</span>
            <span className="text-brand-orange-400 font-semibold">Hyderabad Ops</span>
          </div>
        </div>

        {/* Public Landing Link */}
        <div className="px-3 pt-3 pb-1">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold bg-brand-navy-800/90 text-brand-orange-400 hover:bg-brand-navy-700 transition-colors border border-brand-orange-500/20"
          >
            <span className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5" />
              View Public Website
            </span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-orange-500 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-brand-navy-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer User Info */}
        <div className="p-4 border-t border-brand-navy-800 bg-brand-navy-950/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-white">Operations Admin</p>
              <p className="text-[11px] text-slate-400">Dodail Central Control</p>
            </div>
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
