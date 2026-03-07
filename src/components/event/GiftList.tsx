"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "@/types";
import { formatBRL } from "@/lib/utils";

interface GiftListProps {
  products: Product[];
  eventSlug: string;
}

interface CheckoutState {
  productId: string | null;
  guestName: string;
  guestEmail: string;
  loading: boolean;
  done: boolean;
  error: string;
  // Dados do Pix retornados pelo checkout
  pixCode: string;
  pixQrCodeImage: string;
  pixExpiry: string;
  copied: boolean;
}

function GiftCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="w-full h-48" />
      <CardContent className="p-5 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-7 w-20" />
          <Skeleton className="h-9 w-28 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export function GiftList({ products, eventSlug }: GiftListProps) {
  const [checkout, setCheckout] = useState<CheckoutState>({
    productId: null, guestName: '', guestEmail: '', loading: false, done: false,
    error: '', pixCode: '', pixQrCodeImage: '', pixExpiry: '', copied: false,
  });

  function openCheckout(productId: string) {
    setCheckout((c) => ({ ...c, productId, done: false, error: '', pixCode: '', pixQrCodeImage: '', pixExpiry: '', copied: false }));
  }

  function closeCheckout() {
    if (checkout.loading) return;
    setCheckout((c) => ({ ...c, productId: null }));
  }

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    if (!checkout.guestName.trim()) { setCheckout((c) => ({ ...c, error: 'Informe seu nome' })); return; }
    setCheckout((c) => ({ ...c, loading: true, error: '' }));
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: checkout.productId,
          eventSlug,
          guestName: checkout.guestName,
          guestEmail: checkout.guestEmail,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setCheckout((c) => ({ ...c, loading: false, error: data.error ?? 'Erro ao processar pedido' })); return; }
      setCheckout((c) => ({
        ...c, loading: false, done: true,
        pixCode: data.pixCode ?? '',
        pixQrCodeImage: data.pixQrCodeImage ?? '',
        pixExpiry: data.pixExpiry ?? '',
      }));
    } catch {
      setCheckout((c) => ({ ...c, loading: false, error: 'Erro de conexao' }));
    }
  }

  const selectedProduct = products.find((p) => p.id === checkout.productId);

  return (
    <section id="presentes" className="py-20 px-4" style={{ backgroundColor: "var(--color-background)" }}>
      <div className="max-w-4xl mx-auto">
        <h2
          className="text-3xl md:text-4xl font-extrabold text-center mb-3"
          style={{ color: "var(--color-text)", fontFamily: "var(--font-heading)" }}
        >
          Lista de Presentes
        </h2>
        <p className="text-center mb-12 opacity-60" style={{ color: "var(--color-text)", fontFamily: "var(--font-body)" }}>
          Escolha um presente e contribua via Pix
        </p>

        {products.length === 0 ? (
          <div className="py-20 text-center">
            <div className="text-6xl mb-4">🎁</div>
            <h3
              className="text-xl font-bold mb-2"
              style={{ color: "var(--color-text)", fontFamily: "var(--font-heading)" }}
            >
              Lista em breve
            </h3>
            <p className="opacity-50" style={{ color: "var(--color-text)", fontFamily: "var(--font-body)" }}>
              Os presentes serão adicionados em breve pelo organizador.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card
                key={product.id}
                className="overflow-hidden hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer group"
                onClick={() => openCheckout(product.id)}
              >
                {product.imgUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.imgUrl} alt={product.name} className="w-full h-48 object-cover group-hover:scale-[1.02] transition-transform" />
                ) : (
                  <div className="w-full h-48 flex items-center justify-center text-6xl" style={{ backgroundColor: "var(--color-primary)18" }}>
                    
                  </div>
                )}
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-base leading-snug" style={{ color: "var(--color-text)", fontFamily: "var(--font-heading)" }}>
                      {product.name}
                    </h3>
                    {product.available > 0 && (
                      <Badge variant="secondary" className="shrink-0 text-xs" style={{ backgroundColor: "var(--color-primary)18", color: "var(--color-primary)" }}>
                        {product.available} cota{product.available !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                  {product.description && (
                    <p className="text-sm line-clamp-2 mb-3 opacity-60" style={{ color: "var(--color-text)", fontFamily: "var(--font-body)" }}>
                      {product.description}
                    </p>
                  )}
                </CardContent>
                <CardFooter className="px-5 pb-5 pt-0 flex items-center justify-between">
                  <span className="text-xl font-extrabold" style={{ color: "var(--color-primary)", fontFamily: "var(--font-body)" }}>
                    {formatBRL(product.price)}
                  </span>
                  <Button
                    size="sm"
                    className="rounded-full text-sm font-semibold"
                    style={{ backgroundColor: "var(--color-primary)", color: "#fff" }}
                    onClick={(e) => { e.stopPropagation(); openCheckout(product.id); }}
                  >
                    Presentear
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!checkout.productId} onOpenChange={(open) => { if (!open) closeCheckout(); }}>
        <DialogContent className="sm:max-w-sm">
          {checkout.done ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto" style={{ backgroundColor: "var(--color-primary)18" }}>
                🎉
              </div>
              <DialogHeader>
                <DialogTitle style={{ fontFamily: "var(--font-heading)" }}>Pix gerado!</DialogTitle>
                <DialogDescription style={{ fontFamily: "var(--font-body)" }}>
                  Escaneie o QR Code ou copie o código abaixo
                </DialogDescription>
              </DialogHeader>
              {checkout.pixQrCodeImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`data:image/png;base64,${checkout.pixQrCodeImage}`}
                  alt="QR Code Pix"
                  className="mx-auto w-48 h-48 rounded-xl border"
                />
              )}
              {checkout.pixCode && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Código copia-e-cola</p>
                  <div className="flex gap-2 items-center">
                    <code className="text-xs bg-muted px-3 py-2 rounded-lg flex-1 truncate text-left block">
                      {checkout.pixCode}
                    </code>
                    <Button
                      size="sm"
                      type="button"
                      onClick={() => { navigator.clipboard.writeText(checkout.pixCode); setCheckout((c) => ({ ...c, copied: true })); }}
                    >
                      {checkout.copied ? "✓" : "Copiar"}
                    </Button>
                  </div>
                </div>
              )}
              {checkout.pixExpiry && (
                <p className="text-xs text-muted-foreground">
                  Válido até {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(checkout.pixExpiry))}
                </p>
              )}
              <Button className="w-full rounded-full" style={{ backgroundColor: "var(--color-primary)", color: "#fff" }} onClick={closeCheckout}>
                Fechar
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle style={{ fontFamily: "var(--font-heading)" }}>Finalizar presente</DialogTitle>
                {selectedProduct && (
                  <div className="flex items-center justify-between mt-2 p-3 rounded-xl" style={{ backgroundColor: "var(--color-primary)10" }}>
                    <span className="text-sm font-medium" style={{ color: "var(--color-text)", fontFamily: "var(--font-body)" }}>
                      {selectedProduct.name}
                    </span>
                    <span className="text-base font-extrabold" style={{ color: "var(--color-primary)" }}>
                      {formatBRL(selectedProduct.price)}
                    </span>
                  </div>
                )}
              </DialogHeader>
              <form onSubmit={handleCheckout} className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="checkout-name" style={{ fontFamily: "var(--font-body)" }}>Seu nome *</Label>
                  <Input id="checkout-name" placeholder="Como quer aparecer no presente" value={checkout.guestName} onChange={(e) => setCheckout((c) => ({ ...c, guestName: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="checkout-email" style={{ fontFamily: "var(--font-body)" }}>E-mail <span className="text-muted-foreground font-normal">(opcional)</span></Label>
                  <Input id="checkout-email" type="email" placeholder="Para recibo do pagamento" value={checkout.guestEmail} onChange={(e) => setCheckout((c) => ({ ...c, guestEmail: e.target.value }))} />
                </div>
                {checkout.error && (
                  <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                    {checkout.error}
                  </p>
                )}
                <div className="flex gap-3 pt-1">
                  <Button type="button" variant="outline" className="flex-1 rounded-full" onClick={closeCheckout} disabled={checkout.loading}>Cancelar</Button>
                  <Button type="submit" disabled={checkout.loading} className="flex-1 rounded-full font-semibold" style={{ backgroundColor: "var(--color-primary)", color: "#fff" }}>
                    {checkout.loading ? "Aguarde..." : "💳 Gerar Pix"}
                  </Button>
                </div>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
