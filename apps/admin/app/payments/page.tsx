'use client';

import { useState } from 'react';
import {
  CreditCard,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  Percent,
  Download,
  ChevronLeft,
  ChevronRight,
  Receipt,
  UserCheck,
} from 'lucide-react';
import { AdminShell } from '@/components/AdminShell';
import { adminMemoryStore } from '@/lib/admin-api';

export default function PaymentsAndLedgerPage() {
  const [payments] = useState(adminMemoryStore.payments);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const limit = 5;

  // Aggregate metrics
  const totalGross = payments.reduce((acc, p) => acc + (p.status === 'CAPTURED' ? p.amountInr : 0), 0);
  const totalPlatformFees = payments.reduce(
    (acc, p) => acc + (p.status === 'CAPTURED' ? p.platformFeeInr : 0),
    0
  );
  const totalDriverPayouts = payments.reduce(
    (acc, p) => acc + (p.status === 'CAPTURED' ? p.driverPayoutInr : 0),
    0
  );

  const filtered = payments.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch =
      p.parentName.toLowerCase().includes(q) ||
      p.childName.toLowerCase().includes(q) ||
      p.razorpayOrderId.toLowerCase().includes(q) ||
      p.razorpayPaymentId.toLowerCase().includes(q) ||
      p.route.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchesMethod = methodFilter === 'ALL' || p.paymentMethod === methodFilter;
    return matchesSearch && matchesStatus && matchesMethod;
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
              <CreditCard className="w-6 h-6 text-brand-orange-500" />
              Payments, Gross Collections & Fee Ledger
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Audit Razorpay transactions, 10% Dodail platform commission, and 90% driver payouts.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-navy-900 text-white shadow-sm flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5 text-brand-orange-400" />
              Fixed Platform Fee: 10%
            </span>
          </div>
        </div>

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Gross Collections
              </span>
              <span className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                <TrendingUp className="w-4 h-4" />
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">
              ₹{totalGross.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-slate-500 mt-1">Total monthly subscription collections</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Dodail Platform Commission (10%)
              </span>
              <span className="p-2 bg-orange-50 rounded-lg text-brand-orange-600">
                <Percent className="w-4 h-4" />
              </span>
            </div>
            <p className="text-2xl font-bold text-brand-orange-600 mt-2">
              ₹{totalPlatformFees.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-slate-500 mt-1">Retained operating & safety revenue</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Driver Payouts (90%)
              </span>
              <span className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <UserCheck className="w-4 h-4" />
              </span>
            </div>
            <p className="text-2xl font-bold text-blue-700 mt-2">
              ₹{totalDriverPayouts.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-slate-500 mt-1">Disbursed via automated bank transfer</p>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by parent, child, Razorpay Order ID, or Payment ID..."
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
              <option value="CAPTURED">Captured / Success</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>

            <select
              value={methodFilter}
              onChange={(e) => {
                setMethodFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20"
            >
              <option value="ALL">All Methods</option>
              <option value="UPI">UPI</option>
              <option value="CARD">Debit / Credit Card</option>
              <option value="NETBANKING">Net Banking</option>
            </select>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Transaction & Gateway IDs</th>
                  <th className="px-6 py-4">Parent & Student</th>
                  <th className="px-6 py-4">Assigned Route</th>
                  <th className="px-6 py-4">Gross Amount</th>
                  <th className="px-6 py-4">Commission & Payout</th>
                  <th className="px-6 py-4">Status & Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      <Receipt className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      No transactions found matching the filter criteria.
                    </td>
                  </tr>
                ) : (
                  paginated.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{item.id}</div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">
                          Order: {item.razorpayOrderId}
                        </div>
                        <div className="text-xs text-slate-500 font-mono">
                          Pay ID: {item.razorpayPaymentId}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{item.parentName}</div>
                        <div className="text-xs text-slate-500">Student: {item.childName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                          {item.route}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        ₹{item.amountInr.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-brand-orange-600 font-semibold">
                          Fee (10%): ₹{item.platformFeeInr}
                        </div>
                        <div className="text-xs text-blue-700 font-medium mt-0.5">
                          Payout (90%): ₹{item.driverPayoutInr}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold w-fit ${
                              item.status === 'CAPTURED'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : item.status === 'FAILED'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {item.status === 'CAPTURED' ? (
                              <CheckCircle className="w-3 h-3 text-emerald-600" />
                            ) : item.status === 'FAILED' ? (
                              <XCircle className="w-3 h-3 text-red-600" />
                            ) : (
                              <Clock className="w-3 h-3 text-amber-600" />
                            )}
                            {item.status}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500">
                            Via {item.paymentMethod}
                          </span>
                        </div>
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
              <span className="font-semibold">{filtered.length}</span> payments
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
      </div>
    </AdminShell>
  );
}
