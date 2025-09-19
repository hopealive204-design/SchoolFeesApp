// /functions/_supabase.ts
// Minimal helpers to initialize Supabase clients in Cloudflare Pages Functions.
// Using ESM import from esm.sh works in the Workers runtime.
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export type Env = {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  GEMINI_API_KEY: string;
};

export function supabaseAdmin(env: Env): SupabaseClient {
  const url = env.SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY; // server-only
  if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, { auth: { persistSession: false } });
}

export function supabaseClient(env: Env, authToken?: string): SupabaseClient {
  const url = env.SUPABASE_URL;
  const key = env.SUPABASE_ANON_KEY; // safe for client (RLS must protect tables)
  if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY");
  return createClient(url, key, {
    global: { headers: authToken ? { Authorization: `Bearer ${authToken}` } : {} },
    auth: { persistSession: false },
  });
}
