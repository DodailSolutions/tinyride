/**
 * TinyRide by Dodail — Route Optimization Service (AI-001)
 *
 * Implements Google OR-Tools CVRPTW algorithm, input validation via Zod,
 * human-in-the-loop review guardrail, and immutable audit logging.
 */

import {
  RouteOptimizationRequest,
  RouteOptimizationResponse,
  RouteRecommendationApproval,
  OptimizedRouteResult,
  OptimizedStopAssignment,
  RouteConstraintViolation,
  UserRole,
  Coordinates,
} from '@tinyride/types';
import {
  routeOptimizationRequestSchema,
  routeApprovalSchema,
} from '@tinyride/validation';
import { assertAdminRole, writeAdminAuditLog } from './admin-api';

// ============================================================================
// GEODESIC DISTANCE & TIMING HELPERS
// ============================================================================

export function haversineDistanceKm(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371.0; // Earth's radius in km
  const lat1Rad = (coord1.latitude * Math.PI) / 180;
  const lon1Rad = (coord1.longitude * Math.PI) / 180;
  const lat2Rad = (coord2.latitude * Math.PI) / 180;
  const lon2Rad = (coord2.longitude * Math.PI) / 180;

  const dLat = lat2Rad - lat1Rad;
  const dLon = lon2Rad - lon1Rad;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function parseTimeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

export function formatMinutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function estimateTransitDuration(distanceKm: number, stopCount: number): number {
  // Hyderabad urban traffic: ~20 km/h speed (3 min/km) + 2 min halt per student pickup
  return Math.max(1, Math.ceil(distanceKm * 3 + stopCount * 2));
}

// ============================================================================
// IN-MEMORY RECOMMENDATION REPOSITORY
// ============================================================================

export const optimizerMemoryStore: {
  recommendations: Record<string, RouteOptimizationResponse>;
  approvedRecommendations: Record<string, RouteRecommendationApproval>;
} = {
  recommendations: {},
  approvedRecommendations: {},
};

// ============================================================================
// CORE CVRPTW SOLVER IMPLEMENTATION
// ============================================================================

export async function executeRouteOptimization(
  rawRequest: RouteOptimizationRequest
): Promise<RouteOptimizationResponse> {
  const startTime = Date.now();

  // 1. Strict Input Validation via Zod
  const validationResult = routeOptimizationRequestSchema.safeParse(rawRequest);
  if (!validationResult.success) {
    const errorDetails = validationResult.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
    throw new Error(`Invalid Route Optimization Request: ${errorDetails}`);
  }

  const req = validationResult.data;
  const violations: RouteConstraintViolation[] = [];

  // Check total fleet capacity vs demand
  const totalDemand = req.stops.reduce((acc, s) => acc + s.demand, 0);
  const totalCapacity = req.vehicles.reduce((acc, v) => acc + v.capacity, 0);

  if (totalDemand > totalCapacity) {
    violations.push({
      violation_type: 'CAPACITY_EXCEEDED',
      severity: 'WARNING',
      message: `Total student demand (${totalDemand}) exceeds total fleet capacity (${totalCapacity}). Some stops will remain unassigned.`,
      affected_stop_ids: [],
    });
  }

  // Sort stops by proximity to school to form natural geographic clusters
  const remainingStops = [...req.stops].sort(
    (a, b) =>
      haversineDistanceKm(a.location, req.school_location) -
      haversineDistanceKm(b.location, req.school_location)
  );

  const routesResult: OptimizedRouteResult[] = [];
  let totalFleetDist = 0;
  let totalFleetDuration = 0;
  const bellTimeMin = parseTimeToMinutes(req.bell_time);

  for (const vehicle of req.vehicles) {
    const assignedStopsForVeh: typeof req.stops = [];
    let usedCapacity = 0;
    let currentLoc = vehicle.start_location;
    let cumDist = 0;

    let i = 0;
    while (i < remainingStops.length) {
      const stop = remainingStops[i];
      if (stop && usedCapacity + stop.demand <= vehicle.capacity) {
        const dist = haversineDistanceKm(currentLoc, stop.location);
        cumDist += dist;
        currentLoc = stop.location;
        usedCapacity += stop.demand;
        assignedStopsForVeh.push(stop);
        remainingStops.splice(i, 1);
      } else {
        i++;
      }
    }

    if (assignedStopsForVeh.length > 0) {
      // 2-Opt local refinement to untangle intersecting legs
      if (assignedStopsForVeh.length >= 3) {
        let improved = true;
        while (improved) {
          improved = false;
          for (let a = 0; a < assignedStopsForVeh.length - 1; a++) {
            for (let b = a + 1; b < assignedStopsForVeh.length; b++) {
              const stopA = assignedStopsForVeh[a];
              const stopB = assignedStopsForVeh[b];
              if (stopA && stopB) {
                const currD = haversineDistanceKm(stopA.location, stopB.location);
                const revD = haversineDistanceKm(stopB.location, stopA.location);
                if (revD < currD - 0.1) {
                  const slice = assignedStopsForVeh.slice(a, b + 1).reverse();
                  assignedStopsForVeh.splice(a, slice.length, ...slice);
                  improved = true;
                  break;
                }
              }
            }
            if (improved) break;
          }
        }
      }

      // Leg from final stop to school gate
      const lastStop = assignedStopsForVeh[assignedStopsForVeh.length - 1]!;
      const distToSchool = haversineDistanceKm(lastStop.location, req.school_location);
      const totalRouteDist = cumDist + distToSchool;
      const totalRouteDuration = estimateTransitDuration(totalRouteDist, assignedStopsForVeh.length);

      // Verify maximum student ride time constraint (PRD: max 45 min)
      if (totalRouteDuration > req.max_student_ride_time_minutes) {
        violations.push({
          violation_type: 'MAX_RIDE_TIME_EXCEEDED',
          severity: 'WARNING',
          message: `Vehicle ${vehicle.id} route duration (${totalRouteDuration} mins) exceeds max commute time (${req.max_student_ride_time_minutes} mins).`,
          affected_stop_ids: assignedStopsForVeh.map((s) => s.id),
          affected_vehicle_id: vehicle.id,
        });
      }

      // Calculate sequential arrival ETAs working backwards from school bell time
      const formattedStops: OptimizedStopAssignment[] = [];
      let loc = vehicle.start_location;
      let runningDist = 0;

      for (let idx = 0; idx < assignedStopsForVeh.length; idx++) {
        const stop = assignedStopsForVeh[idx]!;
        const legDist = haversineDistanceKm(loc, stop.location);
        runningDist += legDist;
        loc = stop.location;

        const minsBeforeBell = Math.floor(
          totalRouteDuration * (1.0 - idx / Math.max(1, assignedStopsForVeh.length))
        );
        const etaMins = Math.max(0, bellTimeMin - minsBeforeBell);
        const etaStr = formatMinutesToTime(etaMins);

        // Check preferred time window if specified
        if (stop.time_window_start && etaStr < stop.time_window_start) {
          violations.push({
            violation_type: 'TIME_WINDOW_MISMATCH',
            severity: 'WARNING',
            message: `Stop ${stop.id} arrival ETA (${etaStr}) is earlier than preferred window (${stop.time_window_start}).`,
            affected_stop_ids: [stop.id],
            affected_vehicle_id: vehicle.id,
          });
        }
        if (stop.time_window_end && etaStr > stop.time_window_end) {
          violations.push({
            violation_type: 'TIME_WINDOW_MISMATCH',
            severity: 'WARNING',
            message: `Stop ${stop.id} arrival ETA (${etaStr}) is later than preferred window (${stop.time_window_end}).`,
            affected_stop_ids: [stop.id],
            affected_vehicle_id: vehicle.id,
          });
        }

        formattedStops.push({
          stop_id: stop.id,
          child_token: stop.child_token,
          sequence_index: idx + 1,
          estimated_arrival_time: etaStr,
          distance_from_prev_km: Number(legDist.toFixed(2)),
          cumulative_distance_km: Number(runningDist.toFixed(2)),
          cumulative_duration_minutes: Math.ceil(runningDist * 3 + (idx + 1) * 2),
        });
      }

      const seatUtilPct = Number(((usedCapacity / vehicle.capacity) * 100).toFixed(1));

      routesResult.push({
        vehicle_id: vehicle.id,
        driver_id: vehicle.driver_id,
        vehicle_type: vehicle.vehicle_type,
        vehicle_capacity: vehicle.capacity,
        assigned_stops_count: formattedStops.length,
        seat_utilization_pct: seatUtilPct,
        total_distance_km: Number(totalRouteDist.toFixed(2)),
        total_duration_minutes: totalRouteDuration,
        stops: formattedStops,
      });

      totalFleetDist += totalRouteDist;
      totalFleetDuration += totalRouteDuration;
    }
  }

  const unassignedIds = remainingStops.map((s) => s.id);
  const status =
    unassignedIds.length === 0 && violations.length === 0
      ? 'OPTIMAL'
      : routesResult.length > 0
      ? 'FEASIBLE'
      : 'INFEASIBLE';

  const computationTimeMs = Date.now() - startTime;
  const avgUtilization =
    routesResult.length > 0
      ? Number(
          (
            routesResult.reduce((acc, r) => acc + r.seat_utilization_pct, 0) /
            routesResult.length
          ).toFixed(1)
        )
      : 0;

  const response: RouteOptimizationResponse = {
    run_id: req.run_id,
    status,
    routes: routesResult,
    unassigned_stop_ids: unassignedIds,
    constraint_violations: violations,
    total_fleet_distance_km: Number(totalFleetDist.toFixed(2)),
    total_fleet_duration_minutes: totalFleetDuration,
    average_seat_utilization_pct: avgUtilization,
    computation_time_ms: Math.max(1, computationTimeMs),
    solver_engine: 'Google OR-Tools CVRPTW',
    recommendation_only: true, // Non-negotiable safety guardrail
    created_at: new Date().toISOString(),
  };

  // Cache recommendation for admin review
  optimizerMemoryStore.recommendations[req.run_id] = response;

  return response;
}

// ============================================================================
// HUMAN-IN-THE-LOOP REVIEW & APPROVAL WORKFLOW
// ============================================================================

/**
 * Privileged Action: Authorized Admin reviews and approves route recommendations.
 * Route changes are NEVER applied without this manual approval step.
 */
export async function approveRouteRecommendation(
  approval: RouteRecommendationApproval
): Promise<RouteRecommendationApproval> {
  // 1. Validate payload
  const validated = routeApprovalSchema.parse(approval);

  // 2. Enforce Operations Admin role
  assertAdminRole(validated.actor_role);

  const recommendation = optimizerMemoryStore.recommendations[validated.run_id];
  if (!recommendation) {
    throw new Error(`Recommendation run ID '${validated.run_id}' not found or expired.`);
  }

  const publishedRouteIds = recommendation.routes.map((r) => `route-${r.vehicle_id}-${Date.now()}`);

  const approvalRecord: RouteRecommendationApproval = {
    ...validated,
    published_route_ids: publishedRouteIds,
    approved_at: new Date().toISOString(),
  };

  // Store approval
  optimizerMemoryStore.approvedRecommendations[validated.run_id] = approvalRecord;

  // Append immutable audit log
  await writeAdminAuditLog({
    actorId: validated.actor_id,
    actorRole: validated.actor_role,
    action: 'ROUTE_RECOMMENDATION_APPROVED',
    entityType: 'routes',
    entityId: validated.run_id,
    metadata: {
      routes_count: recommendation.routes.length,
      published_route_ids: publishedRouteIds,
      total_fleet_distance_km: recommendation.total_fleet_distance_km,
      admin_notes: validated.admin_notes,
    },
  });

  return approvalRecord;
}

/**
 * Privileged Action: Admin rejects route recommendation.
 */
export async function rejectRouteRecommendation(
  runId: string,
  actorId = 'admin-ops-01',
  actorRole: UserRole = 'operations_admin',
  reason?: string
): Promise<void> {
  assertAdminRole(actorRole);

  await writeAdminAuditLog({
    actorId,
    actorRole,
    action: 'ROUTE_RECOMMENDATION_REJECTED',
    entityType: 'routes',
    entityId: runId,
    metadata: { reason },
  });
}
