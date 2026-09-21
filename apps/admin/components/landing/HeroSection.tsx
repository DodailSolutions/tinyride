'use client';

import Image from 'next/image';
import { ArrowRight, Sparkles, CheckCircle2, ShieldCheck, Heart, Leaf, Users, MapPin } from 'lucide-react';

interface HeroSectionProps {
  onOpenWaitlist: (type?: 'PARENT' | 'DRIVER' | 'SCHOOL') => void;
}

export function HeroSection({ onOpenWaitlist }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-navy-950 via-brand-navy-900 to-[#0C1A2E] text-white pt-10 pb-20 md:pt-16 md:pb-28">
      {/* Subtle background glow effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-brand-orange-500/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Core Positioning & Brand Promise */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Endorsement & Pilot Hub Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-navy-900/90 border border-brand-orange-500/40 shadow-sm text-xs font-semibold text-brand-orange-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>TinyRide by Dodail • Hyderabad School Commute Coordination</span>
            </div>

            {/* Tagline & Headline conforming to Brand Guidelines v1.0 */}
            <div className="space-y-2">
              <p className="text-sm md:text-base font-bold uppercase tracking-widest text-brand-orange-400">
                Little Rides. Big Peace of Mind.
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.18] text-white">
                School transport, made{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange-400 to-amber-300">
                  easier to manage.
                </span>
              </h1>
            </div>

            {/* Parent-facing Descriptor */}
            <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Arrange your child’s school commute with clearer route details, verified driver information, and dependable support. A more coordinated connection between Hyderabad families and independent drivers.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={() => onOpenWaitlist('PARENT')}
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-sm font-extrabold bg-brand-orange-500 text-white hover:bg-brand-orange-600 shadow-xl shadow-orange-950/60 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="#calculator"
                className="w-full sm:w-auto px-6 py-4 rounded-xl text-sm font-bold bg-white/10 hover:bg-white/15 text-white backdrop-blur-sm border border-white/20 transition-colors text-center"
              >
                Explore Routes & Fares
              </a>
              <button
                onClick={() => onOpenWaitlist('DRIVER')}
                className="w-full sm:w-auto px-5 py-4 rounded-xl text-xs font-semibold text-brand-orange-300 hover:text-white hover:bg-brand-navy-800/80 transition-colors text-center border border-brand-orange-500/20"
              >
                Register as a Driver
              </button>
            </div>

            {/* Trust-oriented Line & Badges */}
            <div className="pt-4 border-t border-brand-navy-800/80">
              <p className="text-xs font-semibold text-slate-300 mb-3 italic">
                “Clear information. Thoughtful coordination. Support when you need it.”
              </p>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Driver Document Verification
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Telangana RTA Capacity Standards
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Transparent Digital Subscriptions
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Master Brand Visual & 4 Hallmarks */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl shadow-black/40 border border-white/10 group">
              {/* Master Brand Artwork */}
              <div className="relative w-full aspect-square overflow-hidden rounded-2xl bg-white flex items-center justify-center">
                <Image
                  src="/brand/tinyride-master-logo.png"
                  alt="TinyRide by Dodail Master Artwork — School Ride, Brighter Futures"
                  width={420}
                  height={420}
                  className="object-contain w-full h-full"
                  priority
                />
              </div>

              {/* Master Brand Hallmarks Banner */}
              <div className="mt-4 grid grid-cols-4 gap-2 pt-3 border-t border-slate-100 text-center">
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800">Safe</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-1">
                    <Users className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800">Reliable</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-1">
                    <Heart className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800">Trusted</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mb-1">
                    <Leaf className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800">Brighter</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Core Message Pillars (Section 3 of Brand Guidelines) */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-brand-navy-900/70 backdrop-blur-md border border-brand-navy-800 hover:border-brand-orange-500/40 transition-colors">
            <div className="text-xs font-bold uppercase tracking-wider text-brand-orange-400 mb-2">
              Message Pillar 01
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Clarity</h3>
            <p className="text-xs text-slate-300 font-medium mb-3">
              Know the route, schedule, pricing and booking status.
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Transparent per-kilometer fee breakdowns, documented pickup timings, live booking confirmations, and clear cancellation policies with no surprise charges.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-brand-navy-900/70 backdrop-blur-md border border-brand-navy-800 hover:border-brand-orange-500/40 transition-colors">
            <div className="text-xs font-bold uppercase tracking-wider text-brand-orange-400 mb-2">
              Message Pillar 02
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Connection</h3>
            <p className="text-xs text-slate-300 font-medium mb-3">
              A more organized connection between families and drivers.
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Audited driver profiles, documented expectations, direct parent support workflows, and respectful partnership that treats drivers and families with mutual dignity.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-brand-navy-900/70 backdrop-blur-md border border-brand-navy-800 hover:border-brand-orange-500/40 transition-colors">
            <div className="text-xs font-bold uppercase tracking-wider text-brand-orange-400 mb-2">
              Message Pillar 03
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Peace of Mind</h3>
            <p className="text-xs text-slate-300 font-medium mb-3">
              Feel informed—not left guessing—about the commute.
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Defined pickup and drop-off handover procedures, timely departure and arrival updates, and a structured operations desk for rapid issue resolution.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
