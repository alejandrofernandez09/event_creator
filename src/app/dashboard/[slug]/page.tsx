import { notFound } from 'next/navigation';
import { db } from '@/db';
import { events, orders, rsvps, products } from '@/db/schema';
import { eq, and, sum } from 'drizzle-orm';
import { parseThemeJson } from '@/lib/theme';
import { formatBRL, calcComissao } from '@/lib/utils';
import { ProductManager } from '@/components/dashboard/ProductManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { deleteProduct } from './actions';
import { Lock, Wallet, TrendingUp, Users, CheckCircle2, XCircle } from 'lucide-react';

interface Props { params: Promise<{ slug: string }>; searchParams: Promise<{ secret?: string }>; }
export const dynamic = 'force-dynamic';

const STATUS_CONFIG = {
  CONFIRMED: { label: 'Confirmado', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  PENDING:   { label: 'Pendente',   className: 'bg-amber-100 text-amber-700 border-amber-200' },
  CANCELED:  { label: 'Cancelado',  className: 'bg-red-100 text-red-600 border-red-200' },
  EXPIRED:   { label: 'Expirado',   className: 'bg-gray-100 text-gray-500 border-gray-200' },
} as const;

export default async function DashboardPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { secret } = await searchParams;

  if (secret !== process.env.DASHBOARD_SECRET) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-gray-50'>
        <Card className='w-full max-w-sm text-center shadow-lg'>
          <CardContent className='pt-8 pb-8 space-y-2'>
            <Lock size={40} className='mx-auto mb-4 text-muted-foreground' />
            <p className='text-xl font-bold text-gray-800'>Acesso Restrito</p>
            <p className='text-sm text-muted-foreground'>Informe o parâmetro <code className='bg-muted px-1 rounded text-xs'>?secret=</code> correto para continuar.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [event] = await db.select().from(events).where(eq(events.slug, slug)).limit(1);
  if (!event) notFound();

  const theme = parseThemeJson(event.themeJson);

  const confirmedResult = await db.select({ total: sum(orders.amount) }).from(orders)
    .where(and(eq(orders.eventId, event.id), eq(orders.status, 'CONFIRMED')));

  const totalVendas = Number(confirmedResult[0]?.total ?? 0);
  const comissaoDevida = calcComissao(totalVendas);
  const valorLiquido = totalVendas - comissaoDevida;

  const allOrders = await db.select().from(orders).where(eq(orders.eventId, event.id)).orderBy(orders.createdAt);
  const rsvpList = await db.select().from(rsvps).where(eq(rsvps.eventId, event.id)).orderBy(rsvps.createdAt);
  const productList = await db.select().from(products).where(eq(products.eventId, event.id)).orderBy(products.name);

  const confirmedOrders = allOrders.filter((o) => o.status === 'CONFIRMED').length;

  const confirmedRsvps = rsvpList.filter((r) => r.status === 'confirmed').length;
  const declinedRsvps  = rsvpList.filter((r) => r.status === 'declined').length;
  const pendingRsvps   = rsvpList.length - confirmedRsvps - declinedRsvps;

  return (
    <div className='min-h-screen bg-gray-50/50'>
      {/* Header */}
      <header className='text-white' style={{ backgroundColor: theme.colors.primary }}>
        <div className='max-w-5xl mx-auto px-4 py-8'>
          <div className='flex items-start justify-between gap-4'>
            <div>
              <p className='text-xs font-semibold uppercase tracking-[0.2em] opacity-60 mb-1'>Dashboard · {slug}</p>
              <h1 className='text-3xl font-bold' style={{ fontFamily: '"Playfair Display", serif' }}>{event.name}</h1>
              <p className='text-sm opacity-70 mt-1'>
                {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(new Date(event.date))}
              </p>
            </div>
            <a
              href={`/${slug}`}
              target='_blank'
              rel='noopener noreferrer'
              className='shrink-0 mt-1 inline-flex items-center gap-1.5 text-xs font-semibold bg-white/20 hover:bg-white/30 transition-colors px-3 py-1.5 rounded-full'
            >
              Ver site do evento ↗
            </a>
          </div>
        </div>
      </header>

      <div className='max-w-5xl mx-auto px-4 py-8 space-y-8'>

        {/* KPI Cards */}
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
          <Card className='shadow-sm'>
            <CardHeader className='pb-2'>
              <p className='text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5'><Wallet size={12} /> Valor líquido a receber</p>
            </CardHeader>
            <CardContent>
              <p className='text-3xl font-extrabold' style={{ color: theme.colors.primary }}>{formatBRL(valorLiquido)}</p>
              <p className='text-xs text-muted-foreground mt-1'>Total vendas − 10% ({formatBRL(comissaoDevida)})</p>
            </CardContent>
          </Card>

          <Card className='shadow-sm'>
            <CardHeader className='pb-2'>
              <p className='text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5'><TrendingUp size={12} /> Total de vendas</p>
            </CardHeader>
            <CardContent>
              <p className='text-3xl font-extrabold text-foreground'>{formatBRL(totalVendas)}</p>
              <p className='text-xs text-muted-foreground mt-1'>{confirmedOrders} pagamento{confirmedOrders !== 1 ? 's' : ''} confirmado{confirmedOrders !== 1 ? 's' : ''}</p>
            </CardContent>
          </Card>

          <Card className='shadow-sm'>
            <CardHeader className='pb-2'>
              <p className='text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5'><Users size={12} /> Convidados</p>
            </CardHeader>
            <CardContent>
              <p className='text-3xl font-extrabold text-emerald-600'>{confirmedRsvps}</p>
              <p className='text-xs text-muted-foreground mt-1'>{rsvpList.length} convite{rsvpList.length !== 1 ? 's' : ''} respondido{rsvpList.length !== 1 ? 's' : ''}</p>
            </CardContent>
          </Card>
        </div>

        {/* Product Manager */}
        <ProductManager
          eventSlug={slug}
          onDelete={deleteProduct}
          initialProducts={productList.map((p) => ({
            id: p.id, name: p.name, description: p.description ?? null,
            price: p.price, imgUrl: p.imgUrl ?? null,
          }))}
          primaryColor={theme.colors.primary}
        />

        {/* Orders Table */}
        <Card className='shadow-sm overflow-hidden'>
          <CardHeader className='pb-0'>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-lg'>Pedidos</CardTitle>
              <Badge variant='secondary'>{allOrders.length}</Badge>
            </div>
          </CardHeader>
          <Separator className='mt-4' />
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='bg-muted/50 text-muted-foreground text-left text-xs uppercase tracking-wide'>
                  <th className='px-6 py-3 font-semibold'>Convidado</th>
                  <th className='px-6 py-3 font-semibold'>Valor</th>
                  <th className='px-6 py-3 font-semibold'>Status</th>
                  <th className='px-6 py-3 font-semibold'>Data</th>
                </tr>
              </thead>
              <tbody className='divide-y'>
                {allOrders.map((order) => {
                  const cfg = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.EXPIRED;
                  return (
                    <tr key={order.id} className='hover:bg-muted/30 transition-colors'>
                      <td className='px-6 py-3.5 font-medium'>{order.guestName}</td>
                      <td className='px-6 py-3.5 font-semibold'>{formatBRL(order.amount)}</td>
                      <td className='px-6 py-3.5'>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.className}`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className='px-6 py-3.5 text-muted-foreground'>
                        {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(order.createdAt))}
                      </td>
                    </tr>
                  );
                })}
                {allOrders.length === 0 && (
                  <tr><td colSpan={4} className='px-6 py-12 text-center text-muted-foreground'>Nenhum pedido ainda</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* RSVPs Table */}
        <Card className='shadow-sm overflow-hidden'>
          <CardHeader className='pb-0'>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-lg'>Confirmações</CardTitle>
              <Badge variant='secondary'>{rsvpList.length}</Badge>
            </div>
          </CardHeader>
          <Separator className='mt-4' />
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='bg-muted/50 text-muted-foreground text-left text-xs uppercase tracking-wide'>
                  <th className='px-6 py-3 font-semibold'>Convidado</th>
                  <th className='px-6 py-3 font-semibold'>Status</th>
                  <th className='px-6 py-3 font-semibold'>Mensagem</th>
                </tr>
              </thead>
              <tbody className='divide-y'>
                {rsvpList.map((rsvp) => (
                  <tr key={rsvp.id} className='hover:bg-muted/30 transition-colors'>
                    <td className='px-6 py-3.5 font-medium'>{rsvp.guestName}</td>
                    <td className='px-6 py-3.5'>
                      {rsvp.status === 'confirmed' ? (
                        <span className='inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border bg-emerald-100 text-emerald-700 border-emerald-200'>
                          <CheckCircle2 size={12} /> Confirmado
                        </span>
                      ) : (
                        <span className='inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border bg-gray-100 text-gray-500 border-gray-200'>
                          <XCircle size={12} /> Não vai
                        </span>
                      )}
                    </td>
                    <td className='px-6 py-3.5 text-muted-foreground'>{rsvp.message || '—'}</td>
                  </tr>
                ))}
                {rsvpList.length === 0 && (
                  <tr><td colSpan={3} className='px-6 py-12 text-center text-muted-foreground'>Nenhuma confirmação ainda</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

      </div>
      <footer className='border-t border-gray-200 py-6 text-center text-xs text-muted-foreground'>
        NOAH · Dashboard do Evento
      </footer>
    </div>
  );
}
