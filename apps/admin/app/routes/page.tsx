'use client';

import { useState } from 'react';
import {
  Bus,
  Sparkles,
  CheckCircle,
  Clock,
  MapPin,
  Users,
  Check,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { AdminShell } from '@/components/AdminShell';

interface RouteItem {

  id: string;
  name: string;
  schoolName: string;
  driverName: string;
  vehicleType: 'AUTO' | 'VAN';
  regNumber: string;
  totalSeats: number;
  reservedSeats: number;
  morningWindow: string;
  monthlyFeeINR: number;
  status: 'ACTIVE' | 'PENDING_APPROVAL';
  stops: { name: string; time: string; students: number }[];
}

const INITIAL_ROUTES: RouteItem[] = [
  {
    id: 'rt-1',
    name: 'Kondapur Express Route 1',
    schoolName: 'Delhi Public School (DPS) Gachibowli',
    driverName: 'Ramesh Goud',
    vehicleType: 'AUTO',
    regNumber: 'TS09UA1234',
    totalSeats: 4,
    reservedSeats: 4,
    morningWindow: '07:30 - 08:15 AM',
    monthlyFeeINR: 3200,
    status: 'ACTIVE',
    stops: [
      { name: 'Kondapur RTO Cross', time: '07:35 AM', students: 1 },
      { name: 'Chirec Avenue Stop', time: '07:45 AM', students: 1 },
      { name: 'Botanical Garden Main Gate', time: '07:55 AM', students: 2 },
      { name: 'DPS Gachibowli Campus Gate', time: '08:12 AM', students: 0 },
    ],
  },
  {
    id: 'rt-2',
    name: 'Manikonda Van Route 4',
    schoolName: 'Oakridge International School',
    driverName: 'Mohammed Khaja',
    vehicleType: 'VAN',
    regNumber: 'TS09VB4567',
    totalSeats: 8,
    reservedSeats: 8,
    morningWindow: '07:20 - 08:25 AM',
    monthlyFeeINR: 3800,
    status: 'ACTIVE',
    stops: [
      { name: 'Puppalguda Golden Temple', time: '07:25 AM', students: 2 },
      { name: 'Alkapur Township Circle', time: '07:40 AM', students: 3 },
      { name: 'Lanco Hills Tower 3', time: '07:55 AM', students: 3 },
      { name: 'Oakridge Einstein Campus', time: '08:20 AM', students: 0 },
    ],
  },
  {
    id: 'rt-3',
    name: 'Begumpet Morning Shuttle',
    schoolName: 'The Hyderabad Public School Begumpet',
    driverName: 'Suresh Kumar Yadav',
    vehicleType: 'AUTO',
    regNumber: 'TS07UC8890',
    totalSeats: 4,
    reservedSeats: 3,
    morningWindow: '07:15 - 07:55 AM',
    monthlyFeeINR: 3000,
    status: 'PENDING_APPROVAL',
    stops: [
      { name: 'Prakash Nagar Metro', time: '07:20 AM', students: 1 },
      { name: 'Shoppers Stop Begumpet', time: '07:32 AM', students: 2 },
      { name: 'HPS Begumpet Heritage Gate', time: '07:50 AM', students: 0 },
    ],
  },
];

export default function RoutesManagementPage() {
  const [routes, setRoutes] = useState<RouteItem[]>(INITIAL_ROUTES);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedProposal, setOptimizedProposal] = useState<null | {
    timeSavedMinutes: number;
    distanceSavedKm: number;
    reorderedStops: string[];
  }>(null);

  const handleRunOptimizer = () => {
    setIsOptimizing(true);
    // Simulate OR-Tools solver call
    setTimeout(() => {
      setIsOptimizing(false);
      setOptimizedProposal({
        timeSavedMinutes: 8,
        distanceSavedKm: 2.3,
        reorderedStops: [
          'Chirec Avenue Stop (07:38 AM)',
          'Kondapur RTO Cross (07:46 AM)',
          'Botanical Garden Main Gate (07:54 AM)',
          'DPS Gachibowli Campus Gate (08:08 AM)',
        ],
      });
    }, 1200);
  };

  const handleApproveOptimization = () => {
    setOptimizedProposal(null);
    alert('Route schedule updated and published to driver & parent applications.');
  };

  return (
    <AdminShell>
      <div className="p-8 space-y-6 max-w-7xl mx-auto w-full">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            School Transport Routes & Seat Capacity
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure approved Hyderabad routes, verify vehicle seat constraints, and run OR-Tools optimization.
          </p>
        </div>
        <button
          onClick={handleRunOptimizer}
          disabled={isOptimizing}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-orange-500 hover:bg-brand-orange-600 text-white font-semibold text-sm shadow-sm transition-colors disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          {isOptimizing ? 'Solving with OR-Tools...' : 'Run Route Optimization'}
        </button>
      </div>

      {/* OR-Tools Proposal Banner if generated */}
      {optimizedProposal && (
        <div className="p-5 rounded-xl bg-orange-50 border border-orange-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-orange-600" />
              <h3 className="font-bold text-slate-900 text-sm">
                Google OR-Tools Optimization Recommendation (CVRPTW)
              </h3>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-orange-100 text-orange-800">
              Recommendation Only — Requires Approval
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-white rounded-lg border border-orange-100">
              <p className="text-slate-500 font-medium">Estimated Efficiency Gain</p>
              <p className="text-base font-bold text-emerald-600 mt-0.5">
                Saved {optimizedProposal.timeSavedMinutes} minutes & {optimizedProposal.distanceSavedKm} km
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-orange-100">
              <p className="text-slate-500 font-medium">Proposed Reordered Sequence</p>
              <p className="font-semibold text-slate-800 mt-0.5">
                {optimizedProposal.reorderedStops.join(' ➔ ')}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setOptimizedProposal(null)}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-orange-100/60"
            >
              Dismiss
            </button>
            <button
              onClick={handleApproveOptimization}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-sm"
            >
              <Check className="w-3.5 h-3.5" /> Approve & Publish New Schedule
            </button>
          </div>
        </div>
      )}

      {/* Routes List */}
      <div className="space-y-4">
        {routes.map((route) => (
          <div
            key={route.id}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="font-bold text-base text-slate-900">{route.name}</h3>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      route.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {route.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  School: <span className="font-medium text-slate-700">{route.schoolName}</span>
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div className="text-right">
                  <span className="text-slate-400 block text-[11px]">Capacity Status</span>
                  <span className="font-bold text-slate-900">
                    {route.reservedSeats} / {route.totalSeats} Seats Filled
                  </span>
                </div>
                <div className="text-right pl-4 border-l border-slate-200">
                  <span className="text-slate-400 block text-[11px]">Monthly Fee</span>
                  <span className="font-bold text-brand-orange-600">
                    ₹{route.monthlyFeeINR.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Stops Sequence */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Pickup Stops Sequence ({route.morningWindow})
              </span>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {route.stops.map((stop, sIdx) => (
                  <div
                    key={sIdx}
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between">
                      <span className="font-bold text-slate-800">{sIdx + 1}. {stop.name}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" /> {stop.time}
                      </span>
                      {stop.students > 0 && (
                        <span className="font-semibold text-brand-navy-800">
                          {stop.students} {stop.students === 1 ? 'student' : 'students'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    </AdminShell>
  );
}

