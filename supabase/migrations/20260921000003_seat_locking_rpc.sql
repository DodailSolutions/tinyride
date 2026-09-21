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
