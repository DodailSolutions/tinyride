import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Bus,
  School,
  CalendarCheck,
  AlertTriangle,
  FileCheck,
  TrendingUp,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'TinyRide Ops — Dodail Solutions',
  description: 'AI-Assisted School Transportation Operations Management Portal',
};

const NAV_ITEMS = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/drivers', label: 'Driver & KYC Desk', icon: ShieldCheck },
  { href: '/schools', label: 'Schools', icon: School },
  { href: '/routes', label: 'Routes & Capacity', icon: Bus },
  { href: '/bookings', label: 'Bookings & Payments', icon: CalendarCheck },
  { href: '/trips', label: 'Live Trip Monitor', icon: TrendingUp },
  { href: '/incidents', label: 'Incidents & Safety', icon: AlertTriangle },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex h-screen overflow-hidden bg-slate-50 text-slate-900">
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
              <span className="text-slate-400 font-medium">Pilot Market</span>
              <span className="text-brand-orange-400 font-semibold">Hyderabad</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-brand-navy-800 transition-colors"
                >
                  <Icon className="w-4 h-4 text-slate-400" />
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
      </body>
    </html>
  );
}
