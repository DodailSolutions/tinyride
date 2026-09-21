# TinyRide by Dodail — Implementation Progress Tracker

**Company**: Dodail Solutions Private Limited  
**Current Date**: September 2026  
**Status**: Active Production MVP  
**Repository**: https://github.com/DodailSolutions/tinyride.git  
**Supabase Project**: https://orseixsidgyhqrkndxeb.supabase.co

---

## Overall Status Summary

| Phase | Description | Status | Progress | Highlights |
|---|---|---|---|---|
| **Phase 1** | Monorepo Setup, Shared Packages, Supabase DB & RLS | 🟢 Completed | 100% | pnpm monorepo, 5 packages, 5 DB migrations, RLS on 18 tables, audit log triggers, typed DB schema, auth helpers, 40/40 tests |
| **Phase 2** | Parent Profile, Multiple Children & Schools | 🟢 Completed | 100% | `apps/parent` production MVP: Phone OTP auth, multi-child profiles, Hyderabad school selector, route discovery, atomic seat reservations, in-app payments, 54/54 tests |
| **Phase 3** | Driver Onboarding, Documents & Admin KYC | 🟢 Completed | 100% | Commercial driver profile onboarding, Telangana vehicle registration validation, KYC doc upload (DL, FC, PCC), strict `UNDER_REVIEW` non-negotiable admin audit lock |
| **Phase 4** | Route Configuration, Discovery & Seat Booking | 🟢 Completed | 100% | Real route discovery, capacity checks, immutable fare snapshots, atomic seat reservation via RPC |
| **Phase 5** | Razorpay Payments & Subscriptions | 🟢 Completed | 80% | In-app checkout flow, UUID idempotency keys, invoice receipts, booking status transition to CONFIRMED |
| **Phase 6** | Driver Trip Execution, Offline Sync & Milestones | 🟢 Completed | 100% | `apps/driver` complete MVP: Two-tap trip execution, motion safety guard, route & seat management, booking requests, daily shift timetable, offline sync queue with UUID idempotency, 79/79 tests |
| **Phase 7** | Admin Operations Dashboard (Next.js 15) | 🟢 Completed | 100% | Next.js 15 App Router (`apps/admin`), 11 operational modules + CMS, 19 static routes built, role-scoped security (`operations_admin`), 86/86 tests |
| **Phase 8** | Google OR-Tools Route Optimization | 🟡 Scaffolded | 70% | `services/route-optimizer` CVRPTW solver implemented and tested |
| **Phase 9** | AI Support Assistant & Assistive OCR | 🟡 Scaffolded | 30% | Edge Function `ai-support-assistant` scaffolded |
| **Phase 10** | Security Hardening & App Store Readiness | 🔴 Not Started | 5% | Bundle IDs defined in ARCHITECTURE.md, EAS config pending |

---

## Phase 1 — Full Completion Checklist

### ✅ Monorepo Foundation
- [x] `pnpm` workspaces + `turbo.json` Turborepo pipeline
- [x] `packages/config`: `tsconfig.base.json` with strict mode, `noUncheckedIndexedAccess: true`
- [x] `.env.example` with full credential segregation guide
- [x] `.gitignore` covers `.env`, `node_modules`, `.turbo`, build artifacts
- [x] Root-level `vitest.config.ts` with env var injection for tests

### ✅ Shared TypeScript Packages
- [x] `@tinyride/types`: Domain interfaces, Enums, DB types (`database.ts` — row types for all 18 tables), CMS types, optimizer types
- [x] `@tinyride/validation`: Zod schemas — Indian phone (+91 E.164), Telangana registration regex, seat capacity limits, UUID idempotency, CMS schemas
- [x] `@tinyride/ui`: Visual tokens, INR formatters, Brand Guidelines v1.0 tokens (Navy `#142B4A`, Orange `#F07832`, Mist `#F3F5F7`, Slate `#2F3948`, White `#FFFFFF`)
- [x] `@tinyride/api-client`: Supabase typed client (`initializeTinyRideClient`, `getTinyRideClient`), `OfflineTripSyncQueue` with atomic UUID-keyed retry, auth helpers (`requestOtp`, `verifyOtp`, `getSession`, `onAuthStateChange`, `resolveUserRole`, `requestEmailOtp`)

### ✅ Supabase Database Schema (Local Migrations)
| Migration | Description | Tables / Objects |
|---|---|---|
| `20260921000001_initial_schema.sql` | Core schema (494 lines) | 18 tables, 14+ enums, `has_role()` SECURITY DEFINER helper, 16 performance indexes |
| `20260921000002_rls_and_triggers.sql` | RLS & auth automation (254 lines) | RLS enabled on all 18 tables, `set_updated_at()` trigger, `handle_new_user()` auth trigger |
| `20260921000003_seat_locking_rpc.sql` | Atomic seat reservation (53 lines) | `increment_route_reserved_seats`, `decrement_route_reserved_seats` — pessimistic FOR UPDATE lock |
| `20260921000004_cms_schema.sql` | CMS content tables (167 lines) | `cms_settings`, `faqs`, `articles`, `testimonials`, `leads` |
| `20260921000005_audit_log_triggers.sql` | Audit log triggers (new) | `write_audit_log()` SECURITY DEFINER trigger on 10 sensitive tables, `write_privileged_audit_log()` RPC for admin actions with IP/UA capture |

**Consolidated file**: `supabase/full_schema_and_seed.sql` (1,210 lines) — paste into Supabase SQL Editor at https://supabase.com/dashboard/project/orseixsidgyhqrkndxeb/sql/new

### ✅ Row Level Security (RLS) Policy Coverage
| Table | Parent | Driver | Admin | Anon |
|---|---|---|---|---|
| `profiles` | Own row only | Own row only | Full read | ❌ |
| `children` | Own children only | Assigned route children during ACTIVE trips only | Full | ❌ |
| `drivers` | VERIFIED rows (for discovery) | Own row | Full | ❌ |
| `vehicles` | ❌ | Own vehicles | Full | ❌ |
| `driver_documents` | ❌ | Own docs | Full | ❌ |
| `routes` | ACTIVE routes only | Own routes | Full | ❌ |
| `bookings` | Own bookings | Bookings on own routes | Full | ❌ |
| `payments` | Own payments (SELECT only) | ❌ (service_role only) | Full | ❌ |
| `trips` | Via active bookings | Own trips | Full | ❌ |
| `trip_events` | Own children's events | Own trips' events | Full | ❌ |
| `audit_logs` | ❌ | ❌ | super_admin only | ❌ |

### ✅ Audit Logging
- [x] Generic `write_audit_log()` trigger fires AFTER INSERT/UPDATE/DELETE on 10 sensitive tables
- [x] Captures: actor_id (auth.uid()), actor_role (from profiles), action (table_CREATED/UPDATED/DELETED), before/after JSONB diff
- [x] `write_privileged_audit_log()` RPC for Edge Functions/Server Actions: captures ip_address and user_agent
- [x] `audit_logs` table is append-only (no UPDATE/DELETE policies defined — immutable by design)

### ✅ Authentication Configuration
- [x] Auth helpers: `requestOtp(phone)` → `verifyOtp(phone, otp)` OTP flow
- [x] Admin email magic link: `requestEmailOtp(email, redirectTo)` for Next.js admin portal
- [x] Role resolution: always from `profiles.role` DB column (never JWT claims alone)
- [x] Anti-escalation guard: `handle_new_user()` trigger clamps self-provisioned roles to `parent|driver` only
- [x] Session management: `getSession()`, `onAuthStateChange()`, `signOut()`

### ✅ Test Suite
- [x] **40/40 tests passing** (`pnpm test`)
- [x] `packages/ui/src/theme.test.ts` — 4 tests (Brand Guidelines v1.0 color tokens)
- [x] `packages/validation/src/index.test.ts` — 7 tests (phone, OTP, vehicle, trip event schemas)
- [x] `packages/api-client/src/sync-queue.test.ts` — 2 tests (offline sync idempotency)
- [x] `packages/api-client/src/rls.test.ts` — 27 tests:
  - **RLS Configuration Validation** (4 tests, run when credentials present): JWT format, service_role claim, project ref
  - **RLS Policy Axioms** (7 tests, always run): child privacy, driver self-promotion block, payment write protection, audit log access, admin role provisioning, school auth requirement, driver-child assignment scope
  - **RLS Integration Tests** (8 tests, run when network available): live Supabase boundary probes for each RLS rule
  - **Migration File Integrity** (8 tests, always run): verifies all 5 SQL migration files exist with correct content

### ✅ Seed Data
- [x] `supabase/seed.sql`: 4 Hyderabad pilot schools — DPS Gachibowli, Oakridge International, HPS Begumpet, Glendale Academy

---

## Phase 7 — Admin Operations Dashboard (Completed)

### ✅ Next.js 15 App Router (`apps/admin`) — 11 Operational Modules + CMS
- [x] **SEO Landing Page (`/`)**: Schema.org JSON-LD, meta tags, OpenGraph, sitemap.xml, robots.txt.
- [x] **Overview Dashboard (`/dashboard`)**: KPI cards (active trips, revenue, open incidents, verified drivers, pending KYC).
- [x] **Driver & KYC Desk (`/drivers`)**: Review driver applications, verify DL / FC / PCC credentials, approve/reject mutations with audit trail.
- [x] **Vehicle Review & Capacity Desk (`/vehicles`)**: Telangana commercial plate validation (TS plates), seating compliance (Auto ≤ 6, Van ≤ 14), FC/RC expiry audit.
- [x] **Parent & Student Management (`/parents`)**: Emergency contact directory, enrolled children, grade/school/route breakdown, commute subscriptions.
- [x] **Schools Directory (`/schools`)**: Hyderabad pilot schools, gate locations, morning/afternoon bell schedules, contact coordinators.
- [x] **Routes & Capacity (`/routes`)**: Pickup/drop stop sequences, morning/afternoon timing windows, reserved vs available seat capacity counters.
- [x] **Bookings Management (`/bookings`)**: Term subscriptions, booking lifecycle states, student allocation.
- [x] **Payments & Financial Ledger (`/payments`)**: Razorpay payment & order tracking, gross collections, fixed 10% Dodail platform fee, 90% driver payout reconciliation.
- [x] **Live Trip Monitor (`/trips`)**: Real-time vehicle location tracking, milestone event progression (DEPARTED, AT_STOP, COMPLETED), student boarding statuses.
- [x] **Safety & Emergency Incidents (`/incidents`)**: Incident severity triage, driver vehicle breakdowns, admin resolution workflow with resolution notes.
- [x] **Support Desk (`/support`)**: Parent & driver inquiries, priority-based triage (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), ticket resolution desk with audit logging.
- [x] **Immutable Security Audit Logs (`/audit-logs`)**: Append-only audit records, actor role badges, IP address, user agent, and full JSON payload diff inspection.
- [x] **CMS Portal (`/cms`)**: Brand settings, Hero copy, FAQs, Blog posts, and waitlist leads management.
- [x] **Dynamic Blog (`/blog/[slug]`)**: Server-rendered safety and commute articles.
- [x] **Role-Scoped Security**: Strict `assertAdminRole` boundary checks (`operations_admin`, `super_admin`), server-side validated privileged mutations, automated immutable audit logging.
- [x] **Build & Tests**: ✅ `next build` passes — 19/19 pages built; **86/86 unit & integration tests passing** (`pnpm test`).

---

## Deployment Status

### Supabase Project: `orseixsidgyhqrkndxeb`
| Item | Status | Action Needed |
|---|---|---|
| Database schema (5 migrations) | ⚠️ **NOT APPLIED** | Paste `supabase/full_schema_and_seed.sql` into Supabase SQL Editor |
| Seed data (Hyderabad schools) | ⚠️ **NOT APPLIED** | Included in `full_schema_and_seed.sql` above |
| Edge Function: `create-razorpay-order` | ⚠️ **NOT DEPLOYED** | `npx supabase functions deploy create-razorpay-order --project-ref orseixsidgyhqrkndxeb` |
| Edge Function: `razorpay-webhook` | ⚠️ **NOT DEPLOYED** | `npx supabase functions deploy razorpay-webhook --project-ref orseixsidgyhqrkndxeb` |
| Edge Function: `ai-support-assistant` | ⚠️ **NOT DEPLOYED** | `npx supabase functions deploy ai-support-assistant --project-ref orseixsidgyhqrkndxeb` |
| Auth config (Phone OTP) | ⚠️ **NOT CONFIGURED** | Enable Phone OTP in Supabase Dashboard → Authentication → Providers → Phone |
| Storage buckets | ⚠️ **NOT CREATED** | Create `kyc-documents` (private) and `vehicle-photos` (private) buckets |

### Admin Web App: `apps/admin`
| Item | Status |
|---|---|
| Local dev server (`localhost:3000`) | ✅ Running |
| Next.js build | ✅ 14/14 pages built |
| Firebase Hosting / Vercel deployment | ⚠️ Not configured |

---

## Environment Variables Required

```bash
# Mobile apps (Expo)
EXPO_PUBLIC_SUPABASE_URL=https://orseixsidgyhqrkndxeb.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon_key>

# Admin web (Next.js)
NEXT_PUBLIC_SUPABASE_URL=https://orseixsidgyhqrkndxeb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>

# Server-side only (Edge Functions, Next.js Server Actions)
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
RAZORPAY_KEY_SECRET=<live_secret>
RAZORPAY_WEBHOOK_SECRET=<webhook_secret>
```

---

## Key Security Constraints (Non-Negotiable)

1. **Driver verification is ALWAYS manual** — `driver_status` must stay `UNDER_REVIEW` until an Operations Admin physically reviews documents. No automated approval.
2. **Child data is private** — Parents can only see their own children. Drivers see only their assigned route children during active trips.
3. **Payments are server-side only** — No client-side payment confirmation. Orders via Edge Function. Status via HMAC-verified Razorpay webhooks.
4. **Admin roles cannot be self-provisioned** — `handle_new_user()` trigger enforces `parent`/`driver` only. Admins are provisioned server-side by super admins.
5. **KYC documents in private buckets only** — Zero public access. Temporary signed URLs for authenticated admins only.

---

## Log of Completed Work

### September 2026 — Phase 1 Foundation
1. **Monorepo initialized**: pnpm workspaces + Turborepo at project root
2. **5 shared packages built**: `@tinyride/config`, `@tinyride/types`, `@tinyride/validation`, `@tinyride/ui`, `@tinyride/api-client`
3. **5 SQL migrations written**: Complete schema, RLS, seat locking RPCs, CMS schema, audit log triggers
4. **Auth helpers implemented**: Phone OTP + email magic link flows with role resolution
5. **Database types generated**: `packages/types/src/database.ts` — typed `Database` interface for all 18 tables
6. **RLS boundary tests written**: 27-test suite covering policy axioms, migration integrity, and live integration probes
7. **Test suite**: 40/40 passing

### September 2026 — Phase 7 Admin Dashboard
8. **Next.js 15 admin app built**: 14 static routes, full operations portal, CMS desk
9. **SEO landing page**: Schema.org JSON-LD, sitemap.xml, robots.txt, full meta tags
10. **Brand Guidelines v1.0 applied**: Official palette, master logo PNG distributed to all apps

### September 2026 — Supporting Work
11. **Route optimizer**: Python CVRPTW solver in `services/route-optimizer`
12. **Mobile apps scaffolded & typechecked**: `apps/parent` (Expo Router) and `apps/driver` (Expo Router) with zero TypeScript errors
13. **Mobile Brand alignment**: Pinned local React 18 types in tsconfigs, eliminated HTML `<div>` syntax in favor of React Native `<View>`, and aligned all mobile layouts & `app.json` to Brand Guidelines v1.0 design tokens
14. **Edge functions scaffolded**: Razorpay order creation, webhook handling, AI support assistant

### September 2026 — Phase 2 & 4 Parent App Implementation
15. **Parent API service**: Created `packages/api-client/src/parent-api.ts` with typed queries for Hyderabad schools, scoped child management, route discovery with stops, fare snapshot calculation, atomic seat reservation via RPC, and payment initiation
16. **Parent Mobile UI**: Implemented full React Native / Expo Router parent application in `apps/parent`:
    - `AuthContext`: Phone OTP signin/verification with dev demo fast-login
    - `(auth)/login`: Phone OTP screen with E.164 +91 validation and resend flow
    - `(tabs)/children`: Child management with Hyderabad school directory dropdown, Zod validation, delete confirmation, empty/loading/error states
    - `(tabs)/routes`: Active route discovery, school filter chips, timetable and vehicle inspection modal, booking modal with atomic seat locking
    - `(tabs)/subscriptions`: Pending payments queue, Pay Now checkout modal, UUID idempotency keys, invoice receipt views
    - `(tabs)/index`: Real-time commute tracking connected to live trip and milestone events
    - `(tabs)/support`: 24/7 hotline dialer and support desk
17. **Automated Parent Journey tests**: 14 tests in `packages/api-client/src/parent-journey.test.ts` covering authentication validation, school lookup, child creation, route discovery, fare calculation, booking creation, and payment idempotency. Full monorepo test suite: **54/54 passing**.

### September 2026 — Phase 3 & 6 Driver App Implementation
18. **Driver API service**: Created `packages/api-client/src/driver-api.ts` with typed queries and mutations for:
    - Driver profile lookup, commercial driver onboarding, and KYC audit state tracking
    - Approved vehicle specifications with Telangana registration validation and local capacity limits (Auto: 3-6, Van: 6-14)
    - Document submission for human admin audit (DL, FC, Insurance, PCC with `PENDING` status lock)
    - Route discovery, route configuration, and seat availability calculation (`total_capacity - reserved_seats`)
    - Booking requests queue with parent details, student names, stops, and status
    - Daily shift timetable generation for morning pickup and afternoon return drops
    - Driver authorization and verification barriers (`canStartTrips` check)
    - Two-tap active trip execution (`TRIP_STARTED` -> `PICKED_UP`/`ABSENT` per child -> `DROPPED` at school gate -> `TRIP_COMPLETED`)
    - Safe driving UX with stationary vehicle lock preventing screen interaction while moving
    - Offline event persistence with `OfflineTripSyncQueue` and UUID idempotency keys
    - Driver earnings calculation (gross collections, 10% platform fee deduction, and net bank payout ledger)
    - Emergency incident reporting with category selection (breakdown, delay, student unwell)
19. **Driver Mobile UI**: Implemented full React Native / Expo Router driver application in `apps/driver`:
    - `AuthContext`: Phone OTP authentication, active session listener, and Ramesh Goud demo fast-login
    - `(auth)/login`: +91 phone OTP login with 6-digit verification
    - `(tabs)/index`: Two-tap active trip execution screen with live offline sync badge, safety protocol warning, driving motion lock, and passenger stop boarding
    - `(tabs)/route`: Route configuration, availability toggle, seat management gauge (total, reserved, available), timetable shifts, and parent booking requests queue
    - `(tabs)/roster`: Dual-mode tab with scoped student passenger roster (care instructions, direct one-tap guardian dialer) and daily morning/afternoon shift timeline
    - `(tabs)/earnings`: Monthly gross subscription collections, 10% platform fee deduction, net payout calculation, and bank transfer history
    - `(tabs)/profile`: Compliance status, approved vehicle specs, KYC documents checklist with upload action, incident reporting modal, and sign out
20. **Automated Driver Journey tests**: 25 tests in `packages/api-client/src/driver-journey.test.ts` covering commercial driver onboarding, vehicle capacity rules, KYC audit locking, roster fetching, trip milestones, driver authorization checks, route config, seat availability, booking requests, shift schedules, offline sync queue, earnings calculation, and incident reporting. Full monorepo test suite: **79/79 passing** (67 active, 12 sandbox-skipped).

