'use client';

import { useState } from 'react';
import {
  LifeBuoy,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  MessageSquare,
  User,
  Phone,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Send,
  X,
} from 'lucide-react';
import { AdminShell } from '@/components/AdminShell';
import { adminMemoryStore, updateSupportTicketAction } from '@/lib/admin-api';
import { SupportTicketStatus } from '@tinyride/types';

export default function SupportDeskPage() {
  const [tickets, setTickets] = useState(adminMemoryStore.tickets);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const limit = 5;

  // Resolution modal state
  const [selectedTicket, setSelectedTicket] = useState<(typeof adminMemoryStore.tickets)[0] | null>(null);
  const [newStatus, setNewStatus] = useState<SupportTicketStatus>('RESOLVED');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    setIsSubmitting(true);
    try {
      await updateSupportTicketAction(selectedTicket.id, newStatus, resolutionNotes || undefined);
      setTickets((prev) =>
        prev.map((t) => (t.id === selectedTicket.id ? { ...t, status: newStatus } : t))
      );
      setSelectedTicket(null);
      setResolutionNotes('');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = tickets.filter((t) => {
    const q = search.toLowerCase();
    const matchesSearch =
      t.subject.toLowerCase().includes(q) ||
      t.userName.toLowerCase().includes(q) ||
      t.userPhone.includes(q) ||
      t.description.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
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
              <LifeBuoy className="w-6 h-6 text-brand-orange-500" />
              Support & Inquiries Desk
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Address parent schedule changes, driver route alerts, and billing queries.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-orange-50 text-brand-orange-700 border border-brand-orange-200">
              Open Tickets:{' '}
              {tickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length}
            </span>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by subject, requester name, phone number, or notes..."
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
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20"
            >
              <option value="ALL">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Ticket & Requester</th>
                  <th className="px-6 py-4">Role & Contact</th>
                  <th className="px-6 py-4">Subject & Description</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      <LifeBuoy className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      No support tickets found matching the filter criteria.
                    </td>
                  </tr>
                ) : (
                  paginated.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{ticket.userName}</div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">{ticket.id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                            ticket.userRole === 'driver'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {ticket.userRole}
                        </span>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {ticket.userPhone}
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <div className="font-semibold text-slate-900 line-clamp-1">
                          {ticket.subject}
                        </div>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {ticket.description}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                            ticket.priority === 'URGENT'
                              ? 'bg-red-100 text-red-800'
                              : ticket.priority === 'HIGH'
                              ? 'bg-orange-100 text-brand-orange-800'
                              : ticket.priority === 'MEDIUM'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            ticket.status === 'RESOLVED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : ticket.status === 'IN_PROGRESS'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {ticket.status === 'RESOLVED' ? (
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                          ) : ticket.status === 'IN_PROGRESS' ? (
                            <Clock className="w-3 h-3 text-blue-600" />
                          ) : (
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                          )}
                          {ticket.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setNewStatus(ticket.status === 'OPEN' ? 'IN_PROGRESS' : 'RESOLVED');
                          }}
                          className="px-3 py-1.5 text-xs font-semibold bg-brand-navy-900 text-white rounded-lg hover:bg-brand-navy-800 transition-colors shadow-sm"
                        >
                          Manage
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
              <span className="font-semibold">{filtered.length}</span> tickets
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

        {/* Manage / Resolve Ticket Modal */}
        {selectedTicket && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <LifeBuoy className="w-5 h-5 text-brand-orange-500" />
                  <h3 className="font-bold text-slate-900">Manage Support Ticket</h3>
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-700">Requester:</span>
                  <span>
                    {selectedTicket.userName} ({selectedTicket.userRole})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-700">Phone:</span>
                  <span>{selectedTicket.userPhone}</span>
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <p className="font-semibold text-slate-800">{selectedTicket.subject}</p>
                  <p className="mt-1 text-slate-600">{selectedTicket.description}</p>
                </div>
              </div>

              <form onSubmit={handleUpdateTicket} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Update Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as SupportTicketStatus)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20"
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Resolution / Admin Follow-up Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter resolution details, parent communication log, or route diversion actions taken..."
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTicket(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 text-xs font-semibold bg-brand-orange-500 text-white rounded-lg hover:bg-brand-orange-600 transition-colors shadow-sm disabled:opacity-50"
                  >
                    {isSubmitting ? 'Updating...' : 'Save & Log Audit Record'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
