'use server';

import { db } from '@/db';
import { products, events } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * Server Action: deleta um produto da lista de presentes.
 * DASHBOARD_SECRET e validado no Server Component pai antes de renderizar o ProductManager.
 * O secret nunca e serializado como prop de Client Component.
 */
export async function deleteProduct(
  productId: string,
  eventSlug: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const [event] = await db
      .select({ id: events.id })
      .from(events)
      .where(eq(events.slug, eventSlug))
      .limit(1);

    if (!event) return { ok: false, error: 'Evento nao encontrado' };

    await db
      .delete(products)
      .where(and(eq(products.id, productId), eq(products.eventId, event.id)));

    console.log("[deleteProduct] Produto " + productId + " removido do evento " + eventSlug);
    return { ok: true };
  } catch (err) {
    console.error('[deleteProduct]', err);
    return { ok: false, error: 'Erro ao remover produto' };
  }
}