'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Cpu,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Car,
  MapPin,
  ChevronRight,
  TrendingUp,
  Percent,
  Lock,
  ArrowLeft,
  Sparkles,
  Users,
  Send,
  Eye,
  Info,
} from 'lucide-react';
import { AdminShell } from '@/components/AdminShell';
import {
  executeRouteOptimization,
  approveRouteRecommendation,
  rejectRouteRecommendation,
} from '@tinyride/api-client';
import {
  RouteOptimizationRequest,
  RouteOptimizationResponse,
  RouteRecommendationApproval,
} from '@tinyride/types';

// Pilot Schools for selection
const PILOT_SCHOOLS = [
  {
    id: 'school-dps-01',
    name: 'Delhi Public School (DPS) Gachibowli',
    location: { latitude: 17.4194, longitude: 78.3688, address: 'DPS Campus, Gachibowli' },
    bell_time: '08:15',
  },
  {
    id: 'school-oakridge-02',
    name: 'Oakridge International School',
    location: { latitude: 17.4116, longitude: 78.3582, address: 'Khajaguda, Gachibowli' },
    bell_time: '08:30',
  },
];

// Available verified fleet
const AVAILABLE_FLEET = [
  {
    id: 'veh-auto-01',
    driver_id: 'd1111111-1111-1111-1111-111111111111',
    driver_name: 'Ramesh Goud',
    vehicle_type: 'AUTO' as const,
    capacity: 4,
    start_location: { latitude: 17.4420, longitude: 78.3620, address: 'Kondapur Main Depot' },
  },
  {
    id: 'veh-van-02',
    driver_id: 'd2222222-2222-2222-2222-222222222222',
    driver_name: 'M. Krishna Murthy',
    vehicle_type: 'VAN' as const,
    capacity: 8,
    start_location: { latitude: 17.4350, longitude: 78.3580, address: 'Manikonda Stand' },
  },
];

// Synthetic student pickup requests (anonymized tokens to protect child PII)
const PENDING_STOPS = [
  {
    id: 'stop-aarav-01',
    child_token: 'tok_aarav_sharma',
    child_alias: 'Student #101 (3rd Std)',
    location: { latitude: 17.4450, longitude: 78.3640, address: 'My Home Mangala, Kondapur' },
    demand: 1,
    time_window_start: '07:30',
    time_window_end: '08:00',
  },
  {
    id: 'stop-ananya-02',
    child_token: 'tok_ananya_rao',
    child_alias: 'Student #102 (4th Std)',
    location: { latitude: 17.4410, longitude: 78.3610, address: 'Aparna Sarovar, Nallagandla' },
    demand: 1,
    time_window_start: '07:35',
    time_window_end: '08:05',
  },
  {
    id: 'stop-siddharth-03',
    child_token: 'tok_siddharth_m',
    child_alias: 'Student #103 (2nd Std)',
    location: { latitude: 17.4380, longitude: 78.3630, address: 'Raja Rajeshwari Nagar' },
    demand: 1,
    time_window_start: '07:40',
    time_window_end: '08:10',
  },
  {
    id: 'stop-rohan-04',
    child_token: 'tok_rohan_verma',
    child_alias: 'Student #104 (5th Std)',
    location: { latitude: 17.4320, longitude: 78.3660, address: 'Botanical Garden Rd' },
    demand: 1,
    time_window_start: '07:45',
    time_window_end: '08:10',
  },
  {
    id: 'stop-diya-05',
    child_token: 'tok_diya_reddy',
    child_alias: 'Student #105 (3rd Std)',
    location: { latitude: 17.4280, longitude: 78.3620, address: 'Silpa Park, Kondapur' },
    demand: 1,
    time_window_start: '07:45',
    time_window_end: '08:12',
  },
];

export default function RouteOptimizerDesk() {
  const [selectedSchool, setSelectedSchool] = useState(PILOT_SCHOOLS[0]!);
  const [shift, setShift] = useState<'MORNING' | 'AFTERNOON'>('MORNING');
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<RouteOptimizationResponse | null>(null);
  const [approvalRecord, setApprovalRecord] = useState<RouteRecommendationApproval | null>(null);

  // Modal state
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [isApproving, setIsApproving] = useState(false);

  const handleRunOptimization = async () => {
    setIsRunning(true);
    setResult(null);
    setApprovalRecord(null);

    try {
      const payload: RouteOptimizationRequest = {
        run_id: `run-opt-${Date.now()}`,
        school_id: selectedSchool.id,
        school_name: selectedSchool.name,
        school_location: selectedSchool.location,
        bell_time: selectedSchool.bell_time,
        shift,
        vehicles: AVAILABLE_FLEET.map((v) => ({
          id: v.id,
          driver_id: v.driver_id,
          vehicle_type: v.vehicle_type,
          capacity: v.capacity,
          start_location: v.start_location,
        })),
        stops: PENDING_STOPS.map((s) => ({
          id: s.id,
          child_token: s.child_token,
          location: s.location,
          demand: s.demand,
          time_window_start: s.time_window_start,
          time_window_end: s.time_window_end,
        })),
        max_student_ride_time_minutes: 45,
      };

      const res = await executeRouteOptimization(payload);
      setResult(res);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Optimization failed');
    } finally {
      setIsRunning(false);
    }
  };

  const handleApprove = async () => {
    if (!result) return;
    setIsApproving(true);
    try {
      const approval = await approveRouteRecommendation({
        run_id: result.run_id,
        decision: 'APPROVE',
        actor_id: 'admin-ops-01',
        actor_role: 'operations_admin',
        admin_notes: adminNotes || 'Reviewed stop sequences, verified safe pedestrian curbside halts.',
      });
      setApprovalRecord(approval);
      setShowApprovalModal(false);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Approval failed');
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!result) return;
    const reason = prompt('Please provide reason for rejecting this route proposal:');
    if (!reason) return;

    try {
      await rejectRouteRecommendation(result.run_id, 'admin-ops-01', 'operations_admin', reason);
      alert('Route proposal rejected and recorded in security audit logs.');
      setResult(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Rejection failed');
    }
  };

  return (
    <AdminShell>
      <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/routes" className="hover:text-brand-orange-500 transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Routes
          </Link>
          <span>/</span>
          <span className="font-semibold text-slate-700">AI-001 Route Optimization Engine</span>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Cpu className="w-6 h-6 text-brand-orange-500" />
              AI Route Optimization & Recommendations Desk
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Google OR-Tools CVRPTW solver generating optimal vehicle-to-stop assignments, safe stop sequencing, and arrival ETAs.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-navy-900 text-white flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-brand-orange-400" />
              Google OR-Tools Engine
            </span>
            <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              Mandatory Admin Approval
            </span>
          </div>
        </div>

        {/* Human Review Guardrail Banner */}
        <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 space-y-1">
            <p className="font-bold">Human-in-the-Loop Safety Guardrail Active</p>
            <p>
              Under TinyRide operating protocol, AI-generated route modifications are <strong>recommendations only</strong> and are <strong>never published automatically</strong> to drivers or parents. An authorized Operations Admin must inspect stop safety, seating capacities, and ETAs before approving publication.
            </p>
          </div>
        </div>

        {/* Configuration Pane */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            1. Optimization Parameters
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Destination School & Bell Time
              </label>
              <select
                value={selectedSchool.id}
                onChange={(e) => {
                  const s = PILOT_SCHOOLS.find((p) => p.id === e.target.value);
                  if (s) setSelectedSchool(s);
                }}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20"
              >
                {PILOT_SCHOOLS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} (Bell: {s.bell_time})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Commute Shift
              </label>
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value as 'MORNING' | 'AFTERNOON')}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20"
              >
                <option value="MORNING">Morning Inbound (Home ➔ School)</option>
                <option value="AFTERNOON">Afternoon Outbound (School ➔ Home)</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleRunOptimization}
                disabled={isRunning}
                className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold bg-brand-orange-500 text-white hover:bg-brand-orange-600 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {isRunning ? 'Solving CVRPTW Problem...' : 'Run Route Optimization'}
              </button>
            </div>
          </div>

          {/* Pending fleet & requests preview */}
          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/60">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5 mb-1">
                <Car className="w-3.5 h-3.5 text-brand-orange-500" />
                Active Fleet Pool ({AVAILABLE_FLEET.length} vehicles)
              </span>
              <ul className="space-y-1 text-slate-600">
                {AVAILABLE_FLEET.map((v) => (
                  <li key={v.id} className="flex justify-between">
                    <span>{v.driver_name} ({v.vehicle_type})</span>
                    <span className="font-semibold">{v.capacity} seats</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/60">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5 mb-1">
                <Users className="w-3.5 h-3.5 text-brand-orange-500" />
                Pending Student Pickup Requests ({PENDING_STOPS.length} students)
              </span>
              <p className="text-slate-500">
                Kondapur, Nallagandla & Botanical Garden clusters (Anonymized tokens used).
              </p>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs text-slate-500 font-semibold uppercase">Solver Status</span>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span
                    className={`inline-block w-2.5 h-2.5 rounded-full ${
                      result.status === 'OPTIMAL' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  />
                  <p className="text-lg font-bold text-slate-900">{result.status}</p>
                </div>
                <span className="text-[11px] text-slate-500">{result.solver_engine}</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs text-slate-500 font-semibold uppercase">Fleet Distance</span>
                <p className="text-lg font-bold text-slate-900 mt-1.5">
                  {result.total_fleet_distance_km} km
                </p>
                <span className="text-[11px] text-slate-500">Total route mileage</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs text-slate-500 font-semibold uppercase">Total Fleet Time</span>
                <p className="text-lg font-bold text-slate-900 mt-1.5">
                  {result.total_fleet_duration_minutes} mins
                </p>
                <span className="text-[11px] text-slate-500">Includes 2m halt/stop</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs text-slate-500 font-semibold uppercase">Seat Utilization</span>
                <p className="text-lg font-bold text-brand-orange-600 mt-1.5">
                  {result.average_seat_utilization_pct}%
                </p>
                <span className="text-[11px] text-slate-500">Fleet capacity efficiency</span>
              </div>
            </div>

            {/* Constraint Violations (if any) */}
            {result.constraint_violations.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-red-800 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4" />
                  Constraint Violations Detected
                </div>
                <ul className="text-xs text-red-700 space-y-1">
                  {result.constraint_violations.map((cv, idx) => (
                    <li key={idx}>• {cv.message}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Proposed Routes Preview */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  2. Proposed Vehicle Routes ({result.routes.length})
                </h2>
                {approvalRecord ? (
                  <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1.5 border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Approved & Published to Roster
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleReject}
                      className="px-4 py-2 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
                    >
                      Reject Proposal
                    </button>
                    <button
                      onClick={() => setShowApprovalModal(true)}
                      className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Approve & Publish Routes
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {result.routes.map((route, rIdx) => {
                  const vehicleInfo = AVAILABLE_FLEET.find((v) => v.id === route.vehicle_id);
                  return (
                    <div
                      key={route.vehicle_id}
                      className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
                    >
                      {/* Card Header */}
                      <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-brand-navy-900">
                              Route #{rIdx + 1}: {vehicleInfo?.driver_name || route.driver_id}
                            </span>
                            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                              {route.vehicle_type}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {route.total_distance_km} km • ~{route.total_duration_minutes} mins travel time
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-brand-orange-600">
                            {route.assigned_stops_count} / {route.vehicle_capacity} seats
                          </span>
                          <p className="text-[11px] text-slate-500">
                            {route.seat_utilization_pct}% occupied
                          </p>
                        </div>
                      </div>

                      {/* Sequenced Stop Timeline */}
                      <div className="p-4 space-y-3">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Pickup Stop Sequence
                        </p>
                        <div className="space-y-2.5">
                          {route.stops.map((stop) => {
                            const stopMeta = PENDING_STOPS.find((p) => p.id === stop.stop_id);
                            return (
                              <div
                                key={stop.stop_id}
                                className="flex items-center justify-between text-xs p-2.5 bg-slate-50/70 rounded-lg border border-slate-100"
                              >
                                <div className="flex items-center gap-2.5">
                                  <span className="w-5 h-5 rounded-full bg-brand-orange-100 text-brand-orange-700 flex items-center justify-center font-bold text-[10px]">
                                    {stop.sequence_index}
                                  </span>
                                  <div>
                                    <p className="font-semibold text-slate-900">
                                      {stopMeta?.child_alias || stop.child_token}
                                    </p>
                                    <p className="text-[11px] text-slate-500">
                                      {stopMeta?.location.address}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="font-mono font-bold text-slate-800">
                                    {stop.estimated_arrival_time}
                                  </span>
                                  <p className="text-[10px] text-slate-400">
                                    +{stop.distance_from_prev_km} km
                                  </p>
                                </div>
                              </div>
                            );
                          })}

                          {/* Final School Gate Destination */}
                          <div className="flex items-center justify-between text-xs p-2.5 bg-brand-navy-50/50 rounded-lg border border-brand-navy-100 text-brand-navy-900 font-medium">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-brand-navy-800" />
                              <span>School Gate Arrival: {selectedSchool.name}</span>
                            </div>
                            <span className="font-mono font-bold text-brand-navy-900">
                              {selectedSchool.bell_time}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Admin Approval Confirmation Modal */}
        {showApprovalModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900">
                  Approve & Publish Route Recommendations
                </h3>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-700">School:</span>
                  <span>{selectedSchool.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-700">Generated Routes:</span>
                  <span>{result?.routes.length} vehicle routes</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-700">Total Mileage:</span>
                  <span>{result?.total_fleet_distance_km} km</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mandatory Operations Admin Review Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Record verification of safe curbside halts, driver familiarity, and bell schedule alignment..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApprovalModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isApproving}
                  onClick={handleApprove}
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isApproving ? 'Recording Approval...' : 'Sign Off & Publish to Roster'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
