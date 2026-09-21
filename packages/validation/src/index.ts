import { z } from 'zod';

// ============================================================================
// 1. AUTHENTICATION & COMMON SCHEMAS
// ============================================================================

// Indian mobile numbers: 10 digits or with +91 prefix
export const indianPhoneRegex = /^(?:\+91|91)?[6-9]\d{9}$/;

export const phoneSchema = z
  .string()
  .trim()
  .regex(indianPhoneRegex, 'Please enter a valid 10-digit Indian mobile number');

export const otpSchema = z
  .string()
  .trim()
  .length(6, 'OTP must be exactly 6 digits')
  .regex(/^\d{6}$/, 'OTP must contain only numbers');

export const coordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().min(5, 'Address is required').optional(),
  landmark: z.string().optional(),
});

// ============================================================================
// 2. PARENT & CHILD SCHEMAS
// ============================================================================

export const emergencyContactSchema = z.object({
  name: z.string().trim().min(2, 'Contact name must be at least 2 characters'),
  relationship: z.string().trim().min(2, 'Relationship is required (e.g., Mother, Uncle)'),
  phone: phoneSchema,
});

export const parentProfileSchema = z.object({
  full_name: z.string().trim().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  alternate_phone: phoneSchema.optional().or(z.literal('')),
  emergency_contacts: z
    .array(emergencyContactSchema)
    .min(1, 'At least one emergency contact is required')
    .max(3, 'Maximum 3 emergency contacts allowed'),
});

export const authorizedGuardianSchema = z.object({
  name: z.string().trim().min(2, 'Guardian name is required'),
  relationship: z.string().trim().min(2, 'Relationship is required'),
  phone: phoneSchema,
  photo_url: z.string().url().optional(),
});

export const childSchema = z.object({
  first_name: z.string().trim().min(1, 'First name is required'),
  last_name: z.string().trim().min(1, 'Last name is required'),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be YYYY-MM-DD'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  school_id: z.string().uuid('Please select a valid school'),
  grade: z.string().trim().min(1, 'Grade/Class is required (e.g., 3rd Standard)'),
  section: z.string().trim().max(10).optional(),
  roll_number: z.string().trim().max(20).optional(),
  home_pickup_location: coordinatesSchema,
  home_drop_location: coordinatesSchema,
  special_instructions: z.string().max(500).optional(),
  medical_notes: z.string().max(500).optional(),
  authorized_guardians: z.array(authorizedGuardianSchema).default([]),
  photo_url: z.string().url().optional(),
});

// ============================================================================
// 3. DRIVER & VEHICLE SCHEMAS
// ============================================================================

export const driverProfileSchema = z.object({
  full_name: z.string().trim().min(2, 'Full name is required'),
  license_number: z.string().trim().min(5, 'Valid Driving License number required'),
  license_expiry: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expiry date must be YYYY-MM-DD'),
  badge_number: z.string().trim().optional(),
  experience_years: z.number().int().min(1, 'Must have at least 1 year of driving experience'),
  languages: z.array(z.string()).min(1, 'Select at least one language'),
  aadhaar_number_masked: z
    .string()
    .regex(/^[X\d]{4}-[X\d]{4}-\d{4}$/, 'Aadhaar must be in XXXX-XXXX-1234 format')
    .optional(),
});

// Telangana Vehicle Registration Number (e.g. TS09UA1234 or AP28X1234 legacy)
export const vehicleRegRegex = /^[A-Z]{2}\s?[0-9]{1,2}\s?[A-Z]{1,3}\s?[0-9]{4}$/i;

export const vehicleSchema = z
  .object({
    vehicle_type: z.enum(['AUTO', 'VAN']),
    registration_number: z
      .string()
      .trim()
      .toUpperCase()
      .regex(vehicleRegRegex, 'Enter valid registration number (e.g. TS09UA1234)'),
    make: z.string().trim().min(2, 'Vehicle make is required (e.g. Bajaj, Maruti)'),
    model: z.string().trim().min(1, 'Vehicle model is required (e.g. Compact RE, Eeco)'),
    year: z.number().int().min(2005).max(new Date().getFullYear() + 1),
    color: z.string().trim().min(2, 'Color is required (e.g. Yellow-Black)'),
    seating_capacity: z.number().int().positive(),
    rc_expiry: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'RC expiry must be YYYY-MM-DD'),
    fitness_expiry: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fitness certificate expiry required'),
    insurance_expiry: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Insurance expiry required'),
    puc_expiry: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'PUC expiry required'),
  })
  .refine(
    (val) => {
      if (val.vehicle_type === 'AUTO') return val.seating_capacity >= 3 && val.seating_capacity <= 6;
      if (val.vehicle_type === 'VAN') return val.seating_capacity >= 6 && val.seating_capacity <= 14;
      return false;
    },
    {
      message: 'Seating capacity must be 3-6 for Auto, or 6-14 for Van under local transport rules',
      path: ['seating_capacity'],
    }
  );

export const driverDocumentUploadSchema = z.object({
  driver_id: z.string().uuid(),
  vehicle_id: z.string().uuid().optional(),
  document_type: z.enum([
    'AADHAAR',
    'DRIVING_LICENSE',
    'BADGE',
    'POLICE_VERIFICATION',
    'VEHICLE_RC',
    'VEHICLE_INSURANCE',
    'VEHICLE_FITNESS',
    'VEHICLE_PUC',
    'VEHICLE_PHOTO_FRONT',
    'VEHICLE_PHOTO_INSIDE',
  ]),
  document_number: z.string().trim().optional(),
  storage_path: z.string().min(5, 'Valid storage path required'),
  expiry_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

// ============================================================================
// 4. ROUTE & BOOKING SCHEMAS
// ============================================================================

export const timeStringRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const routeStopInputSchema = z.object({
  stop_name: z.string().trim().min(2, 'Stop name required'),
  stop_sequence: z.number().int().nonnegative(),
  location: coordinatesSchema,
  estimated_pickup_time: z.string().regex(timeStringRegex, 'Time must be HH:mm (24h)'),
  estimated_drop_time: z.string().regex(timeStringRegex, 'Time must be HH:mm (24h)'),
  landmark: z.string().optional(),
});

export const createRouteSchema = z.object({
  driver_id: z.string().uuid(),
  vehicle_id: z.string().uuid(),
  school_id: z.string().uuid(),
  route_name: z.string().trim().min(3, 'Route name must be at least 3 characters'),
  morning_start_time: z.string().regex(timeStringRegex, 'Time must be HH:mm'),
  morning_arrival_time: z.string().regex(timeStringRegex, 'Time must be HH:mm'),
  afternoon_pickup_time: z.string().regex(timeStringRegex, 'Time must be HH:mm'),
  afternoon_end_time: z.string().regex(timeStringRegex, 'Time must be HH:mm'),
  monthly_base_fee_inr: z.number().positive('Monthly fee must be positive'),
  stops: z.array(routeStopInputSchema).min(2, 'Route must have at least 2 stops'),
});

export const createBookingSchema = z.object({
  child_id: z.string().uuid('Child ID is required'),
  route_id: z.string().uuid('Route ID is required'),
  pickup_stop_id: z.string().uuid('Pickup stop is required'),
  drop_stop_id: z.string().uuid('Drop stop is required'),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be YYYY-MM-DD'),
  pickup_notes: z.string().max(250).optional(),
});

// ============================================================================
// 5. TRIP EXECUTION & OFFLINE EVENT SCHEMAS
// ============================================================================

export const tripEventSchema = z.object({
  trip_id: z.string().uuid('Trip ID is required'),
  child_id: z.string().uuid().optional().nullable(),
  event_type: z.enum([
    'TRIP_STARTED',
    'PICKED_UP',
    'DROPPED',
    'ABSENT',
    'TRIP_COMPLETED',
    'INCIDENT_RECORDED',
  ]),
  idempotency_key: z.string().uuid('Unique UUID idempotency key is required'),
  location: coordinatesSchema,
  recorded_at: z.string().datetime({ message: 'ISO 8601 timestamp required' }),
  notes: z.string().max(300).optional().nullable(),
});

export const syncTripEventsBatchSchema = z.object({
  events: z.array(tripEventSchema).min(1, 'At least one event required in sync batch'),
});

// ============================================================================
// 6. INCIDENTS & SUPPORT TICKETS
// ============================================================================

export const createIncidentSchema = z.object({
  trip_id: z.string().uuid().optional().nullable(),
  category: z.enum([
    'VEHICLE_BREAKDOWN',
    'ACCIDENT',
    'CHILD_UNWELL',
    'DELAY',
    'ROUTE_DEVIATION',
    'OTHER',
  ]),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  description: z.string().trim().min(10, 'Description must be at least 10 characters'),
  location: coordinatesSchema.optional().nullable(),
});

export const createSupportTicketSchema = z.object({
  booking_id: z.string().uuid().optional().nullable(),
  subject: z.string().trim().min(5, 'Subject must be at least 5 characters'),
  description: z.string().trim().min(15, 'Please provide details of your issue'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
});

// ============================================================================
// 7. CMS & LEAD CAPTURE SCHEMAS
// ============================================================================

export const cmsLeadSchema = z.object({
  lead_type: z.enum(['PARENT', 'DRIVER', 'SCHOOL']),
  full_name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  phone: phoneSchema,
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  area: z.string().trim().min(2, 'Please enter your neighborhood/locality in Hyderabad'),
  school_name: z.string().trim().optional(),
  child_grade: z.string().trim().optional(),
  vehicle_type: z.enum(['AUTO', 'VAN']).optional(),
  notes: z.string().max(500).optional(),
});

export const cmsFaqSchema = z.object({
  category: z.string().trim().min(2, 'Category required'),
  question: z.string().trim().min(5, 'Question required'),
  answer: z.string().trim().min(10, 'Answer required'),
  display_order: z.number().int().nonnegative().default(0),
  is_active: z.boolean().default(true),
});

export const cmsArticleSchema = z.object({
  slug: z.string().trim().min(3).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  title: z.string().trim().min(5, 'Title required'),
  excerpt: z.string().trim().min(10, 'Excerpt required'),
  content: z.string().trim().min(20, 'Content required'),
  category: z.string().trim().min(2),
  cover_image_url: z.string().url().optional().or(z.literal('')),
  meta_title: z.string().max(70).optional(),
  meta_description: z.string().max(160).optional(),
  is_published: z.boolean().default(true),
});

