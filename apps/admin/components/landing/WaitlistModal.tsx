'use client';

import { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'PARENT' | 'DRIVER' | 'SCHOOL';
  defaultArea?: string;
  defaultSchool?: string;
}

export function WaitlistModal({
  isOpen,
  onClose,
  defaultType = 'PARENT',
  defaultArea = '',
  defaultSchool = '',
}: WaitlistModalProps) {
  const [leadType, setLeadType] = useState<'PARENT' | 'DRIVER' | 'SCHOOL'>(defaultType);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [area, setArea] = useState(defaultArea);
  const [school, setSchool] = useState(defaultSchool);
  const [grade, setGrade] = useState('');
  const [vehicleType, setVehicleType] = useState<'AUTO' | 'VAN'>('AUTO');
  const [notes, setNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !area.trim()) {
      setErrorMsg('Please fill in your name, mobile number, and locality.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    // Simulate API submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 800);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSubmitted ? (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-brand-orange-500 animate-pulse" />
              <span className="text-[11px] font-bold text-brand-orange-600 uppercase tracking-wider">
                Hyderabad Pilot Program
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              Join the TinyRide Waitlist
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Be the first to access verified school transport routes in your neighborhood.
            </p>

            {/* Type selector */}
            <div className="grid grid-cols-3 gap-2 mt-5 p-1 bg-slate-100 rounded-xl">
              {(['PARENT', 'DRIVER', 'SCHOOL'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setLeadType(t)}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    leadType === t
                      ? 'bg-white text-brand-navy-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {t === 'PARENT' ? 'Parent' : t === 'DRIVER' ? 'Driver Partner' : 'School'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 font-medium">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-orange-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile Number (+91) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="98490 12345"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Locality / Area *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kondapur, Gachibowli"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              {leadType === 'PARENT' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Child's School</label>
                    <input
                      type="text"
                      placeholder="e.g. DPS Gachibowli"
                      value={school}
                      onChange={(e) => setSchool(e.target.value)}
                      className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-orange-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Grade / Class</label>
                    <input
                      type="text"
                      placeholder="e.g. 3rd Standard"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-orange-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {leadType === 'DRIVER' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Vehicle Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setVehicleType('AUTO')}
                      className={`p-3 rounded-xl border font-bold text-center ${
                        vehicleType === 'AUTO'
                          ? 'border-brand-orange-500 bg-orange-50 text-brand-orange-600'
                          : 'border-slate-200'
                      }`}
                    >
                      Auto-Rickshaw (Max 4-6)
                    </button>
                    <button
                      type="button"
                      onClick={() => setVehicleType('VAN')}
                      className={`p-3 rounded-xl border font-bold text-center ${
                        vehicleType === 'VAN'
                          ? 'border-brand-orange-500 bg-orange-50 text-brand-orange-600'
                          : 'border-slate-200'
                      }`}
                    >
                      School Van (Max 8-12)
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Special Notes / Queries</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Prefer morning pickup near Botanical Garden gate..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-orange-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl font-extrabold bg-brand-orange-500 hover:bg-brand-orange-600 text-white shadow-lg shadow-orange-950/40 transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Register on Priority Waitlist'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[11px] text-slate-400 text-center">
                🔒 Your contact info is strictly confidential under DPDPA 2023. No spam calls.
              </p>
            </form>
          </div>
        ) : (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900">You're on the Priority List!</h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
              Thank you, <span className="font-bold text-slate-900">{name}</span>. Our Hyderabad route coordinator will call you at <span className="font-bold text-slate-900">{phone}</span> to confirm seat availability for your route.
            </p>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500">
              Reference ID: <span className="font-mono font-bold text-slate-800">TR-HYD-{Date.now().toString().slice(-6)}</span>
            </div>
            <button
              onClick={handleReset}
              className="w-full py-3 rounded-xl font-bold bg-brand-navy-900 text-white hover:bg-brand-navy-800 transition-colors text-xs mt-2"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
