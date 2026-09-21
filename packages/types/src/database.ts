/**
 * TinyRide by Dodail — Database Row Types
 *
 * These interfaces map 1-to-1 with PostgreSQL table columns as returned by
 * the Supabase PostgREST API (snake_case, nullable columns are `T | null`).
 *
 * They are intentionally separate from the domain `models.ts` interfaces
 * which use camelCase-friendly nested structures for application code.
 *
 * Source of truth: supabase/migrations/20260921000001_initial_schema.sql
 */

// ============================================================================
// ENUMS (PostgreSQL enum literal values)
// ============================================================================

export type DbUserRole =
  | 'parent'
  | 'driver'
  | 'operations_admin'
  | 'super_admin'
  | 'support_agent';

export type DbDriverStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'VERIFIED'
  | 'REJECTED'
  | 'SUSPENDED';

export type DbVehicleType = 'AUTO' | 'VAN';

export type DbVehicleStatus =
  | 'UNVERIFIED'
  | 'UNDER_REVIEW'
  | 'VERIFIED'
  | 'REJECTED'
  | 'INACTIVE';

export type DbDocumentType =
  | 'AADHAAR'
  | 'DRIVING_LICENSE'
  | 'BADGE'
  | 'POLICE_VERIFICATION'
  | 'VEHICLE_RC'
  | 'VEHICLE_INSURANCE'
  | 'VEHICLE_FITNESS'
  | 'VEHICLE_PUC'
  | 'VEHICLE_PHOTO_FRONT'
  | 'VEHICLE_PHOTO_INSIDE';

export type DbDocumentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type DbRouteStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'ACTIVE'
  | 'INACTIVE'
  | 'ARCHIVED';

export type DbBookingStatus =
  | 'PENDING_PAYMENT'
  | 'PAYMENT_PROCESSING'
  | 'CONFIRMED'
  | 'ACTIVE'
  | 'PAYMENT_FAILED'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'REFUND_REQUESTED'
  | 'REFUNDED';

export type DbSubscriptionStatus = 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'EXPIRED';

export type DbPaymentStatus =
  | 'CREATED'
  | 'AUTHORIZED'
  | 'CAPTURED'
  | 'FAILED'
  | 'REFUNDED';

export type DbPaymentMethod = 'UPI' | 'CARD' | 'NETBANKING' | 'WALLET';

export type DbDriverPayoutStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'TRANSFERRED'
  | 'FAILED'
  | 'RECONCILED';

export type DbTripType = 'MORNING_PICKUP' | 'AFTERNOON_DROP';

export type DbTripStatus =
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'INCIDENT_FLAGGED';

export type DbTripEventType =
  | 'TRIP_STARTED'
  | 'PICKED_UP'
  | 'DROPPED'
  | 'ABSENT'
  | 'TRIP_COMPLETED'
  | 'INCIDENT_RECORDED';

export type DbIncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type DbIncidentStatus = 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';
export type DbSupportTicketStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'WAITING_ON_USER'
  | 'RESOLVED'
  | 'CLOSED';
export type DbSupportTicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

// ============================================================================
// TABLE ROW TYPES
// ============================================================================

/** public.profiles */
export interface DbProfile {
  id: string;                        // UUID — references auth.users(id)
  phone: string;                     // VARCHAR(20) UNIQUE NOT NULL
  full_name: string;                 // VARCHAR(100) NOT NULL
  email: string | null;              // VARCHAR(255)
  role: DbUserRole;                  // user_role NOT NULL DEFAULT 'parent'
  avatar_url: string | null;         // TEXT
  is_active: boolean;                // BOOLEAN NOT NULL DEFAULT true
  created_at: string;                // TIMESTAMPTZ
  updated_at: string;                // TIMESTAMPTZ
}

/** public.parents */
export interface DbParent {
  id: string;                        // UUID — references profiles(id)
  emergency_contacts: unknown;       // JSONB NOT NULL DEFAULT '[]'
  alternate_phone: string | null;    // VARCHAR(20)
  created_at: string;                // TIMESTAMPTZ
  updated_at: string;                // TIMESTAMPTZ
}

/** public.schools */
export interface DbSchool {
  id: string;                        // UUID DEFAULT gen_random_uuid()
  name: string;                      // VARCHAR(150) NOT NULL
  code: string;                      // VARCHAR(50) UNIQUE NOT NULL
  branch_name: string;               // VARCHAR(100) NOT NULL
  address: string;                   // TEXT NOT NULL
  latitude: number;                  // DOUBLE PRECISION NOT NULL
  longitude: number;                 // DOUBLE PRECISION NOT NULL
  contact_person: string;            // VARCHAR(100) NOT NULL
  contact_phone: string;             // VARCHAR(20) NOT NULL
  morning_bell_time: string;         // VARCHAR(5) NOT NULL e.g. "08:15"
  afternoon_bell_time: string;       // VARCHAR(5) NOT NULL e.g. "15:30"
  is_active: boolean;                // BOOLEAN NOT NULL DEFAULT true
  created_at: string;                // TIMESTAMPTZ
  updated_at: string;                // TIMESTAMPTZ
}

/** public.children */
export interface DbChild {
  id: string;                        // UUID DEFAULT gen_random_uuid()
  parent_id: string;                 // UUID NOT NULL → parents(id)
  first_name: string;                // VARCHAR(60) NOT NULL
  last_name: string;                 // VARCHAR(60) NOT NULL
  date_of_birth: string;             // DATE NOT NULL (YYYY-MM-DD)
  gender: 'MALE' | 'FEMALE' | 'OTHER'; // VARCHAR(10) NOT NULL
  school_id: string;                 // UUID NOT NULL → schools(id)
  grade: string;                     // VARCHAR(30) NOT NULL
  section: string | null;            // VARCHAR(10)
  roll_number: string | null;        // VARCHAR(20)
  home_pickup_latitude: number;      // DOUBLE PRECISION NOT NULL
  home_pickup_longitude: number;     // DOUBLE PRECISION NOT NULL
  home_pickup_address: string;       // TEXT NOT NULL
  home_drop_latitude: number;        // DOUBLE PRECISION NOT NULL
  home_drop_longitude: number;       // DOUBLE PRECISION NOT NULL
  home_drop_address: string;         // TEXT NOT NULL
  special_instructions: string | null; // TEXT
  medical_notes: string | null;      // TEXT
  authorized_guardians: unknown;     // JSONB NOT NULL DEFAULT '[]'
  photo_url: string | null;          // TEXT
  created_at: string;                // TIMESTAMPTZ
  updated_at: string;                // TIMESTAMPTZ
}

/** public.drivers */
export interface DbDriver {
  id: string;                        // UUID — references profiles(id)
  status: DbDriverStatus;            // driver_status NOT NULL DEFAULT 'DRAFT'
  aadhaar_number_masked: string | null; // VARCHAR(20)
  license_number: string;            // VARCHAR(50) NOT NULL
  license_expiry: string;            // DATE NOT NULL
  badge_number: string | null;       // VARCHAR(50)
  experience_years: number;          // INTEGER NOT NULL DEFAULT 1
  languages: string[];               // TEXT[] NOT NULL DEFAULT ARRAY['Telugu', 'Hindi']
  police_verification_date: string | null; // DATE
  police_verification_expiry: string | null; // DATE
  verified_at: string | null;        // TIMESTAMPTZ
  verified_by: string | null;        // UUID → profiles(id)
  rejection_reason: string | null;   // TEXT
  rating_avg: number;                // NUMERIC(3,2) NOT NULL DEFAULT 5.00
  total_trips: number;               // INTEGER NOT NULL DEFAULT 0
  created_at: string;                // TIMESTAMPTZ
  updated_at: string;                // TIMESTAMPTZ
}

/** public.vehicles */
export interface DbVehicle {
  id: string;                        // UUID DEFAULT gen_random_uuid()
  driver_id: string;                 // UUID NOT NULL → drivers(id)
  vehicle_type: DbVehicleType;       // vehicle_type NOT NULL
  registration_number: string;       // VARCHAR(20) UNIQUE NOT NULL
  make: string;                      // VARCHAR(50) NOT NULL
  model: string;                     // VARCHAR(50) NOT NULL
  year: number;                      // INTEGER NOT NULL CHECK >= 2005
  color: string;                     // VARCHAR(30) NOT NULL
  seating_capacity: number;          // INTEGER NOT NULL CHECK BETWEEN 3 AND 16
  rc_expiry: string;                 // DATE NOT NULL
  fitness_expiry: string;            // DATE NOT NULL
  insurance_expiry: string;          // DATE NOT NULL
  puc_expiry: string;                // DATE NOT NULL
  status: DbVehicleStatus;           // vehicle_status NOT NULL DEFAULT 'UNVERIFIED'
  verified_at: string | null;        // TIMESTAMPTZ
  verified_by: string | null;        // UUID → profiles(id)
  rejection_reason: string | null;   // TEXT
  created_at: string;                // TIMESTAMPTZ
  updated_at: string;                // TIMESTAMPTZ
}

/** public.driver_documents */
export interface DbDriverDocument {
  id: string;                        // UUID DEFAULT gen_random_uuid()
  driver_id: string;                 // UUID NOT NULL → drivers(id)
  vehicle_id: string | null;         // UUID → vehicles(id)
  document_type: DbDocumentType;     // document_type NOT NULL
  document_number: string | null;    // VARCHAR(100)
  storage_path: string;              // TEXT NOT NULL (Supabase Storage private key)
  expiry_date: string | null;        // DATE
  status: DbDocumentStatus;          // document_status NOT NULL DEFAULT 'PENDING'
  rejection_reason: string | null;   // TEXT
  ocr_extracted_data: unknown | null; // JSONB
  verified_at: string | null;        // TIMESTAMPTZ
  verified_by: string | null;        // UUID → profiles(id)
  created_at: string;                // TIMESTAMPTZ
  updated_at: string;                // TIMESTAMPTZ
}

/** public.routes */
export interface DbRoute {
  id: string;                        // UUID DEFAULT gen_random_uuid()
  driver_id: string;                 // UUID NOT NULL → drivers(id)
  vehicle_id: string;                // UUID NOT NULL → vehicles(id)
  school_id: string;                 // UUID NOT NULL → schools(id)
  route_name: string;                // VARCHAR(120) NOT NULL
  status: DbRouteStatus;             // route_status NOT NULL DEFAULT 'DRAFT'
  total_capacity: number;            // INTEGER NOT NULL CHECK > 0
  reserved_seats: number;            // INTEGER NOT NULL DEFAULT 0
  morning_start_time: string;        // VARCHAR(5) e.g. "06:30"
  morning_arrival_time: string;      // VARCHAR(5) e.g. "08:00"
  afternoon_pickup_time: string;     // VARCHAR(5) e.g. "15:45"
  afternoon_end_time: string;        // VARCHAR(5) e.g. "17:00"
  monthly_base_fee_inr: number;      // NUMERIC(10,2) NOT NULL CHECK > 0
  created_at: string;                // TIMESTAMPTZ
  updated_at: string;                // TIMESTAMPTZ
}

/** public.route_stops */
export interface DbRouteStop {
  id: string;                        // UUID DEFAULT gen_random_uuid()
  route_id: string;                  // UUID NOT NULL → routes(id)
  stop_name: string;                 // VARCHAR(100) NOT NULL
  stop_sequence: number;             // INTEGER NOT NULL CHECK >= 0
  latitude: number;                  // DOUBLE PRECISION NOT NULL
  longitude: number;                 // DOUBLE PRECISION NOT NULL
  landmark: string | null;           // VARCHAR(150)
  estimated_pickup_time: string;     // VARCHAR(5) NOT NULL
  estimated_drop_time: string;       // VARCHAR(5) NOT NULL
  created_at: string;                // TIMESTAMPTZ
}

/** public.bookings */
export interface DbBooking {
  id: string;                        // UUID DEFAULT gen_random_uuid()
  parent_id: string;                 // UUID NOT NULL → parents(id)
  child_id: string;                  // UUID NOT NULL → children(id)
  route_id: string;                  // UUID NOT NULL → routes(id)
  pickup_stop_id: string;            // UUID NOT NULL → route_stops(id)
  drop_stop_id: string;              // UUID NOT NULL → route_stops(id)
  status: DbBookingStatus;           // booking_status NOT NULL DEFAULT 'PENDING_PAYMENT'
  start_date: string;                // DATE NOT NULL
  end_date: string;                  // DATE NOT NULL
  fare_snapshot: unknown;            // JSONB NOT NULL (immutable pricing)
  pickup_notes: string | null;       // TEXT
  cancelled_at: string | null;       // TIMESTAMPTZ
  cancellation_reason: string | null; // TEXT
  created_at: string;                // TIMESTAMPTZ
  updated_at: string;                // TIMESTAMPTZ
}

/** public.subscriptions */
export interface DbSubscription {
  id: string;                        // UUID DEFAULT gen_random_uuid()
  parent_id: string;                 // UUID NOT NULL → parents(id)
  booking_id: string;                // UUID NOT NULL UNIQUE → bookings(id)
  billing_cycle_start: string;       // DATE NOT NULL
  billing_cycle_end: string;         // DATE NOT NULL
  monthly_amount_inr: number;        // NUMERIC(10,2) NOT NULL
  status: DbSubscriptionStatus;      // subscription_status NOT NULL DEFAULT 'ACTIVE'
  next_billing_date: string | null;  // DATE
  created_at: string;                // TIMESTAMPTZ
  updated_at: string;                // TIMESTAMPTZ
}

/** public.payments */
export interface DbPayment {
  id: string;                        // UUID DEFAULT gen_random_uuid()
  booking_id: string;                // UUID NOT NULL → bookings(id)
  parent_id: string;                 // UUID NOT NULL → parents(id)
  razorpay_order_id: string;         // VARCHAR(100) UNIQUE NOT NULL
  razorpay_payment_id: string | null; // VARCHAR(100) UNIQUE
  razorpay_signature: string | null; // VARCHAR(255)
  amount_inr: number;                // NUMERIC(10,2) NOT NULL
  amount_subunits: number;           // INTEGER NOT NULL (paise)
  currency: string;                  // VARCHAR(10) DEFAULT 'INR'
  status: DbPaymentStatus;           // payment_status NOT NULL DEFAULT 'CREATED'
  payment_method: DbPaymentMethod | null; // payment_method
  error_code: string | null;         // VARCHAR(100)
  error_description: string | null;  // TEXT
  refund_id: string | null;          // VARCHAR(100)
  refund_amount_inr: number | null;  // NUMERIC(10,2)
  webhook_processed_at: string | null; // TIMESTAMPTZ
  idempotency_key: string;           // UUID UNIQUE NOT NULL
  created_at: string;                // TIMESTAMPTZ
  updated_at: string;                // TIMESTAMPTZ
}

/** public.driver_payouts */
export interface DbDriverPayout {
  id: string;                        // UUID DEFAULT gen_random_uuid()
  driver_id: string;                 // UUID NOT NULL → drivers(id)
  route_id: string;                  // UUID NOT NULL → routes(id)
  period_start: string;              // DATE NOT NULL
  period_end: string;                // DATE NOT NULL
  total_trips_completed: number;     // INTEGER NOT NULL DEFAULT 0
  gross_earnings_inr: number;        // NUMERIC(10,2) NOT NULL
  platform_fee_inr: number;          // NUMERIC(10,2) NOT NULL
  net_payout_inr: number;            // NUMERIC(10,2) NOT NULL
  status: DbDriverPayoutStatus;      // driver_payout_status NOT NULL DEFAULT 'PENDING'
  payout_reference: string | null;   // VARCHAR(100)
  processed_at: string | null;       // TIMESTAMPTZ
  created_at: string;                // TIMESTAMPTZ
}

/** public.trips */
export interface DbTrip {
  id: string;                        // UUID DEFAULT gen_random_uuid()
  route_id: string;                  // UUID NOT NULL → routes(id)
  driver_id: string;                 // UUID NOT NULL → drivers(id)
  vehicle_id: string;                // UUID NOT NULL → vehicles(id)
  trip_type: DbTripType;             // trip_type NOT NULL
  scheduled_date: string;            // DATE NOT NULL
  scheduled_start_time: string;      // VARCHAR(5) NOT NULL
  actual_start_time: string | null;  // TIMESTAMPTZ
  actual_end_time: string | null;    // TIMESTAMPTZ
  status: DbTripStatus;              // trip_status NOT NULL DEFAULT 'SCHEDULED'
  total_children_expected: number;   // INTEGER NOT NULL DEFAULT 0
  total_children_picked: number;     // INTEGER NOT NULL DEFAULT 0
  total_children_dropped: number;    // INTEGER NOT NULL DEFAULT 0
  created_at: string;                // TIMESTAMPTZ
  updated_at: string;                // TIMESTAMPTZ
}

/** public.trip_events */
export interface DbTripEvent {
  id: string;                        // UUID DEFAULT gen_random_uuid()
  trip_id: string;                   // UUID NOT NULL → trips(id)
  child_id: string | null;           // UUID → children(id)
  event_type: DbTripEventType;       // trip_event_type NOT NULL
  idempotency_key: string;           // UUID UNIQUE NOT NULL
  latitude: number;                  // DOUBLE PRECISION NOT NULL
  longitude: number;                 // DOUBLE PRECISION NOT NULL
  recorded_at: string;               // TIMESTAMPTZ NOT NULL (device clock)
  synced_at: string;                 // TIMESTAMPTZ NOT NULL DEFAULT now()
  notes: string | null;              // TEXT
}

/** public.incidents */
export interface DbIncident {
  id: string;                        // UUID DEFAULT gen_random_uuid()
  trip_id: string | null;            // UUID → trips(id)
  reported_by: string;               // UUID NOT NULL → profiles(id)
  reported_by_role: DbUserRole;      // user_role NOT NULL
  severity: DbIncidentSeverity;      // incident_severity NOT NULL
  status: DbIncidentStatus;          // incident_status NOT NULL DEFAULT 'OPEN'
  category: string;                  // VARCHAR(50) NOT NULL
  description: string;               // TEXT NOT NULL
  latitude: number | null;           // DOUBLE PRECISION
  longitude: number | null;          // DOUBLE PRECISION
  resolution_notes: string | null;   // TEXT
  resolved_at: string | null;        // TIMESTAMPTZ
  resolved_by: string | null;        // UUID → profiles(id)
  created_at: string;                // TIMESTAMPTZ
  updated_at: string;                // TIMESTAMPTZ
}

/** public.support_tickets */
export interface DbSupportTicket {
  id: string;                        // UUID DEFAULT gen_random_uuid()
  user_id: string;                   // UUID NOT NULL → profiles(id)
  user_role: DbUserRole;             // user_role NOT NULL
  booking_id: string | null;         // UUID → bookings(id)
  subject: string;                   // VARCHAR(200) NOT NULL
  description: string;               // TEXT NOT NULL
  status: DbSupportTicketStatus;     // support_ticket_status NOT NULL DEFAULT 'OPEN'
  priority: DbSupportTicketPriority; // support_ticket_priority NOT NULL DEFAULT 'MEDIUM'
  assigned_agent_id: string | null;  // UUID → profiles(id)
  resolved_at: string | null;        // TIMESTAMPTZ
  created_at: string;                // TIMESTAMPTZ
  updated_at: string;                // TIMESTAMPTZ
}

/** public.audit_logs */
export interface DbAuditLog {
  id: string;                        // UUID DEFAULT gen_random_uuid()
  actor_id: string | null;           // UUID → auth.users(id)
  actor_role: DbUserRole | null;     // user_role
  action: string;                    // VARCHAR(100) NOT NULL
  entity_type: string;               // VARCHAR(60) NOT NULL
  entity_id: string;                 // UUID NOT NULL
  metadata: unknown | null;          // JSONB
  ip_address: string | null;         // INET
  user_agent: string | null;         // TEXT
  created_at: string;                // TIMESTAMPTZ NOT NULL
}

// ============================================================================
// DATABASE SCHEMA HELPER TYPE
// Provides fully typed access to all table rows, mirroring Supabase's
// generated types shape so it can be used with createClient<Database>().
// ============================================================================

export type Database = {
  public: {
    Tables: {
      profiles:        { Row: DbProfile };
      parents:         { Row: DbParent };
      schools:         { Row: DbSchool };
      children:        { Row: DbChild };
      drivers:         { Row: DbDriver };
      vehicles:        { Row: DbVehicle };
      driver_documents: { Row: DbDriverDocument };
      routes:          { Row: DbRoute };
      route_stops:     { Row: DbRouteStop };
      bookings:        { Row: DbBooking };
      subscriptions:   { Row: DbSubscription };
      payments:        { Row: DbPayment };
      driver_payouts:  { Row: DbDriverPayout };
      trips:           { Row: DbTrip };
      trip_events:     { Row: DbTripEvent };
      incidents:       { Row: DbIncident };
      support_tickets: { Row: DbSupportTicket };
      audit_logs:      { Row: DbAuditLog };
    };
    Functions: {
      has_role: {
        Args: { user_id: string; roles: DbUserRole[] };
        Returns: boolean;
      };
      increment_route_reserved_seats: {
        Args: { p_route_id: string; p_booking_id: string };
        Returns: void;
      };
      decrement_route_reserved_seats: {
        Args: { p_route_id: string; p_booking_id: string };
        Returns: void;
      };
      write_privileged_audit_log: {
        Args: {
          p_actor_id: string;
          p_actor_role: DbUserRole;
          p_action: string;
          p_entity_type: string;
          p_entity_id: string;
          p_metadata?: unknown;
          p_ip_address?: string;
          p_user_agent?: string;
        };
        Returns: string;
      };
    };
    Enums: {
      user_role: DbUserRole;
      driver_status: DbDriverStatus;
      vehicle_type: DbVehicleType;
      vehicle_status: DbVehicleStatus;
      document_type: DbDocumentType;
      document_status: DbDocumentStatus;
      route_status: DbRouteStatus;
      booking_status: DbBookingStatus;
      subscription_status: DbSubscriptionStatus;
      payment_status: DbPaymentStatus;
      payment_method: DbPaymentMethod;
      driver_payout_status: DbDriverPayoutStatus;
      trip_type: DbTripType;
      trip_status: DbTripStatus;
      trip_event_type: DbTripEventType;
      incident_severity: DbIncidentSeverity;
      incident_status: DbIncidentStatus;
      support_ticket_status: DbSupportTicketStatus;
      support_ticket_priority: DbSupportTicketPriority;
    };
  };
};
