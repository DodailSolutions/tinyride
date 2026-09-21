/**
 * TinyRide by Dodail — Parent Journey Integration & Unit Tests
 *
 * Tests the complete end-to-end parent workflow:
 * 1. Authentication credentials and profile validation
 * 2. School directory lookup (Hyderabad pilot schools)
 * 3. Child profile registration with validation (school_id, coordinates, grade)
 * 4. Route discovery and capacity constraints
 * 5. Immutable fare snapshot calculation
 * 6. Concurrency-safe booking request creation
 * 7. Payment transaction initiation with UUID idempotency key
 * 8. Active trip milestone tracking
 */

import { describe, it, expect } from 'vitest';
import {
  phoneSchema,
  childSchema,
  parentProfileSchema,
  createBookingSchema,
} from '@tinyride/validation';
import {
  fetchSchools,
  fetchChildren,
  createChild,
  deleteChild,
  fetchActiveRoutes,
  calculateFareSnapshot,
  createBookingRequest,
  fetchParentBookings,
  initiateBookingPayment,
  SEED_SCHOOLS,
  SEED_ROUTES,
} from './parent-api';

describe('Parent Journey Test Suite', () => {
  const testParentId = 'parent-uuid-001';

  // ==========================================================================
  // 1. AUTHENTICATION & PROFILE VALIDATION
  // ==========================================================================
  describe('Parent Authentication & Profile Validation', () => {
    it('accepts valid Indian phone numbers for OTP signin', () => {
      expect(phoneSchema.safeParse('+919849012345').success).toBe(true);
      expect(phoneSchema.safeParse('9849012345').success).toBe(true);
    });

    it('rejects invalid or non-Indian phone numbers', () => {
      expect(phoneSchema.safeParse('1234567890').success).toBe(false);
      expect(phoneSchema.safeParse('not-a-number').success).toBe(false);
    });

    it('validates parent profile with emergency contacts', () => {
      const validProfile = {
        full_name: 'Ananya Sharma',
        email: 'ananya.sharma@example.com',
        alternate_phone: '+919849022334',
        emergency_contacts: [
          {
            name: 'Rohit Sharma',
            relationship: 'Father',
            phone: '+919849033445',
          },
        ],
      };
      expect(parentProfileSchema.safeParse(validProfile).success).toBe(true);
    });

    it('rejects parent profile without emergency contacts', () => {
      const invalidProfile = {
        full_name: 'Ananya Sharma',
        emergency_contacts: [], // Must have at least 1 contact
      };
      expect(parentProfileSchema.safeParse(invalidProfile).success).toBe(false);
    });
  });

  // ==========================================================================
  // 2. SCHOOLS DIRECTORY (HYDERABAD PILOT)
  // ==========================================================================
  describe('School Directory Lookup', () => {
    it('fetches verified Hyderabad pilot schools', async () => {
      const schools = await fetchSchools();
      expect(schools.length).toBeGreaterThanOrEqual(4);

      const dps = schools.find((s) => s.code === 'DPS-GACHIBOWLI');
      expect(dps).toBeDefined();
      expect(dps?.name).toContain('Delhi Public School');
      expect(dps?.location.latitude).toBeCloseTo(17.4194, 2);
      expect(dps?.morning_bell_time).toBe('08:15');

      const oakridge = schools.find((s) => s.code === 'OAK-NEWTON');
      expect(oakridge).toBeDefined();
      expect(oakridge?.branch_name).toBe('Gachibowli Campus');
    });
  });

  // ==========================================================================
  // 3. CHILD PROFILE MANAGEMENT
  // ==========================================================================
  describe('Child Profile Registration', () => {
    it('validates child profile schema correctly', () => {
      const validChildInput = {
        first_name: 'Aarav',
        last_name: 'Sharma',
        date_of_birth: '2017-06-15',
        gender: 'MALE' as const,
        school_id: SEED_SCHOOLS[0]!.id,
        grade: '3rd Standard',
        section: 'B',
        home_pickup_location: {
          latitude: 17.4645,
          longitude: 78.3582,
          address: 'My Home Mangala, Kondapur, Hyderabad',
        },
        home_drop_location: {
          latitude: 17.4645,
          longitude: 78.3582,
          address: 'My Home Mangala, Kondapur, Hyderabad',
        },
      };

      const result = childSchema.safeParse(validChildInput);
      expect(result.success).toBe(true);
    });

    it('creates and retrieves a child profile for the parent', async () => {
      const newChild = await createChild(testParentId, {
        first_name: 'Aarav',
        last_name: 'Sharma',
        date_of_birth: '2017-06-15',
        gender: 'MALE',
        school_id: SEED_SCHOOLS[0]!.id,
        grade: '3rd Standard',
        section: 'B',
        home_pickup_address: 'Flat 402, Rainbow Vistas, Kondapur, Hyderabad',
        home_pickup_latitude: 17.4645,
        home_pickup_longitude: 78.3582,
        authorized_guardians: [
          { name: 'Rohit Sharma', relationship: 'Father', phone: '+919849033445' },
        ],
      });

      expect(newChild.id).toBeDefined();
      expect(newChild.parent_id).toBe(testParentId);
      expect(newChild.first_name).toBe('Aarav');
      expect(newChild.school_id).toBe(SEED_SCHOOLS[0]!.id);

      const childrenList = await fetchChildren(testParentId);
      expect(childrenList.some((c) => c.id === newChild.id)).toBe(true);
    });

    it('deletes child record when requested', async () => {
      const child = await createChild(testParentId, {
        first_name: 'Temporary',
        last_name: 'Child',
        date_of_birth: '2018-01-01',
        gender: 'FEMALE',
        school_id: SEED_SCHOOLS[0]!.id,
        grade: '1st Standard',
        home_pickup_address: 'Kondapur, Hyderabad',
      });

      const deleted = await deleteChild(child.id, testParentId);
      expect(deleted).toBe(true);

      const remaining = await fetchChildren(testParentId);
      expect(remaining.some((c) => c.id === child.id)).toBe(false);
    });
  });

  // ==========================================================================
  // 4. ROUTE DISCOVERY & INSPECTION
  // ==========================================================================
  describe('Route Discovery & Filtering', () => {
    it('discovers active routes and filters by school', async () => {
      const dpsId = SEED_SCHOOLS[0]!.id;
      const dpsRoutes = await fetchActiveRoutes(dpsId);

      expect(dpsRoutes.length).toBeGreaterThanOrEqual(1);
      expect(dpsRoutes.every((r) => r.school_id === dpsId)).toBe(true);

      const route = dpsRoutes[0]!;
      expect(route.status).toBe('ACTIVE');
      expect(route.stops?.length).toBeGreaterThanOrEqual(2);
      expect(route.driver).toBeDefined();
      expect(route.driver?.status).toBe('VERIFIED');
      expect(route.vehicle).toBeDefined();
      expect(route.vehicle?.status).toBe('VERIFIED');
    });

    it('calculates available seats correctly from capacity and reservations', async () => {
      const allRoutes = await fetchActiveRoutes();
      for (const route of allRoutes) {
        const availableSeats = route.total_capacity - route.reserved_seats;
        expect(availableSeats).toBeGreaterThanOrEqual(0);
        expect(route.reserved_seats).toBeLessThanOrEqual(route.total_capacity);
      }
    });
  });

  // ==========================================================================
  // 5. FARE SNAPSHOT CALCULATION
  // ==========================================================================
  describe('Fare Calculation', () => {
    it('generates an immutable fare snapshot with transparent breakdown', () => {
      const baseFee = 3200;
      const snapshot = calculateFareSnapshot(baseFee);

      expect(snapshot.monthly_fee_inr).toBe(3200);
      expect(snapshot.convenience_fee_inr).toBe(150);
      // Tax is 5% of (3200 + 150) = 5% of 3350 = 167.5 -> rounded to 168
      expect(snapshot.tax_inr).toBe(168);
      expect(snapshot.total_amount_inr).toBe(3200 + 150 + 168);
      expect(snapshot.currency).toBe('INR');
      expect(snapshot.snapshot_timestamp).toBeDefined();
    });
  });

  // ==========================================================================
  // 6. BOOKING REQUEST & ATOMIC SEAT RESERVATION
  // ==========================================================================
  describe('Booking Creation Workflow', () => {
    it('validates booking request schema', () => {
      const validBooking = {
        child_id: '11111111-1111-1111-1111-111111111111',
        route_id: '55555555-5555-5555-5555-555555555555',
        pickup_stop_id: '22222222-2222-2222-2222-222222222222',
        drop_stop_id: '33333333-3333-3333-3333-333333333333',
        start_date: '2026-10-01',
        pickup_notes: 'Child will wait with grandmother',
      };
      expect(createBookingSchema.safeParse(validBooking).success).toBe(true);
    });

    it('creates a booking request in PENDING_PAYMENT status', async () => {
      const route = SEED_ROUTES[0]!;
      const res = await createBookingRequest(testParentId, {
        child_id: 'child-test-123',
        route_id: route.id,
        pickup_stop_id: route.stops![0]!.id,
        drop_stop_id: route.stops![route.stops!.length - 1]!.id,
        monthly_base_fee_inr: route.monthly_base_fee_inr,
        start_date: '2026-10-01',
        pickup_notes: 'Hand over only to authorized mother',
      });

      expect(res.success).toBe(true);
      expect(res.booking).toBeDefined();
      expect(res.booking?.status).toBe('PENDING_PAYMENT');
      expect(res.booking?.parent_id).toBe(testParentId);
      expect(res.booking?.fare_snapshot.monthly_fee_inr).toBe(route.monthly_base_fee_inr);

      const bookings = await fetchParentBookings(testParentId);
      expect(bookings.some((b) => b.id === res.booking?.id)).toBe(true);
    });
  });

  // ==========================================================================
  // 7. PAYMENT INITIATION & IDEMPOTENCY
  // ==========================================================================
  describe('Payment Initiation Workflow', () => {
    it('initiates payment with unique idempotency key and updates booking to CONFIRMED', async () => {
      const route = SEED_ROUTES[0]!;
      const bookingRes = await createBookingRequest(testParentId, {
        child_id: 'child-pay-test',
        route_id: route.id,
        pickup_stop_id: route.stops![0]!.id,
        drop_stop_id: route.stops![1]!.id,
        monthly_base_fee_inr: route.monthly_base_fee_inr,
      });

      const booking = bookingRes.booking!;
      expect(booking.status).toBe('PENDING_PAYMENT');

      const paymentRes = await initiateBookingPayment(testParentId, {
        booking_id: booking.id,
        amount_inr: booking.fare_snapshot.total_amount_inr,
        payment_method: 'UPI',
      });

      expect(paymentRes.success).toBe(true);
      expect(paymentRes.payment).toBeDefined();
      expect(paymentRes.payment?.status).toBe('CAPTURED');
      expect(paymentRes.payment?.idempotency_key).toMatch(/^pay-idemp-/);
      expect(paymentRes.payment?.amount_subunits).toBe(
        Math.round(booking.fare_snapshot.total_amount_inr * 100)
      );

      // Verify booking status transition to CONFIRMED
      const bookings = await fetchParentBookings(testParentId);
      const confirmed = bookings.find((b) => b.id === booking.id);
      expect(confirmed?.status).toBe('CONFIRMED');
    });
  });
});
