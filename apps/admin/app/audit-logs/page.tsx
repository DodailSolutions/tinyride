'use client';

import { useState } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  FileCode,
  Terminal,
  Clock,
  User,
  Globe,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Lock,
} from 'lucide-react';
import { AdminShell } from '@/components/AdminShell';
import { adminMemoryStore } from '@/lib/admin-api';

export default function SecurityAuditLogsPage() {
  const [logs] = useState(adminMemoryStore.auditLogs);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<(typeof adminMemoryStore.auditLogs)[0] | null>(
    null
  );
  const limit = 6;

  const filtered = logs.filter((log) => {
    const q = search.toLowerCase();
    const matchesSearch =
      log.action.toLowerCase().includes(q) ||
      log.actorId.toLowerCase().includes(q) ||
      log.entityType.toLowerCase().includes(q) ||
      log.entityId.toLowerCase().includes(q) ||
      (log.ipAddress && log.ipAddress.includes(q));
    const matchesAction = actionFilter === 'ALL' || log.action.includes(actionFilter);
    return matchesSearch && matchesAction;
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
              <ShieldAlert className="w-6 h-6 text-brand-orange-500" />
              Immutable Security & Audit Logs
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Append-only audit trail recording every privileged operational mutation, actor identity, IP, and payload diff.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-navy-900 text-white flex items-center gap-1.5 shadow-sm">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              Append-Only RLS Enforced
            </span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by action, actor ID, entity ID, or IP address..."
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
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20"
            >
              <option value="ALL">All Actions</option>
              <option value="DRIVER">Driver Actions</option>
              <option value="VEHICLE">Vehicle Audits</option>
              <option value="ROUTE">Route Adjustments</option>
              <option value="PAYMENT">Payment Events</option>
              <option value="INCIDENT">Incident Actions</option>
              <option value="SUPPORT">Support Desk</option>
            </select>
          </div>
        </div>

        {/* Audit Logs Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Timestamp & ID</th>
                  <th className="px-6 py-4">Actor & Role</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Target Entity</th>
                  <th className="px-6 py-4">Client IP / Agent</th>
                  <th className="px-6 py-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      <Terminal className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      No audit records found matching the query.
                    </td>
                  </tr>
                ) : (
                  paginated.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-xs font-mono text-slate-900 font-semibold">
                          {new Date(log.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500">
                          {new Date(log.createdAt).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-1">{log.id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                            log.actorRole === 'super_admin'
                              ? 'bg-purple-100 text-purple-800'
                              : log.actorRole === 'operations_admin'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {log.actorRole}
                        </span>
                        <div className="text-xs text-slate-600 font-mono mt-1 truncate max-w-[140px]">
                          {log.actorId}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-bold text-brand-navy-900 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-semibold text-slate-900 uppercase">
                          {log.entityType}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 truncate max-w-[140px]">
                          {log.entityId}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-mono text-slate-800">
                          {log.ipAddress || '127.0.0.1'}
                        </div>
                        <div
                          className="text-[11px] text-slate-400 truncate max-w-[160px]"
                          title={log.userAgent}
                        >
                          {log.userAgent || 'API/Serverless Worker'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Showing <span className="font-semibold">{paginated.length}</span> of{' '}
              <span className="font-semibold">{filtered.length}</span> audit logs
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-1.5 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
              <span className="text-xs font-semibold text-slate-700">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Audit Log JSON Inspector Modal */}
        {selectedLog && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-brand-orange-500" />
                  <h3 className="font-bold text-slate-900">Audit Record Inspector</h3>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-600">Action:</span>
                  <span className="font-mono font-bold text-brand-navy-900">
                    {selectedLog.action}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-600">Actor:</span>
                  <span className="font-mono">
                    {selectedLog.actorId} ({selectedLog.actorRole})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-600">Entity:</span>
                  <span className="font-mono">
                    {selectedLog.entityType} / {selectedLog.entityId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-600">IP & Client:</span>
                  <span className="font-mono">{selectedLog.ipAddress}</span>
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-slate-500" />
                  Payload Metadata Diff
                </label>
                <div className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto max-h-60">
                  <pre>{JSON.stringify(selectedLog.metadata, null, 2)}</pre>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
