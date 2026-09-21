import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import {
  initializeTinyRideClient,
  requestOtp,
  verifyOtp,
  signOut as apiSignOut,
  getSession,
  onAuthStateChange,
  TinyRideSession,
} from '@tinyride/api-client';

declare const process: { env: Record<string, string | undefined> };

export interface DriverUser {
  id: string;
  phone: string;
  fullName: string;
  email?: string;
  role: 'driver';
}

interface AuthContextType {
  user: DriverUser | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
  requestPhoneOtp: (phone: string) => Promise<{ success: boolean; error?: string }>;
  verifyPhoneOtp: (phone: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  devDemoLogin: (name?: string, phone?: string) => void;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default demo driver credentials for immediate review
const DEMO_DRIVER: DriverUser = {
  id: 'd1111111-1111-1111-1111-111111111111',
  phone: '+919849011223',
  fullName: 'Ramesh Goud',
  email: 'ramesh.goud@tinyride.in',
  role: 'driver',
};

// Initialize Supabase client
const SUPABASE_URL =
  process.env['EXPO_PUBLIC_SUPABASE_URL'] || 'https://orseixsidgyhqrkndxeb.supabase.co';
const SUPABASE_ANON_KEY =
  process.env['EXPO_PUBLIC_SUPABASE_ANON_KEY'] ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yc2VpeHNpZGd5aHFya25keGViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5NzQ0NTcsImV4cCI6MjEwNTU1MDQ1N30.kfTWTZBR-vi4RlkAl0PEM32OVcD_a7135FAcX0h7oNs';

try {
  initializeTinyRideClient({
    supabaseUrl: SUPABASE_URL,
    supabaseAnonKey: SUPABASE_ANON_KEY,
  });
} catch {
  // Already initialized
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DriverUser | null>(DEMO_DRIVER);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkSession() {
      try {
        const activeSession = await getSession();
        if (activeSession && activeSession.user) {
          setSession(activeSession.session);
          setUser({
            id: activeSession.user.id,
            phone: activeSession.user.phone || '+919849011223',
            fullName:
              (activeSession.user.user_metadata as { full_name?: string })?.full_name ||
              'Ramesh Goud',
            email: activeSession.user.email,
            role: 'driver',
          });
        }
      } catch {
        // Fallback to demo mode
      }
    }

    checkSession();

    try {
      const unsubscribe = onAuthStateChange((activeSession: TinyRideSession | null) => {
        if (activeSession && activeSession.user) {
          setSession(activeSession.session);
          setUser({
            id: activeSession.user.id,
            phone: activeSession.user.phone || '',
            fullName:
              (activeSession.user.user_metadata as { full_name?: string })?.full_name || 'Driver',
            email: activeSession.user.email,
            role: 'driver',
          });
        } else {
          setUser(null);
          setSession(null);
        }
      });

      return () => {
        unsubscribe();
      };
    } catch {
      // Ignored
    }
  }, []);

  const requestPhoneOtp = async (phone: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await requestOtp(phone);
      setIsLoading(false);
      if (!res.success) {
        setError(res.error || 'Failed to send OTP');
        return { success: false, error: res.error };
      }
      return { success: true };
    } catch (err: unknown) {
      setIsLoading(false);
      const msg = err instanceof Error ? err.message : 'Failed to send OTP';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const verifyPhoneOtp = async (phone: string, otp: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await verifyOtp(phone, otp, 'driver');
      setIsLoading(false);
      if (!res.success || !res.session) {
        setError(res.error || 'Invalid OTP code');
        return { success: false, error: res.error };
      }

      setSession(res.session.session);
      setUser({
        id: res.session.user.id,
        phone: res.session.user.phone || phone,
        fullName:
          (res.session.user.user_metadata as { full_name?: string })?.full_name || 'Driver',
        email: res.session.user.email,
        role: 'driver',
      });
      return { success: true };
    } catch (err: unknown) {
      setIsLoading(false);
      const msg = err instanceof Error ? err.message : 'Invalid OTP code';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const devDemoLogin = (name = 'Ramesh Goud', phone = '+919849011223') => {
    setUser({
      id: 'd1111111-1111-1111-1111-111111111111',
      phone,
      fullName: name,
      email: 'ramesh.goud@tinyride.in',
      role: 'driver',
    });
    setError(null);
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await apiSignOut();
    } catch {
      // Ignored
    }
    setUser(null);
    setSession(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        error,
        requestPhoneOtp,
        verifyPhoneOtp,
        devDemoLogin,
        signOut,
        clearError: () => setError(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
