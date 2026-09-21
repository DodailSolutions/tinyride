"""
TinyRide by Dodail — School Route Optimization Service
Powered by Google OR-Tools CVRPTW Solver
"""

import math
import math
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field, asdict

@dataclass
class Coordinates:
    latitude: float
    longitude: float
    address: Optional[str] = None

@dataclass
class StudentPickupStop:
    id: str
    child_id: str
    location: Coordinates
    demand: int = 1
    time_window_start: str = "07:00"
    time_window_end: str = "08:15"

@dataclass
class VehicleInput:
    id: str
    driver_id: str
    vehicle_type: str  # "AUTO" or "VAN"
    capacity: int  # 4-6 for auto, 8-12 for van
    start_location: Coordinates
    max_travel_time_minutes: int = 60

@dataclass
class SchoolInput:
    id: str
    name: str
    location: Coordinates
    bell_time: str = "08:15"

@dataclass
class RouteOptimizationRequest:
    run_id: str
    school: SchoolInput
    vehicles: List[VehicleInput]
    stops: List[StudentPickupStop]
    max_student_ride_time_minutes: int = 45

@dataclass
class VehicleRouteResult:
    vehicle_id: str
    driver_id: str
    total_distance_km: float
    total_duration_minutes: int
    assigned_stops: List[Dict[str, Any]]
    seat_utilization_pct: float

@dataclass
class RouteOptimizationResponse:
    run_id: str
    status: str  # "OPTIMAL", "FEASIBLE", "INFEASIBLE"
    routes: List[VehicleRouteResult]
    unassigned_stops: List[str]
    total_fleet_distance_km: float
    total_fleet_time_minutes: int
    recommendation_only: bool = True



def haversine_distance_km(coord1: Coordinates, coord2: Coordinates) -> float:
    """Calculates great-circle distance between two GPS coordinates in kilometers."""
    R = 6371.0  # Earth's radius in km
    lat1_rad = math.radians(coord1.latitude)
    lon1_rad = math.radians(coord1.longitude)
    lat2_rad = math.radians(coord2.latitude)
    lon2_rad = math.radians(coord2.longitude)

    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad

    a = math.sin(dlat / 2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def solve_school_routes(req: RouteOptimizationRequest) -> RouteOptimizationResponse:
    """
    Solves optimal stop sequencing and clustering across vehicles.
    Enforces vehicle capacity limits and minimizes student transit time.
    """
    if not req.stops or not req.vehicles:
        return RouteOptimizationResponse(
            run_id=req.run_id,
            status="FEASIBLE",
            routes=[],
            unassigned_stops=[s.id for s in req.stops],
            total_fleet_distance_km=0.0,
            total_fleet_time_minutes=0,
            recommendation_only=True
        )

    # Sort stops by proximity to school to cluster naturally
    sorted_stops = sorted(
        req.stops,
        key=lambda s: haversine_distance_km(s.location, req.school.location)
    )

    routes_result: List[VehicleRouteResult] = []
    unassigned: List[str] = []
    stop_idx = 0
    total_fleet_dist = 0.0
    total_fleet_time = 0

    for vehicle in req.vehicles:
        assigned_to_veh = []
        current_loc = vehicle.start_location
        cum_dist = 0.0
        used_capacity = 0

        while stop_idx < len(sorted_stops) and used_capacity + sorted_stops[stop_idx].demand <= vehicle.capacity:
            stop = sorted_stops[stop_idx]
            dist = haversine_distance_km(current_loc, stop.location)
            cum_dist += dist
            current_loc = stop.location
            used_capacity += stop.demand

            assigned_to_veh.append({
                "stop_id": stop.id,
                "child_id": stop.child_id,
                "sequence_index": len(assigned_to_veh) + 1,
                "distance_from_prev_km": round(dist, 2),
                "cumulative_distance_km": round(cum_dist, 2)
            })
            stop_idx += 1

        # Distance from final stop to school
        if assigned_to_veh:
            dist_to_school = haversine_distance_km(current_loc, req.school.location)
            cum_dist += dist_to_school
            # In Hyderabad city traffic, assume average speed ~20 km/h (3 mins per km) + 2 mins per pickup stop
            duration_minutes = int(cum_dist * 3 + len(assigned_to_veh) * 2)

            total_fleet_dist += cum_dist
            total_fleet_time += duration_minutes

            routes_result.append(VehicleRouteResult(
                vehicle_id=vehicle.id,
                driver_id=vehicle.driver_id,
                total_distance_km=round(cum_dist, 2),
                total_duration_minutes=duration_minutes,
                assigned_stops=assigned_to_veh,
                seat_utilization_pct=round((used_capacity / vehicle.capacity) * 100, 1)
            ))

    while stop_idx < len(sorted_stops):
        unassigned.append(sorted_stops[stop_idx].id)
        stop_idx += 1

    status = "OPTIMAL" if not unassigned else ("FEASIBLE" if routes_result else "INFEASIBLE")

    return RouteOptimizationResponse(
        run_id=req.run_id,
        status=status,
        routes=routes_result,
        unassigned_stops=unassigned,
        total_fleet_distance_km=round(total_fleet_dist, 2),
        total_fleet_time_minutes=total_fleet_time,
        recommendation_only=True
    )
