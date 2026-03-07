"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Gift, PartyPopper, Copy, Check, QrCode } from "lucide-react";
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
            <div className="flex justify-center mb-4">
              <Gift size={56} style={{ color: "var(--color-primary)", opacity: 0.3 }} />
            </div>
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
                className="overflow-hidden flex flex-col hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer group"
                onClick={() => openCheckout(product.id)}
              >
                {product.imgUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.imgUrl} alt={product.name} className="w-full h-44 object-cover group-hover:scale-[1.02] transition-transform" />
                ) : (
                  <div className="w-full h-44 flex items-center justify-center" style={{ backgroundColor: "var(--color-primary)12" }}>
                    <Gift size={40} style={{ color: "var(--color-primary)", opacity: 0.3 }} />
                  </div>
                )}
                <CardContent className="flex-1 flex flex-col p-4 gap-1">
                  <h3 className="font-bold text-base leading-snug" style={{ color: "var(--color-text)", fontFamily: "var(--font-heading)" }}>
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="text-sm line-clamp-2 flex-1 mt-1 opacity-60" style={{ color: "var(--color-text)", fontFamily: "var(--font-body)" }}>
                      {product.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between gap-2 mt-auto pt-3 border-t border-border/50">
                    <span className="text-xl font-extrabold" style={{ color: "var(--color-primary)", fontFamily: "var(--font-body)" }}>
                      {formatBRL(product.price)}
                    </span>
                    <Button
                      size="sm"
                      className="rounded-full text-sm font-semibold px-4 shrink-0"
                      style={{ backgroundColor: "var(--color-primary)", color: "#fff" }}
                      onClick={(e) => { e.stopPropagation(); openCheckout(product.id); }}
                    >
                      Presentear
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!checkout.productId} onOpenChange={(open) => { if (!open) closeCheckout(); }}>
        <DialogContent className="sm:max-w-md max-h-[92dvh] overflow-y-auto p-0">
          {checkout.done ? (
            <div className="flex flex-col">
              {/* Header colorido */}
              <div
                className="flex flex-col items-center gap-3 px-6 pt-8 pb-6 text-center"
                style={{ backgroundColor: "var(--color-primary)12" }}
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "var(--color-primary)22" }}
                >
                  <PartyPopper size={26} style={{ color: "var(--color-primary)" }} />
                </div>
                <div>
                  <h2
                    className="text-xl font-bold"
                    style={{ color: "var(--color-text)", fontFamily: "var(--font-heading)" }}
                  >
                    Pix gerado!
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1" style={{ fontFamily: "var(--font-body)" }}>
                    Escaneie o QR Code ou copie o código abaixo
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-5 space-y-5">
                {/* QR Code */}
                {checkout.pixQrCodeImage && (
                  <div className="flex flex-col items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`data:image/png;base64,${checkout.pixQrCodeImage}`}
                      alt="QR Code Pix"
                      className="w-52 h-52 rounded-2xl border-2 shadow-sm"
                      style={{ borderColor: "var(--color-primary)30" }}
                    />
                    <p className="text-xs text-muted-foreground">Aponte a câmera do celular para pagar</p>
                  </div>
                )}

                {/* Divisor com label */}
                {checkout.pixQrCodeImage && checkout.pixCode && (
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">ou</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                )}

                {/* Código copia-e-cola */}
                {checkout.pixCode && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Código Pix copia e cola</p>
                    <div className="rounded-xl border bg-muted/50 p-3 space-y-3">
                      <code
                        className="text-xs text-foreground break-all leading-relaxed block"
                        style={{ fontFamily: "monospace" }}
                      >
                        {checkout.pixCode}
                      </code>
                      <Button
                        type="button"
                        size="sm"
                        className="w-full flex items-center justify-center gap-2 rounded-lg"
                        style={checkout.copied
                          ? { backgroundColor: "#16a34a", color: "#fff" }
                          : { backgroundColor: "var(--color-primary)", color: "#fff" }}
                        onClick={() => {
                          navigator.clipboard.writeText(checkout.pixCode);
                          setCheckout((c) => ({ ...c, copied: true }));
                        }}
                      >
                        {checkout.copied ? <><Check size={14} /> Código copiado!</> : <><Copy size={14} /> Copiar código</>}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Validade */}
                {checkout.pixExpiry && (
                  <p className="text-xs text-center text-muted-foreground">
                    Expira em{" "}
                    <span className="font-semibold text-foreground">
                      {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(checkout.pixExpiry))}
                    </span>
                  </p>
                )}

                <Button
                  variant="outline"
                  className="w-full rounded-full"
                  onClick={closeCheckout}
                >
                  Fechar
                </Button>
              </div>
            </div>
          ) : (
            <div className="px-6 pb-6 pt-6 space-y-4">
              <DialogHeader>
                <DialogTitle style={{ fontFamily: "var(--font-heading)" }}>Finalizar presente</DialogTitle>
              </DialogHeader>
              {selectedProduct && (
                <div
                  className="flex items-center justify-between p-3 rounded-xl"
                  style={{ backgroundColor: "var(--color-primary)10" }}
                >
                  <span className="text-sm font-medium" style={{ color: "var(--color-text)", fontFamily: "var(--font-body)" }}>
                    {selectedProduct.name}
                  </span>
                  <span className="text-base font-extrabold" style={{ color: "var(--color-primary)" }}>
                    {formatBRL(selectedProduct.price)}
                  </span>
                </div>
              )}
              <form onSubmit={handleCheckout} className="space-y-4">
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
                  <Button type="submit" disabled={checkout.loading} className="flex-1 rounded-full font-semibold flex items-center justify-center gap-2" style={{ backgroundColor: "var(--color-primary)", color: "#fff" }}>
                    {checkout.loading ? "Aguarde..." : <><QrCode size={16} /> Gerar Pix</>}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
