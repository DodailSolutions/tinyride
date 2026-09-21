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

export interface ParentUser {
  id: string;
  phone: string;
  fullName: string;
  email?: string;
  role: 'parent';
}

interface AuthContextType {
  user: ParentUser | null;
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

// Default demo parent credentials for quick offline / testing login
const DEMO_PARENT: ParentUser = {
  id: 'parent-demo-user-001',
  phone: '+919849012345',
  fullName: 'Ananya Sharma',
  email: 'ananya.sharma@example.com',
  role: 'parent',
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
  // Client might have been initialized already
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ParentUser | null>(DEMO_PARENT); // Default logged-in for immediate review, toggleable in UI
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check existing live Supabase session
    async function checkSession() {
      try {
        const activeSession = await getSession();
        if (activeSession && activeSession.user) {
          setSession(activeSession.session);
          setUser({
            id: activeSession.user.id,
            phone: activeSession.user.phone || '+919849012345',
            fullName:
              (activeSession.user.user_metadata as { full_name?: string })?.full_name ||
              'Parent User',
            email: activeSession.user.email,
            role: 'parent',
          });
        }
      } catch {
        // Offline or dev mode — keep default state
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
              (activeSession.user.user_metadata as { full_name?: string })?.full_name || 'Parent',
            email: activeSession.user.email,
            role: 'parent',
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
      // Listener setup failed gracefully
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
      const res = await verifyOtp(phone, otp, 'parent');
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
          (res.session.user.user_metadata as { full_name?: string })?.full_name || 'Parent',
        email: res.session.user.email,
        role: 'parent',
      });
      return { success: true };
    } catch (err: unknown) {
      setIsLoading(false);
      const msg = err instanceof Error ? err.message : 'Invalid OTP code';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const devDemoLogin = (name = 'Ananya Sharma', phone = '+919849012345') => {
    setUser({
      id: 'parent-demo-user-001',
      phone,
      fullName: name,
      email: 'ananya.sharma@example.com',
      role: 'parent',
    });
    setError(null);
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await apiSignOut();
    } catch {
      // Ignore API sign-out errors
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
