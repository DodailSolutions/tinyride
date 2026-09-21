'use client';

import { useState } from 'react';
import { TrendingUp, Clock, CheckCircle2, MapPin, UserCheck, AlertTriangle } from 'lucide-react';

const TRIPS = [
  {
    id: 'trip-morning-01',
    route: 'Kondapur Express Route 1 ➔ DPS Gachibowli',
    driver: 'Ramesh Goud (Auto TS09UA1234)',
    type: 'MORNING_PICKUP',
    status: 'COMPLETED',
    startTime: '07:32 AM',
    endTime: '08:14 AM',
    expectedChildren: 4,
    pickedChildren: 4,
    droppedChildren: 4,
    milestones: [
      { child: 'Aarav Sharma', status: 'PICKED_UP', time: '07:36 AM', loc: 'Kondapur RTO Cross', idKey: 'e5f1...a1' },
      { child: 'Ananya Rao', status: 'PICKED_UP', time: '07:44 AM', loc: 'Chirec Avenue Stop', idKey: 'e5f1...a2' },
      { child: 'Siddharth M', status: 'PICKED_UP', time: '07:53 AM', loc: 'Botanical Garden Main Gate', idKey: 'e5f1...a3' },
      { child: 'Rohan Verma', status: 'PICKED_UP', time: '07:56 AM', loc: 'Botanical Garden Main Gate', idKey: 'e5f1...a4' },
      { child: 'All 4 Students', status: 'DROPPED', time: '08:14 AM', loc: 'DPS Gachibowli Campus Gate', idKey: 'e5f1...a5' },
    ],
  },
  {
    id: 'trip-morning-02',
    route: 'Manikonda Van Route 4 ➔ Oakridge International',
    driver: 'Mohammed Khaja (Van TS09VB4567)',
    type: 'MORNING_PICKUP',
    status: 'IN_PROGRESS',
    startTime: '07:22 AM',
    endTime: null,
    expectedChildren: 8,
    pickedChildren: 8,
    droppedChildren: 0,
    milestones: [
      { child: 'Diya Reddy', status: 'PICKED_UP', time: '07:26 AM', loc: 'Puppalguda Golden Temple', idKey: 'f9c2...b1' },
      { child: 'Varun Joshi', status: 'PICKED_UP', time: '07:41 AM', loc: 'Alkapur Township Circle', idKey: 'f9c2...b2' },
      { child: 'Pooja K', status: 'PICKED_UP', time: '07:54 AM', loc: 'Lanco Hills Tower 3', idKey: 'f9c2...b3' },
    ],
  },
];

export default function LiveTripOperationsPage() {
  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Live Trip Operations & Milestone Timeline
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time audit of vehicle transit, child boarding verification, and idempotent milestone events.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-semibold text-xs border border-emerald-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Sync Active
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {TRIPS.map((trip) => (
          <div key={trip.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-base text-slate-900">{trip.route}</h2>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      trip.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {trip.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Driver: <span className="font-medium text-slate-700">{trip.driver}</span> • Trip ID: <span className="font-mono text-[11px]">{trip.id}</span>
                </p>
              </div>

              <div className="text-right text-xs">
                <span className="text-slate-400 block text-[11px]">Passenger Milestone</span>
                <span className="font-bold text-slate-900">
                  {trip.pickedChildren} Picked / {trip.droppedChildren} Dropped / {trip.expectedChildren} Total
                </span>
              </div>
            </div>

            {/* Milestones timeline */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Recorded Ingestion Events (UUID Idempotency Verified)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {trip.milestones.map((m, i) => (
                  <div key={i} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{m.child}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-800">
                        {m.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" /> {m.loc}
                    </p>
                    <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" /> {m.time}
                      </span>
                      <span className="font-mono">key: {m.idKey}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
