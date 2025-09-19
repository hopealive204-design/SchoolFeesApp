// /functions/db.ts
import { corsHeaders, handleOptions } from "./_cors";
import { supabaseAdmin, type Env } from "./_supabase";

type InsertBody = {
  text?: string;
  author?: string;
};

export async function onRequest(context: { request: Request; env: Env }) {
  const { request, env } = context;

  const opt = handleOptions(request);
  if (opt) return opt;

  const supa = supabaseAdmin(env);

  if (request.method === "GET") {
    const { data, error } = await supa
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders(), "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders(), "Content-Type": "application/json" },
    });
  }

  if (request.method === "POST") {
    let body: InsertBody;
    try {
      body = await request.json() as InsertBody;
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { ...corsHeaders(), "Content-Type": "application/json" },
      });
    }

    const payload = {
      text: String(body?.text ?? ""),
      author: String(body?.author ?? "anonymous"),
    };

    const { data, error } = await supa.from("messages").insert(payload).select("*").single();
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders(), "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify(data), {
      status: 201,
      headers: { ...corsHeaders(), "Content-Type": "application/json" },
    });
  }

  return new Response("Method Not Allowed", { status: 405, headers: corsHeaders() });
}
