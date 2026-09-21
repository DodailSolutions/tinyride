'use client';

import { useState } from 'react';
import {
  Car,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { AdminShell } from '@/components/AdminShell';
import { adminMemoryStore, verifyVehicleAction } from '@/lib/admin-api';

export default function VehicleReviewDesk() {
  const [vehicles, setVehicles] = useState(
    adminMemoryStore.drivers.map((d) => ({
      id: `veh-${d.id}`,
      driverId: d.id,
      driverName: d.name,
      driverPhone: d.phone,
      ...d.vehicle,
    }))
  );

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const limit = 5;

  const handleVerify = async (vehicleId: string, approve: boolean) => {
    const decision = approve ? 'APPROVE' : 'REJECT';
    try {
      await verifyVehicleAction(vehicleId, decision, approve ? undefined : 'Compliance review failed');
      setVehicles((prev) =>
        prev.map((v) =>
          v.id === vehicleId ? { ...v, status: approve ? 'VERIFIED' : 'REJECTED' } : v
        )
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Action failed');
    }
  };

  const filtered = vehicles.filter((v) => {
    const matchesSearch =
      v.regNumber.toLowerCase().includes(search.toLowerCase()) ||
      v.driverName.toLowerCase().includes(search.toLowerCase()) ||
      v.make.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'ALL' || v.type === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / limit) || 1;
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  return (
    <AdminShell>
      <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Car className="w-6 h-6 text-brand-orange-500" />
              Vehicle Review & Capacity Inspection Desk
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Audit Telangana commercial registrations (TS plates), seating capacity compliance, and Fitness Certificates (FC).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Regulatory Limit: Auto ≤ 6, Van ≤ 14
            </span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by registration (e.g. TS09UA1234), make, model, or driver name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20 focus:border-brand-orange-500"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20"
            >
              <option value="ALL">All Types</option>
              <option value="AUTO">Auto Rickshaw</option>
              <option value="VAN">School Van</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20"
            >
              <option value="ALL">All Statuses</option>
              <option value="VERIFIED">Verified</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {/* Vehicle Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {paginated.length === 0 ? (
            <div className="p-12 text-center">
              <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-800">No Vehicles Found</h3>
              <p className="text-sm text-slate-500 mt-1">Try adjusting your search query or status filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-4">Registration & Type</th>
                    <th className="py-3 px-4">Make & Model</th>
                    <th className="py-3 px-4">Driver Partner</th>
                    <th className="py-3 px-4">Capacity & Compliance</th>
                    <th className="py-3 px-4">FC / RC Expiry</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginated.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-brand-navy-900 font-mono text-sm">
                          {v.regNumber}
                        </div>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                          {v.type}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-900">{v.make} {v.model}</div>
                        <div className="text-xs text-slate-500">Local transport fit</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{v.driverName}</div>
                        <div className="text-xs text-slate-500">{v.driverPhone}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900">
                          <span>{v.capacity} Seats</span>
                          <span className="text-xs text-emerald-600 font-medium">✓ Local Cap Safe</span>
                        </div>
                        <div className="text-xs text-slate-500">TS Reg Valid</div>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        <div>FC: <span className="font-medium text-slate-800">{v.fcExpiry}</span></div>
                        <div>RC: <span className="font-medium text-slate-800">{v.rcExpiry}</span></div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            v.status === 'VERIFIED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : v.status === 'UNDER_REVIEW'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {v.status === 'VERIFIED' && <CheckCircle className="w-3.5 h-3.5" />}
                          {v.status === 'UNDER_REVIEW' && <Clock className="w-3.5 h-3.5" />}
                          {v.status === 'REJECTED' && <XCircle className="w-3.5 h-3.5" />}
                          {v.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {v.status !== 'VERIFIED' && (
                            <button
                              onClick={() => handleVerify(v.id, true)}
                              className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
                            >
                              Approve
                            </button>
                          )}
                          {v.status !== 'REJECTED' && (
                            <button
                              onClick={() => handleVerify(v.id, false)}
                              className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white border border-rose-300 text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Bar */}
          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-600">
            <div>
              Showing <span className="font-semibold">{paginated.length}</span> of <span className="font-semibold">{filtered.length}</span> vehicles
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold text-slate-700">Page {page} of {totalPages}</span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
