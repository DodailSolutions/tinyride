'use client';

import { useState } from 'react';
import { AlertTriangle, ShieldAlert, PhoneCall, CheckCircle, Clock } from 'lucide-react';
import { AdminShell } from '@/components/AdminShell';

const INCIDENTS = [

  {
    id: 'inc-01',
    category: 'DELAY',
    severity: 'MEDIUM',
    status: 'RESOLVED',
    reportedBy: 'Ramesh Goud (Driver)',
    reportedAt: '21 Sep 2026, 07:42 AM',
    description: 'Heavy waterlogging near Gachibowli flyover causing 10-minute delay for stop 3.',
    resolution: 'All 4 parents notified via automated push notification. Vehicle safely reached DPS gate at 08:12 AM.',
  },
  {
    id: 'inc-02',
    category: 'CHILD_UNWELL',
    severity: 'HIGH',
    status: 'INVESTIGATING',
    reportedBy: 'Mohammed Khaja (Driver)',
    reportedAt: '21 Sep 2026, 07:58 AM',
    description: 'Student felt car sick near Lanco Hills. Vehicle pulled safely over to curb.',
    resolution: 'Parent contacted immediately. Child given water and resting; backup vehicle notified.',
  },
];

export default function IncidentsSafetyPage() {
  return (
    <AdminShell>
      <div className="p-8 space-y-6 max-w-7xl mx-auto w-full">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Safety Incidents & Emergency Escalations
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            24/7 Operations response log for vehicle breakdowns, traffic delays, medical alerts, and route deviations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3.5 py-2 rounded-lg bg-rose-50 text-rose-800 font-bold text-xs border border-rose-200 flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-rose-600 animate-bounce" />
            Safety Hotline: +91 40 4567 8900 / 112
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {INCIDENTS.map((inc) => (
          <div
            key={inc.id}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span
                  className={`px-2.5 py-1 rounded text-xs font-bold ${
                    inc.severity === 'HIGH'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {inc.severity} SEVERITY
                </span>
                <span className="font-bold text-slate-800 text-sm">{inc.category}</span>
                <span className="text-xs text-slate-400 font-mono">({inc.id})</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  inc.status === 'RESOLVED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {inc.status}
              </span>
            </div>

            <p className="text-xs text-slate-700 font-medium">{inc.description}</p>

            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
              <div>
                <span>Reported by: <span className="text-slate-800 font-medium">{inc.reportedBy}</span></span>
                <span className="mx-2">•</span>
                <span>{inc.reportedAt}</span>
              </div>
              {inc.resolution && (
                <div className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-100 font-medium">
                  {inc.resolution}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
    </AdminShell>
  );
}

