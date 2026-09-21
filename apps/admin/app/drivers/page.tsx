'use client';

import { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  UserCheck,
  Ban,
  FileText,
  Car,
  Phone,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';

import { AdminShell } from '@/components/AdminShell';

interface DriverItem {

  id: string;
  name: string;
  phone: string;
  vehicleType: 'AUTO' | 'VAN';
  regNumber: string;
  experienceYears: number;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';
  documents: {
    type: string;
    number: string;
    expiry: string;
    verified: boolean;
  }[];
}

const INITIAL_DRIVERS: DriverItem[] = [
  {
    id: 'drv-101',
    name: 'Ramesh Goud',
    phone: '+91 98490 11223',
    vehicleType: 'AUTO',
    regNumber: 'TS09UA1234',
    experienceYears: 8,
    status: 'VERIFIED',
    documents: [
      { type: 'Commercial DL', number: 'DL-TS-09-2015-0012', expiry: '2028-10-15', verified: true },
      { type: 'Police Clearance Certificate', number: 'PCC-HYD-2026-88', expiry: '2027-02-01', verified: true },
      { type: 'Vehicle RC', number: 'TS09UA1234', expiry: '2029-05-20', verified: true },
      { type: 'Vehicle Fitness (FC)', number: 'FC-TS09-9941', expiry: '2027-06-30', verified: true },
    ],
  },
  {
    id: 'drv-102',
    name: 'Mohammed Khaja',
    phone: '+91 98490 22334',
    vehicleType: 'VAN',
    regNumber: 'TS09VB4567',
    experienceYears: 12,
    status: 'VERIFIED',
    documents: [
      { type: 'Commercial DL (Transport)', number: 'DL-TS-09-2012-9988', expiry: '2027-11-20', verified: true },
      { type: 'Police Clearance Certificate', number: 'PCC-HYD-2026-102', expiry: '2027-01-15', verified: true },
      { type: 'Vehicle RC', number: 'TS09VB4567', expiry: '2030-01-10', verified: true },
      { type: 'Vehicle Insurance', number: 'INS-BAJAJ-7788', expiry: '2027-04-12', verified: true },
    ],
  },
  {
    id: 'drv-103',
    name: 'Suresh Kumar Yadav',
    phone: '+91 98490 33445',
    vehicleType: 'AUTO',
    regNumber: 'TS07UC8890',
    experienceYears: 5,
    status: 'SUBMITTED',
    documents: [
      { type: 'Commercial DL', number: 'DL-TS-07-2019-3321', expiry: '2029-08-14', verified: false },
      { type: 'Police Clearance Certificate', number: 'PCC-CYB-2026-44', expiry: '2027-03-10', verified: false },
      { type: 'Vehicle RC', number: 'TS07UC8890', expiry: '2028-12-05', verified: false },
      { type: 'Vehicle Fitness (FC)', number: 'FC-TS07-2210', expiry: '2026-12-31', verified: false },
    ],
  },
  {
    id: 'drv-104',
    name: 'Anjaneyulu Reddy',
    phone: '+91 98490 44556',
    vehicleType: 'VAN',
    regNumber: 'TS08VC1122',
    experienceYears: 7,
    status: 'UNDER_REVIEW',
    documents: [
      { type: 'Commercial DL (Transport)', number: 'DL-TS-08-2017-7766', expiry: '2028-04-20', verified: true },
      { type: 'Police Clearance Certificate', number: 'PCC-HYD-2026-78', expiry: '2027-02-18', verified: false },
      { type: 'Vehicle RC', number: 'TS08VC1122', expiry: '2029-09-15', verified: true },
    ],
  },
];

export default function DriversKYCDesk() {
  const [drivers, setDrivers] = useState<DriverItem[]>(INITIAL_DRIVERS);
  const [selectedDriver, setSelectedDriver] = useState<DriverItem | null>(null);
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const handleApprove = (driverId: string) => {
    setDrivers((prev) =>
      prev.map((d) => (d.id === driverId ? { ...d, status: 'VERIFIED' } : d))
    );
    if (selectedDriver?.id === driverId) {
      setSelectedDriver((prev) => (prev ? { ...prev, status: 'VERIFIED' } : null));
    }
  };

  const handleReject = () => {
    if (!selectedDriver || !rejectionReason.trim()) return;
    setDrivers((prev) =>
      prev.map((d) =>
        d.id === selectedDriver.id ? { ...d, status: 'REJECTED' } : d
      )
    );
    setSelectedDriver((prev) => (prev ? { ...prev, status: 'REJECTED' } : null));
    setRejectionModalOpen(false);
    setRejectionReason('');
  };

  const handleSuspend = (driverId: string) => {
    setDrivers((prev) =>
      prev.map((d) => (d.id === driverId ? { ...d, status: 'SUSPENDED' } : d))
    );
    if (selectedDriver?.id === driverId) {
      setSelectedDriver((prev) => (prev ? { ...prev, status: 'SUSPENDED' } : null));
    }
  };

  const filteredDrivers = drivers.filter(
    (d) => filterStatus === 'ALL' || d.status === filterStatus
  );

  return (
    <AdminShell>
      <div className="p-8 space-y-6 max-w-7xl mx-auto w-full">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Driver Onboarding & KYC Verification Desk
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Mandatory human-in-the-loop review for Telangana commercial license, vehicle fitness & police clearance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'SUSPENDED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterStatus === st
                  ? 'bg-brand-navy-900 text-white'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Driver List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Driver Candidate
              </span>
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Verification State
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredDrivers.map((driver) => {
                const isSelected = selectedDriver?.id === driver.id;
                return (
                  <div
                    key={driver.id}
                    onClick={() => setSelectedDriver(driver)}
                    className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected ? 'bg-orange-50/60' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-sm">
                        {driver.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-slate-900">{driver.name}</h3>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                            {driver.vehicleType} ({driver.regNumber})
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                          <Phone className="w-3 h-3" /> {driver.phone} • {driver.experienceYears} yrs experience
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          driver.status === 'VERIFIED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : driver.status === 'SUBMITTED'
                            ? 'bg-amber-100 text-amber-800'
                            : driver.status === 'UNDER_REVIEW'
                            ? 'bg-blue-100 text-blue-800'
                            : driver.status === 'SUSPENDED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {driver.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Driver Verification Drawer */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between">
          {selectedDriver ? (
            <div className="space-y-5">
              <div className="pb-4 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-900">{selectedDriver.name}</h2>
                  <span className="text-xs font-medium text-slate-500">{selectedDriver.id}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Vehicle: {selectedDriver.vehicleType} • Reg: {selectedDriver.regNumber}
                </p>
              </div>

              {/* Compliance Documents */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Mandatory Telangana Documents
                </h3>

                {selectedDriver.documents.map((doc, i) => (
                  <div key={i} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-800">{doc.type}</span>
                      {doc.verified ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <CheckCircle className="w-2.5 h-2.5" /> Verified
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" /> Pending Audit
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 flex justify-between">
                      <span>Ref: {doc.number}</span>
                      <span>Expires: {doc.expiry}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                {selectedDriver.status !== 'VERIFIED' && (
                  <button
                    onClick={() => handleApprove(selectedDriver.id)}
                    className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
                  >
                    <UserCheck className="w-4 h-4" /> Approve & Activate Driver
                  </button>
                )}

                {selectedDriver.status !== 'REJECTED' && (
                  <button
                    onClick={() => setRejectionModalOpen(true)}
                    className="w-full py-2.5 rounded-lg bg-white border border-rose-300 text-rose-600 hover:bg-rose-50 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <XCircle className="w-4 h-4" /> Reject Documents
                  </button>
                )}

                {selectedDriver.status === 'VERIFIED' && (
                  <button
                    onClick={() => handleSuspend(selectedDriver.id)}
                    className="w-full py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <Ban className="w-4 h-4" /> Suspend Driver (Safety Violation)
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-slate-400">
              <ShieldCheck className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-medium">Select a driver candidate from the list to audit credentials.</p>
            </div>
          )}
        </div>
      </div>

      {/* Rejection Reason Modal */}
      {rejectionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Document Rejection Reason</h3>
            <p className="text-xs text-slate-500 mt-1">
              Provide specific feedback to the driver candidate for document re-upload.
            </p>

            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Vehicle Fitness Certificate image is blurry or expired. Please upload valid RTA fitness slip."
              className="mt-4 w-full h-28 p-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange-500"
            />

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                onClick={() => setRejectionModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectionReason.trim()}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </AdminShell>
  );
}

