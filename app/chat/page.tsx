"use client";
import { useState, useRef } from "react";

export default function Chat() {
  const [q, setQ] = useState("");
  const [a, setA] = useState("");
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  async function send() {
    if (!q.trim() || loading) return;
    setA("");
    setLoading(true);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: q }),
        signal: ctrl.signal
      });

      if (!res.ok || !res.body) {
        setA(await res.text());
        setLoading(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        // Append the chunk as it arrives
        setA(prev => prev + chunk);
      }
    } catch (e: any) {
      if (e.name === "AbortError") setA(prev => prev + "\n\n[stopped]");
      else setA("Network error: " + (e?.message || e));
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }

  function stop() {
    abortRef.current?.abort();
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">Veloura$ Chat (Streaming)</h1>

      <textarea
        className="w-full border p-2 rounded bg-gray-50"
        rows={4}
        placeholder="Type a message…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <div className="mt-2 flex gap-2">
        <button
          onClick={send}
          disabled={loading}
          className="px-4 py-2 bg-black text-white rounded disabled:opacity-50"
        >
          {loading ? "Streaming…" : "Send"}
        </button>
        {loading && (
          <button onClick={stop} className="px-4 py-2 bg-gray-200 rounded">
            Stop
          </button>
        )}
      </div>

      <pre className="mt-4 whitespace-pre-wrap bg-gray-100 p-3 rounded min-h-[8rem]">
        {a || (loading ? "…" : "")}
      </pre>
    </div>
  );
}
