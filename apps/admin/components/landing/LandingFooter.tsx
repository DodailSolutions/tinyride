import Link from 'next/link';
import Image from 'next/image';
import { Shield, PhoneCall, Mail, MapPin, ExternalLink } from 'lucide-react';

export function LandingFooter() {
  return (
    <footer className="bg-brand-navy-950 text-slate-400 border-t border-brand-navy-900 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-brand-navy-900">
          {/* Col 1 & 2: Brand Info conforming to Brand Guidelines v1.0 */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white p-0.5 flex items-center justify-center shadow-md shadow-brand-orange-500/20 overflow-hidden">
                <Image
                  src="/brand/tinyride-master-logo.png"
                  alt="TinyRide by Dodail Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xl tracking-tight text-white">TinyRide</span>
                  <span className="text-[10px] font-bold text-brand-orange-400 uppercase tracking-wider bg-brand-navy-900 px-2 py-0.5 rounded-full border border-brand-orange-500/30">
                    by Dodail
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  Little Rides. Big Peace of Mind.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              School commute coordination for families and independent drivers. Providing clearer route details, transparent arrangements, and dependable support.
            </p>

            <div className="space-y-2 text-xs text-slate-400 pt-2">
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-brand-orange-400" />
                Cyber Towers, Hitec City, Hyderabad, Telangana 500081
              </p>
              <p className="flex items-center gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                24/7 Operations Hotline: +91 40 4567 8900 / 112
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                support@dodail.com
              </p>
            </div>
          </div>

          {/* Col 3: Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Platform</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href="#safety" className="hover:text-white transition-colors">
                  Safety Pillars
                </a>
              </li>
              <li>
                <a href="#calculator" className="hover:text-white transition-colors">
                  Fare Calculator
                </a>
              </li>
              <li>
                <a href="#schools" className="hover:text-white transition-colors">
                  Partner Schools
                </a>
              </li>
              <li>
                <a href="#faqs" className="hover:text-white transition-colors">
                  FAQs & Verification
                </a>
              </li>
              <li>
                <a href="#blog" className="hover:text-white transition-colors">
                  Safety Knowledge Hub
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Hyderabad Hubs */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Pilot Hubs</h4>
            <ul className="space-y-2 text-xs">
              <li>Gachibowli & Telecom Nagar</li>
              <li>Kondapur & Botanical Garden</li>
              <li>Manikonda & Puppalguda</li>
              <li>Madhapur & Hitec City</li>
              <li>Begumpet & Prakash Nagar</li>
              <li>Sun City & Bandlaguda Jagir</li>
            </ul>
          </div>

          {/* Col 5: Operations & Portals */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Operations</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link
                  href="/dashboard"
                  className="text-brand-orange-400 hover:text-brand-orange-300 font-semibold flex items-center gap-1"
                >
                  Operations Portal <ExternalLink className="w-3 h-3" />
                </Link>
              </li>
              <li>
                <Link href="/cms" className="hover:text-white transition-colors">
                  Content Management (CMS)
                </Link>
              </li>
              <li>
                <Link href="/drivers" className="hover:text-white transition-colors">
                  Driver KYC Review Desk
                </Link>
              </li>
              <li>
                <Link href="/routes" className="hover:text-white transition-colors">
                  OR-Tools Route Solver
                </Link>
              </li>
              <li>
                <Link href="/trips" className="hover:text-white transition-colors">
                  Live Trip Operations
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>
            © 2026 Dodail Solutions Private Limited. All rights reserved. Registered in Telangana, India.
          </p>
          <p className="max-w-md text-right text-slate-400 hidden sm:block">
            TinyRide is a technology platform connecting independent commercial transport contractors with parents. Dodail does not own transport vehicles.
          </p>
        </div>
      </div>
    </footer>
  );
}
