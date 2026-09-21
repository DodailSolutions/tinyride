import { describe, it, expect, beforeEach } from 'vitest';
import {
  driverProfileSchema,
  vehicleSchema,
  driverDocumentUploadSchema,
  createIncidentSchema,
  tripEventSchema,
} from '@tinyride/validation';
import {
  fetchDriverCompliance,
  updateDriverProfile,
  registerDriverVehicle,
  submitDriverDocument,
  fetchDriverRoster,
  fetchDriverActiveTrip,
  startDriverTrip,
  recordStudentPickup,
  recordStudentAbsent,
  completeDriverTrip,
  fetchDriverEarnings,
  reportDriverIncident,
  SEED_DRIVER_ID,
  SEED_ROUTE_ID,
  SEED_VEHICLE_ID,
  driverMemoryStore,
} from './driver-api';
import { OfflineTripSyncQueue, StorageAdapter } from './sync-queue';

describe('Driver App Complete Journey & Compliance Test Suite', () => {
  // Mock in-memory storage for offline sync queue
  let mockStorageData: Record<string, string> = {};
  const mockStorageAdapter: StorageAdapter = {
    getItem: async (key: string) => mockStorageData[key] || null,
    setItem: async (key: string, value: string) => {
      mockStorageData[key] = value;
    },
  };

  beforeEach(() => {
    mockStorageData = {};
  });

  describe('1. Driver Onboarding & KYC Schema Validation', () => {
    it('validates a correct commercial driver profile', () => {
      const validProfile = {
        full_name: 'Ramesh Goud',
        license_number: 'TS0920180012345',
        license_expiry: '2028-10-15',
        badge_number: 'HYD-AUTO-4421',
        experience_years: 8,
        languages: ['Telugu', 'Hindi'],
        aadhaar_number_masked: 'XXXX-XXXX-9876',
      };

      const result = driverProfileSchema.safeParse(validProfile);
      expect(result.success).toBe(true);
    });

    it('rejects driver profile with 0 years of experience', () => {
      const invalidProfile = {
        full_name: 'New Driver',
        license_number: 'TS0920250000001',
        license_expiry: '2029-01-01',
        experience_years: 0,
        languages: ['Telugu'],
      };

      const result = driverProfileSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('at least 1 year');
      }
    });

    it('validates Telangana auto registration and seating capacity (4 seats)', () => {
      const validAuto = {
        vehicle_type: 'AUTO' as const,
        registration_number: 'TS09UA1234',
        make: 'Bajaj',
        model: 'Compact RE',
        year: 2022,
        color: 'Yellow-Black',
        seating_capacity: 4,
        rc_expiry: '2037-05-20',
        fitness_expiry: '2027-06-30',
        insurance_expiry: '2027-05-12',
        puc_expiry: '2027-04-10',
      };

      const result = vehicleSchema.safeParse(validAuto);
      expect(result.success).toBe(true);
    });

    it('rejects an Auto exceeding local regulatory capacity (>6 seats)', () => {
      const invalidAuto = {
        vehicle_type: 'AUTO' as const,
        registration_number: 'TS09UA9999',
        make: 'Bajaj',
        model: 'Compact RE',
        year: 2023,
        color: 'Yellow-Black',
        seating_capacity: 8, // Exceeds auto capacity!
        rc_expiry: '2038-05-20',
        fitness_expiry: '2027-06-30',
        insurance_expiry: '2027-05-12',
        puc_expiry: '2027-04-10',
      };

      const result = vehicleSchema.safeParse(invalidAuto);
      expect(result.success).toBe(false);
    });

    it('validates a school van with 10 seats', () => {
      const validVan = {
        vehicle_type: 'VAN' as const,
        registration_number: 'TS07EX5544',
        make: 'Maruti Suzuki',
        model: 'Eeco School Bus',
        year: 2023,
        color: 'School Bus Yellow',
        seating_capacity: 10,
        rc_expiry: '2038-01-10',
        fitness_expiry: '2027-12-31',
        insurance_expiry: '2027-10-15',
        puc_expiry: '2027-08-01',
      };

      const result = vehicleSchema.safeParse(validVan);
      expect(result.success).toBe(true);
    });

    it('validates KYC document upload payload', () => {
      const docPayload = {
        driver_id: '123e4567-e89b-12d3-a456-426614174000',
        document_type: 'DRIVING_LICENSE' as const,
        document_number: 'TS0920180012345',
        storage_path: 'kyc-documents/driver123/dl_front.jpg',
        expiry_date: '2028-10-15',
      };

      const result = driverDocumentUploadSchema.safeParse(docPayload);
      expect(result.success).toBe(true);
    });
  });

  describe('2. Driver Profile & Document Lifecycle', () => {
    it('fetches driver compliance status including documents and vehicle', async () => {
      const compliance = await fetchDriverCompliance(SEED_DRIVER_ID);

      expect(compliance.driver.id).toBe(SEED_DRIVER_ID);
      expect(compliance.driver.license_number).toBe('TS0920180012345');
      expect(compliance.vehicle?.registration_number).toBe('TS09UA1234');
      expect(compliance.documents.length).toBeGreaterThanOrEqual(4);

      // Verify all required documents are present
      const docTypes = compliance.documents.map((d) => d.document_type);
      expect(docTypes).toContain('DRIVING_LICENSE');
      expect(docTypes).toContain('VEHICLE_FITNESS');
      expect(docTypes).toContain('VEHICLE_INSURANCE');
      expect(docTypes).toContain('POLICE_VERIFICATION');
    });

    it('enforces status as UNDER_REVIEW when driver submits profile updates', async () => {
      const updated = await updateDriverProfile(SEED_DRIVER_ID, {
        license_number: 'TS0920200099887',
        license_expiry: '2030-12-31',
        experience_years: 10,
        languages: ['Telugu', 'Hindi', 'English'],
      });

      // Crucial constraint: drivers CANNOT self-approve
      expect(updated.status).toBe('UNDER_REVIEW');
      expect(updated.experience_years).toBe(10);
    });

    it('submits a new vehicle document and initializes status to PENDING audit', async () => {
      const doc = await submitDriverDocument(SEED_DRIVER_ID, {
        document_type: 'VEHICLE_PUC',
        document_number: 'PUC-TS09-2026-1122',
        storage_path: 'kyc-documents/d1111111/puc_cert.pdf',
        expiry_date: '2027-04-10',
      });

      expect(doc.status).toBe('PENDING');
      expect(doc.document_type).toBe('VEHICLE_PUC');
      expect(doc.storage_path).toContain('kyc-documents');
    });
  });

  describe('3. Route & Assigned Passenger Roster', () => {
    it('retrieves assigned route with Hyderabad school and passenger roster', async () => {
      const roster = await fetchDriverRoster(SEED_DRIVER_ID);

      expect(roster.routeName).toContain('Kondapur');
      expect(roster.schoolName).toContain('DPS');
      expect(roster.passengers.length).toBe(4);

      // Verify sequence ordering
      expect(roster.passengers[0]?.name).toBe('Aarav Sharma');
      expect(roster.passengers[0]?.stopName).toContain('My Home Mangala');
      expect(roster.passengers[0]?.parentPhone).toBe('+919849012345');
      expect(roster.passengers[0]?.specialInstructions).toContain('asthma');
    });
  });

  describe('4. Active Trip Execution & Two-Tap Milestone Flow', () => {
    const validTripUuid = 'a0000000-0000-4000-8000-000000000001';
    const validChildUuid = 'b0000000-0000-4000-8000-000000000001';
    const validChild2Uuid = 'b0000000-0000-4000-8000-000000000002';

    it('starts morning trip and initializes state to IN_PROGRESS', async () => {
      const trip = await startDriverTrip(
        SEED_DRIVER_ID,
        SEED_ROUTE_ID,
        SEED_VEHICLE_ID,
        'MORNING_PICKUP',
        { latitude: 17.4645, longitude: 78.3582 }
      );

      expect(trip.status).toBe('IN_PROGRESS');
      expect(trip.driver_id).toBe(SEED_DRIVER_ID);
      expect(trip.actual_start_time).toBeDefined();
    });

    it('records student pickup milestone with UUID idempotency key', async () => {
      const idempotencyKey = '550e8400-e29b-41d4-a716-446655440001';
      const event = await recordStudentPickup(
        validTripUuid,
        validChildUuid,
        idempotencyKey,
        { latitude: 17.4645, longitude: 78.3582 }
      );

      expect(event.event_type).toBe('PICKED_UP');
      expect(event.idempotency_key).toBe(idempotencyKey);

      // Validate schema compliance
      const validated = tripEventSchema.safeParse(event);
      expect(validated.success).toBe(true);
    });

    it('records student absent milestone with reason and UUID idempotency key', async () => {
      const idempotencyKey = '550e8400-e29b-41d4-a716-446655440002';
      const event = await recordStudentAbsent(
        validTripUuid,
        validChild2Uuid,
        idempotencyKey,
        { latitude: 17.4521, longitude: 78.3619 },
        'Parent sent SMS: child unwell'
      );

      expect(event.event_type).toBe('ABSENT');
      expect(event.notes).toContain('child unwell');
    });

    it('completes trip at school gate, dropping all onboard students', async () => {
      const completed = await completeDriverTrip(
        validTripUuid,
        SEED_DRIVER_ID,
        { latitude: 17.4194, longitude: 78.3688 }
      );

      expect(completed.status).toBe('COMPLETED');
      expect(completed.actual_end_time).toBeDefined();
    });
  });

  describe('5. Offline Trip Sync Queue with Idempotency', () => {
    it('queues offline trip events and stores them persistently', async () => {
      const queue = new OfflineTripSyncQueue(mockStorageAdapter);

      await queue.enqueue({
        trip_id: 'trip-offline-1',
        child_id: 'c1111111-1111-1111-1111-111111111111',
        event_type: 'PICKED_UP',
        idempotency_key: '550e8400-e29b-41d4-a716-446655440010',
        location: { latitude: 17.4645, longitude: 78.3582 },
        recorded_at: new Date().toISOString(),
        notes: 'Boarded offline',
      });

      const pending = await queue.getQueue();
      expect(pending.length).toBe(1);
      expect(pending[0]?.idempotency_key).toBe('550e8400-e29b-41d4-a716-446655440010');
      expect(pending[0]?.event_type).toBe('PICKED_UP');
    });

    it('clears queue properly on reset', async () => {
      const queue = new OfflineTripSyncQueue(mockStorageAdapter);
      await queue.enqueue({
        trip_id: 'trip-offline-1',
        event_type: 'TRIP_STARTED',
        idempotency_key: '550e8400-e29b-41d4-a716-446655440011',
        location: { latitude: 17.4645, longitude: 78.3582 },
        recorded_at: new Date().toISOString(),
      });

      await queue.clear();
      const pending = await queue.getQueue();
      expect(pending.length).toBe(0);
    });
  });

  describe('6. Earnings & Platform Fee Calculation', () => {
    it('calculates 10% Dodail platform fee accurately from gross collections', async () => {
      const earnings = await fetchDriverEarnings(SEED_DRIVER_ID);

      const { grossEarningsInr, platformFeeInr, netPayoutInr } = earnings.currentMonth;

      expect(grossEarningsInr).toBe(12800);
      expect(platformFeeInr).toBe(Math.round(grossEarningsInr * 0.1));
      expect(netPayoutInr).toBe(grossEarningsInr - platformFeeInr);
      expect(netPayoutInr).toBe(11520);

      // Verify past payouts
      expect(earnings.payoutHistory.length).toBeGreaterThanOrEqual(2);
      expect(earnings.payoutHistory[0]?.status).toBe('TRANSFERRED');
      expect(earnings.payoutHistory[0]?.payout_reference).toContain('NEFT-SBI');
    });
  });

  describe('7. Safety Incident & Breakdown Reporting', () => {
    it('records an urgent vehicle breakdown incident with location', async () => {
      const incidentData = {
        category: 'VEHICLE_BREAKDOWN' as const,
        severity: 'HIGH' as const,
        description: 'Flat tyre near Botanical Garden circle. Backup auto needed.',
        location: { latitude: 17.4521, longitude: 78.3619 },
      };

      // Validate schema
      const valid = createIncidentSchema.safeParse(incidentData);
      expect(valid.success).toBe(true);

      const reported = await reportDriverIncident(SEED_DRIVER_ID, incidentData);
      expect(reported.category).toBe('VEHICLE_BREAKDOWN');
      expect(reported.severity).toBe('HIGH');
      expect(reported.status).toBe('OPEN');
      expect(reported.reported_by).toBe(SEED_DRIVER_ID);
    });
  });
});
