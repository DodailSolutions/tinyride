import { describe, it, expect } from 'vitest';
import {
  phoneSchema,
  otpSchema,
  vehicleSchema,
  tripEventSchema,
  createBookingSchema,
} from './index';

describe('Validation Package Tests', () => {
  describe('Phone Schema (Indian format)', () => {
    it('accepts valid 10-digit Indian numbers', () => {
      expect(phoneSchema.safeParse('9849012345').success).toBe(true);
      expect(phoneSchema.safeParse('+919849012345').success).toBe(true);
      expect(phoneSchema.safeParse('919849012345').success).toBe(true);
    });

    it('rejects invalid mobile numbers', () => {
      expect(phoneSchema.safeParse('1234567890').success).toBe(false);
      expect(phoneSchema.safeParse('98490').success).toBe(false);
      expect(phoneSchema.safeParse('abcdefghij').success).toBe(false);
    });
  });

  describe('OTP Schema', () => {
    it('validates 6 digit numeric OTPs', () => {
      expect(otpSchema.safeParse('123456').success).toBe(true);
      expect(otpSchema.safeParse('12345').success).toBe(false);
      expect(otpSchema.safeParse('1234567').success).toBe(false);
      expect(otpSchema.safeParse('12345A').success).toBe(false);
    });
  });

  describe('Vehicle Schema (Telangana Regulations)', () => {
    it('accepts valid Auto with capacity 4', () => {
      const validAuto = {
        vehicle_type: 'AUTO' as const,
        registration_number: 'TS09UA1234',
        make: 'Bajaj',
        model: 'Compact RE',
        year: 2022,
        color: 'Yellow-Black',
        seating_capacity: 4,
        rc_expiry: '2028-12-31',
        fitness_expiry: '2027-06-30',
        insurance_expiry: '2027-05-15',
        puc_expiry: '2026-12-31',
      };
      expect(vehicleSchema.safeParse(validAuto).success).toBe(true);
    });

    it('rejects Auto with illegal capacity > 6', () => {
      const invalidAuto = {
        vehicle_type: 'AUTO' as const,
        registration_number: 'TS09UA1234',
        make: 'Bajaj',
        model: 'Compact RE',
        year: 2022,
        color: 'Yellow-Black',
        seating_capacity: 8, // Illegal for Auto
        rc_expiry: '2028-12-31',
        fitness_expiry: '2027-06-30',
        insurance_expiry: '2027-05-15',
        puc_expiry: '2026-12-31',
      };
      const res = vehicleSchema.safeParse(invalidAuto);
      expect(res.success).toBe(false);
    });
  });

  describe('Trip Event Schema (Idempotency & Coordinates)', () => {
    it('validates valid milestone event with UUID idempotency key', () => {
      const validEvent = {
        trip_id: '550e8400-e29b-41d4-a716-446655440000',
        child_id: '550e8400-e29b-41d4-a716-446655440001',
        event_type: 'PICKED_UP' as const,
        idempotency_key: '550e8400-e29b-41d4-a716-446655440002',
        location: {
          latitude: 17.4194,
          longitude: 78.3688,
          address: 'Khajaguda, Hyderabad',
        },
        recorded_at: new Date().toISOString(),
        notes: 'Handed over by mother',
      };
      expect(tripEventSchema.safeParse(validEvent).success).toBe(true);
    });

    it('rejects event without valid UUID idempotency key', () => {
      const invalidEvent = {
        trip_id: '550e8400-e29b-41d4-a716-446655440000',
        child_id: '550e8400-e29b-41d4-a716-446655440001',
        event_type: 'PICKED_UP' as const,
        idempotency_key: 'not-a-uuid',
        location: { latitude: 17.4194, longitude: 78.3688 },
        recorded_at: new Date().toISOString(),
      };
      expect(tripEventSchema.safeParse(invalidEvent).success).toBe(false);
    });
  });
});
