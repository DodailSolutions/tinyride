"""
Unit Tests for TinyRide School Route Optimizer
"""

from optimizer import (
    Coordinates,
    StudentPickupStop,
    VehicleInput,
    SchoolInput,
    RouteOptimizationRequest,
    solve_school_routes,
    haversine_distance_km
)

def test_haversine_distance():
    # Distance between DPS Gachibowli and Oakridge Gachibowli (~1.4 km in Hyderabad)
    dps = Coordinates(latitude=17.4194, longitude=78.3688)
    oakridge = Coordinates(latitude=17.4116, longitude=78.3582)
    dist = haversine_distance_km(dps, oakridge)
    assert 1.0 <= dist <= 2.0

def test_route_optimization_capacity_constraint():
    # School: DPS Gachibowli
    school = SchoolInput(
        id="school-1",
        name="DPS Gachibowli",
        location=Coordinates(latitude=17.4194, longitude=78.3688)
    )

    # 1 Auto with capacity of 4 seats
    auto = VehicleInput(
        id="veh-auto-1",
        driver_id="drv-1",
        vehicle_type="AUTO",
        capacity=4,
        start_location=Coordinates(latitude=17.4300, longitude=78.3700)
    )

    # 5 students wanting pickup in Kondapur
    stops = [
        StudentPickupStop(id=f"stop-{i}", child_id=f"child-{i}", location=Coordinates(latitude=17.4350 + i * 0.002, longitude=78.3600 + i * 0.002))
        for i in range(5)
    ]

    req = RouteOptimizationRequest(
        run_id="test-run-1",
        school=school,
        vehicles=[auto],
        stops=stops
    )

    result = solve_school_routes(req)

    # Since auto capacity is 4 and there are 5 stops, exactly 4 must be assigned, 1 unassigned
    assert len(result.routes) == 1
    assert len(result.routes[0].assigned_stops) == 4
    assert len(result.unassigned_stops) == 1
    assert result.status == "FEASIBLE"
    assert result.recommendation_only is True

if __name__ == "__main__":
    test_haversine_distance()
    test_route_optimization_capacity_constraint()
    print("All route optimizer tests passed successfully!")
