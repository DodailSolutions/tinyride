'use client';

import { useState } from 'react';
import { CalendarCheck, CreditCard, CheckCircle, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

const BOOKINGS = [
  {
    id: 'bkg-101',
    parentName: 'Ananya Sharma',
    parentPhone: '+91 98490 88776',
    childName: 'Aarav Sharma (3rd Std)',
    school: 'DPS Gachibowli',
    routeName: 'Kondapur Express Route 1',
    driver: 'Ramesh Goud',
    monthlyFee: 3200,
    status: 'CONFIRMED',
    razorpayOrderId: 'order_RZP1029384756',
    razorpayPaymentId: 'pay_RZP9988776655',
    method: 'UPI',
    cycle: '01 Sep 2026 - 30 Sep 2026',
  },
  {
    id: 'bkg-102',
    parentName: 'K. Vikram Reddy',
    parentPhone: '+91 98490 77665',
    childName: 'Diya Reddy (5th Std)',
    school: 'Oakridge International',
    routeName: 'Manikonda Van Route 4',
    driver: 'Mohammed Khaja',
    monthlyFee: 3800,
    status: 'CONFIRMED',
    razorpayOrderId: 'order_RZP2039485761',
    razorpayPaymentId: 'pay_RZP8877665544',
    method: 'CARD',
    cycle: '01 Sep 2026 - 30 Sep 2026',
  },
  {
    id: 'bkg-103',
    parentName: 'Sneha Patel',
    parentPhone: '+91 98490 66554',
    childName: 'Ishaan Patel (2nd Std)',
    school: 'HPS Begumpet',
    routeName: 'Begumpet Morning Shuttle',
    driver: 'Suresh Kumar Yadav',
    monthlyFee: 3000,
    status: 'PENDING_PAYMENT',
    razorpayOrderId: 'order_RZP3049586712',
    razorpayPaymentId: null,
    method: null,
    cycle: '01 Oct 2026 - 31 Oct 2026',
  },
];

export default function BookingsAndPaymentsPage() {
  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Bookings, Subscriptions & Razorpay Payments
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Reconciled monthly school transport subscriptions with cryptographic webhook verification.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700">
            Monthly Invoicing Cycle: 1st - 30th
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-600 uppercase tracking-wider">
          <span>Student & Parent</span>
          <span>Route & School</span>
          <span>Billing & Cycle</span>
          <span>Razorpay Status</span>
        </div>

        <div className="divide-y divide-slate-100">
          {BOOKINGS.map((bkg) => (
            <div key={bkg.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs hover:bg-slate-50/70 transition-colors">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{bkg.childName}</h3>
                <p className="text-slate-500 mt-0.5">Parent: {bkg.parentName} ({bkg.parentPhone})</p>
                <p className="text-slate-400 font-mono text-[11px] mt-0.5">{bkg.id}</p>
              </div>

              <div>
                <p className="font-semibold text-slate-800">{bkg.routeName}</p>
                <p className="text-slate-500 mt-0.5">{bkg.school}</p>
                <p className="text-slate-500 mt-0.5">Driver: {bkg.driver}</p>
              </div>

              <div>
                <p className="font-bold text-brand-navy-900 text-sm">₹{bkg.monthlyFee.toLocaleString('en-IN')}/mo</p>
                <p className="text-slate-500 mt-0.5">{bkg.cycle}</p>
                {bkg.method && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded inline-block mt-1">
                    Method: {bkg.method}
                  </span>
                )}
              </div>

              <div className="flex flex-col items-start md:items-end gap-1">
                <span
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    bkg.status === 'CONFIRMED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {bkg.status}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {bkg.razorpayOrderId}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
