"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, subject, message }),
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json.error ?? "Something went wrong. Please try again.");
      setSubmitting(false);
      return;
    }

    setSent(true);
    setSubmitting(false);
  }

  if (sent) {
    return (
      <div className="card p-8 flex flex-col items-center text-center gap-3 h-full justify-center">
        <div className="w-12 h-12 rounded-full bg-signal-50 flex items-center justify-center text-signal-600">
          <CheckCircle2 size={22} />
        </div>
        <p className="font-medium text-lg">Message sent</p>
        <p className="text-sm text-ink-soft max-w-xs">
          Thanks for reaching out — we typically reply within a business day.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 sm:p-7 flex flex-col gap-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Your name">
          <input required value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Jane Wanjiru" />
        </Field>
        <Field label="Email">
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            placeholder="jane@email.com"
          />
        </Field>
      </div>
      <Field label="Subject">
        <input
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="input"
          placeholder="Question about a shop listing"
        />
      </Field>
      <Field label="Message">
        <textarea
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="input"
          placeholder="Tell us what's going on…"
        />
      </Field>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button type="submit" disabled={submitting} className="btn-primary self-start disabled:opacity-60">
        {submitting ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-ink-soft">{label}</span>
      {children}
    </label>
  );
}
