// app/api/chat/route.ts
import type { NextRequest } from "next/server";

/** Parse Ollama NDJSON and stream only the `response` field as plain text */
function streamOllamaToClient(res: Response): ReadableStream<Uint8Array> {
  if (!res.body) throw new Error("Upstream had no body");
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) {
        controller.close();
        return;
      }
      const chunk = decoder.decode(value, { stream: true });

      // Ollama returns NDJSON (one JSON object per line)
      for (const line of chunk.split("\n")) {
        const s = line.trim();
        if (!s) continue;
        try {
          const j = JSON.parse(s);
          // Stream only the model's text tokens
          if (typeof j?.response === "string") {
            controller.enqueue(encoder.encode(j.response));
          }
        } catch {
          // ignore partial JSON lines
        }
      }
    },
    cancel() {
      reader.cancel();
    },
  });
}

/** Small CORS-friendly headers for fetch/clients */
const COMMON_HEADERS = {
  "Content-Type": "text/plain; charset=utf-8",
  "Cache-Control": "no-store, no-transform",
  "X-Accel-Buffering": "no", // friendlier for proxies
} as const;

export async function POST(req: NextRequest) {
  try {
    // 1) Read prompt from JSON {prompt} or raw text
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
      // fall through; prompt might remain ""
    }

    if (!prompt?.trim()) {
      return new Response("No prompt provided.", { status: 400 });
    }

    // 2) Resolve model + base URL from env (safe defaults)
    const model = process.env.LOCAL_MODEL?.trim() || "phi3:mini";

    // Use your Cloudflare tunnel (or local Ollama) as the base
    const baseUrl =
      process.env.LOCAL_AI_URL?.trim() ||
      // final fallback so build never crashes (replace with your current tunnel)
      "https://schedule-seed-provinces-accomplish.trycloudflare.com";

    if (!baseUrl) {
      return new Response(
        "LOCAL_AI_URL is not set. Add it in your Vercel env or .env file.",
        { status: 500 }
      );
    }

    const url = `${baseUrl.replace(/\/$/, "")}/api/generate`;

    // 3) Call Ollama with stream=true so we can forward tokens
    const upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt,
        stream: true,
      }),
    });

    if (!upstream.ok) {
      const body = await upstream.text().catch(() => "");
      console.error("[CHAT] Ollama error", upstream.status, body);
      return new Response(`Ollama error ${upstream.status}: ${body}`, {
        status: 502,
        headers: COMMON_HEADERS,
      });
    }

    // 4) Stream NDJSON -> plain text back to the client
    const stream = streamOllamaToClient(upstream);
    return new Response(stream, { status: 200, headers: COMMON_HEADERS });
  } catch (e: any) {
    console.error("[CHAT] Server error:", e?.message || e);
    return new Response(`Server error: ${e?.message || e}`, {
      status: 500,
      headers: COMMON_HEADERS,
    });
  }
}

/** Optional: handle CORS preflight (if you embed from other domains) */
export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      ...COMMON_HEADERS,
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    },
  });
}
