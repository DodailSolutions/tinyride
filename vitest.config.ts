import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['**/*.test.ts'],
    // Load root .env so RLS integration tests pick up Supabase credentials
    // locally. In CI, inject secrets as environment variables directly.
    env: {
      EXPO_PUBLIC_SUPABASE_URL: process.env['EXPO_PUBLIC_SUPABASE_URL'] ?? '',
      EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env['EXPO_PUBLIC_SUPABASE_ANON_KEY'] ?? '',
      NEXT_PUBLIC_SUPABASE_URL: process.env['NEXT_PUBLIC_SUPABASE_URL'] ?? '',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] ?? '',
      SUPABASE_SERVICE_ROLE_KEY: process.env['SUPABASE_SERVICE_ROLE_KEY'] ?? '',
    },
  },
});
