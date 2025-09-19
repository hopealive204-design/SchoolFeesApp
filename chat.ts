// /functions/chat.ts
import { corsHeaders, handleOptions } from "./_cors";
import type { Env } from "./_supabase";

type ChatBody = {
  prompt?: string;
  model?: string; // e.g. "gemini-1.5-flash" | "gemini-1.5-pro"
};

export async function onRequest(context: { request: Request; env: Env }) {
  const { request, env } = context;

  const opt = handleOptions(request);
  if (opt) return opt;

  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders() });
  }

  let body: ChatBody;
  try {
    body = await request.json() as ChatBody;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { ...corsHeaders(), "Content-Type": "application/json" },
    });
  }

  const prompt = body?.prompt ?? "";
  const model = body?.model ?? "gemini-1.5-flash";

  if (!env.GEMINI_API_KEY) {
    return new Response(JSON.stringify({ error: "Missing GEMINI_API_KEY" }), {
      status: 500,
      headers: { ...corsHeaders(), "Content-Type": "application/json" },
    });
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;
  const payload = { contents: [{ parts: [{ text: String(prompt) }]}] };

  const resp = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await resp.json().catch(() => ({}));
  return new Response(JSON.stringify(data), {
    status: resp.status,
    headers: { ...corsHeaders(), "Content-Type": "application/json" },
  });
}
