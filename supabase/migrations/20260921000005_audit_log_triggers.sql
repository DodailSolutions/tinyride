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
