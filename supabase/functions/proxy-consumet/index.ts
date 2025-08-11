// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "*",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { url, init } = await req.json();
    if (!url || typeof url !== "string") {
      return new Response(JSON.stringify({ error: "Missing URL" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const resp = await fetch(url, init);
    const contentType = resp.headers.get("content-type") || "application/json";

    // Stream JSON or text back
    const body = contentType.includes("application/json")
      ? JSON.stringify(await resp.json())
      : await resp.text();

    return new Response(body, {
      status: resp.status,
      headers: { "Content-Type": contentType, ...corsHeaders },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error?.message ?? "Proxy error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }
});
