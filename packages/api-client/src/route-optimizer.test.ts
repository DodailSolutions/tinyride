import { describe, it, expect, beforeEach } from 'vitest';
import {
  executeRouteOptimization,
  approveRouteRecommendation,
  rejectRouteRecommendation,
  haversineDistanceKm,
  parseTimeToMinutes,
  formatMinutesToTime,
  estimateTransitDuration,
  optimizerMemoryStore,
} from './route-optimizer';
import { adminMemoryStore } from './admin-api';
import { RouteOptimizationRequest, UserRole } from '@tinyride/types';

describe('AI-001 Route Optimization Service Test Suite', () => {
  const mockSchool = {
    id: 'school-dps-01',
    name: 'DPS Gachibowli',
    location: { latitude: 17.4194, longitude: 78.3688 },
    bell_time: '08:15',
  };

  beforeEach(() => {
    optimizerMemoryStore.recommendations = {};
    optimizerMemoryStore.approvedRecommendations = {};
    adminMemoryStore.auditLogs = [];
  });

  describe('1. Geodesic & Timing Utilities', () => {
    it('calculates accurate Haversine distance in Hyderabad', () => {
      // DPS Gachibowli to Oakridge (~1.4 km)
      const dps = { latitude: 17.4194, longitude: 78.3688 };
      const oakridge = { latitude: 17.4116, longitude: 78.3582 };
      const dist = haversineDistanceKm(dps, oakridge);
      expect(dist).toBeGreaterThan(1.0);
      expect(dist).toBeLessThan(2.0);
    });

    it('converts time strings and minutes correctly', () => {
      expect(parseTimeToMinutes('08:15')).toBe(495);
      expect(parseTimeToMinutes('07:30')).toBe(450);
      expect(formatMinutesToTime(495)).toBe('08:15');
      expect(formatMinutesToTime(450)).toBe('07:30');
    });

    it('estimates transit duration with Hyderabad urban traffic model', () => {
      // 5 km with 2 curbside student halts
      // 5 km * 3 min/km + 2 stops * 2 min = 19 mins
      const duration = estimateTransitDuration(5.0, 2);
      expect(duration).toBe(19);
    });
  });

  describe('2. Input Validation (Zod Schema)', () => {
    it('throws when coordinates are invalid', async () => {
      const invalidReq: any = {
        run_id: 'test-1',
        school_id: mockSchool.id,
        school_name: mockSchool.name,
        school_location: { latitude: 120.0, longitude: 78.3688 }, // invalid latitude > 90
        bell_time: '08:15',
        shift: 'MORNING',
        vehicles: [
          {
            id: 'v1',
            driver_id: 'd1',
            vehicle_type: 'AUTO',
            capacity: 4,
            start_location: { latitude: 17.43, longitude: 78.36 },
          },
        ],
        stops: [
          {
            id: 's1',
            child_token: 'tok_1',
            location: { latitude: 17.435, longitude: 78.362 },
            demand: 1,
          },
        ],
      };

      await expect(executeRouteOptimization(invalidReq)).rejects.toThrow(/Invalid Route Optimization Request/);
    });

    it('throws when bell time is not HH:MM format', async () => {
      const invalidReq: any = {
        run_id: 'test-2',
        school_id: mockSchool.id,
        school_name: mockSchool.name,
        school_location: mockSchool.location,
        bell_time: '8-15-AM', // invalid format
        shift: 'MORNING',
        vehicles: [
          {
            id: 'v1',
            driver_id: 'd1',
            vehicle_type: 'AUTO',
            capacity: 4,
            start_location: { latitude: 17.43, longitude: 78.36 },
          },
        ],
        stops: [
          {
            id: 's1',
            child_token: 'tok_1',
            location: { latitude: 17.435, longitude: 78.362 },
            demand: 1,
          },
        ],
      };

      await expect(executeRouteOptimization(invalidReq)).rejects.toThrow(/Bell time must be HH:MM format/);
    });

    it('throws when vehicles list is empty', async () => {
      const invalidReq: any = {
        run_id: 'test-3',
        school_id: mockSchool.id,
        school_name: mockSchool.name,
        school_location: mockSchool.location,
        bell_time: '08:15',
        shift: 'MORNING',
        vehicles: [], // empty fleet
        stops: [
          {
            id: 's1',
            child_token: 'tok_1',
            location: { latitude: 17.435, longitude: 78.362 },
            demand: 1,
          },
        ],
      };

      await expect(executeRouteOptimization(invalidReq)).rejects.toThrow(/At least one vehicle required/);
    });
  });

  describe('3. Capacity Constraints & Fleet Allocation', () => {
    it('enforces vehicle capacity: 4-seat auto with 5 students assigns 4 and flags 1 unassigned', async () => {
      const req: RouteOptimizationRequest = {
        run_id: 'run-cap-test',
        school_id: mockSchool.id,
        school_name: mockSchool.name,
        school_location: mockSchool.location,
        bell_time: mockSchool.bell_time,
        shift: 'MORNING',
        vehicles: [
          {
            id: 'auto-01',
            driver_id: 'drv-01',
            vehicle_type: 'AUTO',
            capacity: 4,
            start_location: { latitude: 17.43, longitude: 78.36 },
          },
        ],
        stops: [
          { id: 's1', child_token: 'tok_1', location: { latitude: 17.435, longitude: 78.362 }, demand: 1 },
          { id: 's2', child_token: 'tok_2', location: { latitude: 17.436, longitude: 78.363 }, demand: 1 },
          { id: 's3', child_token: 'tok_3', location: { latitude: 17.437, longitude: 78.364 }, demand: 1 },
          { id: 's4', child_token: 'tok_4', location: { latitude: 17.438, longitude: 78.365 }, demand: 1 },
          { id: 's5', child_token: 'tok_5', location: { latitude: 17.439, longitude: 78.366 }, demand: 1 },
        ],
      };

      const result = await executeRouteOptimization(req);

      expect(result.status).toBe('FEASIBLE');
      expect(result.recommendation_only).toBe(true);
      expect(result.routes.length).toBe(1);
      expect(result.routes[0]!.assigned_stops_count).toBe(4);
      expect(result.routes[0]!.seat_utilization_pct).toBe(100);
      expect(result.unassigned_stop_ids.length).toBe(1);
      expect(result.constraint_violations.some((c) => c.violation_type === 'CAPACITY_EXCEEDED')).toBe(true);
    });

    it('clusters students across heterogeneous fleet (Auto 4 + Van 8 for 10 students)', async () => {
      const req: RouteOptimizationRequest = {
        run_id: 'run-hetero-test',
        school_id: mockSchool.id,
        school_name: mockSchool.name,
        school_location: mockSchool.location,
        bell_time: mockSchool.bell_time,
        shift: 'MORNING',
        vehicles: [
          {
            id: 'auto-01',
            driver_id: 'drv-01',
            vehicle_type: 'AUTO',
            capacity: 4,
            start_location: { latitude: 17.43, longitude: 78.36 },
          },
          {
            id: 'van-01',
            driver_id: 'drv-02',
            vehicle_type: 'VAN',
            capacity: 8,
            start_location: { latitude: 17.425, longitude: 78.358 },
          },
        ],
        stops: Array.from({ length: 10 }, (_, i) => ({
          id: `s-${i + 1}`,
          child_token: `tok_${i + 1}`,
          location: { latitude: 17.432 + i * 0.001, longitude: 78.361 + i * 0.001 },
          demand: 1,
        })),
      };

      const result = await executeRouteOptimization(req);

      expect(result.status).toBe('OPTIMAL');
      expect(result.unassigned_stop_ids.length).toBe(0);
      const totalAssigned = result.routes.reduce((acc, r) => acc + r.assigned_stops_count, 0);
      expect(totalAssigned).toBe(10);
    });
  });

  describe('4. Time Windows & Arrival ETAs', () => {
    it('calculates sequential stop ETAs arriving prior to bell time (08:15)', async () => {
      const req: RouteOptimizationRequest = {
        run_id: 'run-time-test',
        school_id: mockSchool.id,
        school_name: mockSchool.name,
        school_location: mockSchool.location,
        bell_time: '08:15',
        shift: 'MORNING',
        vehicles: [
          {
            id: 'van-01',
            driver_id: 'drv-01',
            vehicle_type: 'VAN',
            capacity: 6,
            start_location: { latitude: 17.43, longitude: 78.36 },
          },
        ],
        stops: [
          { id: 's1', child_token: 'tok_1', location: { latitude: 17.44, longitude: 78.362 }, demand: 1 },
          { id: 's2', child_token: 'tok_2', location: { latitude: 17.435, longitude: 78.364 }, demand: 1 },
        ],
      };

      const result = await executeRouteOptimization(req);
      const stops = result.routes[0]!.stops;

      expect(stops.length).toBe(2);
      expect(stops[0]!.sequence_index).toBe(1);
      expect(stops[1]!.sequence_index).toBe(2);

      // Verify all ETAs are before or equal to 08:15
      for (const stop of stops) {
        expect(stop.estimated_arrival_time <= '08:15').toBe(true);
      }
    });

    it('flags warning if route duration exceeds max student ride time (e.g. 15 min limit)', async () => {
      const req: RouteOptimizationRequest = {
        run_id: 'run-max-ride-test',
        school_id: mockSchool.id,
        school_name: mockSchool.name,
        school_location: mockSchool.location,
        bell_time: '08:15',
        shift: 'MORNING',
        max_student_ride_time_minutes: 10, // strict 10 min limit
        vehicles: [
          {
            id: 'auto-01',
            driver_id: 'drv-01',
            vehicle_type: 'AUTO',
            capacity: 4,
            start_location: { latitude: 17.48, longitude: 78.30 }, // far away (~12 km)
          },
        ],
        stops: [
          { id: 's1', child_token: 'tok_1', location: { latitude: 17.47, longitude: 78.32 }, demand: 1 },
        ],
      };

      const result = await executeRouteOptimization(req);
      expect(result.constraint_violations.some((c) => c.violation_type === 'MAX_RIDE_TIME_EXCEEDED')).toBe(true);
    });
  });

  describe('5. Human-in-the-Loop Review & Approval Guardrail', () => {
    it('approves a recommendation when executed by authorized operations_admin', async () => {
      const req: RouteOptimizationRequest = {
        run_id: 'run-approval-01',
        school_id: mockSchool.id,
        school_name: mockSchool.name,
        school_location: mockSchool.location,
        bell_time: '08:15',
        shift: 'MORNING',
        vehicles: [
          {
            id: 'auto-01',
            driver_id: 'drv-01',
            vehicle_type: 'AUTO',
            capacity: 4,
            start_location: { latitude: 17.43, longitude: 78.36 },
          },
        ],
        stops: [
          { id: 's1', child_token: 'tok_1', location: { latitude: 17.435, longitude: 78.362 }, demand: 1 },
        ],
      };

      await executeRouteOptimization(req);

      // Authorized approval
      const approval = await approveRouteRecommendation({
        run_id: 'run-approval-01',
        decision: 'APPROVE',
        actor_id: 'admin-ops-01',
        actor_role: 'operations_admin',
        admin_notes: 'Verified safe curbside pickup and zero U-turns.',
      });

      expect(approval.decision).toBe('APPROVE');
      expect(approval.published_route_ids?.length).toBe(1);

      // Verify immutable audit log recorded
      const latestLog = adminMemoryStore.auditLogs[0]!;
      expect(latestLog.action).toBe('ROUTE_RECOMMENDATION_APPROVED');
      expect(latestLog.actorRole).toBe('operations_admin');
    });

    it('blocks approval attempts from non-admin roles (e.g. parent or driver)', async () => {
      const req: RouteOptimizationRequest = {
        run_id: 'run-block-01',
        school_id: mockSchool.id,
        school_name: mockSchool.name,
        school_location: mockSchool.location,
        bell_time: '08:15',
        shift: 'MORNING',
        vehicles: [
          {
            id: 'auto-01',
            driver_id: 'drv-01',
            vehicle_type: 'AUTO',
            capacity: 4,
            start_location: { latitude: 17.43, longitude: 78.36 },
          },
        ],
        stops: [
          { id: 's1', child_token: 'tok_1', location: { latitude: 17.435, longitude: 78.362 }, demand: 1 },
        ],
      };

      await executeRouteOptimization(req);

      // Non-admin attempt must throw
      await expect(
        approveRouteRecommendation({
          run_id: 'run-block-01',
          decision: 'APPROVE',
          actor_id: 'parent-01',
          actor_role: 'parent' as UserRole,
        })
      ).rejects.toThrow();
    });

    it('records audit log on recommendation rejection', async () => {
      await rejectRouteRecommendation(
        'run-reject-01',
        'admin-ops-01',
        'operations_admin',
        'Traffic bottleneck near botanical garden'
      );

      const latestLog = adminMemoryStore.auditLogs[0]!;
      expect(latestLog.action).toBe('ROUTE_RECOMMENDATION_REJECTED');
      expect(latestLog.metadata?.['reason']).toContain('Traffic bottleneck');
    });
  });
});
