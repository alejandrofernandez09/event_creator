import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { db } from '@/db';
import { events, products } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { parseThemeJson } from '@/lib/theme';
import { ThemeProvider } from '@/components/event/ThemeProvider';
import { EventHero } from '@/components/event/EventHero';
import { GiftList } from '@/components/event/GiftList';
import { RsvpForm } from '@/components/event/RsvpForm';
import { PlaylistSection } from '@/components/event/PlaylistSection';

interface Props { params: Promise<{ slug: string }>; }

export const dynamic = 'force-dynamic';

async function getEventData(slug: string) {
  try {
    const [event] = await db.select().from(events).where(eq(events.slug, slug)).limit(1);
    if (!event) return null;
    const productList = await db.select().from(products).where(eq(products.eventId, event.id)).orderBy(products.createdAt);
    return { event, products: productList };
  } catch (err) {
    console.error('[event-page] Failed to load event:', slug, err);
    return null;
  }
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const data = await getEventData(slug);
  if (!data) return { title: 'Evento nao encontrado' };
  return { title: data.event.name, description: data.event.description ?? 'Site do evento ' + data.event.name };
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params;
  const data = await getEventData(slug);
  if (!data) { notFound(); }
  const theme = parseThemeJson(data.event.themeJson);
  const mappedProducts = data.products.map((p) => ({
    id: p.id, name: p.name, description: p.description,
    price: p.price, imgUrl: p.imgUrl, available: p.available,
  }));
  return (
    <ThemeProvider theme={theme}>
      <main style={{ backgroundColor: 'var(--color-background)', minHeight: '100vh' }}>
        <Suspense fallback={<div>Carregando...</div>}>
          <EventHero eventName={data.event.name} eventDate={new Date(data.event.date)} theme={theme} />
        </Suspense>
        <GiftList products={mappedProducts} eventSlug={slug} />
        <PlaylistSection spotifyUrl={theme.sections.spotifyUrl} />
        {data.event.description ? (
          <section className='py-16 px-4 max-w-2xl mx-auto text-center'>
            <p style={{ color: 'var(--color-text)', fontFamily: 'var(--font-body)' }} className='text-lg opacity-80 leading-relaxed'>
              {data.event.description}
            </p>
          </section>
        ) : null}
        <RsvpForm eventSlug={slug} />
        <footer className='py-8 text-center text-xs opacity-40' style={{ color: 'var(--color-text)' }}>
          POC Alejandro
        </footer>
      </main>
    </ThemeProvider>
  );
}