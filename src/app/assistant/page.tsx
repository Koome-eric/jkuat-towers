"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ShopPlaque } from "@/components/ShopPlaque";

type ProductResult = {
  id: string;
  name: string;
  brand: string | null;
  price: number;
  shop: { name: string; shopNumber: string; floor: string | null; slug: string; whatsapp: string | null };
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  products?: ProductResult[];
};

const STARTER_PROMPTS = [
  "I need a men's perfume under 3000",
  "Gift ideas under 5000 for a birthday",
  "Do you have black handbags?",
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi 👋 I'm the JKUAT Towers shopping assistant. Tell me what you're looking for and I'll search every shop in the building.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages.map((m) => ({ role: m.role, content: m.content })) }),
      });
      const json = await res.json();

      if (!res.ok) {
        setMessages((prev) => [...prev, { role: "assistant", content: json.error ?? "Something went wrong. Please try again." }]);
        return;
      }

      setMessages((prev) => [...prev, { role: "assistant", content: json.reply, products: json.products }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Network error — please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="h-dvh bg-paper flex flex-col overflow-hidden">
      <header className="bg-violet-500 text-white px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between shrink-0">
        <div>
          <Link href="/" className="text-xs text-white/70 hover:text-white transition-colors">
            ← JKUAT Towers
          </Link>
          <h1 className="font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            Ask JKUAT Towers
          </h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 max-w-2xl w-full mx-auto">
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className="max-w-[85%]">
                <div
                  className={`rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-ink text-white rounded-br-md"
                      : "bg-white border border-line rounded-bl-md"
                  }`}
                >
                  {m.content}
                </div>

                {m.products && m.products.length > 0 ? (
                  <div className="mt-2 space-y-2">
                    {m.products.slice(0, 6).map((p, idx) => (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.04, duration: 0.2 }}
                      >
                        <Link href={`/shops/${p.shop.slug}`} className="block card card-interactive px-3.5 py-2.5">
                          <div className="flex justify-between items-start gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{p.name}</p>
                              <ShopPlaque shopNumber={p.shop.shopNumber} floor={p.shop.floor} className="mt-1.5" />
                            </div>
                            <p className="text-sm font-semibold font-tabular whitespace-nowrap">
                              KSh {p.price.toLocaleString()}
                            </p>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                ) : null}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="bg-white border border-line rounded-2xl rounded-bl-md px-4 py-3 flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-neutral-400"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15, ease: "easeInOut" }}
                />
              ))}
            </div>
          </motion.div>
        ) : null}

        {messages.length === 1 ? (
          <div className="flex flex-wrap gap-2 pt-2">
            {STARTER_PROMPTS.map((p) => (
              <button key={p} onClick={() => sendMessage(p)} className="chip text-xs">
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
          sendMessage(input);
        }}
        className="border-t border-line bg-white px-4 py-3 shrink-0"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <div className="max-w-2xl mx-auto flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about a product, price, or gift idea…"
            className="input"
            disabled={loading}
          />
          <button type="submit" disabled={loading || !input.trim()} className="btn-ai shrink-0">
            Send
          </button>
        </div>
      </form>
    </main>
  );
}
