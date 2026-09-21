'use client';

import { useState } from 'react';
import {
  Users,
  Search,
  Phone,
  Mail,
  GraduationCap,
  Bus,
  ChevronLeft,
  ChevronRight,
  Shield,
  HeartHandshake,
} from 'lucide-react';
import { AdminShell } from '@/components/AdminShell';
import { adminMemoryStore } from '@/lib/admin-api';

export default function ParentManagementDesk() {
  const [parents] = useState(adminMemoryStore.parents);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 5;

  const filtered = parents.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.fullName.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.children.some((c) => c.name.toLowerCase().includes(q) || c.school.toLowerCase().includes(q))
    );
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
              <Users className="w-6 h-6 text-brand-orange-500" />
              Parent Management & Enrolled Children
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Directory of verified parents in Hyderabad, authorized emergency contacts, and active child subscriptions.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              {parents.length} Active Parents Enrolled
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by parent name, mobile number, child name, or school..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20 focus:border-brand-orange-500"
            />
          </div>
        </div>

        {/* Parent Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {paginated.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-800">No Parents Found</h3>
              <p className="text-sm text-slate-500 mt-1">Try adjusting your search criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-4">Parent / Guardian</th>
                    <th className="py-3 px-4">Contact Info</th>
                    <th className="py-3 px-4">Emergency Contact</th>
                    <th className="py-3 px-4">Enrolled Children</th>
                    <th className="py-3 px-4">Active Subscriptions</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginated.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">{p.fullName}</div>
                        <span className="inline-block mt-0.5 text-[11px] font-medium text-slate-500">
                          ID: {p.id.substring(0, 8)}...
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {p.phone}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {p.email}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-700">
                        <div className="flex items-center gap-1.5 font-medium text-amber-800 bg-amber-50 px-2 py-1 rounded-md border border-amber-200/60">
                          <HeartHandshake className="w-3.5 h-3.5 text-amber-600" />
                          {p.emergencyContact}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-1.5">
                          {p.children.map((c) => (
                            <div key={c.id} className="text-xs bg-slate-50 p-1.5 rounded border border-slate-200">
                              <div className="font-bold text-slate-900">{c.name} ({c.grade})</div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                <GraduationCap className="w-3 h-3" />
                                {c.school} • {c.route}
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {p.activeSubscriptions} Commute Plan
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span className="inline-block px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-600">
            <div>
              Showing <span className="font-semibold">{paginated.length}</span> of <span className="font-semibold">{filtered.length}</span> parents
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
