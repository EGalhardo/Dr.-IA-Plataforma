import { createClient } from '@supabase/supabase-js';

// Load client-side environment variables
const supabaseUrl: string =
  (import.meta as any).env.VITE_SUPABASE_URL || '';

// Prefer the classic anon JWT; fall back to the new sb_publishable_ key
// if present (new Supabase SDKs accept both).
const supabaseAnonKey: string =
  (import.meta as any).env.VITE_SUPABASE_ANON_KEY ||
  (import.meta as any).env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  '';

// Fallback warning in console if keys are missing during development
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase integration: Missing VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY / VITE_SUPABASE_PUBLISHABLE_KEY. ' +
    'Please set these environment variables to connect to your database.'
  );
}

// Create and export the Supabase Client
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: { eventsPerSecond: 10 },
    },
  }
);
