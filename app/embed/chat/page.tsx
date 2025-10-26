"use client";
import { useEffect, useState } from "react";

export default function EmbedChat() {
  const [q, setQ] = useState("");
  const [a, setA] = useState("");
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!q.trim()) return;
    setA(""); setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: q }),
      });
      const text = await res.text();
      setA(text);
      if (window.parent !== window) {
        window.parent.postMessage({ type: "veloura_chat_done", text }, "*");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const t = new URLSearchParams(location.search).get("theme") || "light";
    document.documentElement.dataset.theme = t;
  }, []);

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: 12, width: 360 }}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>Veloura$ Assistant</div>
      <textarea
        rows={3}
        style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #e5e7eb" }}
        placeholder="Ask me anything…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <button
        onClick={send}
        disabled={loading}
        style={{ marginTop: 8, padding: "8px 12px", borderRadius: 9999,
                 border: "1px solid #111", background: "#111", color: "#fff" }}
      >
        {loading ? "Sending…" : "Send"}
      </button>
      <pre
        style={{ whiteSpace: "pre-wrap", background: "#f6f6f6",
                 padding: 8, marginTop: 8, minHeight: 80, borderRadius: 8 }}
      >
        {a}
      </pre>
    </div>
  );
}
