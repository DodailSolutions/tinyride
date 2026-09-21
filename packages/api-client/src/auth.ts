/**
 * TinyRide by Dodail — Authentication Helpers
 *
 * Provides OTP-based phone authentication, role resolution, and session
 * management utilities. Uses the Supabase Auth OTP flow (no passwords).
 *
 * Security constraints enforced here:
 * - Admin/ops roles cannot be provisioned client-side (handled server-side).
 * - Session tokens are auto-refreshed.
 * - Role is read from the `profiles` table (NOT from JWT claims alone).
 */

import { Session, User } from '@supabase/supabase-js';
import { getTinyRideClient } from './client';

// ============================================================================
// TYPES
// ============================================================================

export type TinyRideRole =
  | 'parent'
  | 'driver'
  | 'operations_admin'
  | 'super_admin'
  | 'support_agent';

export interface TinyRideSession {
  user: User;
  session: Session;
  role: TinyRideRole;
}

export interface OtpRequestResult {
  success: boolean;
  error?: string;
}

export interface OtpVerifyResult {
  success: boolean;
  session?: TinyRideSession;
  error?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/** Roles that can only be assigned server-side by super admins. */
const ADMIN_ROLES: TinyRideRole[] = ['operations_admin', 'super_admin', 'support_agent'];

/** Roles permitted to self-provision via sign-up metadata. */
const SELF_SERVICE_ROLES: TinyRideRole[] = ['parent', 'driver'];

// ============================================================================
// OTP SIGN-IN FLOW (Phone OTP)
// ============================================================================

/**
 * Step 1: Request a 6-digit OTP to the given phone number.
 * The phone number must be in E.164 format (e.g., "+919849012345").
 *
 * Supabase Auth is configured for Phone OTP (no passwords).
 * SMS delivery is handled via Twilio/AWS SNS configured in Supabase project settings.
 */
export async function requestOtp(
  phone: string,
  signupRole: TinyRideRole = 'parent'
): Promise<OtpRequestResult> {
  const supabase = getTinyRideClient();
  const safeRole: TinyRideRole = SELF_SERVICE_ROLES.includes(signupRole)
    ? signupRole
    : 'parent';

  const { error } = await supabase.auth.signInWithOtp({
    phone,
    options: {
      shouldCreateUser: true,
      data: {
        role: safeRole,
      },
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Step 2: Verify the OTP entered by the user.
 * On success, creates or retrieves the Supabase Auth session and returns
 * the user's role from the `profiles` table.
 *
 * @param phone - E.164 phone number
 * @param otp   - 6-digit code received via SMS
 * @param signupRole - 'parent' | 'driver' (only used on first sign-up)
 */
export async function verifyOtp(
  phone: string,
  otp: string,
  _signupRole: TinyRideRole = 'parent'
): Promise<OtpVerifyResult> {
  const supabase = getTinyRideClient();

  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token: otp,
    type: 'sms',
  });

  if (error || !data.session || !data.user) {
    return { success: false, error: error?.message ?? 'OTP verification failed' };
  }

  // Fetch role from DB (single source of truth; JWT claims are secondary)
  const role = await resolveUserRole(data.user.id);

  return {
    success: true,
    session: {
      user: data.user,
      session: data.session,
      role,
    },
  };
}

/**
 * Sign out the current user and clear local session storage.
 */
export async function signOut(): Promise<void> {
  const supabase = getTinyRideClient();
  await supabase.auth.signOut();
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

/**
 * Retrieve the currently active session, refreshing the JWT if needed.
 * Returns null if no authenticated session exists.
 */
export async function getSession(): Promise<TinyRideSession | null> {
  const supabase = getTinyRideClient();

  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session || !data.session.user) {
    return null;
  }

  const role = await resolveUserRole(data.session.user.id);

  return {
    user: data.session.user,
    session: data.session,
    role,
  };
}

/**
 * Listen for real-time auth state changes.
 * Callback fires when user signs in, signs out, or token refreshes.
 *
 * @returns Unsubscribe function — call on component unmount.
 */
export function onAuthStateChange(
  callback: (session: TinyRideSession | null) => void
): () => void {
  const supabase = getTinyRideClient();

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (_event, session) => {
      if (!session?.user) {
        callback(null);
        return;
      }
      const role = await resolveUserRole(session.user.id);
      callback({ user: session.user, session, role });
    }
  );

  return () => subscription.unsubscribe();
}

// ============================================================================
// ROLE RESOLUTION
// ============================================================================

/**
 * Resolve the user's role from the `profiles` table.
 * Falls back to 'parent' if the profile is not yet created (race condition
 * during first sign-up between auth.users INSERT and trigger execution).
 *
 * This is the authoritative role check — always prefer this over reading
 * JWT claims directly, which may be stale.
 */
export async function resolveUserRole(userId: string): Promise<TinyRideRole> {
  const supabase = getTinyRideClient();

  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  return ((data as { role?: TinyRideRole } | null)?.role as TinyRideRole | undefined) ?? 'parent';
}

/**
 * Guard helper: returns true if the given role has admin privileges.
 */
export function isAdminRole(role: TinyRideRole): boolean {
  return ADMIN_ROLES.includes(role);
}

/**
 * Guard helper: returns true if the user is a verified admin or super admin.
 */
export function isSuperAdmin(role: TinyRideRole): boolean {
  return role === 'super_admin';
}

// ============================================================================
// EMAIL OTP SIGN-IN (Admin web portal)
// ============================================================================

/**
 * Admin sign-in via email magic link (no password).
 * Used by the Next.js admin portal. Mobile apps use phone OTP exclusively.
 *
 * @param email - Admin user email address
 * @param redirectTo - Post-login redirect URL
 */
export async function requestEmailOtp(
  email: string,
  redirectTo?: string
): Promise<OtpRequestResult> {
  const supabase = getTinyRideClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false, // Admin accounts are pre-provisioned server-side
      emailRedirectTo: redirectTo,
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
