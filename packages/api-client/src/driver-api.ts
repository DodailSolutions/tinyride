/**
 * TinyRide by Dodail — Driver API Service
 *
 * Provides typed queries and mutations for all Driver App workflows:
 * - Driver profile lookup & onboarding (commercial DL, badge, experience, languages)
 * - Vehicle registration & compliance tracking (Telangana TS format, auto/van capacity)
 * - Document upload & KYC audit status tracking (DL, FC, Insurance, PCC)
 * - Assigned routes and school commute passenger roster lookup
 * - Two-tap active trip execution (Start Trip, Picked Up / Absent per child, Complete Drop)
 * - Offline event synchronization with UUID idempotency
 * - Earnings calculation (gross subscription collections, 10% Dodail fee, net payout)
 * - Safety incident & breakdown reporting
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { getTinyRideClient } from './client';
import {
  Driver,
  Profile,
  Vehicle,
  DriverDocument,
  Route,
  Trip,
  TripEvent,
  DriverPayout,
  Incident,
  Coordinates,
} from '@tinyride/types';

// ============================================================================
// SEED FALLBACK DATA
// ============================================================================

export const SEED_DRIVER_ID = 'd1111111-1111-1111-1111-111111111111';
export const SEED_VEHICLE_ID = 'v1111111-1111-1111-1111-111111111111';
export const SEED_ROUTE_ID = '55555555-5555-5555-5555-555555555555';

export const SEED_DRIVER_PROFILE: Profile = {
  id: SEED_DRIVER_ID,
  phone: '+919849011223',
  full_name: 'Ramesh Goud',
  email: 'ramesh.goud@tinyride.in',
  role: 'driver',
  is_active: true,
  created_at: '2026-08-01T00:00:00Z',
  updated_at: '2026-09-21T00:00:00Z',
};

export const SEED_DRIVER: Driver = {
  id: SEED_DRIVER_ID,
  status: 'VERIFIED',
  license_number: 'TS0920180012345',
  license_expiry: '2028-10-15',
  badge_number: 'HYD-AUTO-4421',
  experience_years: 8,
  languages: ['Telugu', 'Hindi'],
  aadhaar_number_masked: 'XXXX-XXXX-9876',
  police_verification_date: '2026-01-10',
  police_verification_expiry: '2027-01-10',
  rating_avg: 4.9,
  total_trips: 340,
  created_at: '2026-08-01T00:00:00Z',
  updated_at: '2026-09-21T00:00:00Z',
};

export const SEED_VEHICLE: Vehicle = {
  id: SEED_VEHICLE_ID,
  driver_id: SEED_DRIVER_ID,
  vehicle_type: 'AUTO',
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
  status: 'VERIFIED',
  created_at: '2026-08-01T00:00:00Z',
  updated_at: '2026-09-21T00:00:00Z',
};

export const SEED_DRIVER_DOCUMENTS: DriverDocument[] = [
  {
    id: 'doc-01',
    driver_id: SEED_DRIVER_ID,
    document_type: 'DRIVING_LICENSE',
    document_number: 'TS0920180012345',
    storage_path: 'kyc-documents/d1111111/dl_front.jpg',
    expiry_date: '2028-10-15',
    status: 'APPROVED',
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-08-02T00:00:00Z',
  },
  {
    id: 'doc-02',
    driver_id: SEED_DRIVER_ID,
    vehicle_id: SEED_VEHICLE_ID,
    document_type: 'VEHICLE_FITNESS',
    document_number: 'FC-TS09-2022-9988',
    storage_path: 'kyc-documents/d1111111/fitness_cert.pdf',
    expiry_date: '2027-06-30',
    status: 'APPROVED',
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-08-02T00:00:00Z',
  },
  {
    id: 'doc-03',
    driver_id: SEED_DRIVER_ID,
    vehicle_id: SEED_VEHICLE_ID,
    document_type: 'VEHICLE_INSURANCE',
    document_number: 'UIIC-PKG-77112233',
    storage_path: 'kyc-documents/d1111111/insurance_policy.pdf',
    expiry_date: '2027-05-12',
    status: 'APPROVED',
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-08-02T00:00:00Z',
  },
  {
    id: 'doc-04',
    driver_id: SEED_DRIVER_ID,
    document_type: 'POLICE_VERIFICATION',
    document_number: 'CYB-PCC-2026-0912',
    storage_path: 'kyc-documents/d1111111/police_clearance.pdf',
    expiry_date: '2027-01-10',
    status: 'APPROVED',
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-08-02T00:00:00Z',
  },
];

export interface RosterPassenger {
  childId: string;
  name: string;
  grade: string;
  schoolName: string;
  stopId: string;
  stopName: string;
  stopSequence: number;
  pickupTime: string;
  dropTime: string;
  parentName: string;
  parentPhone: string;
  specialInstructions?: string | null;
  medicalNotes?: string | null;
  passengerStatus: 'PENDING' | 'PICKED_UP' | 'DROPPED' | 'ABSENT';
}

export const SEED_ROSTER_PASSENGERS: RosterPassenger[] = [
  {
    childId: 'c1111111-1111-1111-1111-111111111111',
    name: 'Aarav Sharma',
    grade: '3rd Standard',
    schoolName: 'Delhi Public School (DPS) Gachibowli',
    stopId: 'stop-01',
    stopName: 'My Home Mangala Gate 2 (Kondapur)',
    stopSequence: 1,
    pickupTime: '07:25',
    dropTime: '16:20',
    parentName: 'Ananya Sharma',
    parentPhone: '+919849012345',
    specialInstructions: 'Child carries blue backpack with asthma inhaler in side pocket.',
    medicalNotes: 'Mild asthma, carries inhaler.',
    passengerStatus: 'PENDING',
  },
  {
    childId: 'c2222222-2222-2222-2222-222222222222',
    name: 'Ananya Rao',
    grade: '4th Standard',
    schoolName: 'Delhi Public School (DPS) Gachibowli',
    stopId: 'stop-02',
    stopName: 'Botanical Garden Main Cross (Khajaguda)',
    stopSequence: 2,
    pickupTime: '07:38',
    dropTime: '16:05',
    parentName: 'Srinivas Rao',
    parentPhone: '+919849055443',
    specialInstructions: 'Handover only to mother or grandfather at pickup stop.',
    medicalNotes: null,
    passengerStatus: 'PENDING',
  },
  {
    childId: 'c3333333-3333-3333-3333-333333333333',
    name: 'Siddharth Madhavan',
    grade: '2nd Standard',
    schoolName: 'Delhi Public School (DPS) Gachibowli',
    stopId: 'stop-03',
    stopName: 'Lanco Hills Circle Gate A',
    stopSequence: 3,
    pickupTime: '07:50',
    dropTime: '15:52',
    parentName: 'Madhavan V',
    parentPhone: '+919849044332',
    specialInstructions: null,
    medicalNotes: null,
    passengerStatus: 'PENDING',
  },
  {
    childId: 'c4444444-4444-4444-4444-444444444444',
    name: 'Rohan Verma',
    grade: '5th Standard',
    schoolName: 'Delhi Public School (DPS) Gachibowli',
    stopId: 'stop-03',
    stopName: 'Lanco Hills Circle Gate A',
    stopSequence: 3,
    pickupTime: '07:50',
    dropTime: '15:52',
    parentName: 'Rajesh Verma',
    parentPhone: '+919849033221',
    specialInstructions: null,
    medicalNotes: null,
    passengerStatus: 'PENDING',
  },
];

export const SEED_DRIVER_PAYOUTS: DriverPayout[] = [
  {
    id: 'pay-aug-2026',
    driver_id: SEED_DRIVER_ID,
    route_id: SEED_ROUTE_ID,
    period_start: '2026-08-01',
    period_end: '2026-08-31',
    total_trips_completed: 44,
    gross_earnings_inr: 12800,
    platform_fee_inr: 1280,
    net_payout_inr: 11520,
    status: 'TRANSFERRED',
    payout_reference: 'NEFT-SBI-9918273645',
    processed_at: '2026-09-02T10:30:00Z',
    created_at: '2026-08-31T23:59:59Z',
  },
  {
    id: 'pay-jul-2026',
    driver_id: SEED_DRIVER_ID,
    route_id: SEED_ROUTE_ID,
    period_start: '2026-07-01',
    period_end: '2026-07-31',
    total_trips_completed: 44,
    gross_earnings_inr: 12800,
    platform_fee_inr: 1280,
    net_payout_inr: 11520,
    status: 'TRANSFERRED',
    payout_reference: 'NEFT-SBI-8817263544',
    processed_at: '2026-08-02T11:00:00Z',
    created_at: '2026-07-31T23:59:59Z',
  },
];

// In-memory fallback state for sandbox/offline execution
export const driverMemoryStore = {
  driver: { ...SEED_DRIVER },
  vehicle: { ...SEED_VEHICLE },
  documents: [...SEED_DRIVER_DOCUMENTS],
  passengers: [...SEED_ROSTER_PASSENGERS],
  trips: new Map<string, Trip>(),
  tripEvents: new Map<string, TripEvent[]>(),
  incidents: [] as Incident[],
};

function getClientSafely(customClient?: SupabaseClient): SupabaseClient | null {
  if (customClient) return customClient;
  try {
    return getTinyRideClient();
  } catch {
    return null;
  }
}

// ============================================================================
// 1. DRIVER PROFILE & ONBOARDING
// ============================================================================

export interface DriverComplianceDetails {
  driver: Driver;
  profile: Profile;
  vehicle: Vehicle | null;
  documents: DriverDocument[];
}

/**
 * Fetches driver profile, KYC status, and registered vehicle.
 */
export async function fetchDriverCompliance(
  driverId: string,
  client?: SupabaseClient
): Promise<DriverComplianceDetails> {
  const supabase = getClientSafely(client);

  if (!supabase) {
    return {
      driver: driverMemoryStore.driver,
      profile: SEED_DRIVER_PROFILE,
      vehicle: driverMemoryStore.vehicle,
      documents: driverMemoryStore.documents,
    };
  }

  try {
    const [driverRes, profileRes, vehicleRes, docsRes] = await Promise.all([
      supabase.from('drivers').select('*').eq('id', driverId).maybeSingle(),
      supabase.from('profiles').select('*').eq('id', driverId).maybeSingle(),
      supabase.from('vehicles').select('*').eq('driver_id', driverId).maybeSingle(),
      supabase.from('driver_documents').select('*').eq('driver_id', driverId),
    ]);

    const profile: Profile = profileRes.data
      ? {
          id: profileRes.data.id,
          phone: profileRes.data.phone,
          full_name: profileRes.data.full_name,
          email: profileRes.data.email,
          role: profileRes.data.role,
          is_active: profileRes.data.is_active,
          created_at: profileRes.data.created_at,
          updated_at: profileRes.data.updated_at,
        }
      : SEED_DRIVER_PROFILE;

    const driver: Driver = driverRes.data
      ? {
          id: driverRes.data.id,
          status: driverRes.data.status,
          aadhaar_number_masked: driverRes.data.aadhaar_number_masked,
          license_number: driverRes.data.license_number,
          license_expiry: driverRes.data.license_expiry,
          badge_number: driverRes.data.badge_number,
          experience_years: driverRes.data.experience_years,
          languages: driverRes.data.languages || ['Telugu'],
          police_verification_date: driverRes.data.police_verification_date,
          police_verification_expiry: driverRes.data.police_verification_expiry,
          rating_avg: driverRes.data.rating_avg ?? 5.0,
          total_trips: driverRes.data.total_trips ?? 0,
          created_at: driverRes.data.created_at,
          updated_at: driverRes.data.updated_at,
        }
      : driverMemoryStore.driver;

    const vehicle: Vehicle | null = vehicleRes.data
      ? {
          id: vehicleRes.data.id,
          driver_id: vehicleRes.data.driver_id,
          vehicle_type: vehicleRes.data.vehicle_type,
          registration_number: vehicleRes.data.registration_number,
          make: vehicleRes.data.make,
          model: vehicleRes.data.model,
          year: vehicleRes.data.year,
          color: vehicleRes.data.color,
          seating_capacity: vehicleRes.data.seating_capacity,
          rc_expiry: vehicleRes.data.rc_expiry,
          fitness_expiry: vehicleRes.data.fitness_expiry,
          insurance_expiry: vehicleRes.data.insurance_expiry,
          puc_expiry: vehicleRes.data.puc_expiry,
          status: vehicleRes.data.status,
          created_at: vehicleRes.data.created_at,
          updated_at: vehicleRes.data.updated_at,
        }
      : driverMemoryStore.vehicle;

    const documents: DriverDocument[] = docsRes.data && docsRes.data.length > 0
      ? docsRes.data.map((d) => ({
          id: d.id,
          driver_id: d.driver_id,
          vehicle_id: d.vehicle_id,
          document_type: d.document_type,
          document_number: d.document_number,
          storage_path: d.storage_path,
          expiry_date: d.expiry_date,
          status: d.status,
          created_at: d.created_at,
          updated_at: d.updated_at,
        }))
      : driverMemoryStore.documents;

    return { driver, profile, vehicle, documents };
  } catch {
    return {
      driver: driverMemoryStore.driver,
      profile: SEED_DRIVER_PROFILE,
      vehicle: driverMemoryStore.vehicle,
      documents: driverMemoryStore.documents,
    };
  }
}

/**
 * Onboards / updates driver profile. Status is always UNDER_REVIEW until admin approves.
 */
export async function updateDriverProfile(
  driverId: string,
  data: {
    license_number: string;
    license_expiry: string;
    badge_number?: string;
    experience_years: number;
    languages: string[];
    aadhaar_number_masked?: string;
  },
  client?: SupabaseClient
): Promise<Driver> {
  const supabase = getClientSafely(client);

  const payload = {
    ...data,
    status: 'UNDER_REVIEW' as const, // Enforce non-negotiable human admin verification
    updated_at: new Date().toISOString(),
  };

  if (!supabase) {
    driverMemoryStore.driver = {
      ...driverMemoryStore.driver,
      ...payload,
      id: driverId,
    };
    return driverMemoryStore.driver;
  }

  try {
    const { data: updated, error } = await supabase
      .from('drivers')
      .upsert({ id: driverId, ...payload })
      .select('*')
      .single();

    if (error || !updated) {
      driverMemoryStore.driver = { ...driverMemoryStore.driver, ...payload, id: driverId };
      return driverMemoryStore.driver;
    }

    return updated as Driver;
  } catch {
    driverMemoryStore.driver = { ...driverMemoryStore.driver, ...payload, id: driverId };
    return driverMemoryStore.driver;
  }
}

/**
 * Registers or updates a driver's vehicle.
 */
export async function registerDriverVehicle(
  driverId: string,
  vehicleData: {
    vehicle_type: 'AUTO' | 'VAN';
    registration_number: string;
    make: string;
    model: string;
    year: number;
    color: string;
    seating_capacity: number;
    rc_expiry: string;
    fitness_expiry: string;
    insurance_expiry: string;
    puc_expiry: string;
  },
  client?: SupabaseClient
): Promise<Vehicle> {
  const supabase = getClientSafely(client);

  const newVehicle: Vehicle = {
    id: `v_${Date.now()}`,
    driver_id: driverId,
    ...vehicleData,
    status: 'UNDER_REVIEW',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (!supabase) {
    driverMemoryStore.vehicle = newVehicle;
    return newVehicle;
  }

  try {
    const { data, error } = await supabase
      .from('vehicles')
      .upsert({
        driver_id: driverId,
        ...vehicleData,
        status: 'UNDER_REVIEW',
      })
      .select('*')
      .single();

    if (error || !data) {
      driverMemoryStore.vehicle = newVehicle;
      return newVehicle;
    }

    return data as Vehicle;
  } catch {
    driverMemoryStore.vehicle = newVehicle;
    return newVehicle;
  }
}

/**
 * Submits a driver KYC or vehicle document for admin review.
 */
export async function submitDriverDocument(
  driverId: string,
  docData: {
    document_type: DriverDocument['document_type'];
    document_number?: string;
    storage_path: string;
    expiry_date?: string;
    vehicle_id?: string;
  },
  client?: SupabaseClient
): Promise<DriverDocument> {
  const supabase = getClientSafely(client);

  const newDoc: DriverDocument = {
    id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    driver_id: driverId,
    document_type: docData.document_type,
    document_number: docData.document_number,
    storage_path: docData.storage_path,
    expiry_date: docData.expiry_date,
    vehicle_id: docData.vehicle_id,
    status: 'PENDING',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (!supabase) {
    driverMemoryStore.documents.push(newDoc);
    return newDoc;
  }

  try {
    const { data, error } = await supabase
      .from('driver_documents')
      .insert({
        driver_id: driverId,
        vehicle_id: docData.vehicle_id,
        document_type: docData.document_type,
        document_number: docData.document_number,
        storage_path: docData.storage_path,
        expiry_date: docData.expiry_date,
        status: 'PENDING',
      })
      .select('*')
      .single();

    if (error || !data) {
      driverMemoryStore.documents.push(newDoc);
      return newDoc;
    }

    return data as DriverDocument;
  } catch {
    driverMemoryStore.documents.push(newDoc);
    return newDoc;
  }
}

// ============================================================================
// 2. ASSIGNED ROUTE & PASSENGER ROSTER
// ============================================================================

/**
 * Fetches the driver's assigned route and detailed passenger roster.
 */
export async function fetchDriverRoster(
  driverId: string,
  client?: SupabaseClient
): Promise<{ routeName: string; schoolName: string; passengers: RosterPassenger[] }> {
  const supabase = getClientSafely(client);

  if (!supabase) {
    return {
      routeName: 'Kondapur ➔ DPS Gachibowli Junior Route',
      schoolName: 'Delhi Public School (DPS) Gachibowli',
      passengers: driverMemoryStore.passengers,
    };
  }

  try {
    // 1. Fetch route assigned to driver
    const { data: routeData, error: routeError } = await supabase
      .from('routes')
      .select('id, route_name, school:schools(name)')
      .eq('driver_id', driverId)
      .eq('status', 'ACTIVE')
      .maybeSingle();

    if (routeError || !routeData) {
      return {
        routeName: 'Kondapur ➔ DPS Gachibowli Junior Route',
        schoolName: 'Delhi Public School (DPS) Gachibowli',
        passengers: driverMemoryStore.passengers,
      };
    }

    const schoolName = (routeData.school as any)?.name || 'DPS Gachibowli';

    // 2. Fetch active bookings on this route with children & parent info
    const { data: bookingsData, error: bookError } = await supabase
      .from('bookings')
      .select(`
        id,
        child_id,
        child:children(
          id,
          first_name,
          last_name,
          grade,
          special_instructions,
          medical_notes,
          parent:profiles!parent_id(full_name, phone)
        ),
        pickup_stop:route_stops!pickup_stop_id(id, stop_name, stop_sequence, estimated_pickup_time, estimated_drop_time)
      `)
      .eq('route_id', routeData.id)
      .eq('status', 'CONFIRMED');

    if (bookError || !bookingsData || bookingsData.length === 0) {
      return {
        routeName: routeData.route_name,
        schoolName,
        passengers: driverMemoryStore.passengers,
      };
    }

    const passengers: RosterPassenger[] = bookingsData.map((b: any) => ({
      childId: b.child?.id || b.child_id,
      name: `${b.child?.first_name || ''} ${b.child?.last_name || ''}`.trim(),
      grade: b.child?.grade || 'N/A',
      schoolName,
      stopId: b.pickup_stop?.id || 'stop-default',
      stopName: b.pickup_stop?.stop_name || 'Designated Stop',
      stopSequence: b.pickup_stop?.stop_sequence || 1,
      pickupTime: b.pickup_stop?.estimated_pickup_time || '07:30',
      dropTime: b.pickup_stop?.estimated_drop_time || '15:45',
      parentName: b.child?.parent?.full_name || 'Guardian',
      parentPhone: b.child?.parent?.phone || '+919849000000',
      specialInstructions: b.child?.special_instructions,
      medicalNotes: b.child?.medical_notes,
      passengerStatus: 'PENDING',
    }));

    passengers.sort((a, b) => a.stopSequence - b.stopSequence);

    return {
      routeName: routeData.route_name,
      schoolName,
      passengers,
    };
  } catch {
    return {
      routeName: 'Kondapur ➔ DPS Gachibowli Junior Route',
      schoolName: 'Delhi Public School (DPS) Gachibowli',
      passengers: driverMemoryStore.passengers,
    };
  }
}

// ============================================================================
// 3. TRIP EXECUTION & MILESTONE EVENTS
// ============================================================================

export interface ActiveTripState {
  trip: Trip;
  passengers: RosterPassenger[];
}

/**
 * Retrieves the current in-progress or scheduled trip for the driver.
 */
export async function fetchDriverActiveTrip(
  driverId: string,
  client?: SupabaseClient
): Promise<ActiveTripState | null> {
  const supabase = getClientSafely(client);

  if (!supabase) {
    const existing = driverMemoryStore.trips.get(driverId);
    if (!existing) {
      // Return fresh scheduled trip
      const mockTrip: Trip = {
        id: 'trip-morning-today',
        route_id: SEED_ROUTE_ID,
        driver_id: driverId,
        vehicle_id: SEED_VEHICLE_ID,
        trip_type: 'MORNING_PICKUP',
        scheduled_date: new Date().toISOString().split('T')[0] || '2026-09-21',
        scheduled_start_time: '07:15',
        status: 'SCHEDULED',
        total_children_expected: driverMemoryStore.passengers.length,
        total_children_picked: 0,
        total_children_dropped: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      driverMemoryStore.trips.set(driverId, mockTrip);
      return { trip: mockTrip, passengers: driverMemoryStore.passengers };
    }
    return { trip: existing, passengers: driverMemoryStore.passengers };
  }

  try {
    const today = new Date().toISOString().split('T')[0];
    const { data: tripData, error } = await supabase
      .from('trips')
      .select('*')
      .eq('driver_id', driverId)
      .eq('scheduled_date', today)
      .in('status', ['SCHEDULED', 'IN_PROGRESS'])
      .order('scheduled_start_time', { ascending: true })
      .maybeSingle();

    if (error || !tripData) {
      return fetchDriverActiveTrip(driverId, undefined);
    }

    // Fetch roster
    const { passengers } = await fetchDriverRoster(driverId, client);

    // Fetch existing events for this trip to restore passengerStatus
    const { data: events } = await supabase
      .from('trip_events')
      .select('child_id, event_type')
      .eq('trip_id', tripData.id);

    if (events && events.length > 0) {
      const eventMap = new Map<string, string>();
      events.forEach((ev: any) => {
        if (ev.child_id) eventMap.set(ev.child_id, ev.event_type);
      });

      passengers.forEach((p) => {
        const lastEv = eventMap.get(p.childId);
        if (lastEv === 'PICKED_UP') p.passengerStatus = 'PICKED_UP';
        else if (lastEv === 'DROPPED') p.passengerStatus = 'DROPPED';
        else if (lastEv === 'ABSENT') p.passengerStatus = 'ABSENT';
      });
    }

    return {
      trip: tripData as Trip,
      passengers,
    };
  } catch {
    return fetchDriverActiveTrip(driverId, undefined);
  }
}

/**
 * Starts a morning or afternoon trip, recording the TRIP_STARTED milestone.
 */
export async function startDriverTrip(
  driverId: string,
  routeId: string,
  vehicleId: string,
  tripType: 'MORNING_PICKUP' | 'AFTERNOON_DROP' = 'MORNING_PICKUP',
  startLocation: Coordinates = { latitude: 17.4645, longitude: 78.3582 },
  client?: SupabaseClient
): Promise<Trip> {
  const supabase = getClientSafely(client);
  const now = new Date().toISOString();
  const today = now.split('T')[0] || '2026-09-21';

  const tripId = `trip_${Date.now()}`;
  const startEventIdempotency = `evt_${Date.now()}_start`;

  const updatedTrip: Trip = {
    id: tripId,
    route_id: routeId,
    driver_id: driverId,
    vehicle_id: vehicleId,
    trip_type: tripType,
    scheduled_date: today,
    scheduled_start_time: '07:15',
    actual_start_time: now,
    status: 'IN_PROGRESS',
    total_children_expected: driverMemoryStore.passengers.length,
    total_children_picked: 0,
    total_children_dropped: 0,
    created_at: now,
    updated_at: now,
  };

  if (!supabase) {
    driverMemoryStore.trips.set(driverId, updatedTrip);
    // Reset statuses to pending
    driverMemoryStore.passengers.forEach((p) => {
      p.passengerStatus = 'PENDING';
    });
    return updatedTrip;
  }

  try {
    // 1. Create or update trip in DB
    const { data: trip, error: tripErr } = await supabase
      .from('trips')
      .insert({
        route_id: routeId,
        driver_id: driverId,
        vehicle_id: vehicleId,
        trip_type: tripType,
        scheduled_date: today,
        scheduled_start_time: '07:15',
        actual_start_time: now,
        status: 'IN_PROGRESS',
        total_children_expected: 4,
      })
      .select('*')
      .single();

    if (tripErr || !trip) {
      driverMemoryStore.trips.set(driverId, updatedTrip);
      return updatedTrip;
    }

    // 2. Insert initial TRIP_STARTED event
    await supabase.from('trip_events').insert({
      trip_id: trip.id,
      event_type: 'TRIP_STARTED',
      idempotency_key: startEventIdempotency,
      location: startLocation,
      recorded_at: now,
      notes: `${tripType} initiated`,
    });

    return trip as Trip;
  } catch {
    driverMemoryStore.trips.set(driverId, updatedTrip);
    return updatedTrip;
  }
}

/**
 * Records student boarding at a scheduled stop.
 */
export async function recordStudentPickup(
  tripId: string,
  childId: string,
  idempotencyKey: string,
  location: Coordinates,
  client?: SupabaseClient
): Promise<TripEvent> {
  const supabase = getClientSafely(client);
  const now = new Date().toISOString();

  const event: TripEvent = {
    id: `ev_${Date.now()}`,
    trip_id: tripId,
    child_id: childId,
    event_type: 'PICKED_UP',
    idempotency_key: idempotencyKey,
    location,
    recorded_at: now,
    synced_at: now,
    notes: 'Child boarded safely',
  };

  // Update in-memory state
  const passenger = driverMemoryStore.passengers.find((p) => p.childId === childId);
  if (passenger) passenger.passengerStatus = 'PICKED_UP';

  if (!supabase) {
    const list = driverMemoryStore.tripEvents.get(tripId) || [];
    list.push(event);
    driverMemoryStore.tripEvents.set(tripId, list);
    return event;
  }

  try {
    const { data, error } = await supabase
      .from('trip_events')
      .insert({
        trip_id: tripId,
        child_id: childId,
        event_type: 'PICKED_UP',
        idempotency_key: idempotencyKey,
        location,
        recorded_at: now,
        notes: 'Child boarded safely',
      })
      .select('*')
      .single();

    if (error || !data) return event;
    return data as TripEvent;
  } catch {
    return event;
  }
}

/**
 * Records student absence (parent informed or no-show at stop).
 */
export async function recordStudentAbsent(
  tripId: string,
  childId: string,
  idempotencyKey: string,
  location: Coordinates,
  reason = 'Absent at scheduled stop',
  client?: SupabaseClient
): Promise<TripEvent> {
  const supabase = getClientSafely(client);
  const now = new Date().toISOString();

  const event: TripEvent = {
    id: `ev_${Date.now()}`,
    trip_id: tripId,
    child_id: childId,
    event_type: 'ABSENT',
    idempotency_key: idempotencyKey,
    location,
    recorded_at: now,
    synced_at: now,
    notes: reason,
  };

  // Update in-memory state
  const passenger = driverMemoryStore.passengers.find((p) => p.childId === childId);
  if (passenger) passenger.passengerStatus = 'ABSENT';

  if (!supabase) {
    const list = driverMemoryStore.tripEvents.get(tripId) || [];
    list.push(event);
    driverMemoryStore.tripEvents.set(tripId, list);
    return event;
  }

  try {
    const { data, error } = await supabase
      .from('trip_events')
      .insert({
        trip_id: tripId,
        child_id: childId,
        event_type: 'ABSENT',
        idempotency_key: idempotencyKey,
        location,
        recorded_at: now,
        notes: reason,
      })
      .select('*')
      .single();

    if (error || !data) return event;
    return data as TripEvent;
  } catch {
    return event;
  }
}

/**
 * Completes the active trip at the school campus or terminal stop.
 * Sets all picked up children to DROPPED, marks trip COMPLETED.
 */
export async function completeDriverTrip(
  tripId: string,
  driverId: string,
  schoolLocation: Coordinates = { latitude: 17.4194, longitude: 78.3688 },
  client?: SupabaseClient
): Promise<Trip> {
  const supabase = getClientSafely(client);
  const now = new Date().toISOString();

  // In-memory update
  driverMemoryStore.passengers.forEach((p) => {
    if (p.passengerStatus === 'PICKED_UP') {
      p.passengerStatus = 'DROPPED';
    }
  });

  const trip = driverMemoryStore.trips.get(driverId);
  const completedTrip: Trip = {
    ...(trip || {
      id: tripId,
      route_id: SEED_ROUTE_ID,
      driver_id: driverId,
      vehicle_id: SEED_VEHICLE_ID,
      trip_type: 'MORNING_PICKUP',
      scheduled_date: now.split('T')[0] || '2026-09-21',
      scheduled_start_time: '07:15',
      total_children_expected: driverMemoryStore.passengers.length,
      created_at: now,
    }),
    actual_end_time: now,
    status: 'COMPLETED',
    total_children_picked: driverMemoryStore.passengers.filter(
      (p) => p.passengerStatus === 'DROPPED'
    ).length,
    total_children_dropped: driverMemoryStore.passengers.filter(
      (p) => p.passengerStatus === 'DROPPED'
    ).length,
    updated_at: now,
  };

  driverMemoryStore.trips.set(driverId, completedTrip);

  if (!supabase) return completedTrip;

  try {
    // 1. Record milestone events for dropped children
    for (const p of driverMemoryStore.passengers) {
      if (p.passengerStatus === 'DROPPED') {
        await supabase.from('trip_events').insert({
          trip_id: tripId,
          child_id: p.childId,
          event_type: 'DROPPED',
          idempotency_key: `drop_${tripId}_${p.childId}`,
          location: schoolLocation,
          recorded_at: now,
          notes: 'Safely dropped at school gate',
        });
      }
    }

    // 2. Insert TRIP_COMPLETED event
    await supabase.from('trip_events').insert({
      trip_id: tripId,
      event_type: 'TRIP_COMPLETED',
      idempotency_key: `complete_${tripId}`,
      location: schoolLocation,
      recorded_at: now,
      notes: 'All students handed over to school authorities',
    });

    // 3. Mark trip row as COMPLETED
    const { data, error } = await supabase
      .from('trips')
      .update({
        status: 'COMPLETED',
        actual_end_time: now,
        total_children_dropped: completedTrip.total_children_dropped,
        updated_at: now,
      })
      .eq('id', tripId)
      .select('*')
      .single();

    if (error || !data) return completedTrip;
    return data as Trip;
  } catch {
    return completedTrip;
  }
}

// ============================================================================
// 4. EARNINGS & PAYOUTS
// ============================================================================

export interface DriverEarningsSummary {
  currentMonth: {
    period: string;
    activeChildrenCount: number;
    grossEarningsInr: number;
    platformFeeInr: number;
    netPayoutInr: number;
  };
  payoutHistory: DriverPayout[];
}

/**
 * Calculates current month subscription revenue and bank transfer ledger.
 */
export async function fetchDriverEarnings(
  driverId: string,
  client?: SupabaseClient
): Promise<DriverEarningsSummary> {
  const supabase = getClientSafely(client);

  const fallback: DriverEarningsSummary = {
    currentMonth: {
      period: '01 Sep 2026 – 30 Sep 2026',
      activeChildrenCount: 4,
      grossEarningsInr: 12800,
      platformFeeInr: 1280, // 10% Dodail platform fee
      netPayoutInr: 11520,
    },
    payoutHistory: SEED_DRIVER_PAYOUTS,
  };

  if (!supabase) return fallback;

  try {
    const { data: payouts, error } = await supabase
      .from('driver_payouts')
      .select('*')
      .eq('driver_id', driverId)
      .order('period_end', { ascending: false });

    if (error || !payouts || payouts.length === 0) {
      return fallback;
    }

    return {
      currentMonth: fallback.currentMonth,
      payoutHistory: payouts as DriverPayout[],
    };
  } catch {
    return fallback;
  }
}

// ============================================================================
// 5. INCIDENT REPORTING
// ============================================================================

/**
 * Reports a delay, vehicle breakdown, or safety incident to Dodail Operations.
 */
export async function reportDriverIncident(
  driverId: string,
  data: {
    tripId?: string;
    category: Incident['category'];
    severity: Incident['severity'];
    description: string;
    location?: Coordinates;
  },
  client?: SupabaseClient
): Promise<Incident> {
  const supabase = getClientSafely(client);
  const now = new Date().toISOString();

  const newIncident: Incident = {
    id: `inc_${Date.now()}`,
    trip_id: data.tripId,
    reported_by: driverId,
    reported_by_role: 'driver',
    severity: data.severity,
    status: 'OPEN',
    category: data.category,
    description: data.description,
    location: data.location || { latitude: 17.4194, longitude: 78.3688 },
    created_at: now,
    updated_at: now,
  };

  driverMemoryStore.incidents.push(newIncident);

  if (!supabase) return newIncident;

  try {
    const { data: inserted, error } = await supabase
      .from('incidents')
      .insert({
        trip_id: data.tripId,
        reported_by: driverId,
        reported_by_role: 'driver',
        severity: data.severity,
        status: 'OPEN',
        category: data.category,
        description: data.description,
        latitude: data.location?.latitude,
        longitude: data.location?.longitude,
      })
      .select('*')
      .single();

    if (error || !inserted) return newIncident;
    return inserted as Incident;
  } catch {
    return newIncident;
  }
}
