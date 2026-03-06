import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { products, events } from "@/db/schema";
import { eq, and } from "drizzle-orm";

const CreateProductSchema = z.object({
  eventSlug: z.string().min(1),
  name: z.string().min(2).max(120),
  description: z.string().max(300).nullish(),
  price: z.number().int().positive(),  // centavos
  imgUrl: z.string().url().nullish(),
  available: z.number().int().min(1).default(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = CreateProductSchema.parse(body);

    const [event] = await db
      .select({ id: events.id })
      .from(events)
      .where(eq(events.slug, data.eventSlug))
      .limit(1);

    if (!event) {
      return NextResponse.json({ error: "Evento nao encontrado" }, { status: 404 });
    }

    const [product] = await db
      .insert(products)
      .values({
        eventId: event.id,
        name: data.name,
        description: data.description ?? "",
        price: data.price,
        imgUrl: data.imgUrl ?? "",
        available: data.available,
      })
      .returning();

    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
    return NextResponse.json({ error: err.issues.map((e) => e.message).join(", ") }, { status: 400 });
    }
    return NextResponse.json({ error: "Erro ao criar produto" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "slug obrigatorio" }, { status: 400 });

  const [event] = await db
    .select({ id: events.id })
    .from(events)
    .where(eq(events.slug, slug))
    .limit(1);

  if (!event) return NextResponse.json({ error: "Evento nao encontrado" }, { status: 404 });

  const list = await db
    .select()
    .from(products)
    .where(eq(products.eventId, event.id))
    .orderBy(products.createdAt);
  return NextResponse.json({ products: list });
}
// DELETE /api/products?id=&eventSlug=&secret=
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  const eventSlug = req.nextUrl.searchParams.get("eventSlug");
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.DASHBOARD_SECRET) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }
  if (!id || !eventSlug) {
    return NextResponse.json({ error: "id e eventSlug obrigatorios" }, { status: 400 });
  }
  const [event] = await db.select({ id: events.id }).from(events).where(eq(events.slug, eventSlug)).limit(1);
  if (!event) return NextResponse.json({ error: "Evento nao encontrado" }, { status: 404 });
  await db.delete(products).where(and(eq(products.id, id), eq(products.eventId, event.id)));
  return NextResponse.json({ ok: true });
}

