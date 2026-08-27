"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string | null;
  isActive: boolean;
};

export default function ProductManager({
  dashboardToken,
  initialProducts,
}: {
  dashboardToken: string;
  initialProducts: Product[];
}) {
  const [products, setProducts] = useState(initialProducts);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function addProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !price) return;
    setSubmitting(true);
    setError(null);

    const res = await fetch(`/api/dashboard/${dashboardToken}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, price: Number(price), stock: stock ? Number(stock) : 0 }),
    });
    const json = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(json.error ?? "Could not add product");
      return;
    }

    setProducts((prev) => [...prev, { ...json.product, price: Number(json.product.price) }]);
    setName("");
    setPrice("");
    setStock("");
  }

  async function toggleActive(product: Product) {
    setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, isActive: !p.isActive } : p)));
    await fetch(`/api/dashboard/${dashboardToken}/products`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id, isActive: !product.isActive }),
    });
  }

  return (
    <div className="card p-5 sm:p-6">
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-semibold">Products</h2>
        <span className="text-xs text-ink-soft font-tabular">
          {products.filter((p) => p.isActive).length} live
        </span>
      </div>

      <div className="divide-y divide-line">
        <AnimatePresence initial={false}>
          {products.map((p) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center justify-between py-2.5 text-sm"
            >
              <div className="min-w-0">
                <p className={`truncate ${p.isActive ? "" : "line-through text-neutral-400"}`}>{p.name}</p>
                <p className="text-xs text-ink-soft font-tabular mt-0.5">
                  KSh {p.price.toLocaleString()} · stock {p.stock}
                  {p.stock <= 5 ? <span className="text-amber-500"> · low</span> : null}
                </p>
              </div>
              <button
                onClick={() => toggleActive(p)}
                className={`text-xs rounded-full px-3 py-1.5 border shrink-0 transition-colors ${
                  p.isActive ? "text-ink-soft border-line hover:border-ink" : "text-signal-600 border-signal-100 bg-signal-50"
                }`}
              >
                {p.isActive ? "Deactivate" : "Reactivate"}
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        {!products.length ? <p className="text-sm text-ink-soft py-2">No products yet.</p> : null}
      </div>

      <form onSubmit={addProduct} className="mt-4 pt-4 border-t border-line space-y-2">
        <p className="text-sm font-medium">Add a product</p>
        <input className="input" placeholder="Product name" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="grid grid-cols-2 gap-2">
          <input className="input" type="number" placeholder="Price (KSh)" value={price} onChange={(e) => setPrice(e.target.value)} />
          <input className="input" type="number" placeholder="Stock" value={stock} onChange={(e) => setStock(e.target.value)} />
        </div>
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? "Adding…" : "Add product"}
        </button>
      </form>
    </div>
  );
}
