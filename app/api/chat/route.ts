// app/api/chat/route.ts
import { NextRequest } from "next/server";

export const runtime = "nodejs"; // don't use 'edge' for HTTP calls to Ollama

function streamOllamaToClient(res: Response) {
  if (!res.body) throw new Error("No body from Ollama");
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  return new ReadableStream({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) {
        controller.close();
        return;
      }
      const chunk = decoder.decode(value, { stream: true });
      for (const line of chunk.split("\n")) {
        const s = line.trim();
        if (!s) continue;
        try {
          const j = JSON.parse(s);
          if (typeof j?.response === "string") {
            controller.enqueue(encoder.encode(j.response));
          }
        } catch {
          // ignore partial/incomplete NDJSON lines
        }
      }
    },
    cancel() {
      reader.cancel();
    },
  });
}

export async function POST(req: NextRequest) {
  // Read prompt from JSON or raw body
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
    /* ignore */
  }

  if (!prompt.trim()) {
    return new Response("No prompt provided.", { status: 400 });
  }

  // Choose base URL by environment
  const isProd =
    process.env.VERCEL_ENV === "production" ||
    process.env.NODE_ENV === "production";

  const baseUrl = isProd
    ? process.env.PROD_AI_URL
    : process.env.LOCAL_AI_URL;

  const model = isProd
    ? process.env.PROD_MODEL || "phi3:mini"
    : process.env.LOCAL_MODEL || "phi3:mini";

  if (!baseUrl) {
    return new Response("AI base URL not configured.", { status: 500 });
  }

  const url = `${baseUrl.replace(/\/+$/, "")}/api/generate`;
  // console.log(`[CHAT] Mode: ${isProd ? "prod" : "local"} | URL: ${url} | Model: ${model}`);

  try {
    const upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // stream=true is required for token streaming
      body: JSON.stringify({ model, prompt, stream: true }),
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      // Pass through the upstream error text so you can see it in curl
      return new Response(`Upstream error ${upstream.status}: ${text}`, {
        status: 502,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const stream = streamOllamaToClient(upstream);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (e: any) {
    return new Response(`Server error: ${e?.message || e}`, { status: 500 });
  }
}

// Explicitly reject GET to avoid HTML errors when you browse to it
export async function GET() {
  return new Response("Method Not Allowed", { status: 405 });
}
