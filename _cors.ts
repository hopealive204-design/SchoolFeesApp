// /functions/_cors.ts
export type CorsOptions = {
  origin?: string;
  methods?: string;
  headers?: string;
};

export function corsHeaders(opts: CorsOptions = {}) {
  const origin = opts.origin ?? "*";
  const methods = opts.methods ?? "GET,POST,OPTIONS";
  const headers = opts.headers ?? "Content-Type, Authorization";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": methods,
    "Access-Control-Allow-Headers": headers,
  };
}

export function handleOptions(request: Request, opts: CorsOptions = {}) {
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders(opts) });
  }
  return null;
}
