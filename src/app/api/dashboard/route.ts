import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, rsvps, events } from "@/db/schema";
import { eq, and, sum } from "drizzle-orm";
import { calcComissao } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  const secret = req.nextUrl.searchParams.get("secret");

  if (!slug) return NextResponse.json({ error: "slug obrigatorio" }, { status: 400 });

  // Protecao basica de dashboard para POC
  if (secret !== process.env.DASHBOARD_SECRET) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.slug, slug))
    .limit(1);

  if (!event) return NextResponse.json({ error: "Evento nao encontrado" }, { status: 404 });

  // Total arrecadado (apenas orders CONFIRMADAS)
  const confirmedResult = await db
    .select({ total: sum(orders.amount) })
    .from(orders)
    .where(and(eq(orders.eventId, event.id), eq(orders.status, "CONFIRMED")));

  const totalArrecadado = Number(confirmedResult[0]?.total ?? 0);

  // Contagem de orders
  const allOrders = await db
    .select({ id: orders.id, status: orders.status, amount: orders.amount, guestName: orders.guestName, createdAt: orders.createdAt })
    .from(orders)
    .where(eq(orders.eventId, event.id))
    .orderBy(orders.createdAt);

  // RSVPs
  const rsvpList = await db
    .select({ id: rsvps.id, guestName: rsvps.guestName, status: rsvps.status, createdAt: rsvps.createdAt })
    .from(rsvps)
    .where(eq(rsvps.eventId, event.id))
    .orderBy(rsvps.createdAt);

  const metrics = {
    totalArrecadado,
    comissaoDevida: calcComissao(totalArrecadado),
    totalOrders: allOrders.length,
    confirmedOrders: allOrders.filter((o) => o.status === "CONFIRMED").length,
    totalRsvps: rsvpList.length,
  };

  return NextResponse.json({
    event: { id: event.id, name: event.name, slug: event.slug, date: event.date },
    metrics,
    orders: allOrders,
    rsvps: rsvpList,
  });
}
