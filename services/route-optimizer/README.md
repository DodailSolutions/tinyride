# TinyRide by Dodail — School Route Optimization Service (AI-001)

Microservice implementing the **School Bus Routing Problem (SBRP)** as a **Capacitated Vehicle Routing Problem with Time Windows (CVRPTW)** using **Google OR-Tools** with an automated heuristic fallback solver.

---

## 1. Problem Formulation

- **Depot**: School campus gate coordinates (e.g. DPS Gachibowli, Oakridge International).
- **Vehicles**: Heterogeneous fleet of independent auto rickshaws (capacity 3–6) and vans (capacity 6–14).
- **Stops**: Student home pickup/drop locations with demand (1 seat) and optional pickup time windows.
- **Objective**: Minimize total fleet transit time and student commute duration.
- **Constraints**:
  1. Vehicle seating capacity cannot be exceeded.
  2. Maximum student travel time must be $\le 45$ minutes.
  3. School bell times (morning arrival before 08:15 AM, afternoon departure at 15:30 PM).
  4. Curbside halt of 2 minutes per student pickup.
- **Security & Privacy**:
  - Student PII is **never** sent to the optimizer. Only anonymized tokens (`tok_aarav_01`) and GPS coordinates are used.
  - **Human-in-the-loop requirement**: All recommendations are marked `recommendation_only: true` and are **never** published automatically without explicit Operations Admin review and approval.

---

## 2. API Endpoints

### `GET /api/v1/health`
Returns service status, OR-Tools availability, and engine version.

**Response**:
```json
{
  "status": "HEALTHY",
  "service": "tinyride-route-optimizer",
  "ortools_available": true,
  "solver_engine": "Google OR-Tools CVRPTW",
  "timestamp": "2026-09-21T10:00:00Z"
}
```

### `POST /api/v1/optimize`
Generates optimal vehicle-to-stop assignments and ETA timelines.

**Request**:
```json
{
  "run_id": "run-opt-20260921-01",
  "school": {
    "id": "school-dps-01",
    "name": "DPS Gachibowli",
    "location": { "latitude": 17.4194, "longitude": 78.3688 },
    "bell_time": "08:15"
  },
  "shift": "MORNING",
  "vehicles": [
    {
      "id": "veh-auto-01",
      "driver_id": "drv-ramesh-01",
      "vehicle_type": "AUTO",
      "capacity": 4,
      "start_location": { "latitude": 17.4350, "longitude": 78.3600 }
    }
  ],
  "stops": [
    {
      "id": "stop-01",
      "child_token": "tok_aarav_01",
      "location": { "latitude": 17.4380, "longitude": 78.3620 },
      "demand": 1
    }
  ],
  "max_student_ride_time_minutes": 45
}
```

**Response**:
```json
{
  "run_id": "run-opt-20260921-01",
  "status": "OPTIMAL",
  "routes": [
    {
      "vehicle_id": "veh-auto-01",
      "driver_id": "drv-ramesh-01",
      "vehicle_type": "AUTO",
      "vehicle_capacity": 4,
      "assigned_stops_count": 1,
      "seat_utilization_pct": 25.0,
      "total_distance_km": 3.8,
      "total_duration_minutes": 14,
      "stops": [
        {
          "stop_id": "stop-01",
          "child_token": "tok_aarav_01",
          "sequence_index": 1,
          "estimated_arrival_time": "08:01",
          "distance_from_prev_km": 0.5,
          "cumulative_distance_km": 0.5,
          "cumulative_duration_minutes": 4
        }
      ]
    }
  ],
  "unassigned_stop_ids": [],
  "constraint_violations": [],
  "total_fleet_distance_km": 3.8,
  "total_fleet_duration_minutes": 14,
  "average_seat_utilization_pct": 25.0,
  "computation_time_ms": 12,
  "solver_engine": "Google OR-Tools CVRPTW",
  "recommendation_only": true,
  "created_at": "2026-09-21T10:00:01Z"
}
```

---

## 3. Local Development & Testing

```bash
# 1. Navigate to directory
cd services/route-optimizer

# 2. Run unit tests
python3 test_optimizer.py

# 3. Run FastAPI dev server
uvicorn app:app --reload --port 8080
```

---

## 4. Production Deployment

### Docker Container
```bash
docker build -t tinyride/route-optimizer:latest .
docker run -p 8080:8080 tinyride/route-optimizer:latest
```

### Google Cloud Run
```bash
gcloud builds submit --tag gcr.io/dodail-tinyride/route-optimizer
gcloud run deploy route-optimizer \
  --image gcr.io/dodail-tinyride/route-optimizer \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated
```
