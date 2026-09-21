import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface TinyRideClientConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  authStorage?: {
    getItem: (key: string) => Promise<string | null> | string | null;
    setItem: (key: string, value: string) => Promise<void> | void;
    removeItem: (key: string) => Promise<void> | void;
  };
}

let clientInstance: SupabaseClient | null = null;

export function initializeTinyRideClient(config: TinyRideClientConfig): SupabaseClient {
  clientInstance = createClient(config.supabaseUrl, config.supabaseAnonKey, {
    auth: {
      storage: config.authStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
  return clientInstance;
}

export function getTinyRideClient(): SupabaseClient {
  if (!clientInstance) {
    throw new Error(
      'TinyRide Supabase client has not been initialized. Call initializeTinyRideClient() first.'
    );
  }
  return clientInstance;
}
