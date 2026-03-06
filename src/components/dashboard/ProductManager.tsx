"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  onDelete: (productId: string, eventSlug: string) => Promise<{ ok: boolean; error?: string }>;
  initialProducts: Product[];
  primaryColor: string;
}

export function ProductManager({ eventSlug, onDelete, initialProducts, primaryColor }: Props) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [form, setForm] = useState({ name: "", description: "", price: "", imgUrl: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.price.trim()) { setError("Nome e valor são obrigatórios"); return; }
    const priceInCents = Math.round(parseFloat(form.price.replace(",", ".")) * 100);
    if (isNaN(priceInCents) || priceInCents <= 0) { setError("Valor inválido"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventSlug,
          name: form.name.trim(),
          description: form.description.trim() || null,
          price: priceInCents,
          imgUrl: form.imgUrl.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(typeof data.error === "string" ? data.error : "Dados inválidos"); return; }
      setProducts((prev) => [...prev, data.product]);
      setForm({ name: "", description: "", price: "", imgUrl: "" });
      setDialogOpen(false);
    } catch { setError("Erro de conexão"); }
    finally { setLoading(false); }
  }

  async function handleDelete(productId: string) {
    setDeletingId(productId);
    setDeleteError("");
    const result = await onDelete(productId, eventSlug);
    if (result.ok) {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } else {
      setDeleteError(result.error ?? "Erro ao remover presente");
    }
    setDeletingId(null);
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-lg">Lista de Presentes</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              {products.length} {products.length === 1 ? "item" : "itens"} cadastrado{products.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button
            size="sm"
            className="rounded-full"
            style={{ backgroundColor: primaryColor }}
            onClick={() => setDialogOpen(true)}
          >
            + Adicionar presente
          </Button>
        </CardHeader>

        <Separator />

        <CardContent className="p-0">
          {deleteError && (
            <p className="mx-6 mt-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
              {deleteError}
            </p>
          )}
          {products.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              <p className="text-3xl mb-3">🎁</p>
              Nenhum presente ainda. Adicione o primeiro!
            </div>
          ) : (
            <ul className="divide-y">
              {products.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-muted/40 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    {p.imgUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.imgUrl} alt={p.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-xl shrink-0">🎁</div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{p.name}</p>
                      {p.description && (
                        <p className="text-xs text-muted-foreground truncate">{p.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant="secondary" className="font-bold text-sm" style={{ color: primaryColor }}>
                      {formatBRL(p.price)}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={deletingId === p.id}
                      onClick={() => handleDelete(p.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs h-7 px-2"
                    >
                      {deletingId === p.id ? "..." : "Remover"}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open && !loading) { setDialogOpen(false); setError(""); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo presente</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="prod-name">Nome do presente *</Label>
              <Input
                id="prod-name"
                placeholder="Ex: Jogo de panelas, Viagem, ..."
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prod-desc">
                Descrição <span className="text-muted-foreground font-normal">(opcional)</span>
              </Label>
              <Input
                id="prod-desc"
                placeholder="Detalhes do presente"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prod-price">Valor em R$ *</Label>
              <Input
                id="prod-price"
                placeholder="Ex: 150,00"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prod-img">
                URL da imagem <span className="text-muted-foreground font-normal">(opcional)</span>
              </Label>
              <Input
                id="prod-img"
                type="url"
                placeholder="https://..."
                value={form.imgUrl}
                onChange={(e) => setForm((f) => ({ ...f, imgUrl: e.target.value }))}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                disabled={loading}
                onClick={() => { setDialogOpen(false); setError(""); }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
                style={{ backgroundColor: primaryColor }}
              >
                {loading ? "Salvando..." : "Adicionar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

