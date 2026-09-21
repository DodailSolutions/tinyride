# TinyRide by Dodail — Security & Child Privacy Architecture

**Company**: Dodail Solutions Private Limited  
**Product**: TinyRide  
**Security Level**: High (Children's Personal Data & Financial Transactions)  
**Standard**: Digital Personal Data Protection Act (DPDPA 2023, India), OWASP Mobile & API Top 10  

---

## 1. Threat Modeling & Core Defense Principles

| Threat Vector | Potential Impact | TinyRide Mitigation |
|---|---|---|
| **Child Data Leakage** | Exposure of school, home coordinates, guardian phone numbers | Strict PostgreSQL Row Level Security (RLS). Drivers only have read access to assigned children during active trips. Parents only see their own children. |
| **Unauthorized Role Escalation** | Attacker assigns themselves `operations_admin` or `super_admin` | Roles stored in secure server-managed table (`user_roles`) with RLS preventing client-side writes. JWT claims verified via database RPCs. |
| **Fake Payment Spoofing** | Client intercepts response and marks booking `PAID` | Zero client-side payment confirmation. Orders created via server-side Edge Function. Payment status updated exclusively via HMAC-SHA256 verified Razorpay webhooks. |
| **Unapproved Driver Dispatch** | Unvetted driver taking children | Multi-tier state machine: `driver_status` must be `VERIFIED` and `vehicle_status` must be `VERIFIED` before assignment or route activation. Database triggers prevent assignment to unapproved drivers. |
| **Public KYC Document Access** | Identity theft of driver Aadhaar/DL/RC | Supabase Storage private buckets. Zero public access. Temporary HMAC-signed URLs generated strictly for authenticated admins. |
| **Trip Event Replay / Tampering** | Falsified pickup/drop timestamps or repeated charges | UUID-based client idempotency keys (`idempotency_key`), unique constraint on `(trip_id, child_id, event_type)`. |
| **In-Motion Driver Distraction** | Road accidents during auto/van transit | UX enforces simple two-tap milestone buttons (`Picked Up`, `Dropped Off`). Complex forms locked during active trip execution. |

---

## 2. Row Level Security (RLS) Policy Matrix

### Table: `profiles`
- `SELECT`: `auth.uid() = id` OR `has_role(auth.uid(), 'operations_admin', 'super_admin')`.
- `INSERT`: Triggered automatically upon `auth.users` creation via security definer trigger.
- `UPDATE`: `auth.uid() = id` (can update display name, phone; cannot update role or verification status).

### Table: `children`
- `SELECT`: `parent_id = auth.uid()` OR `id IN (SELECT child_id FROM route_assignments WHERE route_id IN (SELECT id FROM routes WHERE driver_id = auth.uid() AND status = 'ACTIVE'))` OR `has_role(auth.uid(), 'operations_admin', 'super_admin')`.
- `INSERT`: Authenticated parent can insert where `parent_id = auth.uid()`.
- `UPDATE`: `parent_id = auth.uid()`.
- `DELETE`: `parent_id = auth.uid()`.

### Table: `drivers`
- `SELECT`: `user_id = auth.uid()` OR `has_role(auth.uid(), 'operations_admin', 'super_admin')` OR (`status = 'VERIFIED'` for public parent discovery on active routes).
- `INSERT`: Authenticated user where `user_id = auth.uid()`.
- `UPDATE`: Driver can only update draft fields. Changing `status` to `VERIFIED` or `SUSPENDED` requires admin privileges.

### Table: `driver_documents`
- `SELECT`: `driver_id = auth.uid()` OR `has_role(auth.uid(), 'operations_admin', 'super_admin')`.
- `INSERT`: `driver_id = auth.uid()`.
- `UPDATE`: `driver_id = auth.uid()` (only when status is `PENDING` or `REJECTED`).
- `DELETE`: Prohibited after submission.

### Table: `bookings`
- `SELECT`: `parent_id = auth.uid()` OR `route_id IN (SELECT id FROM routes WHERE driver_id = auth.uid())` OR `has_role(auth.uid(), 'operations_admin', 'super_admin')`.
- `INSERT`: Authenticated parent for their own child (`parent_id = auth.uid()`).
- `UPDATE`: Admin or server-side Edge Function (for status transition to `CONFIRMED`, `CANCELLED`).

### Table: `payments`
- `SELECT`: `parent_id = auth.uid()` OR `has_role(auth.uid(), 'operations_admin', 'super_admin')`.
- `INSERT/UPDATE`: Only executable by `service_role` (via Razorpay Webhook Edge Function). Client cannot directly insert or update payments.

### Table: `trip_events`
- `SELECT`: Driver of trip OR Parent of child in event OR Admin.
- `INSERT`: Assigned driver of active trip with valid `idempotency_key`.

---

## 3. Secret Management & Client Isolation
1. **Never in Mobile or Web Clients**:
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RAZORPAY_KEY_SECRET`
   - `RAZORPAY_WEBHOOK_SECRET`
   - `GOOGLE_MAPS_SERVER_KEY`
2. **Safe for Client Use**:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - `EXPO_PUBLIC_RAZORPAY_KEY_ID` (client checkout modal only)

---

## 4. Audit Logging & Compliance
All privileged state mutations (Driver Approval, Vehicle Approval, Route Activation, Refund Execution, Emergency Incident Escalation) write an immutable record to `audit_logs`:
- `id` (UUID)
- `actor_id` (UUID references auth.users)
- `actor_role` (VARCHAR)
- `action` (VARCHAR, e.g. `DRIVER_VERIFIED`, `REFUND_ISSUED`)
- `entity_type` (VARCHAR, e.g. `drivers`, `payments`)
- `entity_id` (UUID)
- `metadata` (JSONB diff of before/after state)
- `ip_address` (INET)
- `created_at` (TIMESTAMPTZ)
