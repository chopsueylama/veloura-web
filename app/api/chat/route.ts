import type { NextRequest } from "next/server";

/**
 * Works both locally and on Vercel.
 * Local: talks to Ollama via localhost:11434
 * Vercel: uses Cloudflare tunnel URL from environment variables
 */
export async function POST(req: NextRequest) {
  try {
    // ---- Parse input prompt ----
    let prompt = "";
    try {
      const ct = req.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        const body = await req.json();
        prompt = (body?.prompt ?? body?.message ?? "").toString();
      } else {
        prompt = (await req.text()).toString();
      }
    } catch {
      prompt = "";
    }

    if (!prompt.trim()) {
      return new Response("No prompt provided.", { status: 400 });
    }

    // ---- Determine where to send ----
    const mode = process.env.AI_MODE || "local";
    const localBase = process.env.LOCAL_AI_URL || "http://localhost:11434";
    const remoteBase = process.env.LOCAL_AI_URL; // same variable, but different value on Vercel

    const baseUrl = mode === "local" ? localBase : remoteBase;
    const model = process.env.LOCAL_MODEL || "phi3:mini";

    const url = `${baseUrl.replace(/\/$/, "")}/api/generate`;

    console.log(`[CHAT] Mode: ${mode} | URL: ${url} | Model: ${model}`);

    // ---- Send to Ollama ----
    const upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, prompt, stream: false }),
    });

    const text = await upstream.text();

    if (!upstream.ok) {
      console.error("[CHAT] Ollama error", upstream.status, text);
      return new Response(`Ollama error ${upstream.status}: ${text}`, { status: 502 });
    }

    // ---- Return plain text ----
    try {
      const data = JSON.parse(text);
      const reply = typeof data?.response === "string" ? data.response : text;
      return new Response(reply, {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    } catch {
      return new Response(text, {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
  } catch (e: any) {
    console.error("[CHAT] Server exception:", e?.message || e);
    return new Response(`Server error: ${e?.message || e}`, { status: 500 });
  }
}
