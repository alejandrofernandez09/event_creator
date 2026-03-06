"use client";

import { useState } from "react";
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
}

export function GiftList({ products, eventSlug }: GiftListProps) {
  const [checkout, setCheckout] = useState<CheckoutState>({
    productId: null, guestName: '', guestEmail: '', loading: false, done: false, error: '',
  });

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
      setCheckout((c) => ({ ...c, loading: false, done: true }));
    } catch {
      setCheckout((c) => ({ ...c, loading: false, error: 'Erro de conexao' }));
    }
  }

  return (
    <section id='presentes' className='py-20 px-4' style={{ backgroundColor: 'var(--color-background)' }}>
      <div className='max-w-4xl mx-auto'>
        <h2 className='text-3xl md:text-4xl font-bold text-center mb-3'
          style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}>
          Lista de Presentes
        </h2>
        <p className='text-center text-gray-500 mb-12' style={{ fontFamily: 'var(--font-body)' }}>
          Escolha um presente e contribua via Pix
        </p>

        {products.length === 0 ? (
          <p className='text-center text-gray-400 py-16' style={{ fontFamily: 'var(--font-body)' }}>
            A lista de presentes sera divulgada em breve.
          </p>
        ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
          {products.map((product) => (
            <div key={product.id}
              className='bg-white rounded-2xl overflow-hidden shadow-sm border hover:shadow-md transition-shadow cursor-pointer'
              onClick={() => setCheckout((c) => ({ ...c, productId: product.id, done: false, error: '' }))}
            >
              {product.imgUrl ? (
                <img src={product.imgUrl} alt={product.name} className='w-full h-48 object-cover' />
              ) : (
                <div className='w-full h-48 flex items-center justify-center text-5xl'
                  style={{ backgroundColor: 'var(--color-primary)', opacity: 0.1 }}>
                  
                </div>
              )}
              <div className='p-5'>
                <h3 className='font-semibold text-gray-800 mb-1' style={{ fontFamily: 'var(--font-heading)' }}>
                  {product.name}
                </h3>
                {product.description && (
                  <p className='text-sm text-gray-500 mb-3 line-clamp-2' style={{ fontFamily: 'var(--font-body)' }}>
                    {product.description}
                  </p>
                )}
                <div className='flex items-center justify-between'>
                  <span className='text-xl font-bold' style={{ color: 'var(--color-primary)' }}>
                    {formatBRL(product.price)}
                  </span>
                  <button
                    className='px-4 py-2 rounded-full text-sm font-medium text-white transition-transform hover:scale-105'
                    style={{ backgroundColor: 'var(--color-primary)' }}
                    onClick={(e) => { e.stopPropagation(); setCheckout((c) => ({ ...c, productId: product.id, done: false, error: '' })); }}
                  >
                    Presentear
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}

        {/* Modal de checkout */}
        {checkout.productId && !checkout.done && (
          <div className='fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4'
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className='bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl'
              onClick={(e) => e.stopPropagation()}>
              <h3 className='text-xl font-bold mb-1' style={{ fontFamily: 'var(--font-heading)' }}>
                Finalizar presente
              </h3>
              {(() => {
                const p = products.find((x) => x.id === checkout.productId);
                return p ? <p className='text-gray-500 text-sm mb-5'>{p.name} - {formatBRL(p.price)}</p> : null;
              })()}
              <form onSubmit={handleCheckout} className='space-y-3'>
                <input type='text' placeholder='Seu nome *' value={checkout.guestName}
                  onChange={(e) => setCheckout((c) => ({ ...c, guestName: e.target.value }))}
                  className='w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2' />
                <input type='email' placeholder='Seu e-mail (opcional)' value={checkout.guestEmail}
                  onChange={(e) => setCheckout((c) => ({ ...c, guestEmail: e.target.value }))}
                  className='w-full border rounded-xl px-4 py-3 text-sm outline-none' />
                {checkout.error && <p className='text-red-500 text-sm'>{checkout.error}</p>}
                <div className='flex gap-3'>
                  <button type='button'
                    onClick={() => setCheckout((c) => ({ ...c, productId: null }))}
                    className='flex-1 py-3 rounded-full border text-gray-600 text-sm font-medium'>
                    Cancelar
                  </button>
                  <button type='submit' disabled={checkout.loading}
                    className='flex-1 py-3 rounded-full text-white text-sm font-semibold disabled:opacity-60'
                    style={{ backgroundColor: 'var(--color-primary)' }}>
                    {checkout.loading ? 'Aguarde...' : 'Confirmar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {checkout.done && (
          <div className='mt-10 text-center py-8'>
            <div className='text-5xl mb-4'></div>
            <h3 className='text-2xl font-bold' style={{ fontFamily: 'var(--font-heading)' }}>Presente enviado!</h3>
            <p className='text-gray-500 mt-2' style={{ fontFamily: 'var(--font-body)' }}>
              O pagamento sera processado em breve.
            </p>
            <button onClick={() => setCheckout((c) => ({ ...c, productId: null, done: false }))}
              className='mt-4 text-sm underline' style={{ color: 'var(--color-primary)' }}>
              Presentear outro item
            </button>
          </div>
        )}
      </div>
    </section>
  );
}