"use client";

import { useState } from "react";
import { formatBRL } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imgUrl: string | null;
}

interface Props {
  eventSlug: string;
  /** Server Action injetado pelo Server Component pai — secret nunca chega ao cliente */
  onDelete: (productId: string, eventSlug: string) => Promise<{ ok: boolean; error?: string }>;
  initialProducts: Product[];
  primaryColor: string;
}

export function ProductManager({ eventSlug, onDelete, initialProducts, primaryColor }: Props) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [form, setForm] = useState({ name: "", description: "", price: "", imgUrl: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.price.trim()) { setError("Nome e valor sao obrigatorios"); return; }
    const priceInCents = Math.round(parseFloat(form.price.replace(",", ".")) * 100);
    if (isNaN(priceInCents) || priceInCents <= 0) { setError("Valor invalido"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventSlug, name: form.name.trim(), description: form.description.trim() || null, price: priceInCents, imgUrl: form.imgUrl.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) { setError(typeof data.error === "string" ? data.error : "Dados invalidos"); return; }
      setProducts((prev) => [...prev, data.product]);
      setForm({ name: "", description: "", price: "", imgUrl: "" });
      setOpen(false);
    } catch { setError("Erro de conexao"); }
    finally { setLoading(false); }
  }

  async function handleDelete(productId: string) {
    if (!confirm("Remover este presente da lista?")) return;
    const result = await onDelete(productId, eventSlug);
    if (result.ok) {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } else {
      alert(result.error ?? "Erro ao remover");
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
      <div className="px-6 py-4 border-b flex items-center justify-between">
        <h2 className="font-semibold text-gray-700">Lista de Presentes ({products.length})</h2>
        <button onClick={() => setOpen(true)} className="px-4 py-2 rounded-full text-sm font-semibold text-white transition-colors hover:opacity-90" style={{ backgroundColor: primaryColor }}>
          + Adicionar presente
        </button>
      </div>

      {products.length === 0 ? (
        <p className="px-6 py-8 text-center text-gray-400 text-sm">Nenhum presente ainda. Adicione o primeiro!</p>
      ) : (
        <div className="divide-y">
          {products.map((p) => (
            <div key={p.id} className="px-6 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                {p.imgUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.imgUrl} alt={p.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-xl flex-shrink-0">🎁</div>
                )}
                <div className="min-w-0">
                  <p className="font-medium text-gray-800 truncate">{p.name}</p>
                  {p.description && <p className="text-xs text-gray-400 truncate">{p.description}</p>}
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="font-bold text-gray-700">{formatBRL(p.price)}</span>
                <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-600 text-sm px-2 py-1 rounded transition-colors">
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-5">Novo presente</h3>
            <form onSubmit={handleAdd} className="space-y-3">
              <input type="text" placeholder="Nome do presente *" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2" />
              <input type="text" placeholder="Descricao (opcional)" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full border rounded-xl px-4 py-3 text-sm outline-none" />
              <input type="text" placeholder="Valor em R$ (ex: 150,00) *" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2" />
              <input type="url" placeholder="URL da imagem (opcional)" value={form.imgUrl} onChange={(e) => setForm((f) => ({ ...f, imgUrl: e.target.value }))} className="w-full border rounded-xl px-4 py-3 text-sm outline-none" />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setOpen(false); setError(""); }} className="flex-1 py-3 rounded-full border text-gray-600 text-sm font-medium">
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="flex-1 py-3 rounded-full text-white text-sm font-semibold disabled:opacity-60" style={{ backgroundColor: primaryColor }}>
                  {loading ? "Salvando..." : "Adicionar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
