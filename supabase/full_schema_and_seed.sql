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
-- ============================================================================
-- TINYRIDE BY DODAIL — DATABASE SCHEMA MIGRATION 002
-- ============================================================================
-- Row Level Security (RLS) Policies, Triggers & Auth Automation
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 2. AUTOMATED UPDATED_AT TRIGGER
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_parents_updated_at BEFORE UPDATE ON public.parents FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_schools_updated_at BEFORE UPDATE ON public.schools FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_children_updated_at BEFORE UPDATE ON public.children FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_drivers_updated_at BEFORE UPDATE ON public.drivers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_vehicles_updated_at BEFORE UPDATE ON public.vehicles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_driver_documents_updated_at BEFORE UPDATE ON public.driver_documents FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_routes_updated_at BEFORE UPDATE ON public.routes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_trips_updated_at BEFORE UPDATE ON public.trips FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_incidents_updated_at BEFORE UPDATE ON public.incidents FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_support_tickets_updated_at BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 3. USER ONBOARDING TRIGGER (SUPABASE AUTH INTEGRATION)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    requested_role user_role := 'parent';
BEGIN
    -- Extract requested role if provided in user metadata, default to 'parent'
    IF (NEW.raw_user_meta_data->>'role') IS NOT NULL THEN
        requested_role := (NEW.raw_user_meta_data->>'role')::user_role;
    END IF;

    -- Note: Only 'parent' and 'driver' can self-select role during signup.
    -- Admin roles cannot be provisioned client-side.
    IF requested_role NOT IN ('parent', 'driver') THEN
        requested_role := 'parent';
    END IF;

    INSERT INTO public.profiles (id, phone, full_name, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.phone, NEW.raw_user_meta_data->>'phone', 'UNKNOWN'),
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'User ' || substring(NEW.id::text, 1, 6)),
        requested_role
    );

    IF requested_role = 'parent' THEN
        INSERT INTO public.parents (id) VALUES (NEW.id);
    ELSIF requested_role = 'driver' THEN
        INSERT INTO public.drivers (id, license_number, license_expiry)
        VALUES (NEW.id, 'PENDING_ONBOARDING', CURRENT_DATE + INTERVAL '1 year');
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------

-- PROFILES
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR public.has_role(auth.uid(), 'operations_admin', 'super_admin'));

CREATE POLICY "Users can update their own profile details"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

-- PARENTS
CREATE POLICY "Parents can view and update their own record"
    ON public.parents FOR ALL
    USING (auth.uid() = id OR public.has_role(auth.uid(), 'operations_admin', 'super_admin'));

-- SCHOOLS
CREATE POLICY "Schools are viewable by all authenticated users"
    ON public.schools FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Schools can only be managed by admins"
    ON public.schools FOR ALL
    USING (public.has_role(auth.uid(), 'operations_admin', 'super_admin'));

-- CHILDREN (Strict Child Privacy Policy)
CREATE POLICY "Parents can manage their own children"
    ON public.children FOR ALL
    USING (parent_id = auth.uid() OR public.has_role(auth.uid(), 'operations_admin', 'super_admin'));

CREATE POLICY "Assigned drivers can view children on their active routes"
    ON public.children FOR SELECT
    USING (
        id IN (
            SELECT b.child_id FROM public.bookings b
            JOIN public.routes r ON b.route_id = r.id
            WHERE r.driver_id = auth.uid() AND b.status IN ('CONFIRMED', 'ACTIVE')
        )
    );

-- DRIVERS
CREATE POLICY "Drivers can view and edit their own record"
    ON public.drivers FOR SELECT
    USING (id = auth.uid() OR status = 'VERIFIED' OR public.has_role(auth.uid(), 'operations_admin', 'super_admin'));

CREATE POLICY "Drivers can update their own draft details"
    ON public.drivers FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (
        id = auth.uid() AND (
            -- Drivers cannot mark themselves VERIFIED or SUSPENDED
            status NOT IN ('VERIFIED', 'SUSPENDED') OR
            status = (SELECT status FROM public.drivers WHERE id = auth.uid())
        )
    );

CREATE POLICY "Admins can manage drivers"
    ON public.drivers FOR ALL
    USING (public.has_role(auth.uid(), 'operations_admin', 'super_admin'));

-- VEHICLES
CREATE POLICY "Drivers can manage their own vehicles"
    ON public.vehicles FOR ALL
    USING (driver_id = auth.uid() OR public.has_role(auth.uid(), 'operations_admin', 'super_admin'));

-- DRIVER DOCUMENTS
CREATE POLICY "Drivers can view and upload their own documents"
    ON public.driver_documents FOR ALL
    USING (driver_id = auth.uid() OR public.has_role(auth.uid(), 'operations_admin', 'super_admin'));

-- ROUTES & STOPS
CREATE POLICY "Published routes are discoverable by authenticated users"
    ON public.routes FOR SELECT
    USING (status = 'ACTIVE' OR driver_id = auth.uid() OR public.has_role(auth.uid(), 'operations_admin', 'super_admin'));

CREATE POLICY "Drivers can propose routes"
    ON public.routes FOR INSERT
    WITH CHECK (driver_id = auth.uid());

CREATE POLICY "Admins can manage all routes"
    ON public.routes FOR ALL
    USING (public.has_role(auth.uid(), 'operations_admin', 'super_admin'));

CREATE POLICY "Route stops viewable with routes"
    ON public.route_stops FOR SELECT
    USING (
        route_id IN (
            SELECT id FROM public.routes
            WHERE status = 'ACTIVE' OR driver_id = auth.uid() OR public.has_role(auth.uid(), 'operations_admin', 'super_admin')
        )
    );

-- BOOKINGS
CREATE POLICY "Parents can view and create their bookings"
    ON public.bookings FOR SELECT
    USING (parent_id = auth.uid() OR route_id IN (SELECT id FROM public.routes WHERE driver_id = auth.uid()) OR public.has_role(auth.uid(), 'operations_admin', 'super_admin'));

CREATE POLICY "Parents can insert bookings for their own children"
    ON public.bookings FOR INSERT
    WITH CHECK (parent_id = auth.uid());

-- SUBSCRIPTIONS & PAYMENTS
CREATE POLICY "Parents can view their subscriptions"
    ON public.subscriptions FOR SELECT
    USING (parent_id = auth.uid() OR public.has_role(auth.uid(), 'operations_admin', 'super_admin'));

CREATE POLICY "Parents can view their payments"
    ON public.payments FOR SELECT
    USING (parent_id = auth.uid() OR public.has_role(auth.uid(), 'operations_admin', 'super_admin'));

-- TRIPS & TRIP EVENTS
CREATE POLICY "Trips viewable by assigned drivers and parents with active bookings"
    ON public.trips FOR SELECT
    USING (
        driver_id = auth.uid() OR
        route_id IN (SELECT route_id FROM public.bookings WHERE parent_id = auth.uid() AND status IN ('CONFIRMED', 'ACTIVE')) OR
        public.has_role(auth.uid(), 'operations_admin', 'super_admin')
    );

CREATE POLICY "Drivers can manage their trips"
    ON public.trips FOR UPDATE
    USING (driver_id = auth.uid() OR public.has_role(auth.uid(), 'operations_admin', 'super_admin'));

CREATE POLICY "Trip events viewable by trip driver and affected parents"
    ON public.trip_events FOR SELECT
    USING (
        trip_id IN (SELECT id FROM public.trips WHERE driver_id = auth.uid()) OR
        child_id IN (SELECT id FROM public.children WHERE parent_id = auth.uid()) OR
        public.has_role(auth.uid(), 'operations_admin', 'super_admin')
    );

CREATE POLICY "Assigned drivers can insert trip events"
    ON public.trip_events FOR INSERT
    WITH CHECK (
        trip_id IN (SELECT id FROM public.trips WHERE driver_id = auth.uid())
    );

-- INCIDENTS & SUPPORT TICKETS
CREATE POLICY "Incidents viewable by reporter, assigned driver, or admin"
    ON public.incidents FOR SELECT
    USING (reported_by = auth.uid() OR public.has_role(auth.uid(), 'operations_admin', 'super_admin'));

CREATE POLICY "Users can report incidents"
    ON public.incidents FOR INSERT
    WITH CHECK (reported_by = auth.uid());

CREATE POLICY "Support tickets viewable by creator or admin"
    ON public.support_tickets FOR ALL
    USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'operations_admin', 'super_admin', 'support_agent'));

-- AUDIT LOGS (Read-only for Admins)
CREATE POLICY "Audit logs readable by super admin only"
    ON public.audit_logs FOR SELECT
    USING (public.has_role(auth.uid(), 'super_admin'));
-- ============================================================================
-- TINYRIDE BY DODAIL — DATABASE SCHEMA MIGRATION 003
-- ============================================================================
-- Concurrency-Safe Seat Reservations & Atomic Seat Management RPCs
-- ============================================================================

-- Function to atomically increment reserved seats
CREATE OR REPLACE FUNCTION public.increment_route_reserved_seats(target_route_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_reserved INTEGER;
    capacity INTEGER;
BEGIN
    -- Acquire exclusive row lock on the route
    SELECT reserved_seats, total_capacity
    INTO current_reserved, capacity
    FROM public.routes
    WHERE id = target_route_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Route not found';
    END IF;

    IF current_reserved >= capacity THEN
        RAISE EXCEPTION 'Route capacity exceeded. No seats available.';
    END IF;

    UPDATE public.routes
    SET reserved_seats = reserved_seats + 1
    WHERE id = target_route_id;

    RETURN true;
END;
$$;

-- Function to atomically decrement reserved seats upon cancellation or expiration
CREATE OR REPLACE FUNCTION public.decrement_route_reserved_seats(target_route_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.routes
    SET reserved_seats = GREATEST(0, reserved_seats - 1)
    WHERE id = target_route_id;

    RETURN true;
END;
$$;
-- ============================================================================
-- TINYRIDE BY DODAIL — DATABASE SCHEMA MIGRATION 004
-- ============================================================================
-- Content Management System (CMS), SEO Settings, FAQs, Articles, Leads
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. CMS ENUMS
-- ----------------------------------------------------------------------------
CREATE TYPE cms_lead_type AS ENUM ('PARENT', 'DRIVER', 'SCHOOL');
CREATE TYPE cms_lead_status AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'ARCHIVED');

-- ----------------------------------------------------------------------------
-- 2. CMS SETTINGS & GLOBAL SEO
-- ----------------------------------------------------------------------------
CREATE TABLE public.cms_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_title VARCHAR(150) NOT NULL DEFAULT 'TinyRide by Dodail — School Transport Platform Hyderabad',
    meta_description TEXT NOT NULL DEFAULT 'Safe, verified, and transparent school auto & van transport in Hyderabad. Real-time child tracking, police-verified drivers, and simple monthly payments.',
    keywords TEXT[] NOT NULL DEFAULT ARRAY['school transport hyderabad', 'school van gachibowli', 'school auto begumpet', 'child safety transport', 'tinyride dodail'],
    canonical_url VARCHAR(255) NOT NULL DEFAULT 'https://tinyride.in',
    og_image_url VARCHAR(255) NOT NULL DEFAULT 'https://tinyride.in/og-image.jpg',
    contact_phone VARCHAR(30) NOT NULL DEFAULT '+91 40 4567 8900',
    contact_email VARCHAR(100) NOT NULL DEFAULT 'support@dodail.com',
    pilot_city VARCHAR(50) NOT NULL DEFAULT 'Hyderabad, Telangana, India',
    office_address TEXT NOT NULL DEFAULT 'Cyber Towers, Hitec City, Hyderabad, Telangana 500081',
    google_site_verification VARCHAR(100),
    is_live BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 3. CMS FAQS (SEO RICH SNIPPETS)
-- ----------------------------------------------------------------------------
CREATE TABLE public.cms_faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(50) NOT NULL DEFAULT 'General',
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 4. CMS ARTICLES & SAFETY GUIDES (SEO BLOG)
-- ----------------------------------------------------------------------------
CREATE TABLE public.cms_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(150) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(60) NOT NULL DEFAULT 'Child Safety',
    cover_image_url TEXT,
    author_name VARCHAR(100) NOT NULL DEFAULT 'Dodail Safety Committee',
    reading_time_minutes INTEGER NOT NULL DEFAULT 3,
    meta_title VARCHAR(150),
    meta_description TEXT,
    is_published BOOLEAN NOT NULL DEFAULT true,
    published_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 5. CMS TESTIMONIALS
-- ----------------------------------------------------------------------------
CREATE TABLE public.cms_testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_name VARCHAR(100) NOT NULL,
    relationship VARCHAR(60) NOT NULL DEFAULT 'Parent',
    child_info VARCHAR(100) NOT NULL,
    school_name VARCHAR(120) NOT NULL,
    rating INTEGER NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
    quote TEXT NOT NULL,
    area VARCHAR(60) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 6. CMS LEADS & WAITLIST INQUIRIES
-- ----------------------------------------------------------------------------
CREATE TABLE public.cms_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_type cms_lead_type NOT NULL DEFAULT 'PARENT',
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    area VARCHAR(100) NOT NULL,
    school_name VARCHAR(150),
    child_grade VARCHAR(50),
    vehicle_type vehicle_type,
    notes TEXT,
    status cms_lead_status NOT NULL DEFAULT 'NEW',
    ip_address INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 7. RLS POLICIES FOR CMS
-- ----------------------------------------------------------------------------
ALTER TABLE public.cms_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_leads ENABLE ROW LEVEL SECURITY;

-- Public read for published content
CREATE POLICY "Public can read live cms settings" ON public.cms_settings FOR SELECT USING (is_live = true);
CREATE POLICY "Public can read active faqs" ON public.cms_faqs FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read published articles" ON public.cms_articles FOR SELECT USING (is_published = true);
CREATE POLICY "Public can read active testimonials" ON public.cms_testimonials FOR SELECT USING (is_active = true);

-- Public can submit lead inquiries
CREATE POLICY "Public can insert lead inquiries" ON public.cms_leads FOR INSERT WITH CHECK (true);

-- Admin full access
CREATE POLICY "Admins have full access to cms settings" ON public.cms_settings FOR ALL USING (public.has_role(auth.uid(), 'operations_admin', 'super_admin'));
CREATE POLICY "Admins have full access to cms faqs" ON public.cms_faqs FOR ALL USING (public.has_role(auth.uid(), 'operations_admin', 'super_admin'));
CREATE POLICY "Admins have full access to cms articles" ON public.cms_articles FOR ALL USING (public.has_role(auth.uid(), 'operations_admin', 'super_admin'));
CREATE POLICY "Admins have full access to cms testimonials" ON public.cms_testimonials FOR ALL USING (public.has_role(auth.uid(), 'operations_admin', 'super_admin'));
CREATE POLICY "Admins have full access to cms leads" ON public.cms_leads FOR ALL USING (public.has_role(auth.uid(), 'operations_admin', 'super_admin'));

-- ----------------------------------------------------------------------------
-- 8. SEED CMS DATA (Hyderabad Specific)
-- ----------------------------------------------------------------------------
INSERT INTO public.cms_settings (site_title, meta_description, canonical_url)
VALUES (
    'TinyRide by Dodail — Trusted School Transport Platform in Hyderabad',
    'Connecting Hyderabad parents with police-verified school auto & van drivers. Real-time boarding alerts, transparent monthly pricing, and strict seat capacity limits for DPS, Oakridge, HPS, and Glendale.',
    'https://tinyride.in'
);

INSERT INTO public.cms_faqs (category, question, answer, display_order)
VALUES
    ('Safety & Drivers', 'How are TinyRide school drivers verified in Hyderabad?', 'Every driver undergoes an exhaustive 4-step verification process: (1) Commercial Transport Driving License validation with Telangana RTA, (2) Telangana Police Clearance Certificate (PCC), (3) Annual Vehicle Fitness Certificate (FC) and commercial insurance check, and (4) Personal interview and road safety audit by Dodail Operations.', 1),
    ('Safety & Drivers', 'Are vehicles allowed to carry excess students?', 'Strictly NO. TinyRide strictly enforces local transport regulations: maximum 4-6 children in an Auto-rickshaw and 8-12 children in a school van. Our automated booking system prevents overselling seats.', 2),
    ('Bookings & Payments', 'How does monthly payment work?', 'Parents pay a transparent monthly fee online via Razorpay (UPI, Google Pay, PhonePe, Debit/Credit cards, or NetBanking). No cash handling or sudden fare hikes.', 3),
    ('Trip Tracking', 'How do parents know their child arrived safely at school?', 'Parents receive real-time notifications when the morning trip begins, when their child is picked up at the gate, and when the driver confirms safe handover at the school gate.', 4),
    ('Coverage & Routes', 'Which areas in Hyderabad does TinyRide cover?', 'Our initial pilot focuses on Gachibowli, Kondapur, Madhapur, Manikonda, Puppalguda, Begumpet, and Sun City, servicing partner schools like DPS Gachibowli, Oakridge International, HPS Begumpet, and Glendale Academy.', 5);

INSERT INTO public.cms_testimonials (author_name, relationship, child_info, school_name, rating, quote, area)
VALUES
    ('Pooja Deshmukh', 'Mother', 'Aarav (Grade 3)', 'DPS Gachibowli', 5, 'Before TinyRide, we were always anxious about whether our regular auto driver would turn up on time. The real-time pickup alerts give us total peace of mind every single morning!', 'Kondapur'),
    ('K. V. S. Murthy', 'Father', 'Sanya (Grade 5)', 'Oakridge International', 5, 'Clean vehicles, verified drivers who do not use their phones while driving, and transparent monthly UPI payments. Exactly what Hyderabad parents needed.', 'Manikonda'),
    ('Dr. Farhan Ali', 'Parent & Pediatrician', 'Zain (Grade 2)', 'Glendale Academy', 5, 'The strict seat limits was what convinced me. No overcrowding, polite driver, and prompt customer support.', 'Sun City');

INSERT INTO public.cms_articles (slug, title, excerpt, content, category, meta_title, meta_description)
VALUES
    ('hyderabad-school-transport-safety-rules-2026',
     'Telangana School Vehicle Safety Guidelines: What Every Hyderabad Parent Must Know',
     'A comprehensive guide to commercial driver badges, vehicle fitness certificates, and student capacity limits under Telangana RTA rules.',
     'School transportation safety is the highest priority for every parent in Hyderabad. Under the latest Telangana Motor Vehicles Rules and Supreme Court school transport guidelines, commercial auto-rickshaws carrying schoolchildren cannot exceed 6 children, while school vans must adhere strictly to their permitted RTA capacity. In this article, Dodail Solutions breaks down the essential legal checklists every parent should verify...',
     'Parent Safety Guide',
     'Telangana School Transport Safety Rules 2026 — Parent Guide',
     'Learn about Telangana RTA rules for school autos and vans in Hyderabad: capacity limits, police verification, and commercial driver licenses.'),
    ('how-tinyride-protects-student-data',
     'Child Privacy in School Logistics: How TinyRide Protects Student Locations',
     'Why public GPS links and unsecured group chats compromise child safety, and how our strict Row Level Security (RLS) keeps your child data private.',
     'In today’s connected world, sharing your child’s live location or school routine in unmoderated WhatsApp groups or public tracking links exposes sensitive private data. TinyRide was built from day one under the Digital Personal Data Protection Act (DPDPA 2023). Drivers only access passenger details for their assigned route, and location data is never made public...',
     'Privacy & Technology',
     'Child Privacy in School Logistics — TinyRide Safety Architecture',
     'How TinyRide uses enterprise PostgreSQL Row Level Security and encrypted streams to protect Hyderabad school children data.');
-- ============================================================================
-- TINYRIDE BY DODAIL — HYDERABAD PILOT SEED DATA
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. PILOT SCHOOLS (Hyderabad Core Education Hubs)
-- ----------------------------------------------------------------------------

INSERT INTO public.schools (id, name, code, branch_name, address, latitude, longitude, contact_person, contact_phone, morning_bell_time, afternoon_bell_time, is_active)
VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'Delhi Public School (DPS)',
    'DPS-GACHIBOWLI',
    'Gachibowli Campus',
    'Survey No. 74, Khajaguda Village, Golconda Post, Gachibowli, Hyderabad, Telangana 500008',
    17.4194,
    78.3688,
    'Transport Coordinator - Mr. Satyanarayana',
    '+919849012345',
    '08:15',
    '15:15',
    true
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Oakridge International School',
    'OAKRIDGE-GACHIBOWLI',
    'Einstein Campus',
    'Nanakramguda Road, Cyberabad, Khajaguda, Manikonda, Hyderabad, Telangana 500008',
    17.4116,
    78.3582,
    'Transport Desk - Ms. Radhika V',
    '+919849067890',
    '08:30',
    '15:30',
    true
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'The Hyderabad Public School',
    'HPS-BEGUMPET',
    'Begumpet Heritage Campus',
    '1-11-87 & 88, S.P. Road, Begumpet, Hyderabad, Telangana 500016',
    17.4435,
    78.4728,
    'Admin Office - Mr. K. Rao',
    '+919849054321',
    '08:00',
    '14:45',
    true
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    'Glendale Academy International',
    'GLENDALE-SUNCITY',
    'Sun City Campus',
    'Beside Sun City, Artry Road, Bandlaguda Jagir, Hyderabad, Telangana 500086',
    17.3627,
    78.3972,
    'Safety & Fleet Lead - Mr. Imran Khan',
    '+919849098765',
    '08:20',
    '15:10',
    true
  )
ON CONFLICT (id) DO NOTHING;
-- ============================================================================
-- TINYRIDE BY DODAIL — DATABASE SCHEMA MIGRATION 005
-- ============================================================================
-- Audit Log Triggers
-- Generic trigger function that fires on INSERT/UPDATE/DELETE on all sensitive
-- tables and writes an immutable record to public.audit_logs.
-- Actor identity is extracted from the Supabase JWT (auth.uid()).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. GENERIC AUDIT LOG TRIGGER FUNCTION
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.write_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    audit_actor_id   UUID;
    audit_actor_role user_role;
    audit_action     VARCHAR(100);
    audit_entity_id  UUID;
    audit_metadata   JSONB;
BEGIN
    -- Resolve actor; may be NULL for service_role operations
    BEGIN
        audit_actor_id := auth.uid();
    EXCEPTION WHEN OTHERS THEN
        audit_actor_id := NULL;
    END;

    -- Resolve actor role from profiles table (SECURITY DEFINER prevents RLS loop)
    IF audit_actor_id IS NOT NULL THEN
        SELECT role INTO audit_actor_role
        FROM public.profiles
        WHERE id = audit_actor_id;
    END IF;

    -- Map trigger operation to action label
    IF TG_OP = 'INSERT' THEN
        audit_action    := TG_TABLE_NAME || '_CREATED';
        audit_entity_id := NEW.id;
        audit_metadata  := jsonb_build_object(
            'operation', 'INSERT',
            'new',       to_jsonb(NEW)
        );
    ELSIF TG_OP = 'UPDATE' THEN
        audit_action    := TG_TABLE_NAME || '_UPDATED';
        audit_entity_id := NEW.id;
        audit_metadata  := jsonb_build_object(
            'operation', 'UPDATE',
            'old',       to_jsonb(OLD),
            'new',       to_jsonb(NEW)
        );
    ELSIF TG_OP = 'DELETE' THEN
        audit_action    := TG_TABLE_NAME || '_DELETED';
        audit_entity_id := OLD.id;
        audit_metadata  := jsonb_build_object(
            'operation', 'DELETE',
            'old',       to_jsonb(OLD)
        );
    END IF;

    INSERT INTO public.audit_logs (
        actor_id,
        actor_role,
        action,
        entity_type,
        entity_id,
        metadata
    )
    VALUES (
        audit_actor_id,
        audit_actor_role,
        audit_action,
        TG_TABLE_NAME,
        audit_entity_id,
        audit_metadata
    );

    -- Return appropriate row for trigger type
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- 2. ATTACH AUDIT TRIGGERS TO SENSITIVE TABLES
-- Tracks all state-changing operations on core domain tables.
-- ----------------------------------------------------------------------------

-- drivers (status changes: DRAFT → SUBMITTED → UNDER_REVIEW → VERIFIED/REJECTED/SUSPENDED)
CREATE TRIGGER audit_drivers
    AFTER INSERT OR UPDATE OR DELETE ON public.drivers
    FOR EACH ROW EXECUTE FUNCTION public.write_audit_log();

-- vehicles
CREATE TRIGGER audit_vehicles
    AFTER INSERT OR UPDATE OR DELETE ON public.vehicles
    FOR EACH ROW EXECUTE FUNCTION public.write_audit_log();

-- driver_documents (KYC uploads and review decisions)
CREATE TRIGGER audit_driver_documents
    AFTER INSERT OR UPDATE OR DELETE ON public.driver_documents
    FOR EACH ROW EXECUTE FUNCTION public.write_audit_log();

-- routes (DRAFT → PENDING_APPROVAL → ACTIVE)
CREATE TRIGGER audit_routes
    AFTER INSERT OR UPDATE OR DELETE ON public.routes
    FOR EACH ROW EXECUTE FUNCTION public.write_audit_log();

-- bookings (payment and cancellation lifecycle)
CREATE TRIGGER audit_bookings
    AFTER INSERT OR UPDATE OR DELETE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION public.write_audit_log();

-- payments (Razorpay webhook-driven transitions; CREATED → CAPTURED / REFUNDED)
CREATE TRIGGER audit_payments
    AFTER INSERT OR UPDATE OR DELETE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION public.write_audit_log();

-- driver_payouts (financial ledger)
CREATE TRIGGER audit_driver_payouts
    AFTER INSERT OR UPDATE OR DELETE ON public.driver_payouts
    FOR EACH ROW EXECUTE FUNCTION public.write_audit_log();

-- trips (trip lifecycle)
CREATE TRIGGER audit_trips
    AFTER INSERT OR UPDATE OR DELETE ON public.trips
    FOR EACH ROW EXECUTE FUNCTION public.write_audit_log();

-- incidents (safety-critical events)
CREATE TRIGGER audit_incidents
    AFTER INSERT OR UPDATE OR DELETE ON public.incidents
    FOR EACH ROW EXECUTE FUNCTION public.write_audit_log();

-- support_tickets
CREATE TRIGGER audit_support_tickets
    AFTER INSERT OR UPDATE OR DELETE ON public.support_tickets
    FOR EACH ROW EXECUTE FUNCTION public.write_audit_log();

-- ----------------------------------------------------------------------------
-- 3. PRIVILEGED ACTION RPC — write_privileged_audit_log
-- Called explicitly by Edge Functions / Next.js Server Actions for high-fidelity
-- admin actions that need ip_address and user_agent captured.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.write_privileged_audit_log(
    p_actor_id    UUID,
    p_actor_role  user_role,
    p_action      VARCHAR,
    p_entity_type VARCHAR,
    p_entity_id   UUID,
    p_metadata    JSONB    DEFAULT NULL,
    p_ip_address  INET     DEFAULT NULL,
    p_user_agent  TEXT     DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_id UUID;
BEGIN
    INSERT INTO public.audit_logs (
        actor_id, actor_role, action, entity_type,
        entity_id, metadata, ip_address, user_agent
    )
    VALUES (
        p_actor_id, p_actor_role, p_action, p_entity_type,
        p_entity_id, p_metadata, p_ip_address, p_user_agent
    )
    RETURNING id INTO new_id;

    RETURN new_id;
END;
$$;
