-- ============================================================================
-- TINYRIDE BY DODAIL — DATABASE SCHEMA MIGRATION 001
-- ============================================================================
-- Core Schema: Profiles, Roles, Schools, Vehicles, Drivers, Children,
-- Routes, Bookings, Subscriptions, Payments, Trips, Events, Incidents, Audit.
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. ENUMS
-- ----------------------------------------------------------------------------
CREATE TYPE user_role AS ENUM (
    'parent',
    'driver',
    'operations_admin',
    'super_admin',
    'support_agent'
);

CREATE TYPE driver_status AS ENUM (
    'DRAFT',
    'SUBMITTED',
    'UNDER_REVIEW',
    'VERIFIED',
    'REJECTED',
    'SUSPENDED'
);

CREATE TYPE vehicle_type AS ENUM ('AUTO', 'VAN');

CREATE TYPE vehicle_status AS ENUM (
    'UNVERIFIED',
    'UNDER_REVIEW',
    'VERIFIED',
    'REJECTED',
    'INACTIVE'
);

CREATE TYPE document_type AS ENUM (
    'AADHAAR',
    'DRIVING_LICENSE',
    'BADGE',
    'POLICE_VERIFICATION',
    'VEHICLE_RC',
    'VEHICLE_INSURANCE',
    'VEHICLE_FITNESS',
    'VEHICLE_PUC',
    'VEHICLE_PHOTO_FRONT',
    'VEHICLE_PHOTO_INSIDE'
);

CREATE TYPE document_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TYPE route_status AS ENUM (
    'DRAFT',
    'PENDING_APPROVAL',
    'ACTIVE',
    'INACTIVE',
    'ARCHIVED'
);

CREATE TYPE booking_status AS ENUM (
    'PENDING_PAYMENT',
    'PAYMENT_PROCESSING',
    'CONFIRMED',
    'ACTIVE',
    'PAYMENT_FAILED',
    'EXPIRED',
    'CANCELLED',
    'REFUND_REQUESTED',
    'REFUNDED'
);

CREATE TYPE subscription_status AS ENUM (
    'ACTIVE',
    'PAST_DUE',
    'CANCELLED',
    'EXPIRED'
);

CREATE TYPE payment_status AS ENUM (
    'CREATED',
    'AUTHORIZED',
    'CAPTURED',
    'FAILED',
    'REFUNDED'
);

CREATE TYPE payment_method AS ENUM (
    'UPI',
    'CARD',
    'NETBANKING',
    'WALLET'
);

CREATE TYPE driver_payout_status AS ENUM (
    'PENDING',
    'PROCESSING',
    'TRANSFERRED',
    'FAILED',
    'RECONCILED'
);

CREATE TYPE trip_type AS ENUM ('MORNING_PICKUP', 'AFTERNOON_DROP');

CREATE TYPE trip_status AS ENUM (
    'SCHEDULED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
    'INCIDENT_FLAGGED'
);

CREATE TYPE trip_event_type AS ENUM (
    'TRIP_STARTED',
    'PICKED_UP',
    'DROPPED',
    'ABSENT',
    'TRIP_COMPLETED',
    'INCIDENT_RECORDED'
);

CREATE TYPE incident_severity AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE incident_status AS ENUM ('OPEN', 'INVESTIGATING', 'RESOLVED', 'DISMISSED');
CREATE TYPE support_ticket_status AS ENUM ('OPEN', 'IN_PROGRESS', 'WAITING_ON_USER', 'RESOLVED', 'CLOSED');
CREATE TYPE support_ticket_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- ----------------------------------------------------------------------------
-- 2. CORE USER TABLES & AUTHORIZATION HELPER
-- ----------------------------------------------------------------------------

CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    phone VARCHAR(20) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    role user_role NOT NULL DEFAULT 'parent',
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Security helper to check user role without recursive RLS lookups
CREATE OR REPLACE FUNCTION public.has_role(user_id UUID, VARIADIC roles user_role[])
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = user_id AND role = ANY(roles) AND is_active = true
    );
$$;

-- ----------------------------------------------------------------------------
-- 3. PARENTS & CHILDREN
-- ----------------------------------------------------------------------------

CREATE TABLE public.parents (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    emergency_contacts JSONB NOT NULL DEFAULT '[]'::jsonb,
    alternate_phone VARCHAR(20),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE public.schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    branch_name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL CHECK (latitude BETWEEN -90 AND 90),
    longitude DOUBLE PRECISION NOT NULL CHECK (longitude BETWEEN -180 AND 180),
    contact_person VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    morning_bell_time VARCHAR(5) NOT NULL, -- "HH:mm"
    afternoon_bell_time VARCHAR(5) NOT NULL, -- "HH:mm"
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE public.children (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID NOT NULL REFERENCES public.parents(id) ON DELETE CASCADE,
    first_name VARCHAR(60) NOT NULL,
    last_name VARCHAR(60) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('MALE', 'FEMALE', 'OTHER')),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE RESTRICT,
    grade VARCHAR(30) NOT NULL,
    section VARCHAR(10),
    roll_number VARCHAR(20),
    home_pickup_latitude DOUBLE PRECISION NOT NULL,
    home_pickup_longitude DOUBLE PRECISION NOT NULL,
    home_pickup_address TEXT NOT NULL,
    home_drop_latitude DOUBLE PRECISION NOT NULL,
    home_drop_longitude DOUBLE PRECISION NOT NULL,
    home_drop_address TEXT NOT NULL,
    special_instructions TEXT,
    medical_notes TEXT,
    authorized_guardians JSONB NOT NULL DEFAULT '[]'::jsonb,
    photo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 4. DRIVERS, VEHICLES & DOCUMENTS
-- ----------------------------------------------------------------------------

CREATE TABLE public.drivers (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    status driver_status NOT NULL DEFAULT 'DRAFT',
    aadhaar_number_masked VARCHAR(20),
    license_number VARCHAR(50) NOT NULL,
    license_expiry DATE NOT NULL,
    badge_number VARCHAR(50),
    experience_years INTEGER NOT NULL DEFAULT 1 CHECK (experience_years >= 0),
    languages TEXT[] NOT NULL DEFAULT ARRAY['Telugu', 'Hindi'],
    police_verification_date DATE,
    police_verification_expiry DATE,
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES public.profiles(id),
    rejection_reason TEXT,
    rating_avg NUMERIC(3, 2) NOT NULL DEFAULT 5.00 CHECK (rating_avg BETWEEN 1.0 AND 5.0),
    total_trips INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE public.vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
    vehicle_type vehicle_type NOT NULL,
    registration_number VARCHAR(20) NOT NULL UNIQUE,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INTEGER NOT NULL CHECK (year >= 2005),
    color VARCHAR(30) NOT NULL,
    seating_capacity INTEGER NOT NULL CHECK (seating_capacity BETWEEN 3 AND 16),
    rc_expiry DATE NOT NULL,
    fitness_expiry DATE NOT NULL,
    insurance_expiry DATE NOT NULL,
    puc_expiry DATE NOT NULL,
    status vehicle_status NOT NULL DEFAULT 'UNVERIFIED',
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES public.profiles(id),
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE public.driver_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    document_type document_type NOT NULL,
    document_number VARCHAR(100),
    storage_path TEXT NOT NULL,
    expiry_date DATE,
    status document_status NOT NULL DEFAULT 'PENDING',
    rejection_reason TEXT,
    ocr_extracted_data JSONB,
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 5. ROUTES & STOPS
-- ----------------------------------------------------------------------------

CREATE TABLE public.routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE RESTRICT,
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE RESTRICT,
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE RESTRICT,
    route_name VARCHAR(120) NOT NULL,
    status route_status NOT NULL DEFAULT 'DRAFT',
    total_capacity INTEGER NOT NULL CHECK (total_capacity > 0),
    reserved_seats INTEGER NOT NULL DEFAULT 0 CHECK (reserved_seats >= 0),
    morning_start_time VARCHAR(5) NOT NULL,
    morning_arrival_time VARCHAR(5) NOT NULL,
    afternoon_pickup_time VARCHAR(5) NOT NULL,
    afternoon_end_time VARCHAR(5) NOT NULL,
    monthly_base_fee_inr NUMERIC(10, 2) NOT NULL CHECK (monthly_base_fee_inr > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT check_capacity_not_exceeded CHECK (reserved_seats <= total_capacity)
);

CREATE TABLE public.route_stops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
    stop_name VARCHAR(100) NOT NULL,
    stop_sequence INTEGER NOT NULL CHECK (stop_sequence >= 0),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    landmark VARCHAR(150),
    estimated_pickup_time VARCHAR(5) NOT NULL,
    estimated_drop_time VARCHAR(5) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(route_id, stop_sequence)
);

-- ----------------------------------------------------------------------------
-- 6. BOOKINGS, SUBSCRIPTIONS & PAYMENTS
-- ----------------------------------------------------------------------------

CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID NOT NULL REFERENCES public.parents(id) ON DELETE RESTRICT,
    child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE RESTRICT,
    route_id UUID NOT NULL REFERENCES public.routes(id) ON DELETE RESTRICT,
    pickup_stop_id UUID NOT NULL REFERENCES public.route_stops(id) ON DELETE RESTRICT,
    drop_stop_id UUID NOT NULL REFERENCES public.route_stops(id) ON DELETE RESTRICT,
    status booking_status NOT NULL DEFAULT 'PENDING_PAYMENT',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    fare_snapshot JSONB NOT NULL, -- Immutable pricing locked at reservation
    pickup_notes TEXT,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(child_id, route_id, start_date)
);

CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID NOT NULL REFERENCES public.parents(id) ON DELETE RESTRICT,
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE RESTRICT UNIQUE,
    billing_cycle_start DATE NOT NULL,
    billing_cycle_end DATE NOT NULL,
    monthly_amount_inr NUMERIC(10, 2) NOT NULL,
    status subscription_status NOT NULL DEFAULT 'ACTIVE',
    next_billing_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE RESTRICT,
    parent_id UUID NOT NULL REFERENCES public.parents(id) ON DELETE RESTRICT,
    razorpay_order_id VARCHAR(100) NOT NULL UNIQUE,
    razorpay_payment_id VARCHAR(100) UNIQUE,
    razorpay_signature VARCHAR(255),
    amount_inr NUMERIC(10, 2) NOT NULL,
    amount_subunits INTEGER NOT NULL, -- Paise (INR * 100)
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    status payment_status NOT NULL DEFAULT 'CREATED',
    payment_method payment_method,
    error_code VARCHAR(100),
    error_description TEXT,
    refund_id VARCHAR(100),
    refund_amount_inr NUMERIC(10, 2),
    webhook_processed_at TIMESTAMPTZ,
    idempotency_key UUID NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE public.driver_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE RESTRICT,
    route_id UUID NOT NULL REFERENCES public.routes(id) ON DELETE RESTRICT,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_trips_completed INTEGER NOT NULL DEFAULT 0,
    gross_earnings_inr NUMERIC(10, 2) NOT NULL,
    platform_fee_inr NUMERIC(10, 2) NOT NULL,
    net_payout_inr NUMERIC(10, 2) NOT NULL,
    status driver_payout_status NOT NULL DEFAULT 'PENDING',
    payout_reference VARCHAR(100),
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 7. TRIPS & EVENT TRACKING
-- ----------------------------------------------------------------------------

CREATE TABLE public.trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID NOT NULL REFERENCES public.routes(id) ON DELETE RESTRICT,
    driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE RESTRICT,
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE RESTRICT,
    trip_type trip_type NOT NULL,
    scheduled_date DATE NOT NULL,
    scheduled_start_time VARCHAR(5) NOT NULL,
    actual_start_time TIMESTAMPTZ,
    actual_end_time TIMESTAMPTZ,
    status trip_status NOT NULL DEFAULT 'SCHEDULED',
    total_children_expected INTEGER NOT NULL DEFAULT 0,
    total_children_picked INTEGER NOT NULL DEFAULT 0,
    total_children_dropped INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(route_id, scheduled_date, trip_type)
);

CREATE TABLE public.trip_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    child_id UUID REFERENCES public.children(id) ON DELETE CASCADE,
    event_type trip_event_type NOT NULL,
    idempotency_key UUID NOT NULL UNIQUE, -- Device generated UUID prevents duplicates
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL, -- Device timestamp
    synced_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    notes TEXT,
    -- Prevent duplicate milestone for same child in same trip
    UNIQUE(trip_id, child_id, event_type)
);

-- ----------------------------------------------------------------------------
-- 8. INCIDENTS, SUPPORT & AUDIT LOGS
-- ----------------------------------------------------------------------------

CREATE TABLE public.incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES public.trips(id) ON DELETE SET NULL,
    reported_by UUID NOT NULL REFERENCES public.profiles(id),
    reported_by_role user_role NOT NULL,
    severity incident_severity NOT NULL,
    status incident_status NOT NULL DEFAULT 'OPEN',
    category VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    resolution_notes TEXT,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_role user_role NOT NULL,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    subject VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    status support_ticket_status NOT NULL DEFAULT 'OPEN',
    priority support_ticket_priority NOT NULL DEFAULT 'MEDIUM',
    assigned_agent_id UUID REFERENCES public.profiles(id),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES auth.users(id),
    actor_role user_role,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(60) NOT NULL,
    entity_id UUID NOT NULL,
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 9. PERFORMANCE INDEXES
-- ----------------------------------------------------------------------------
CREATE INDEX idx_children_parent ON public.children(parent_id);
CREATE INDEX idx_children_school ON public.children(school_id);
CREATE INDEX idx_vehicles_driver ON public.vehicles(driver_id);
CREATE INDEX idx_driver_docs_driver ON public.driver_documents(driver_id);
CREATE INDEX idx_routes_driver ON public.routes(driver_id);
CREATE INDEX idx_routes_school ON public.routes(school_id);
CREATE INDEX idx_routes_status ON public.routes(status);
CREATE INDEX idx_route_stops_route ON public.route_stops(route_id);
CREATE INDEX idx_bookings_parent ON public.bookings(parent_id);
CREATE INDEX idx_bookings_child ON public.bookings(child_id);
CREATE INDEX idx_bookings_route ON public.bookings(route_id);
CREATE INDEX idx_payments_booking ON public.payments(booking_id);
CREATE INDEX idx_payments_order ON public.payments(razorpay_order_id);
CREATE INDEX idx_trips_route_date ON public.trips(route_id, scheduled_date);
CREATE INDEX idx_trip_events_trip ON public.trip_events(trip_id);
CREATE INDEX idx_audit_entity ON public.audit_logs(entity_type, entity_id);
