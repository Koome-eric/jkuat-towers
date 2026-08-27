"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { THEME_SWATCHES } from "@/lib/templates";

type ProductDraft = { name: string; price: string; stock: string; category: string };

const CATEGORIES = [
  "Perfume",
  "Fashion",
  "Shoes",
  "Electronics",
  "Phone Accessories",
  "Beauty & Barber",
  "Jewelry",
  "Bags",
  "Food",
  "Gifts",
  "Watches",
  "Tailoring",
  "Tech Repair",
  "Services",
  "Other",
];

const PAYMENT_OPTIONS = ["mpesa", "cash", "card", "bank"];

const STEPS = ["Business", "Location & contact", "Products", "Review"] as const;

export default function OnboardPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [aboutBusiness, setAboutBusiness] = useState("");
  const [themeColor, setThemeColor] = useState<string | null>(null);

  const [shopNumber, setShopNumber] = useState("");
  const [floorLabel, setFloorLabel] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [openingHours, setOpeningHours] = useState("");
  const [paymentMethods, setPaymentMethods] = useState<string[]>(["mpesa"]);

  const [products, setProducts] = useState<ProductDraft[]>([
    { name: "", price: "", stock: "", category: "" },
  ]);

  function updateProduct(index: number, field: keyof ProductDraft, value: string) {
    setProducts((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  }

  function addProduct() {
    setProducts((prev) => [...prev, { name: "", price: "", stock: "", category: "" }]);
  }

  function removeProduct(index: number) {
    setProducts((prev) => prev.filter((_, i) => i !== index));
  }

  function togglePayment(method: string) {
    setPaymentMethods((prev) =>
      prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method]
    );
  }

  function canProceed(): boolean {
    if (step === 0) return businessName.trim().length > 1 && category.length > 0;
    if (step === 1) return shopNumber.trim().length > 0 && phone.trim().length > 6;
    if (step === 2) return products.some((p) => p.name.trim() && Number(p.price) > 0);
    return true;
  }

  function goTo(next: number) {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          ownerName: ownerName || undefined,
          category,
          shopNumber,
          floorLabel: floorLabel || undefined,
          phone,
          whatsapp: whatsapp || undefined,
          openingHours: openingHours || undefined,
          aboutBusiness: aboutBusiness || undefined,
          paymentMethods,
          themeColor: themeColor || undefined,
          products: products
            .filter((p) => p.name.trim() && Number(p.price) > 0)
            .map((p) => ({
              name: p.name,
              price: Number(p.price),
              stock: p.stock ? Number(p.stock) : 0,
              category: p.category || undefined,
            })),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        if (res.status === 409 && json.shop?.dashboardToken) {
          router.push(`/dashboard/${json.shop.dashboardToken}`);
          return;
        }
        setError(json.error ?? "Something went wrong. Please check your details.");
        setSubmitting(false);
        return;
      }

      router.push(`/dashboard/${json.shop.dashboardToken}?welcome=1`);
    } catch {
      setError("Network error — please try again.");
      setSubmitting(false);
    }
  }

  const variants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 24 : -24 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -24 : 24 }),
  };

  return (
    <main className="min-h-screen bg-paper px-6 py-10 sm:py-16">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-semibold">Join JKUAT Towers</h1>
        <p className="text-ink-soft mt-1">Get your digital shop live in about 5 minutes — free to start.</p>

        {/* Step indicator */}
        <div className="flex items-center gap-1.5 sm:gap-2 mt-8 mb-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex-1 min-w-0">
              <div className="h-1.5 rounded-full bg-line overflow-hidden">
                <motion.div
                  className="h-full bg-ink rounded-full"
                  initial={false}
                  animate={{ width: i <= step ? "100%" : "0%" }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
              <p
                className={`hidden sm:block text-xs mt-1.5 truncate transition-colors ${i === step ? "text-ink font-medium" : "text-neutral-400"}`}
              >
                {label}
              </p>
            </div>
          ))}
        </div>
        <p className="sm:hidden text-xs font-medium text-ink mb-2">
          Step {step + 1} of {STEPS.length} · {STEPS[step]}
        </p>

        <div className="card p-5 sm:p-8 mt-6 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              {step === 0 && (
                <div className="space-y-4">
                  <Field label="Business name">
                    <input
                      className="input"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Eric Fragrances"
                      autoFocus
                    />
                  </Field>
                  <Field label="Owner name (optional)">
                    <input className="input" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
                  </Field>
                  <Field label="Category">
                    <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="About your business (optional)">
                    <textarea
                      className="input"
                      rows={3}
                      value={aboutBusiness}
                      onChange={(e) => setAboutBusiness(e.target.value)}
                      placeholder="What makes your shop worth visiting?"
                    />
                  </Field>
                  <Field label="Storefront accent color (optional)">
                    <div className="flex flex-wrap gap-2.5 mt-0.5">
                      {THEME_SWATCHES.map((s) => (
                        <button
                          key={s.value}
                          type="button"
                          title={s.label}
                          aria-label={s.label}
                          onClick={() => setThemeColor(s.value)}
                          className="w-7 h-7 rounded-full shrink-0 transition-transform hover:scale-110"
                          style={{
                            background: s.value,
                            boxShadow:
                              themeColor === s.value
                                ? "0 0 0 2px white, 0 0 0 4px #0B1121"
                                : "0 0 0 1px rgba(0,0,0,0.08)",
                          }}
                        />
                      ))}
                      <label
                        className="w-7 h-7 rounded-full shrink-0 cursor-pointer relative overflow-hidden"
                        style={{
                          background:
                            themeColor ?? "conic-gradient(from 0deg, red, yellow, lime, cyan, blue, magenta, red)",
                          boxShadow:
                            themeColor && !THEME_SWATCHES.some((s) => s.value === themeColor)
                              ? "0 0 0 2px white, 0 0 0 4px #0B1121"
                              : "0 0 0 1px rgba(0,0,0,0.08)",
                        }}
                        title="Custom color"
                      >
                        <input
                          type="color"
                          value={themeColor ?? "#3452ff"}
                          onChange={(e) => setThemeColor(e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </label>
                    </div>
                    <p className="text-xs text-ink-soft mt-2">
                      Leave unset to use your category&apos;s default color — you can change this anytime from your
                      dashboard.
                    </p>
                  </Field>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Shop number">
                      <input
                        className="input"
                        value={shopNumber}
                        onChange={(e) => setShopNumber(e.target.value)}
                        placeholder="Shop 21"
                        autoFocus
                      />
                    </Field>
                    <Field label="Floor (optional)">
                      <input
                        className="input"
                        value={floorLabel}
                        onChange={(e) => setFloorLabel(e.target.value)}
                        placeholder="Floor 3"
                      />
                    </Field>
                  </div>
                  <Field label="Phone number">
                    <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+2547..." />
                  </Field>
                  <Field label="WhatsApp number (if different)">
                    <input className="input" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+2547..." />
                  </Field>
                  <Field label="Opening hours (optional)">
                    <input
                      className="input"
                      value={openingHours}
                      onChange={(e) => setOpeningHours(e.target.value)}
                      placeholder="Mon-Sat 8am-7pm"
                    />
                  </Field>
                  <Field label="Payment methods you accept">
                    <div className="flex flex-wrap gap-2">
                      {PAYMENT_OPTIONS.map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => togglePayment(m)}
                          className="chip"
                          data-active={paymentMethods.includes(m)}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </Field>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <p className="text-sm text-ink-soft">Add a few products to start — you can add more later.</p>
                  <AnimatePresence initial={false}>
                    {products.map((p, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border border-line rounded-xl p-3 space-y-2 relative overflow-hidden"
                      >
                        {products.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeProduct(i)}
                            className="absolute top-2.5 right-2.5 text-xs text-neutral-400 hover:text-ink transition-colors"
                          >
                            Remove
                          </button>
                        )}
                        <input
                          className="input"
                          placeholder="Product name"
                          value={p.name}
                          onChange={(e) => updateProduct(i, "name", e.target.value)}
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            className="input"
                            placeholder="Price (KSh)"
                            type="number"
                            value={p.price}
                            onChange={(e) => updateProduct(i, "price", e.target.value)}
                          />
                          <input
                            className="input"
                            placeholder="Stock"
                            type="number"
                            value={p.stock}
                            onChange={(e) => updateProduct(i, "stock", e.target.value)}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <button type="button" onClick={addProduct} className="text-sm font-medium text-signal-600 hover:text-signal-700 transition-colors">
                    + Add another product
                  </button>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-3 text-sm">
                  <SummaryRow label="Business" value={`${businessName} (${category})`} />
                  <SummaryRow label="Location" value={`${shopNumber}${floorLabel ? `, ${floorLabel}` : ""}`} />
                  <SummaryRow label="Phone" value={phone} />
                  <SummaryRow label="Payments" value={paymentMethods.join(", ") || "—"} />
                  <SummaryRow
                    label="Products"
                    value={products.filter((p) => p.name).map((p) => `${p.name} (KSh ${p.price})`).join(", ")}
                  />
                  {error ? <p className="text-red-600">{error}</p> : null}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-between mt-6">
          <button
            type="button"
            disabled={step === 0}
            onClick={() => goTo(Math.max(0, step - 1))}
            className="text-sm text-ink-soft hover:text-ink transition-colors disabled:opacity-0"
          >
            ← Back
          </button>

          {step < STEPS.length - 1 ? (
            <button type="button" disabled={!canProceed()} onClick={() => goTo(Math.min(STEPS.length - 1, step + 1))} className="btn-primary">
              Continue
            </button>
          ) : (
            <button type="button" disabled={submitting} onClick={handleSubmit} className="btn-primary">
              {submitting ? "Creating your shop…" : "Go live"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-line pb-2.5">
      <span className="text-ink-soft">{label}</span>
      <span className="font-medium text-right max-w-[60%]">{value}</span>
    </div>
  );
}
