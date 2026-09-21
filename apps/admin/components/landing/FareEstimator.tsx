'use client';

import { useState } from 'react';
import { Calculator, MapPin, School, Bus, CheckCircle2, ArrowRight } from 'lucide-react';

interface FareEstimatorProps {
  onOpenWaitlist: (type?: 'PARENT' | 'DRIVER' | 'SCHOOL', defaultArea?: string, defaultSchool?: string) => void;
}


const LOCALITIES = [
  'Kondapur / Hitec City',
  'Madhapur / Chirec Avenue',
  'Manikonda / Puppalguda',
  'Gachibowli / Telecom Nagar',
  'Begumpet / Prakash Nagar',
  'Sun City / Bandlaguda Jagir',
];

const SCHOOLS = [
  { name: 'Delhi Public School (DPS) Gachibowli', bell: '08:15 AM' },
  { name: 'Oakridge International School, Gachibowli', bell: '08:30 AM' },
  { name: 'The Hyderabad Public School (HPS) Begumpet', bell: '08:00 AM' },
  { name: 'Glendale Academy, Sun City', bell: '08:20 AM' },
];

export function FareEstimator({ onOpenWaitlist }: FareEstimatorProps) {
  const [selectedArea, setSelectedArea] = useState<string>(LOCALITIES[0] ?? 'Kondapur / Hitec City');
  const [selectedSchool, setSelectedSchool] = useState<string>(SCHOOLS[0]?.name ?? 'Delhi Public School (DPS) Gachibowli');
  const [vehicleType, setVehicleType] = useState<'AUTO' | 'VAN'>('AUTO');


  // Compute calculated estimate based on area and vehicle type
  const calculateFee = () => {
    let base = vehicleType === 'AUTO' ? 3200 : 3800;
    if (selectedArea?.includes('Manikonda') || selectedArea?.includes('Kondapur')) {
      base += 200;
    }
    return base;
  };

  const estimatedFee = calculateFee();

  return (
    <section id="calculator" className="py-20 bg-slate-100/70">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange-50 text-brand-orange-600 border border-brand-orange-200 text-xs font-bold mb-3">
            <Calculator className="w-3.5 h-3.5" />
            Transparent Pricing
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Estimate Your Monthly School Transport Fare
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            No bargaining. No hidden charges. Clear distance-band pricing with monthly digital receipts.
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Inputs (7 cols) */}
          <div className="p-8 lg:col-span-7 space-y-6">
            {/* Step 1: Area */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-brand-orange-500" />
                Select Your Home Pickup Locality
              </label>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="w-full p-3.5 text-sm font-semibold rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange-500 transition-colors"
              >
                {LOCALITIES.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: School */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <School className="w-4 h-4 text-brand-orange-500" />
                Select Your Child's School
              </label>
              <select
                value={selectedSchool}
                onChange={(e) => setSelectedSchool(e.target.value)}
                className="w-full p-3.5 text-sm font-semibold rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange-500 transition-colors"
              >
                {SCHOOLS.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name} (Bell: {s.bell})
                  </option>
                ))}
              </select>
            </div>

            {/* Step 3: Vehicle Type Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Bus className="w-4 h-4 text-brand-orange-500" />
                Vehicle Preference
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setVehicleType('AUTO')}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    vehicleType === 'AUTO'
                      ? 'border-brand-orange-500 bg-orange-50/70 text-slate-900 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-extrabold text-sm">School Auto</div>
                  <div className="text-xs text-slate-500 mt-0.5">3-4 Kids Max • Quick Navigation</div>
                </button>

                <button
                  type="button"
                  onClick={() => setVehicleType('VAN')}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    vehicleType === 'VAN'
                      ? 'border-brand-orange-500 bg-orange-50/70 text-slate-900 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-extrabold text-sm">School Van</div>
                  <div className="text-xs text-slate-500 mt-0.5">8-12 Kids Max • AC Comfort</div>
                </button>
              </div>
            </div>
          </div>

          {/* Results Box (5 cols) */}
          <div className="p-8 lg:col-span-5 bg-brand-navy-900 text-white flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-brand-orange-400 uppercase tracking-wider">
                Monthly Subscription Estimate
              </div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">
                  ₹{estimatedFee.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-slate-400">/ child / month</span>
              </div>
              <p className="text-xs text-slate-300 mt-2">
                Includes morning pickup, school gate drop, afternoon return, and live boarding tracking.
              </p>

              <div className="mt-6 pt-6 border-t border-brand-navy-800 space-y-2.5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Pickup window: 07:25 AM - 07:45 AM</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Doorstep pickup with authorized guardian code</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Zero cash handling; monthly Razorpay invoice</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-brand-navy-800">
              <button
                onClick={() => onOpenWaitlist('PARENT', selectedArea, selectedSchool)}
                className="w-full py-3.5 rounded-xl font-extrabold text-xs bg-brand-orange-500 hover:bg-brand-orange-600 text-white shadow-lg shadow-orange-950/40 transition-colors flex items-center justify-center gap-2"
              >
                Reserve Seat for this Route
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[10px] text-center text-slate-400 mt-2">
                No upfront payment required to join waitlist.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
