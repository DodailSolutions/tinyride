# TinyRide by Dodail — Assumptions & Regulatory Notes

**Product**: TinyRide  
**Brand**: TinyRide by Dodail  
**Tagline**: Little Rides. Big Peace of Mind.  
**Company**: Dodail Solutions Private Limited  
**Initial Pilot Market**: Hyderabad, Telangana, India  
**Document Version**: 1.0.0  
**Date**: September 2026  

---

## 1. Context & PRD Source
- **PRD Availability**: As the initial repository was empty and `docs/TinyRide_PRD.docx` was not present in the workspace root, all functional requirements, role definitions, data safety rules, and architectural guidelines are derived directly from the Dodail TinyRide Master Specification provided in the prompt.
- **Hyderabad Pilot Target**: Focus is placed on central/western Hyderabad education hubs (e.g., Jubilee Hills, Banjara Hills, Madhapur, Gachibowli, Kondapur, Kukatpally) with independent school auto-rickshaws (3-4 children standard, max 6 under TS transport regulations) and school vans (7-12 children capacity, e.g. Maruti Omni/Eeco/Winger).

---

## 2. Business & Operational Model Assumptions
1. **Asset-Light Marketplace**:
   - TinyRide does **not** own, lease, or operate vehicles.
   - All drivers are independent transport contractors.
   - TinyRide facilitates discovery, automated route assignment recommendations, digital seat bookings, milestone notifications, and monthly recurring payment collections.
2. **Driver Verification & Compliance (Telangana Transport Rules)**:
   - Telangana School Transport Safety guidelines require commercial transport driving licenses (yellow badge / transport endorsement), fitness certificate (FC), valid third-party insurance, pollution under control (PUC), and police verification certificate.
   - **Zero Automatic Approvals**: Driver onboarding status starts as `DRAFT`, moves to `SUBMITTED`, then requires two-party human review (`Operations Admin` or `Super Admin`) before switching to `VERIFIED`.
   - Vehicles must also be separately verified (`UNVERIFIED` -> `VERIFIED`).
3. **Route Publishing & Capacity**:
   - Drivers propose preferred routes and morning/afternoon timings.
   - Routes can only be activated (`ACTIVE`) following admin approval.
   - Capacity is strictly checked per vehicle type (Auto: 4-6 seats; Van: 8-12 seats). System prevents overselling using row-level locking and transaction checks.
4. **Pricing Model**:
   - Pricing is calculated per child per month based on distance bands (e.g., 0-3 km, 3-6 km, 6-10 km) or fixed route fees configured by drivers/admins.
   - Upon booking creation, an **immutable price snapshot** (`fare_snapshot`) is locked in the `bookings` record. Subsequent fare rule changes do not retroactively alter active monthly cycles.

---

## 3. Financial & Payment Assumptions (Razorpay)
1. **Direct Collection & Escrow/Payouts**:
   - In MVP Phase, parents pay Dodail Solutions Private Limited via Razorpay payment gateway (UPI, Cards, NetBanking).
   - Driver payouts are tracked as ledger entries (`driver_payouts`) and reconciled manually or via Razorpay Route/Payouts once separate vendor onboarding and KYC is finalized.
   - No client-side payment confirmation is trusted. All payment states (`PAID`, `FAILED`, `REFUNDED`) are updated exclusively via server-side verified Razorpay webhooks (`x-razorpay-signature` validated with crypto HMAC-SHA256).
2. **Subscription Periods**:
   - Subscriptions run on a calendar-month or 30-day billing cycle with recurring renewal invoices generated 5 days prior to cycle expiration.

---

## 4. Safety & Child Privacy Assumptions
1. **Data Minimization & Cross-Tenant Isolation**:
   - Drivers only see names, pickup/drop addresses, and emergency contacts of children assigned to their active route/day schedule. Drivers never see children on other routes.
   - Parents only see their own children and the driver assigned to their active booking.
   - Public storage buckets are **prohibited** for child photos, driver KYC, and vehicle permits. All media uses Supabase Storage private buckets with short-lived Signed URLs (max 15 minutes TTL).
2. **Trip Operations & Offline Synchronization**:
   - Safe Driving Mandate: The mobile driver app is designed with large buttons and state locks preventing complex data entry while vehicle is in motion.
   - Trip events (`TRIP_STARTED`, `CHILD_PICKED_UP`, `CHILD_DROPPED`, `TRIP_COMPLETED`, `INCIDENT_RECORDED`) require UUID idempotency keys generated on the device.
   - In low-connectivity areas, events are queued locally in SQLite / AsyncStorage and flushed upon reconnect. Any conflicting sequence generates an administrative review flag rather than silent overwrite.

---

## 5. Technology Stack Choices
- **Monorepo**: pnpm workspaces with Turborepo (`apps/parent`, `apps/driver`, `apps/admin`, `packages/*`, `services/*`).
- **Database & Auth**: Supabase (PostgreSQL 15+, Row Level Security, Edge Functions).
- **Mobile**: Expo SDK 52+ / React Native with Expo Router and TypeScript.
- **Web Admin**: Next.js 15 App Router, React 19 / TypeScript, Tailwind CSS, Lucide icons.
- **Route Optimization**: Google OR-Tools in a dedicated Python microservice (`services/route-optimizer`).
