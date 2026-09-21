import { describe, it, expect, beforeEach } from 'vitest';
import {
  assertAdminRole,
  ADMIN_ROLES,
  verifyDriverAction,
  verifyVehicleAction,
  resolveIncidentAction,
  updateSupportTicketAction,
  writeAdminAuditLog,
  fetchAdminDrivers,
  fetchAdminParents,
  fetchAdminPayments,
  fetchAdminSupportTickets,
  fetchAdminAuditLogs,
  fetchAdminDashboardMetrics,
  adminMemoryStore,
  SEED_ADMIN_DRIVERS,
  SEED_ADMIN_PARENTS,
  SEED_ADMIN_PAYMENTS,
  SEED_ADMIN_SUPPORT_TICKETS,
  SEED_ADMIN_AUDIT_LOGS,
} from './admin-api';
import { UserRole } from '@tinyride/types';

describe('Admin Role-Scoped Permissions & Operations Desk Test Suite', () => {
  beforeEach(() => {
    // Reset in-memory mutation stores before each test
    adminMemoryStore.drivers = JSON.parse(JSON.stringify(SEED_ADMIN_DRIVERS));
    adminMemoryStore.parents = JSON.parse(JSON.stringify(SEED_ADMIN_PARENTS));
    adminMemoryStore.payments = JSON.parse(JSON.stringify(SEED_ADMIN_PAYMENTS));
    adminMemoryStore.tickets = JSON.parse(JSON.stringify(SEED_ADMIN_SUPPORT_TICKETS));
    adminMemoryStore.auditLogs = JSON.parse(JSON.stringify(SEED_ADMIN_AUDIT_LOGS));
  });

  describe('1. Role-Scoped Permission Enforcement (assertAdminRole)', () => {
    it('allows operations_admin and super_admin', () => {
      expect(() => assertAdminRole('operations_admin')).not.toThrow();
      expect(() => assertAdminRole('super_admin')).not.toThrow();
    });

    it('denies parent role with clear error message', () => {
      expect(() => assertAdminRole('parent' as UserRole)).toThrow(
        /Permission Denied: Action requires operations_admin or super_admin/
      );
    });

    it('denies driver role with clear error message', () => {
      expect(() => assertAdminRole('driver' as UserRole)).toThrow(
        /Permission Denied: Action requires operations_admin or super_admin/
      );
    });

    it('denies school_admin when only central operations admins are permitted', () => {
      expect(() => assertAdminRole('school_admin' as UserRole)).toThrow(/Permission Denied/);
    });

    it('supports custom allowed role lists (e.g. support desk)', () => {
      const allowed: UserRole[] = ['operations_admin', 'super_admin', 'support_agent'];
      expect(() => assertAdminRole('support_agent', allowed)).not.toThrow();
      expect(() => assertAdminRole('parent' as UserRole, allowed)).toThrow(/Permission Denied/);
    });
  });

  describe('2. Privileged Driver Verification & Audit Logging', () => {
    it('approves a submitted driver and records an immutable audit log', async () => {
      const targetDriverId = 'd3333333-3333-3333-3333-333333333333';
      const initialLogsCount = adminMemoryStore.auditLogs.length;

      await verifyDriverAction(
        targetDriverId,
        'APPROVE',
        undefined,
        'admin-ops-01',
        'operations_admin'
      );

      // Verify driver status changed
      const driver = adminMemoryStore.drivers.find((d) => d.id === targetDriverId);
      expect(driver?.status).toBe('VERIFIED');

      // Verify audit log was appended
      expect(adminMemoryStore.auditLogs.length).toBe(initialLogsCount + 1);
      const latestLog = adminMemoryStore.auditLogs[0]!;
      expect(latestLog.action).toBe('DRIVER_APPROVED');
      expect(latestLog.entityType).toBe('drivers');
      expect(latestLog.entityId).toBe(targetDriverId);
      expect(latestLog.actorRole).toBe('operations_admin');
    });

    it('rejects an invalid driver application with recorded reason and audit log', async () => {
      const targetDriverId = 'd3333333-3333-3333-3333-333333333333';
      const rejectionReason = 'Police Clearance Certificate expired';

      await verifyDriverAction(
        targetDriverId,
        'REJECT',
        rejectionReason,
        'admin-ops-01',
        'operations_admin'
      );

      const driver = adminMemoryStore.drivers.find((d) => d.id === targetDriverId);
      expect(driver?.status).toBe('REJECTED');

      const latestLog = adminMemoryStore.auditLogs[0]!;
      expect(latestLog.action).toBe('DRIVER_REJECTED');
      expect(latestLog.metadata?.['reason']).toBe(rejectionReason);
    });

    it('throws when non-admin attempts driver verification', async () => {
      await expect(
        verifyDriverAction(
          'd3333333-3333-3333-3333-333333333333',
          'APPROVE',
          undefined,
          'parent-01',
          'parent' as UserRole
        )
      ).rejects.toThrow(/Permission Denied/);
    });
  });

  describe('3. Privileged Vehicle Inspection & Audit Logging', () => {
    it('verifies vehicle compliance and logs audit trail', async () => {
      const vehicleId = 'v-101';
      await verifyVehicleAction(vehicleId, 'APPROVE', undefined, 'admin-ops-01', 'operations_admin');

      const latestLog = adminMemoryStore.auditLogs[0]!;
      expect(latestLog.action).toBe('VEHICLE_APPROVED');
      expect(latestLog.entityType).toBe('vehicles');
      expect(latestLog.entityId).toBe(vehicleId);
    });

    it('denies vehicle approval from unauthorized driver role', async () => {
      await expect(
        verifyVehicleAction('v-101', 'APPROVE', undefined, 'driver-01', 'driver' as UserRole)
      ).rejects.toThrow(/Permission Denied/);
    });
  });

  describe('4. Emergency Safety Incident Resolution', () => {
    it('resolves an emergency incident with notes and audit record', async () => {
      const incidentId = 'inc-999';
      await resolveIncidentAction(
        incidentId,
        'RESOLVE',
        'Driver replaced flat tire; parents notified; route completed safely',
        'admin-ops-01',
        'operations_admin'
      );

      const latestLog = adminMemoryStore.auditLogs[0]!;
      expect(latestLog.action).toBe('INCIDENT_RESOLVED');
      expect(latestLog.entityType).toBe('incidents');
      expect(latestLog.entityId).toBe(incidentId);
      expect(latestLog.metadata?.['resolutionNotes']).toContain('flat tire');
    });

    it('blocks incident resolution from parent role', async () => {
      await expect(
        resolveIncidentAction(
          'inc-999',
          'RESOLVE',
          'Self resolved',
          'parent-01',
          'parent' as UserRole
        )
      ).rejects.toThrow(/Permission Denied/);
    });
  });

  describe('5. Support Ticket Management Desk', () => {
    it('updates support ticket status and captures resolution audit trail', async () => {
      const ticketId = 'tick-001';
      await updateSupportTicketAction(
        ticketId,
        'RESOLVED',
        'Approved stop change with driver Ramesh Goud',
        'support-agent-01',
        'operations_admin'
      );

      const ticket = adminMemoryStore.tickets.find((t) => t.id === ticketId);
      expect(ticket?.status).toBe('RESOLVED');

      const latestLog = adminMemoryStore.auditLogs[0]!;
      expect(latestLog.action).toBe('SUPPORT_TICKET_RESOLVED');
      expect(latestLog.entityType).toBe('support_tickets');
      expect(latestLog.metadata?.['notes']).toContain('Ramesh Goud');
    });
  });

  describe('6. Data Fetchers: Search, Filter & Pagination', () => {
    it('fetches drivers with status filter and search query', async () => {
      const allResult = await fetchAdminDrivers('', 'ALL', 1, 10);
      expect(allResult.total).toBe(3);
      expect(allResult.items.length).toBe(3);

      const verifiedOnly = await fetchAdminDrivers('', 'VERIFIED', 1, 10);
      expect(verifiedOnly.items.every((d) => d.status === 'VERIFIED')).toBe(true);

      const searchByName = await fetchAdminDrivers('Ramesh', 'ALL', 1, 10);
      expect(searchByName.items.length).toBe(1);
      expect(searchByName.items[0]!.name).toBe('Ramesh Goud');
    });

    it('fetches parents with search query and pagination', async () => {
      const result = await fetchAdminParents('Aarav', 1, 10);
      expect(result.items.length).toBe(1);
      expect(result.items[0]!.fullName).toBe('Ananya Sharma');
      expect(result.items[0]!.children[0]!.name).toBe('Aarav Sharma');
    });

    it('fetches payments ledger with status filter and calculates commission', async () => {
      const result = await fetchAdminPayments('', 'CAPTURED', 1, 10);
      expect(result.items.length).toBe(4);
      expect(result.items.every((p) => p.status === 'CAPTURED')).toBe(true);

      // Verify 10% platform fee calculation
      for (const p of result.items) {
        expect(p.platformFeeInr).toBe(p.amountInr * 0.1);
        expect(p.driverPayoutInr).toBe(p.amountInr * 0.9);
      }
    });

    it('fetches support tickets with priority and status filters', async () => {
      const highPriority = await fetchAdminSupportTickets('', 'ALL', 'HIGH', 1, 10);
      expect(highPriority.items.length).toBe(1);
      expect(highPriority.items[0]!.subject).toContain('diversion');

      const openTickets = await fetchAdminSupportTickets('', 'OPEN', 'ALL', 1, 10);
      expect(openTickets.items.length).toBe(1);
      expect(openTickets.items[0]!.id).toBe('tick-001');
    });

    it('fetches audit logs with action filters and search', async () => {
      const driverLogs = await fetchAdminAuditLogs('', 'DRIVER', 1, 10);
      expect(driverLogs.items.every((a) => a.action.includes('DRIVER'))).toBe(true);

      const searchByActor = await fetchAdminAuditLogs('admin-usr-ops-01', 'ALL', 1, 10);
      expect(searchByActor.items.length).toBeGreaterThan(0);
    });

    it('returns dashboard overview metrics accurately', async () => {
      const metrics = await fetchAdminDashboardMetrics();
      expect(metrics.totalSchools).toBe(4);
      expect(metrics.activeRoutes).toBe(2);
      expect(metrics.verifiedDrivers).toBe(2);
      expect(metrics.monthlyGrossInr).toBe(12800);
      expect(metrics.platformFeeRevenueInr).toBe(1280);
      expect(metrics.openSafetyIncidents).toBe(0);
    });
  });
});
