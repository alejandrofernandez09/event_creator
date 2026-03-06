import { notFound } from 'next/navigation';
import { db } from '@/db';
import { events, orders, rsvps, products } from '@/db/schema';
import { eq, and, sum } from 'drizzle-orm';
import { parseThemeJson } from '@/lib/theme';
import { formatBRL, calcComissao } from '@/lib/utils';
import { ProductManager } from '@/components/dashboard/ProductManager';

interface Props { params: Promise<{ slug: string }>; searchParams: Promise<{ secret?: string }>; }
export const dynamic = 'force-dynamic';

export default async function DashboardPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { secret } = await searchParams;

  if (secret !== process.env.DASHBOARD_SECRET) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <p className='text-2xl font-bold text-gray-400'>Acesso nao autorizado</p>
          <p className='text-sm text-gray-400 mt-2'>Informe o parametro ?secret= correto</p>
        </div>
      </div>
    );
  }

  const [event] = await db.select().from(events).where(eq(events.slug, slug)).limit(1);
  if (!event) notFound();

  const theme = parseThemeJson(event.themeJson);

  const confirmedResult = await db.select({ total: sum(orders.amount) }).from(orders)
    .where(and(eq(orders.eventId, event.id), eq(orders.status, 'CONFIRMED')));

  const totalArrecadado = Number(confirmedResult[0]?.total ?? 0);
  const comissaoDevida = calcComissao(totalArrecadado);

  const allOrders = await db.select().from(orders).where(eq(orders.eventId, event.id)).orderBy(orders.createdAt);
  const rsvpList = await db.select().from(rsvps).where(eq(rsvps.eventId, event.id)).orderBy(rsvps.createdAt);
  const productList = await db.select().from(products).where(eq(products.eventId, event.id)).orderBy(products.name);
  const confirmedOrders = allOrders.filter((o) => o.status === 'CONFIRMED');

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='py-8 px-4 text-white' style={{ backgroundColor: theme.colors.primary }}>
        <div className='max-w-5xl mx-auto'>
          <p className='text-sm opacity-70 uppercase tracking-widest'>Dashboard</p>
          <h1 className='text-3xl font-bold mt-1'>{event.name}</h1>
          <p className='text-sm opacity-70 mt-1'>{new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(new Date(event.date))}</p>
        </div>
      </div>
      <div className='max-w-5xl mx-auto px-4 py-8 space-y-8'>
        <ProductManager
          eventSlug={slug}
          secret={secret!}
          initialProducts={productList.map((p) => ({ id: p.id, name: p.name, description: p.description ?? null, price: p.price, imgUrl: p.imgUrl ?? null }))}
          primaryColor={theme.colors.primary}
        />
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
          <div className='bg-white rounded-2xl p-6 shadow-sm border'>
            <p className='text-sm text-gray-500 mb-1'>Total arrecadado</p>
            <p className='text-3xl font-bold' style={{ color: theme.colors.primary }}>{formatBRL(totalArrecadado)}</p>
            <p className='text-xs text-gray-400 mt-1'>{confirmedOrders.length} pagamentos confirmados</p>
          </div>
          <div className='bg-white rounded-2xl p-6 shadow-sm border'>
            <p className='text-sm text-gray-500 mb-1'>Comissao devida (10%)</p>
            <p className='text-3xl font-bold text-gray-700'>{formatBRL(comissaoDevida)}</p>
            <p className='text-xs text-gray-400 mt-1'>Acerto pos-evento</p>
          </div>
          <div className='bg-white rounded-2xl p-6 shadow-sm border'>
            <p className='text-sm text-gray-500 mb-1'>RSVPs</p>
            <p className='text-3xl font-bold text-gray-700'>{rsvpList.length}</p>
            <p className='text-xs text-gray-400 mt-1'>{rsvpList.filter((r) => r.status === 'confirmed').length} confirmados</p>
          </div>
        </div>

        <div className='bg-white rounded-2xl shadow-sm border overflow-hidden'>
          <div className='px-6 py-4 border-b'><h2 className='font-semibold text-gray-700'>Pedidos ({allOrders.length})</h2></div>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead><tr className='bg-gray-50 text-gray-500 text-left'>
                <th className='px-6 py-3 font-medium'>Convidado</th>
                <th className='px-6 py-3 font-medium'>Valor</th>
                <th className='px-6 py-3 font-medium'>Status</th>
                <th className='px-6 py-3 font-medium'>Data</th>
              </tr></thead>
              <tbody className='divide-y'>
                {allOrders.map((order) => (
                  <tr key={order.id} className='hover:bg-gray-50'>
                    <td className='px-6 py-3 font-medium'>{order.guestName}</td>
                    <td className='px-6 py-3'>{formatBRL(order.amount)}</td>
                    <td className='px-6 py-3'>
                      <span className={order.status === 'CONFIRMED' ? 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700' : order.status === 'PENDING' ? 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700' : 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700'}>
                        {order.status}
                      </span>
                    </td>
                    <td className='px-6 py-3 text-gray-400'>{new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(order.createdAt))}</td>
                  </tr>
                ))}
                {allOrders.length === 0 && <tr><td colSpan={4} className='px-6 py-8 text-center text-gray-400'>Nenhum pedido ainda</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className='bg-white rounded-2xl shadow-sm border overflow-hidden'>
          <div className='px-6 py-4 border-b'><h2 className='font-semibold text-gray-700'>Confirmacoes ({rsvpList.length})</h2></div>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead><tr className='bg-gray-50 text-gray-500 text-left'>
                <th className='px-6 py-3 font-medium'>Convidado</th>
                <th className='px-6 py-3 font-medium'>Status</th>
                <th className='px-6 py-3 font-medium'>Mensagem</th>
              </tr></thead>
              <tbody className='divide-y'>
                {rsvpList.map((rsvp) => (
                  <tr key={rsvp.id} className='hover:bg-gray-50'>
                    <td className='px-6 py-3 font-medium'>{rsvp.guestName}</td>
                    <td className='px-6 py-3'>
                      <span className={rsvp.status === 'confirmed' ? 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700' : 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700'}>
                        {rsvp.status === 'confirmed' ? 'Confirmado' : 'Nao vai'}
                      </span>
                    </td>
                    <td className='px-6 py-3 text-gray-500'>{rsvp.message || '-'}</td>
                  </tr>
                ))}
                {rsvpList.length === 0 && <tr><td colSpan={3} className='px-6 py-8 text-center text-gray-400'>Nenhuma confirmacao ainda</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}