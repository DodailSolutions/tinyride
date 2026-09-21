'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Shield, PhoneCall, ArrowRight, UserCheck } from 'lucide-react';

interface LandingHeaderProps {
  onOpenWaitlist?: (type?: 'PARENT' | 'DRIVER' | 'SCHOOL') => void;
}

export function LandingHeader({ onOpenWaitlist }: LandingHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleWaitlistClick = (type: 'PARENT' | 'DRIVER' | 'SCHOOL') => {
    if (onOpenWaitlist) {
      onOpenWaitlist(type);
    } else if (typeof window !== 'undefined') {
      window.location.href = `/?waitlist=true&type=${type}`;
    }
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-brand-navy-950/90 border-b border-brand-navy-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo & Lockup conforming to Brand Guidelines v1.0 */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-white p-0.5 flex items-center justify-center shadow-lg shadow-brand-orange-500/20 overflow-hidden group-hover:ring-2 group-hover:ring-brand-orange-400 transition-all">
              <Image
                src="/brand/tinyride-master-logo.png"
                alt="TinyRide by Dodail Logo"
                width={44}
                height={44}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white">TinyRide</span>
                <span className="text-[10px] font-bold text-brand-orange-400 uppercase tracking-wider bg-brand-navy-900 px-2 py-0.5 rounded-full border border-brand-orange-500/30">
                  by Dodail
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium hidden sm:block">
                Little Rides. Big Peace of Mind.
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#safety" className="hover:text-white hover:text-brand-orange-400 transition-colors">
              Pillars & Values
            </a>
            <a href="#calculator" className="hover:text-white hover:text-brand-orange-400 transition-colors">
              Fare Calculator
            </a>
            <a href="#schools" className="hover:text-white hover:text-brand-orange-400 transition-colors">
              Schools
            </a>
            <a href="#faqs" className="hover:text-white hover:text-brand-orange-400 transition-colors">
              FAQs & Policies
            </a>
            <a href="#blog" className="hover:text-white hover:text-brand-orange-400 transition-colors">
              Knowledge Hub
            </a>
          </nav>

          {/* Desktop CTAs conforming to Brand Guidelines */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/dashboard"
              className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-brand-navy-800 transition-colors border border-brand-navy-700"
            >
              Operations Portal
            </Link>
            <button
              onClick={() => handleWaitlistClick('DRIVER')}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-brand-navy-900 text-brand-orange-400 hover:bg-brand-navy-800 transition-colors border border-brand-orange-500/30"
            >
              Register as a Driver
            </button>
            <button
              onClick={() => handleWaitlistClick('PARENT')}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-brand-orange-500 text-white hover:bg-brand-orange-600 shadow-md shadow-orange-950/40 transition-colors flex items-center gap-1.5"
            >
              Get Started
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => handleWaitlistClick('PARENT')}
              className="px-3 py-1.5 text-xs font-bold bg-brand-orange-500 text-white rounded-lg"
            >
              Waitlist
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-brand-navy-900 border-b border-brand-navy-800 px-4 pt-3 pb-6 space-y-3">
          <a
            href="#safety"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-200"
          >
            Safety Pillars
          </a>
          <a
            href="#calculator"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-200"
          >
            Fare Calculator
          </a>
          <a
            href="#schools"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-200"
          >
            Partner Schools
          </a>
          <a
            href="#faqs"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-200"
          >
            FAQs
          </a>
          <a
            href="#blog"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-200"
          >
            Safety Guides
          </a>
          <div className="pt-3 border-t border-brand-navy-800 flex flex-col gap-2">
            <Link
              href="/dashboard"
              className="py-2 text-center text-xs font-semibold text-slate-300 bg-brand-navy-800 rounded-lg"
            >
              Operations Portal
            </Link>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleWaitlistClick('DRIVER');
              }}
              className="py-2 text-center text-xs font-semibold text-brand-orange-400 bg-brand-navy-800 rounded-lg border border-brand-orange-500/30"
            >
              Driver Registration
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
