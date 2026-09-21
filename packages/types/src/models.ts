import {
  UserRole,
  DriverStatus,
  VehicleType,
  VehicleStatus,
  DocumentType,
  DocumentStatus,
  RouteStatus,
  BookingStatus,
  SubscriptionStatus,
  PaymentStatus,
  PaymentMethod,
  DriverPayoutStatus,
  TripType,
  TripStatus,
  TripEventType,
  IncidentSeverity,
  IncidentStatus,
  SupportTicketStatus,
  SupportTicketPriority,
} from './enums';

export interface Coordinates {
  latitude: number;
  longitude: number;
  address?: string;
  landmark?: string;
}

export interface Profile {
  id: string; // references auth.users
  phone: string;
  full_name: string;
  email?: string | null;
  role: UserRole;
  avatar_url?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface Parent {
  id: string; // references profiles.id
  emergency_contacts: EmergencyContact[];
  alternate_phone?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthorizedGuardian {
  name: string;
  relationship: string;
  phone: string;
  photo_url?: string | null;
}

export interface Child {
  id: string;
  parent_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  school_id: string;
  grade: string;
  section?: string | null;
  roll_number?: string | null;
  home_pickup_location: Coordinates;
  home_drop_location: Coordinates;
  special_instructions?: string | null;
  medical_notes?: string | null;
  authorized_guardians: AuthorizedGuardian[];
  photo_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface School {
  id: string;
  name: string;
  code: string;
  branch_name: string;
  address: string;
  location: Coordinates;
  contact_person: string;
  contact_phone: string;
  morning_bell_time: string; // HH:mm format e.g. "08:15"
  afternoon_bell_time: string; // HH:mm format e.g. "15:30"
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Driver {
  id: string; // references profiles.id
  status: DriverStatus;
  aadhaar_number_masked?: string | null;
  license_number: string;
  license_expiry: string;
  badge_number?: string | null;
  experience_years: number;
  languages: string[];
  police_verification_date?: string | null;
  police_verification_expiry?: string | null;
  verified_at?: string | null;
  verified_by?: string | null;
  rejection_reason?: string | null;
  rating_avg: number;
  total_trips: number;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: string;
  driver_id: string;
  vehicle_type: VehicleType;
  registration_number: string;
  make: string;
  model: string;
  year: number;
  color: string;
  seating_capacity: number; // TS Reg: 4-6 for Auto, 8-12 for Van
  rc_expiry: string;
  fitness_expiry: string;
  insurance_expiry: string;
  puc_expiry: string;
  status: VehicleStatus;
  verified_at?: string | null;
  verified_by?: string | null;
  rejection_reason?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DriverDocument {
  id: string;
  driver_id: string;
  vehicle_id?: string | null;
  document_type: DocumentType;
  document_number?: string | null;
  storage_path: string; // Private Supabase storage bucket key
  expiry_date?: string | null;
  status: DocumentStatus;
  rejection_reason?: string | null;
  ocr_extracted_data?: Record<string, unknown> | null;
  verified_at?: string | null;
  verified_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface RouteStop {
  id: string;
  route_id: string;
  stop_name: string;
  stop_sequence: number;
  location: Coordinates;
  estimated_pickup_time: string; // HH:mm
  estimated_drop_time: string; // HH:mm
  landmark?: string | null;
  created_at: string;
}

export interface Route {
  id: string;
  driver_id: string;
  vehicle_id: string;
  school_id: string;
  route_name: string;
  status: RouteStatus;
  total_capacity: number;
  reserved_seats: number;
  morning_start_time: string; // HH:mm
  morning_arrival_time: string; // HH:mm
  afternoon_pickup_time: string; // HH:mm
  afternoon_end_time: string; // HH:mm
  monthly_base_fee_inr: number;
  stops?: RouteStop[];
  school?: School;
  driver?: Driver & { profile?: Profile };
  vehicle?: Vehicle;
  created_at: string;
  updated_at: string;
}

export interface FareSnapshot {
  monthly_fee_inr: number;
  base_distance_km: number;
  convenience_fee_inr: number;
  tax_inr: number;
  total_amount_inr: number;
  currency: 'INR';
  snapshot_timestamp: string;
}

export interface Booking {
  id: string;
  parent_id: string;
  child_id: string;
  route_id: string;
  pickup_stop_id: string;
  drop_stop_id: string;
  status: BookingStatus;
  start_date: string;
  end_date: string;
  fare_snapshot: FareSnapshot;
  pickup_notes?: string | null;
  cancelled_at?: string | null;
  cancellation_reason?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  parent_id: string;
  booking_id: string;
  billing_cycle_start: string;
  billing_cycle_end: string;
  monthly_amount_inr: number;
  status: SubscriptionStatus;
  next_billing_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  parent_id: string;
  razorpay_order_id: string;
  razorpay_payment_id?: string | null;
  razorpay_signature?: string | null;
  amount_inr: number;
  amount_subunits: number; // paise (INR * 100)
  currency: 'INR';
  status: PaymentStatus;
  payment_method?: PaymentMethod | null;
  error_code?: string | null;
  error_description?: string | null;
  refund_id?: string | null;
  refund_amount_inr?: number | null;
  webhook_processed_at?: string | null;
  idempotency_key: string;
  created_at: string;
  updated_at: string;
}

export interface DriverPayout {
  id: string;
  driver_id: string;
  route_id: string;
  period_start: string;
  period_end: string;
  total_trips_completed: number;
  gross_earnings_inr: number;
  platform_fee_inr: number;
  net_payout_inr: number;
  status: DriverPayoutStatus;
  payout_reference?: string | null;
  processed_at?: string | null;
  created_at: string;
}

export interface Trip {
  id: string;
  route_id: string;
  driver_id: string;
  vehicle_id: string;
  trip_type: TripType;
  scheduled_date: string; // YYYY-MM-DD
  scheduled_start_time: string; // HH:mm
  actual_start_time?: string | null;
  actual_end_time?: string | null;
  status: TripStatus;
  total_children_expected: number;
  total_children_picked: number;
  total_children_dropped: number;
  created_at: string;
  updated_at: string;
}

export interface TripEvent {
  id: string;
  trip_id: string;
  child_id?: string | null;
  event_type: TripEventType;
  idempotency_key: string; // Unique client UUID
  location: Coordinates;
  recorded_at: string; // Device timestamp
  synced_at: string; // Server ingestion timestamp
  notes?: string | null;
}

export interface Incident {
  id: string;
  trip_id?: string | null;
  reported_by: string; // auth.users.id
  reported_by_role: UserRole;
  severity: IncidentSeverity;
  status: IncidentStatus;
  category: 'VEHICLE_BREAKDOWN' | 'ACCIDENT' | 'CHILD_UNWELL' | 'DELAY' | 'ROUTE_DEVIATION' | 'OTHER';
  description: string;
  location?: Coordinates | null;
  resolution_notes?: string | null;
  resolved_at?: string | null;
  resolved_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupportTicket {
  id: string;
  user_id: string;
  user_role: UserRole;
  booking_id?: string | null;
  subject: string;
  description: string;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  assigned_agent_id?: string | null;
  resolved_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string;
  actor_role: UserRole;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata?: Record<string, unknown> | null;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
}

// ============================================================================
// AI-001 ROUTE OPTIMIZATION TYPES (Google OR-Tools CVRPTW)
// ============================================================================

export type OptimizationSolverStatus = 'OPTIMAL' | 'FEASIBLE' | 'INFEASIBLE';

export type RouteConstraintViolationType =
  | 'CAPACITY_EXCEEDED'
  | 'TIME_WINDOW_MISMATCH'
  | 'MAX_RIDE_TIME_EXCEEDED'
  | 'DRIVER_UNAVAILABLE';

export interface RouteConstraintViolation {
  violation_type: RouteConstraintViolationType;
  severity: 'WARNING' | 'ERROR';
  message: string;
  affected_stop_ids: string[];
  affected_vehicle_id?: string | null;
}

export interface OptimizedStopAssignment {
  stop_id: string;
  child_token: string; // Anonymized token (child PII protected)
  sequence_index: number;
  estimated_arrival_time: string; // HH:MM
  distance_from_prev_km: number;
  cumulative_distance_km: number;
  cumulative_duration_minutes: number;
}

export interface OptimizedRouteResult {
  vehicle_id: string;
  driver_id: string;
  vehicle_type: 'AUTO' | 'VAN';
  vehicle_capacity: number;
  assigned_stops_count: number;
  seat_utilization_pct: number;
  total_distance_km: number;
  total_duration_minutes: number;
  stops: OptimizedStopAssignment[];
}

export interface StudentPickupInput {
  id: string;
  child_token: string; // Anonymized identifier e.g. "tok_aarav_01"
  location: Coordinates;
  demand: number; // usually 1
  time_window_start?: string; // "07:15"
  time_window_end?: string; // "07:45"
}

export interface VehicleOptimizationInput {
  id: string;
  driver_id: string;
  vehicle_type: 'AUTO' | 'VAN';
  capacity: number;
  start_location: Coordinates;
  max_travel_time_minutes?: number;
}

export interface RouteOptimizationRequest {
  run_id: string;
  school_id: string;
  school_name: string;
  school_location: Coordinates;
  bell_time: string; // "08:15"
  shift: 'MORNING' | 'AFTERNOON';
  vehicles: VehicleOptimizationInput[];
  stops: StudentPickupInput[];
  max_student_ride_time_minutes?: number; // default 45
}

export interface RouteOptimizationResponse {
  run_id: string;
  status: OptimizationSolverStatus;
  routes: OptimizedRouteResult[];
  unassigned_stop_ids: string[];
  constraint_violations: RouteConstraintViolation[];
  total_fleet_distance_km: number;
  total_fleet_duration_minutes: number;
  average_seat_utilization_pct: number;
  computation_time_ms: number;
  solver_engine: string; // "Google OR-Tools CVRPTW" or "Heuristic CVRPTW Fallback"
  recommendation_only: true; // Strict non-negotiable guardrail
  created_at: string;
}

export interface RouteRecommendationApproval {
  run_id: string;
  decision: 'APPROVE' | 'REJECT';
  actor_id: string;
  actor_role: UserRole;
  admin_notes?: string;
  published_route_ids?: string[];
  approved_at?: string;
}

// ============================================================================
// AI-004 CUSTOMER SUPPORT ASSISTANT TYPES
// ============================================================================

export interface AIAssistantMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface PermittedUserContext {
  user_id: string;
  user_role: UserRole;
  user_name: string;
  active_bookings: Array<{
    id: string;
    child_name: string;
    school_name: string;
    route_name: string;
    driver_name: string;
    pickup_stop: string;
    monthly_fee_inr: number;
    status: string;
  }>;
  recent_payments: Array<{
    id: string;
    amount_inr: number;
    status: string;
    method: string;
    created_at: string;
  }>;
  active_trip?: {
    trip_id: string;
    route_name: string;
    status: string;
    driver_name: string;
    current_milestone: string;
    last_event_time: string;
  } | null;
}

export interface AIAssistantRequest {
  user_id: string;
  user_role: UserRole;
  message: string;
  conversation_history?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export interface AIAssistantResponse {
  reply: string;
  escalated: boolean;
  escalation_reason?: 'EMERGENCY_SAFETY' | 'REFUND_DISPUTE' | 'UNRESOLVED_AMBIGUITY' | 'UNAUTHORIZED' | null;
  ticket_id?: string | null;
  grounded_facts_used: string[];
  provider_used: string;
  tokens_used: number;
  timestamp: string;
}


