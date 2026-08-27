"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type ChatMessage = { role: "user" | "assistant"; content: string };

const STARTER_PROMPTS = [
  "What's my business overview today?",
  "Create a quotation for Sarah, 2 units at 3000 each",
  "Which products are low on stock?",
];

export default function BrainChat({ dashboardToken }: { dashboardToken: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi 👋 I'm your AI business assistant. Ask me about sales, stock, or say 'create a quotation for...' and I'll draft it.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const next: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`/api/dashboard/${dashboardToken}/brain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const json = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.ok ? json.reply : json.error ?? "Something went wrong." },
      ]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Network error — please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card flex flex-col h-[560px] overflow-hidden">
      <div className="px-5 py-3.5 border-b border-line flex items-center gap-2 bg-violet-50/60">
        <span className="w-2 h-2 rounded-full bg-violet-500" />
        <h2 className="font-semibold text-sm">AI Business Assistant</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap ${
                  m.role === "user" ? "bg-ink text-white rounded-br-md" : "bg-violet-50 text-ink rounded-bl-md"
                }`}
              >
                {m.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading ? (
          <div className="flex gap-1 px-1">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-violet-400"
                animate={{ y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15, ease: "easeInOut" }}
              />
            ))}
          </div>
        ) : null}

        {messages.length === 1 ? (
          <div className="flex flex-col gap-2 pt-2">
            {STARTER_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => send(p)}
                className="text-left text-xs bg-violet-50/60 border border-violet-100 rounded-lg px-3 py-2 hover:bg-violet-50 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        ) : null}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="border-t border-line p-3 flex gap-2"
      >
        <input
          className="input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your AI assistant…"
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()} className="btn-ai shrink-0">
          Send
        </button>
      </form>
    </div>
  );
}
