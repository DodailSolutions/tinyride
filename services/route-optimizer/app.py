"""
TinyRide by Dodail — Route Optimization Microservice API
FastAPI service exposing Google OR-Tools CVRPTW solver endpoints.
"""

from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import time

from optimizer import (
    Coordinates,
    StudentPickupStop,
    VehicleInput,
    SchoolInput,
    RouteOptimizationRequest,
    RouteOptimizationResponse,
    solve_school_routes,
    ORTOOLS_AVAILABLE,
)

app = FastAPI(
    title="TinyRide Route Optimizer Service",
    description="AI-001 School Route Clustering & CVRPTW Engine for TinyRide by Dodail",
    version="1.0.0",
)


# =============================================================================
# PYDANTIC SCHEMAS FOR REST VALIDATION
# =============================================================================

class CoordinatesModel(BaseModel):
    latitude: float = Field(..., ge=-90.0, le=90.0, description="Latitude between -90 and 90")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="Longitude between -180 and 180")
    address: Optional[str] = None
    landmark: Optional[str] = None


class StudentPickupModel(BaseModel):
    id: str
    child_token: str = Field(..., min_length=1, description="Anonymized student token")
    location: CoordinatesModel
    demand: int = Field(default=1, ge=1)
    time_window_start: Optional[str] = None
    time_window_end: Optional[str] = None


class VehicleModel(BaseModel):
    id: str
    driver_id: str
    vehicle_type: str = Field(..., pattern="^(AUTO|VAN)$")
    capacity: int = Field(..., ge=1, le=20)
    start_location: CoordinatesModel
    max_travel_time_minutes: int = Field(default=60, ge=10, le=120)


class SchoolModel(BaseModel):
    id: str
    name: str
    location: CoordinatesModel
    bell_time: str = Field(default="08:15", pattern="^([01]\\d|2[0-3]):[0-5]\\d$")


class OptimizationRequestModel(BaseModel):
    run_id: str
    school: SchoolModel
    vehicles: List[VehicleModel] = Field(..., min_length=1)
    stops: List[StudentPickupModel] = Field(..., min_length=1)
    shift: str = Field(default="MORNING", pattern="^(MORNING|AFTERNOON)$")
    max_student_ride_time_minutes: int = Field(default=45, ge=10, le=120)


# =============================================================================
# ENDPOINTS
# =============================================================================

@app.get("/api/v1/health")
def health_check():
    return {
        "status": "HEALTHY",
        "service": "tinyride-route-optimizer",
        "ortools_available": ORTOOLS_AVAILABLE,
        "solver_engine": "Google OR-Tools CVRPTW" if ORTOOLS_AVAILABLE else "Heuristic CVRPTW Fallback",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }


@app.post("/api/v1/optimize")
def optimize_routes(payload: OptimizationRequestModel):
    try:
        # Convert Pydantic models to domain dataclasses
        school = SchoolInput(
            id=payload.school.id,
            name=payload.school.name,
            location=Coordinates(
                latitude=payload.school.location.latitude,
                longitude=payload.school.location.longitude,
                address=payload.school.location.address,
                landmark=payload.school.location.landmark,
            ),
            bell_time=payload.school.bell_time,
        )

        vehicles = [
            VehicleInput(
                id=v.id,
                driver_id=v.driver_id,
                vehicle_type=v.vehicle_type,
                capacity=v.capacity,
                start_location=Coordinates(
                    latitude=v.start_location.latitude,
                    longitude=v.start_location.longitude,
                    address=v.start_location.address,
                ),
                max_travel_time_minutes=v.max_travel_time_minutes,
            )
            for v in payload.vehicles
        ]

        stops = [
            StudentPickupStop(
                id=s.id,
                child_token=s.child_token,
                location=Coordinates(
                    latitude=s.location.latitude,
                    longitude=s.location.longitude,
                    address=s.location.address,
                ),
                demand=s.demand,
                time_window_start=s.time_window_start,
                time_window_end=s.time_window_end,
            )
            for s in payload.stops
        ]

        req = RouteOptimizationRequest(
            run_id=payload.run_id,
            school=school,
            vehicles=vehicles,
            stops=stops,
            shift=payload.shift,
            max_student_ride_time_minutes=payload.max_student_ride_time_minutes,
        )

        response = solve_school_routes(req)

        # Serialize dataclass response to dict
        return {
            "run_id": response.run_id,
            "status": response.status,
            "routes": [
                {
                    "vehicle_id": r.vehicle_id,
                    "driver_id": r.driver_id,
                    "vehicle_type": r.vehicle_type,
                    "vehicle_capacity": r.vehicle_capacity,
                    "assigned_stops_count": r.assigned_stops_count,
                    "seat_utilization_pct": r.seat_utilization_pct,
                    "total_distance_km": r.total_distance_km,
                    "total_duration_minutes": r.total_duration_minutes,
                    "stops": r.stops,
                }
                for r in response.routes
            ],
            "unassigned_stop_ids": response.unassigned_stop_ids,
            "constraint_violations": [
                {
                    "violation_type": cv.violation_type,
                    "severity": cv.severity,
                    "message": cv.message,
                    "affected_stop_ids": cv.affected_stop_ids,
                    "affected_vehicle_id": cv.affected_vehicle_id,
                }
                for cv in response.constraint_violations
            ],
            "total_fleet_distance_km": response.total_fleet_distance_km,
            "total_fleet_duration_minutes": response.total_fleet_duration_minutes,
            "average_seat_utilization_pct": response.average_seat_utilization_pct,
            "computation_time_ms": response.computation_time_ms,
            "solver_engine": response.solver_engine,
            "recommendation_only": True,
            "created_at": response.created_at,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Route optimization solver failed: {str(e)}",
        )
