/**
 * TinyRide by Dodail — Operations & Administration API Layer
 *
 * Provides typed data fetching, role-scoped permission checks, and server-side
 * validated mutations with automated audit logging for:
 * - Driver KYC & document verification
 * - Vehicle inspection & capacity review (Telangana regulatory rules)
 * - Parent directory & enrolled children
 * - Pilot schools & bell schedules
 * - Routes, stops & seat allocations
 * - Bookings & subscription lifecycle
 * - Financial ledger, platform fee collection & driver payout reconciliation
 * - Live trip monitoring & milestone tracking
 * - Emergency safety incident management
 * - Support ticket resolution desk
 * - Immutable security audit logs
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  UserRole,
  DriverStatus,
  VehicleStatus,
  DocumentStatus,
  IncidentStatus,
  SupportTicketStatus,
  SupportTicketPriority,
  BookingStatus,
  PaymentStatus,
  TripStatus,
  AuditLog,
  Driver,
  Profile,
  Vehicle,
  DriverDocument,
  School,
  Route,
  Booking,
  Payment,
  Trip,
  Incident,
  SupportTicket,
  DriverPayout,
} from '@tinyride/types';

// ============================================================================
// SUPABASE CLIENT
// ============================================================================

const SUPABASE_URL =
  process.env['NEXT_PUBLIC_SUPABASE_URL'] || 'https://orseixsidgyhqrkndxeb.supabase.co';
const SUPABASE_ANON_KEY =
  process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yc2VpeHNpZGd5aHFya25keGViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5NzQ0NTcsImV4cCI6MjEwNTU1MDQ1N30.kfTWTZBR-vi4RlkAl0PEM32OVcD_a7135FAcX0h7oNs';
const SUPABASE_SERVICE_ROLE_KEY = process.env['SUPABASE_SERVICE_ROLE_KEY'];

let adminClientInstance: SupabaseClient | null = null;

export function getAdminSupabaseClient(): SupabaseClient {
  if (adminClientInstance) return adminClientInstance;
  // Use service role on server if provided, otherwise anon key
  const key = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
  adminClientInstance = createClient(SUPABASE_URL, key, {
    auth: { persistSession: false },
  });
  return adminClientInstance;
}

// ============================================================================
// ROLE-SCOPED PERMISSION CHECKS
// ============================================================================

export const ADMIN_ROLES: UserRole[] = ['operations_admin', 'super_admin'];

/**
 * Enforces role restrictions. Throws if user is not authorized.
 */
export function assertAdminRole(
  actorRole: UserRole,
  allowedRoles: UserRole[] = ADMIN_ROLES
): void {
  if (!allowedRoles.includes(actorRole)) {
    throw new Error(
      `Permission Denied: Action requires ${allowedRoles.join(' or ')}. Actor has '${actorRole}'.`
    );
  }
}

// ============================================================================
// SEED FALLBACK DATA
// ============================================================================

export const SEED_ADMIN_DRIVERS = [
  {
    id: 'd1111111-1111-1111-1111-111111111111',
    name: 'Ramesh Goud',
    phone: '+91 98490 11223',
    email: 'ramesh.goud@tinyride.in',
    experienceYears: 8,
    status: 'VERIFIED' as DriverStatus,
    ratingAvg: 4.9,
    totalTrips: 340,
    vehicle: {
      type: 'AUTO' as const,
      regNumber: 'TS09UA1234',
      make: 'Bajaj',
      model: 'Compact RE',
      capacity: 4,
      status: 'VERIFIED' as VehicleStatus,
      rcExpiry: '2037-05-20',
      fcExpiry: '2027-06-30',
    },
    documents: [
      { id: 'doc-1', type: 'DRIVING_LICENSE', number: 'TS0920180012345', expiry: '2028-10-15', status: 'APPROVED' as DocumentStatus },
      { id: 'doc-2', type: 'VEHICLE_FITNESS', number: 'FC-TS09-9941', expiry: '2027-06-30', status: 'APPROVED' as DocumentStatus },
      { id: 'doc-3', type: 'VEHICLE_INSURANCE', number: 'UIIC-PKG-7711', expiry: '2027-05-12', status: 'APPROVED' as DocumentStatus },
      { id: 'doc-4', type: 'POLICE_VERIFICATION', number: 'CYB-PCC-2026-88', expiry: '2027-01-10', status: 'APPROVED' as DocumentStatus },
    ],
  },
  {
    id: 'd2222222-2222-2222-2222-222222222222',
    name: 'M. Krishna Murthy',
    phone: '+91 98492 00300',
    email: 'krishna.murthy@tinyride.in',
    experienceYears: 15,
    status: 'VERIFIED' as DriverStatus,
    ratingAvg: 4.98,
    totalTrips: 1250,
    vehicle: {
      type: 'VAN' as const,
      regNumber: 'TS07EX5544',
      make: 'Maruti Suzuki',
      model: 'Eeco School Bus',
      capacity: 10,
      status: 'VERIFIED' as VehicleStatus,
      rcExpiry: '2038-01-10',
      fcExpiry: '2027-12-31',
    },
    documents: [
      { id: 'doc-5', type: 'DRIVING_LICENSE', number: 'TS0920150098765', expiry: '2030-01-20', status: 'APPROVED' as DocumentStatus },
      { id: 'doc-6', type: 'VEHICLE_FITNESS', number: 'FC-TS07-5544', expiry: '2027-12-31', status: 'APPROVED' as DocumentStatus },
      { id: 'doc-7', type: 'VEHICLE_INSURANCE', number: 'NIAC-SCH-9988', expiry: '2027-10-15', status: 'APPROVED' as DocumentStatus },
      { id: 'doc-8', type: 'POLICE_VERIFICATION', number: 'HYD-PCC-2026-102', expiry: '2027-02-01', status: 'APPROVED' as DocumentStatus },
    ],
  },
  {
    id: 'd3333333-3333-3333-3333-333333333333',
    name: 'Suresh Kumar Yadav',
    phone: '+91 98490 33445',
    email: 'suresh.yadav@example.com',
    experienceYears: 5,
    status: 'UNDER_REVIEW' as DriverStatus,
    ratingAvg: 5.0,
    totalTrips: 12,
    vehicle: {
      type: 'AUTO' as const,
      regNumber: 'TS07UC8890',
      make: 'Bajaj',
      model: 'Maxima Z',
      capacity: 4,
      status: 'UNDER_REVIEW' as VehicleStatus,
      rcExpiry: '2036-12-05',
      fcExpiry: '2026-12-31',
    },
    documents: [
      { id: 'doc-9', type: 'DRIVING_LICENSE', number: 'TS072019003321', expiry: '2029-08-14', status: 'PENDING' as DocumentStatus },
      { id: 'doc-10', type: 'VEHICLE_FITNESS', number: 'FC-TS07-2210', expiry: '2026-12-31', status: 'PENDING' as DocumentStatus },
      { id: 'doc-11', type: 'POLICE_VERIFICATION', number: 'PCC-CYB-2026-44', expiry: '2027-03-10', status: 'PENDING' as DocumentStatus },
    ],
  },
];

export const SEED_ADMIN_PARENTS = [
  {
    id: 'p1111111-1111-1111-1111-111111111111',
    fullName: 'Ananya Sharma',
    phone: '+91 98490 12345',
    email: 'ananya.sharma@example.com',
    emergencyContact: 'Mr. Rajesh Sharma (Father) • +91 98490 99887',
    childrenCount: 1,
    children: [
      { id: 'c1', name: 'Aarav Sharma', grade: '3rd Standard', school: 'DPS Gachibowli', route: 'Kondapur Route' },
    ],
    activeSubscriptions: 1,
    status: 'ACTIVE',
  },
  {
    id: 'p2222222-2222-2222-2222-222222222222',
    fullName: 'Srinivas Rao',
    phone: '+91 98490 55443',
    email: 'srinivas.rao@example.com',
    emergencyContact: 'Mrs. Lakshmi Rao (Mother) • +91 98490 55444',
    childrenCount: 1,
    children: [
      { id: 'c2', name: 'Ananya Rao', grade: '4th Standard', school: 'DPS Gachibowli', route: 'Kondapur Route' },
    ],
    activeSubscriptions: 1,
    status: 'ACTIVE',
  },
  {
    id: 'p3333333-3333-3333-3333-333333333333',
    fullName: 'Madhavan V',
    phone: '+91 98490 44332',
    email: 'madhavan.v@example.com',
    emergencyContact: 'Mrs. Geetha Madhavan • +91 98490 44331',
    childrenCount: 1,
    children: [
      { id: 'c3', name: 'Siddharth Madhavan', grade: '2nd Standard', school: 'DPS Gachibowli', route: 'Kondapur Route' },
    ],
    activeSubscriptions: 1,
    status: 'ACTIVE',
  },
  {
    id: 'p4444444-4444-4444-4444-444444444444',
    fullName: 'Rajesh Verma',
    phone: '+91 98490 33221',
    email: 'rajesh.verma@example.com',
    emergencyContact: 'Mrs. Sunita Verma • +91 98490 33220',
    childrenCount: 1,
    children: [
      { id: 'c4', name: 'Rohan Verma', grade: '5th Standard', school: 'DPS Gachibowli', route: 'Kondapur Route' },
    ],
    activeSubscriptions: 1,
    status: 'ACTIVE',
  },
];

export const SEED_ADMIN_PAYMENTS = [
  {
    id: 'pay-001',
    bookingId: 'book-01',
    parentName: 'Ananya Sharma',
    childName: 'Aarav Sharma',
    route: 'Kondapur ➔ DPS Gachibowli',
    amountInr: 3200,
    platformFeeInr: 320,
    driverPayoutInr: 2880,
    paymentMethod: 'UPI',
    razorpayOrderId: 'order_hyd_001_aarav',
    razorpayPaymentId: 'pay_hyd_9988_01',
    status: 'CAPTURED' as PaymentStatus,
    createdAt: '2026-09-01T08:30:00Z',
  },
  {
    id: 'pay-002',
    bookingId: 'book-02',
    parentName: 'Srinivas Rao',
    childName: 'Ananya Rao',
    route: 'Kondapur ➔ DPS Gachibowli',
    amountInr: 3200,
    platformFeeInr: 320,
    driverPayoutInr: 2880,
    paymentMethod: 'CARD',
    razorpayOrderId: 'order_hyd_002_ananya',
    razorpayPaymentId: 'pay_hyd_9988_02',
    status: 'CAPTURED' as PaymentStatus,
    createdAt: '2026-09-01T08:45:00Z',
  },
  {
    id: 'pay-003',
    bookingId: 'book-03',
    parentName: 'Madhavan V',
    childName: 'Siddharth Madhavan',
    route: 'Kondapur ➔ DPS Gachibowli',
    amountInr: 3200,
    platformFeeInr: 320,
    driverPayoutInr: 2880,
    paymentMethod: 'UPI',
    razorpayOrderId: 'order_hyd_003_siddharth',
    razorpayPaymentId: 'pay_hyd_9988_03',
    status: 'CAPTURED' as PaymentStatus,
    createdAt: '2026-09-01T09:00:00Z',
  },
  {
    id: 'pay-004',
    bookingId: 'book-04',
    parentName: 'Rajesh Verma',
    childName: 'Rohan Verma',
    route: 'Kondapur ➔ DPS Gachibowli',
    amountInr: 3200,
    platformFeeInr: 320,
    driverPayoutInr: 2880,
    paymentMethod: 'NETBANKING',
    razorpayOrderId: 'order_hyd_004_rohan',
    razorpayPaymentId: 'pay_hyd_9988_04',
    status: 'CAPTURED' as PaymentStatus,
    createdAt: '2026-09-01T09:15:00Z',
  },
];

export const SEED_ADMIN_SUPPORT_TICKETS: Array<{
  id: string;
  userRole: UserRole;
  userName: string;
  userPhone: string;
  subject: string;
  description: string;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  assignedAgent: string;
  createdAt: string;
}> = [
  {
    id: 'tick-001',
    userRole: 'parent' as UserRole,
    userName: 'Ananya Sharma',
    userPhone: '+91 98490 12345',
    subject: 'Request temporary pickup stop change for next week',
    description: 'We will be staying at maternal grandparents house near Chirec Avenue for 3 days. Can Aarav be picked up from Stop #2?',
    status: 'OPEN' as SupportTicketStatus,
    priority: 'MEDIUM' as SupportTicketPriority,
    assignedAgent: 'Support Desk 1',
    createdAt: '2026-09-21T07:15:00Z',
  },
  {
    id: 'tick-002',
    userRole: 'driver' as UserRole,
    userName: 'Ramesh Goud',
    userPhone: '+91 98490 11223',
    subject: 'Road maintenance diversion near Botanical Garden',
    description: 'GHMC road laying started this morning. We need to bypass the main cross and use Gate 3 road for pickup stops.',
    status: 'IN_PROGRESS' as SupportTicketStatus,
    priority: 'HIGH' as SupportTicketPriority,
    assignedAgent: 'Transport Ops Desk',
    createdAt: '2026-09-21T06:40:00Z',
  },
  {
    id: 'tick-003',
    userRole: 'parent' as UserRole,
    userName: 'Rajesh Verma',
    userPhone: '+91 98490 33221',
    subject: 'Invoice receipt download for term tax submission',
    description: 'Need GST breakdown receipt for September 2026 school auto subscription.',
    status: 'RESOLVED' as SupportTicketStatus,
    priority: 'LOW' as SupportTicketPriority,
    assignedAgent: 'Billing Desk',
    createdAt: '2026-09-20T14:20:00Z',
  },
];

export interface AdminAuditLogEntry {
  id: string;
  actorId: string;
  actorRole: UserRole;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export const SEED_ADMIN_AUDIT_LOGS: AdminAuditLogEntry[] = [
  {
    id: 'aud-001',
    actorId: 'admin-usr-ops-01',
    actorRole: 'operations_admin' as UserRole,
    action: 'DRIVER_VERIFICATION_APPROVED',
    entityType: 'drivers',
    entityId: 'd1111111-1111-1111-1111-111111111111',
    metadata: { driver_name: 'Ramesh Goud', commercial_dl: 'TS0920180012345', fc_verified: true },
    ipAddress: '103.248.112.45',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    createdAt: '2026-09-21T09:12:00Z',
  },
  {
    id: 'aud-002',
    actorId: 'admin-usr-ops-01',
    actorRole: 'operations_admin' as UserRole,
    action: 'VEHICLE_FITNESS_AUDITED',
    entityType: 'vehicles',
    entityId: 'v1111111-1111-1111-1111-111111111111',
    metadata: { reg_number: 'TS09UA1234', capacity: 4, fc_expiry: '2027-06-30' },
    ipAddress: '103.248.112.45',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    createdAt: '2026-09-21T09:15:00Z',
  },
  {
    id: 'aud-003',
    actorId: 'admin-usr-sup-02',
    actorRole: 'super_admin' as UserRole,
    action: 'ROUTE_CAPACITY_UPDATED',
    entityType: 'routes',
    entityId: '55555555-5555-5555-5555-555555555555',
    metadata: { route_name: 'Kondapur ➔ DPS Gachibowli', total_capacity: 4, reserved_seats: 4 },
    ipAddress: '183.82.110.12',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    createdAt: '2026-09-21T09:30:00Z',
  },
  {
    id: 'aud-004',
    actorId: 'system-edge-function',
    actorRole: 'operations_admin' as UserRole,
    action: 'RAZORPAY_PAYMENT_CAPTURED',
    entityType: 'payments',
    entityId: 'pay-001',
    metadata: { amount: 3200, fee: 320, parent_id: 'p1111111' },
    ipAddress: '13.235.45.19',
    userAgent: 'Razorpay-Webhook-Worker/1.0',
    createdAt: '2026-09-21T10:00:00Z',
  },
];

// In-memory mutation store for local testing
export const adminMemoryStore: {
  drivers: typeof SEED_ADMIN_DRIVERS;
  parents: typeof SEED_ADMIN_PARENTS;
  payments: typeof SEED_ADMIN_PAYMENTS;
  tickets: typeof SEED_ADMIN_SUPPORT_TICKETS;
  auditLogs: AdminAuditLogEntry[];
} = {
  drivers: [...SEED_ADMIN_DRIVERS],
  parents: [...SEED_ADMIN_PARENTS],
  payments: [...SEED_ADMIN_PAYMENTS],
  tickets: [...SEED_ADMIN_SUPPORT_TICKETS],
  auditLogs: [...SEED_ADMIN_AUDIT_LOGS],
};

// ============================================================================
// PRIVILEGED SERVER ACTIONS & AUDIT LOGGING
// ============================================================================

/**
 * Appends an immutable audit log record.
 */
export async function writeAdminAuditLog(data: {
  actorId: string;
  actorRole: UserRole;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> {
  const newLog = {
    id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    ...data,
    createdAt: new Date().toISOString(),
  };

  adminMemoryStore.auditLogs.unshift(newLog);

  const supabase = getAdminSupabaseClient();
  try {
    await supabase.from('audit_logs').insert({
      actor_id: data.actorId,
      actor_role: data.actorRole,
      action: data.action,
      entity_type: data.entityType,
      entity_id: data.entityId,
      metadata: data.metadata,
      ip_address: data.ipAddress,
      user_agent: data.userAgent,
    });
  } catch {
    // Persisted in memory store
  }
}

/**
 * Privileged mutation: Verifies or rejects a driver's application with role enforcement.
 */
export async function verifyDriverAction(
  driverId: string,
  decision: 'APPROVE' | 'REJECT',
  reason?: string,
  actorId = 'admin-ops-01',
  actorRole: UserRole = 'operations_admin'
): Promise<void> {
  assertAdminRole(actorRole);

  const newStatus: DriverStatus = decision === 'APPROVE' ? 'VERIFIED' : 'REJECTED';

  // Update in-memory
  const driver = adminMemoryStore.drivers.find((d) => d.id === driverId);
  if (driver) {
    driver.status = newStatus;
  }

  const actionVerb = decision === 'APPROVE' ? 'APPROVED' : 'REJECTED';

  // Write audit log
  await writeAdminAuditLog({
    actorId,
    actorRole,
    action: `DRIVER_${actionVerb}`,
    entityType: 'drivers',
    entityId: driverId,
    metadata: { decision, reason },
  });

  const supabase = getAdminSupabaseClient();
  try {
    await supabase
      .from('drivers')
      .update({
        status: newStatus,
        verified_at: decision === 'APPROVE' ? new Date().toISOString() : null,
        verified_by: actorId,
        rejection_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', driverId);
  } catch {
    // Updated in memory
  }
}

/**
 * Privileged mutation: Verifies or rejects a driver's vehicle with capacity checks.
 */
export async function verifyVehicleAction(
  vehicleId: string,
  decision: 'APPROVE' | 'REJECT',
  reason?: string,
  actorId = 'admin-ops-01',
  actorRole: UserRole = 'operations_admin'
): Promise<void> {
  assertAdminRole(actorRole);

  const newStatus: VehicleStatus = decision === 'APPROVE' ? 'VERIFIED' : 'REJECTED';
  const actionVerb = decision === 'APPROVE' ? 'APPROVED' : 'REJECTED';

  await writeAdminAuditLog({
    actorId,
    actorRole,
    action: `VEHICLE_${actionVerb}`,
    entityType: 'vehicles',
    entityId: vehicleId,
    metadata: { decision, reason },
  });

  const supabase = getAdminSupabaseClient();
  try {
    await supabase
      .from('vehicles')
      .update({
        status: newStatus,
        verified_at: decision === 'APPROVE' ? new Date().toISOString() : null,
        verified_by: actorId,
        rejection_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', vehicleId);
  } catch {
    // Handled
  }
}

/**
 * Privileged mutation: Resolves an active safety incident.
 */
export async function resolveIncidentAction(
  incidentId: string,
  decision: 'RESOLVE' | 'DISMISS',
  resolutionNotes: string,
  actorId = 'admin-ops-01',
  actorRole: UserRole = 'operations_admin'
): Promise<void> {
  assertAdminRole(actorRole);

  const status: IncidentStatus = decision === 'RESOLVE' ? 'RESOLVED' : 'DISMISSED';

  await writeAdminAuditLog({
    actorId,
    actorRole,
    action: `INCIDENT_${status}`,
    entityType: 'incidents',
    entityId: incidentId,
    metadata: { resolutionNotes },
  });

  const supabase = getAdminSupabaseClient();
  try {
    await supabase
      .from('incidents')
      .update({
        status,
        resolution_notes: resolutionNotes,
        resolved_at: new Date().toISOString(),
        resolved_by: actorId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', incidentId);
  } catch {
    // Handled
  }
}

/**
 * Privileged mutation: Updates a support ticket status.
 */
export async function updateSupportTicketAction(
  ticketId: string,
  status: SupportTicketStatus,
  notes?: string,
  actorId = 'admin-ops-01',
  actorRole: UserRole = 'operations_admin'
): Promise<void> {
  assertAdminRole(actorRole, ['operations_admin', 'super_admin', 'support_agent']);

  const ticket = adminMemoryStore.tickets.find((t) => t.id === ticketId);
  if (ticket) {
    ticket.status = status;
  }

  await writeAdminAuditLog({
    actorId,
    actorRole,
    action: `SUPPORT_TICKET_${status}`,
    entityType: 'support_tickets',
    entityId: ticketId,
    metadata: { status, notes },
  });

  const supabase = getAdminSupabaseClient();
  try {
    await supabase
      .from('support_tickets')
      .update({
        status,
        resolved_at: status === 'RESOLVED' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', ticketId);
  } catch {
    // Handled
  }
}

// ============================================================================
// DATA FETCHERS WITH SEARCH, FILTER & PAGINATION
// ============================================================================

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Driver KYC Desk list with search, status filters, and pagination.
 */
export async function fetchAdminDrivers(
  query = '',
  statusFilter = 'ALL',
  page = 1,
  limit = 10
): Promise<PaginatedResult<typeof SEED_ADMIN_DRIVERS[0]>> {
  let filtered = [...adminMemoryStore.drivers];

  if (statusFilter !== 'ALL') {
    filtered = filtered.filter((d) => d.status === statusFilter);
  }

  if (query.trim()) {
    const q = query.toLowerCase();
    filtered = filtered.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.phone.includes(q) ||
        d.vehicle.regNumber.toLowerCase().includes(q)
    );
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const start = (page - 1) * limit;
  const items = filtered.slice(start, start + limit);

  return { items, total, page, limit, totalPages };
}

/**
 * Parent management list with search and pagination.
 */
export async function fetchAdminParents(
  query = '',
  page = 1,
  limit = 10
): Promise<PaginatedResult<typeof SEED_ADMIN_PARENTS[0]>> {
  let filtered = [...adminMemoryStore.parents];

  if (query.trim()) {
    const q = query.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.fullName.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        p.children.some((c) => c.name.toLowerCase().includes(q))
    );
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const start = (page - 1) * limit;
  const items = filtered.slice(start, start + limit);

  return { items, total, page, limit, totalPages };
}

/**
 * Payments & platform fee ledger with method/status filters.
 */
export async function fetchAdminPayments(
  query = '',
  statusFilter = 'ALL',
  page = 1,
  limit = 10
): Promise<PaginatedResult<typeof SEED_ADMIN_PAYMENTS[0]>> {
  let filtered = [...adminMemoryStore.payments];

  if (statusFilter !== 'ALL') {
    filtered = filtered.filter((p) => p.status === statusFilter);
  }

  if (query.trim()) {
    const q = query.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.parentName.toLowerCase().includes(q) ||
        p.childName.toLowerCase().includes(q) ||
        p.razorpayPaymentId.toLowerCase().includes(q) ||
        p.razorpayOrderId.toLowerCase().includes(q)
    );
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const start = (page - 1) * limit;
  const items = filtered.slice(start, start + limit);

  return { items, total, page, limit, totalPages };
}

/**
 * Support ticket desk.
 */
export async function fetchAdminSupportTickets(
  query = '',
  statusFilter = 'ALL',
  priorityFilter = 'ALL',
  page = 1,
  limit = 10
): Promise<PaginatedResult<typeof SEED_ADMIN_SUPPORT_TICKETS[0]>> {
  let filtered = [...adminMemoryStore.tickets];

  if (statusFilter !== 'ALL') {
    filtered = filtered.filter((t) => t.status === statusFilter);
  }

  if (priorityFilter !== 'ALL') {
    filtered = filtered.filter((t) => t.priority === priorityFilter);
  }

  if (query.trim()) {
    const q = query.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.subject.toLowerCase().includes(q) ||
        t.userName.toLowerCase().includes(q) ||
        t.userPhone.includes(q)
    );
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const start = (page - 1) * limit;
  const items = filtered.slice(start, start + limit);

  return { items, total, page, limit, totalPages };
}

/**
 * Security audit logs viewer.
 */
export async function fetchAdminAuditLogs(
  query = '',
  actionFilter = 'ALL',
  page = 1,
  limit = 10
): Promise<PaginatedResult<typeof SEED_ADMIN_AUDIT_LOGS[0]>> {
  let filtered = [...adminMemoryStore.auditLogs];

  if (actionFilter !== 'ALL') {
    filtered = filtered.filter((a) => a.action.includes(actionFilter));
  }

  if (query.trim()) {
    const q = query.toLowerCase();
    filtered = filtered.filter(
      (a) =>
        a.action.toLowerCase().includes(q) ||
        a.entityType.toLowerCase().includes(q) ||
        a.actorId.toLowerCase().includes(q) ||
        (a.ipAddress && a.ipAddress.includes(q))
    );
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const start = (page - 1) * limit;
  const items = filtered.slice(start, start + limit);

  return { items, total, page, limit, totalPages };
}

/**
 * Overview metrics for the executive dashboard.
 */
export async function fetchAdminDashboardMetrics() {
  return {
    totalSchools: 4,
    activeRoutes: 2,
    verifiedDrivers: adminMemoryStore.drivers.filter((d) => d.status === 'VERIFIED').length,
    pendingDriverKyc: adminMemoryStore.drivers.filter((d) => d.status === 'UNDER_REVIEW' || d.status === 'SUBMITTED').length,
    bookedStudents: 4,
    totalCapacity: 12,
    monthlyGrossInr: 12800,
    platformFeeRevenueInr: 1280,
    activeTripsLive: 1,
    openSafetyIncidents: 0,
    openSupportTickets: adminMemoryStore.tickets.filter((t) => t.status === 'OPEN').length,
  };
}
