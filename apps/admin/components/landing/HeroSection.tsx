'use client';

import { ShieldCheck, Users, Clock, CheckCircle2, ArrowRight, Sparkles, MapPin } from 'lucide-react';

interface HeroSectionProps {
  onOpenWaitlist: (type?: 'PARENT' | 'DRIVER' | 'SCHOOL') => void;
}


export function HeroSection({ onOpenWaitlist }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-navy-950 via-brand-navy-900 to-slate-900 text-white pt-12 pb-24 md:pt-20 md:pb-32">
      {/* Subtle background glow effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-orange-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Pilot Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-navy-800 border border-brand-orange-500/40 shadow-sm text-xs font-semibold text-brand-orange-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hyderabad Pilot Now Live — Gachibowli, Begumpet, Manikonda & Sun City</span>
          </div>

          {/* Main H1 Headline for SEO */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] text-white">
            Safe, Verified School Transport for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange-400 to-orange-500">
              Hyderabad Kids
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            TinyRide connects parents with strictly vetted independent school auto and van drivers.
            Enjoy real-time boarding alerts, transparent monthly UPI subscriptions, and zero vehicle overcrowding.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onOpenWaitlist('PARENT')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-sm font-extrabold bg-brand-orange-500 text-white hover:bg-brand-orange-600 shadow-xl shadow-orange-950/60 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
            >
              Join Hyderabad Parent Waitlist
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#calculator"
              className="w-full sm:w-auto px-6 py-4 rounded-xl text-sm font-bold bg-white/10 hover:bg-white/15 text-white backdrop-blur-sm border border-white/20 transition-colors text-center"
            >
              Calculate Monthly Fare
            </a>
          </div>

          {/* Quick trust metrics */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300">
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Telangana RTA & Police Verified
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Strict Auto (4-6) & Van (8-12) Capacity
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Automated Razorpay Monthly Billing
            </span>
          </div>
        </div>

        {/* 3 Core Value Cards */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-brand-orange-500/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-brand-orange-500/20 text-brand-orange-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">4-Step Driver Vetting</h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Every driver candidate undergoes commercial driving license audit, annual vehicle fitness (FC) check, and Telangana Police Clearance certificate verification.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-brand-orange-500/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Real-Time Boarding Alerts</h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Receive live milestone notifications when morning trip starts, when your child is picked up at home, and when safely handed over at the school gate.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-brand-orange-500/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Zero Overcrowding</h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Our concurrency-safe booking engine locks seat capacity in database transactions. No cramming 10 kids into an auto-rickshaw. Ever.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
