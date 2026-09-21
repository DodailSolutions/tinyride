import { Coordinates } from './models';

export interface StudentPickupStop {
  id: string;
  child_id: string;
  location: Coordinates;
  time_window_start: string; // HH:mm
  time_window_end: string; // HH:mm
  demand: number; // usually 1 seat
}

export interface OptimizerVehicleInput {
  id: string;
  driver_id: string;
  vehicle_type: 'AUTO' | 'VAN';
  capacity: number; // e.g. 4 for auto, 10 for van
  start_location: Coordinates; // driver home or vehicle parking base
  max_travel_time_minutes: number; // e.g. 60
}

export interface OptimizerSchoolInput {
  id: string;
  location: Coordinates;
  bell_time: string; // e.g. "08:15"
}

export interface RouteOptimizerInput {
  run_id: string;
  school: OptimizerSchoolInput;
  vehicles: OptimizerVehicleInput[];
  stops: StudentPickupStop[];
  max_student_ride_time_minutes?: number; // e.g. 45 mins
}

export interface OptimizedRouteStopAssignment {
  stop_id: string;
  child_id: string;
  sequence_index: number;
  arrival_time: string;
  departure_time: string;
  cumulative_distance_km: number;
  cumulative_time_minutes: number;
}

export interface OptimizedVehicleRoute {
  vehicle_id: string;
  driver_id: string;
  total_distance_km: number;
  total_duration_minutes: number;
  assigned_stops: OptimizedRouteStopAssignment[];
  seat_utilization: number; // percentage (0 - 100)
}

export interface RouteOptimizerOutput {
  run_id: string;
  status: 'OPTIMAL' | 'FEASIBLE' | 'INFEASIBLE';
  routes: OptimizedVehicleRoute[];
  unassigned_stops: string[];
  total_fleet_distance_km: number;
  total_fleet_time_minutes: number;
  solver_metadata: {
    solver: 'Google OR-Tools CVRPTW';
    execution_time_ms: number;
    objective_value: number;
  };
}
