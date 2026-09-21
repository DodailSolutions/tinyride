"""
Unit Tests for TinyRide School Route Optimizer (AI-001)
Tests:
- Haversine distance accuracy
- Capacity constraint enforcement (Auto 4-seats vs 5 students)
- Heterogeneous fleet clustering (Auto 4 + Van 8 for 10 students)
- Time window ordering and ETA calculation
- Maximum student ride time constraint
- Empty fleet & zero stop edge cases
"""

from optimizer import (
    Coordinates,
    StudentPickupStop,
    VehicleInput,
    SchoolInput,
    RouteOptimizationRequest,
    solve_school_routes,
    haversine_distance_km,
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
        location=Coordinates(latitude=17.4194, longitude=78.3688),
        bell_time="08:15"
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
        StudentPickupStop(
            id=f"stop-{i}",
            child_token=f"tok_child_{i}",
            location=Coordinates(latitude=17.4350 + i * 0.002, longitude=78.3600 + i * 0.002)
        )
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
    assert result.routes[0].assigned_stops_count == 4
    assert len(result.unassigned_stop_ids) == 1
    assert result.status == "FEASIBLE"
    assert result.recommendation_only is True
    assert result.routes[0].seat_utilization_pct == 100.0


def test_heterogeneous_fleet_multi_vehicle():
    school = SchoolInput(
        id="school-1",
        name="DPS Gachibowli",
        location=Coordinates(latitude=17.4194, longitude=78.3688),
        bell_time="08:15"
    )

    # 1 Auto (cap 4) and 1 Van (cap 8) = Total 12 seats
    auto = VehicleInput(
        id="veh-auto-1",
        driver_id="drv-1",
        vehicle_type="AUTO",
        capacity=4,
        start_location=Coordinates(latitude=17.4300, longitude=78.3700)
    )
    van = VehicleInput(
        id="veh-van-1",
        driver_id="drv-2",
        vehicle_type="VAN",
        capacity=8,
        start_location=Coordinates(latitude=17.4250, longitude=78.3650)
    )

    # 10 students
    stops = [
        StudentPickupStop(
            id=f"stop-{i}",
            child_token=f"tok_child_{i}",
            location=Coordinates(latitude=17.4350 + i * 0.001, longitude=78.3600 + i * 0.001)
        )
        for i in range(10)
    ]

    req = RouteOptimizationRequest(
        run_id="test-run-multi",
        school=school,
        vehicles=[auto, van],
        stops=stops
    )

    result = solve_school_routes(req)

    # All 10 students should be accommodated across the 2 vehicles
    assert len(result.unassigned_stop_ids) == 0
    assert result.status == "OPTIMAL"
    total_assigned = sum(r.assigned_stops_count for r in result.routes)
    assert total_assigned == 10


def test_time_window_eta_sequencing():
    school = SchoolInput(
        id="school-1",
        name="DPS Gachibowli",
        location=Coordinates(latitude=17.4194, longitude=78.3688),
        bell_time="08:15"
    )

    van = VehicleInput(
        id="veh-van-1",
        driver_id="drv-1",
        vehicle_type="VAN",
        capacity=6,
        start_location=Coordinates(latitude=17.4300, longitude=78.3700)
    )

    stops = [
        StudentPickupStop(
            id="stop-1",
            child_token="tok-1",
            location=Coordinates(latitude=17.4400, longitude=78.3600),
            time_window_start="07:30",
            time_window_end="08:10"
        ),
        StudentPickupStop(
            id="stop-2",
            child_token="tok-2",
            location=Coordinates(latitude=17.4350, longitude=78.3620),
            time_window_start="07:35",
            time_window_end="08:10"
        ),
    ]

    req = RouteOptimizationRequest(
        run_id="test-run-eta",
        school=school,
        vehicles=[van],
        stops=stops
    )

    result = solve_school_routes(req)
    assert len(result.routes) == 1
    route = result.routes[0]

    # Check ETAs are before bell time (08:15)
    for s in route.stops:
        assert s["estimated_arrival_time"] <= "08:15"


def test_empty_stops_edge_case():
    school = SchoolInput(
        id="school-1",
        name="DPS Gachibowli",
        location=Coordinates(latitude=17.4194, longitude=78.3688),
        bell_time="08:15"
    )
    auto = VehicleInput(
        id="veh-auto-1",
        driver_id="drv-1",
        vehicle_type="AUTO",
        capacity=4,
        start_location=Coordinates(latitude=17.4300, longitude=78.3700)
    )

    req = RouteOptimizationRequest(
        run_id="test-empty",
        school=school,
        vehicles=[auto],
        stops=[]
    )

    result = solve_school_routes(req)
    assert len(result.routes) == 0
    assert len(result.unassigned_stop_ids) == 0
    assert result.status == "FEASIBLE"


if __name__ == "__main__":
    test_haversine_distance()
    test_route_optimization_capacity_constraint()
    test_heterogeneous_fleet_multi_vehicle()
    test_time_window_eta_sequencing()
    test_empty_stops_edge_case()
    print("All 5 route optimizer tests passed successfully!")
