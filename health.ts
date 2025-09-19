// /functions/health.ts
import type { Env } from "./_supabase";

export async function onRequest({ env }: { env: Env }) {
  const ok = {
    SUPABASE_URL: Boolean(env.SUPABASE_URL),
    SUPABASE_ANON_KEY: Boolean(env.SUPABASE_ANON_KEY),
    SUPABASE_SERVICE_ROLE_KEY: Boolean(env.SUPABASE_SERVICE_ROLE_KEY),
    GEMINI_API_KEY: Boolean(env.GEMINI_API_KEY),
  };
  return new Response(JSON.stringify(ok), {
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}
