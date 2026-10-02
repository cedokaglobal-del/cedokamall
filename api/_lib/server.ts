/**
 * Server-only helpers for Vercel Functions.
 *
 * IMPORTANT: nothing in `api/` may be imported from `src/`. Vercel bundles the
 * browser app and the functions separately, but keeping the boundary explicit in
 * the code makes it obvious that a secret can never be dragged into the client
 * bundle by a stray import.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export interface ServerEnv {
  supabaseUrl: string;
  serviceRoleKey: string;
  paystackSecretKey: string;
  siteUrl: string;
}

/**
 * Reads and validates the server-only environment.
 *
 * Returns a list of problems rather than throwing so each route can answer with
 * a precise 500 and a useful message instead of a generic crash.
 */
export const readServerEnv = (): { env: ServerEnv; missing: string[] } => {
  const env: ServerEnv = {
    supabaseUrl: process.env.SUPABASE_URL || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    paystackSecretKey: process.env.PAYSTACK_SECRET_KEY || '',
    siteUrl: process.env.SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || '',
  };

  const missing: string[] = [];
  if (!env.supabaseUrl) missing.push('SUPABASE_URL');
  if (!env.serviceRoleKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');
  if (!env.paystackSecretKey) missing.push('PAYSTACK_SECRET_KEY');

  return { env, missing };
};

/**
 * Supabase client using the service role key.
 *
 * The service role bypasses RLS, so it must only ever exist inside a function.
 * It is never sent to the browser.
 */
export const serverSupabase = (url: string, serviceRoleKey: string): SupabaseClient =>
  createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

/** Consistent JSON response with no-store caching. */
export const json = (status: number, body: unknown) => ({
  status,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  },
  body: JSON.stringify(body),
});

/**
 * Minimal CORS guard: only same-origin browser calls are accepted.
 *
 * Without this, any site could POST to the endpoint from a visitor's browser and
 * attempt to use your Paystack account.
 */
export const assertSameOrigin = (origin: string | undefined, siteUrl: string): boolean => {
  if (!origin) return true; // server-to-server or same-origin fetch without Origin
  try {
    return new URL(origin).host === new URL(siteUrl).host;
  } catch {
    return false;
  }
};

export const normaliseEmail = (value: unknown): string => {
  const email = typeof value === 'string' ? value.trim().toLowerCase() : '';
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? email : '';
};

export const normaliseReference = (value: unknown): string => {
  const reference = typeof value === 'string' ? value.trim() : '';
  // Paystack references become part of a provider URL, so keep them boring.
  return /^[A-Za-z0-9_-]{8,32}$/.test(reference) ? reference : '';
};
