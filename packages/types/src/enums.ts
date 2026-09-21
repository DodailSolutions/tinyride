export type UserRole =
  | 'parent'
  | 'driver'
  | 'operations_admin'
  | 'super_admin'
  | 'support_agent';

export type DriverStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'VERIFIED'
  | 'REJECTED'
  | 'SUSPENDED';

export type VehicleType = 'AUTO' | 'VAN';

export type VehicleStatus =
  | 'UNVERIFIED'
  | 'UNDER_REVIEW'
  | 'VERIFIED'
  | 'REJECTED'
  | 'INACTIVE';

export type DocumentType =
  | 'AADHAAR'
  | 'DRIVING_LICENSE'
  | 'BADGE'
  | 'POLICE_VERIFICATION'
  | 'VEHICLE_RC'
  | 'VEHICLE_INSURANCE'
  | 'VEHICLE_FITNESS'
  | 'VEHICLE_PUC'
  | 'VEHICLE_PHOTO_FRONT'
  | 'VEHICLE_PHOTO_INSIDE';

export type DocumentStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED';

export type RouteStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'ACTIVE'
  | 'INACTIVE'
  | 'ARCHIVED';

export type BookingStatus =
  | 'PENDING_PAYMENT'
  | 'PAYMENT_PROCESSING'
  | 'CONFIRMED'
  | 'ACTIVE'
  | 'PAYMENT_FAILED'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'REFUND_REQUESTED'
  | 'REFUNDED';

export type SubscriptionStatus =
  | 'ACTIVE'
  | 'PAST_DUE'
  | 'CANCELLED'
  | 'EXPIRED';

export type PaymentStatus =
  | 'CREATED'
  | 'AUTHORIZED'
  | 'CAPTURED'
  | 'FAILED'
  | 'REFUNDED';

export type PaymentMethod =
  | 'UPI'
  | 'CARD'
  | 'NETBANKING'
  | 'WALLET';

export type DriverPayoutStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'TRANSFERRED'
  | 'FAILED'
  | 'RECONCILED';

export type TripType = 'MORNING_PICKUP' | 'AFTERNOON_DROP';

export type TripStatus =
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'INCIDENT_FLAGGED';

export type TripEventType =
  | 'TRIP_STARTED'
  | 'PICKED_UP'
  | 'DROPPED'
  | 'ABSENT'
  | 'TRIP_COMPLETED'
  | 'INCIDENT_RECORDED';

export type IncidentSeverity =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL';

export type IncidentStatus =
  | 'OPEN'
  | 'INVESTIGATING'
  | 'RESOLVED'
  | 'DISMISSED';

export type SupportTicketStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'WAITING_ON_USER'
  | 'RESOLVED'
  | 'CLOSED';

export type SupportTicketPriority =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'URGENT';
