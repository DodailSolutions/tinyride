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
