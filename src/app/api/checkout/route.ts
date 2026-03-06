import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { orders, products, events } from "@/db/schema";
import { eq } from "drizzle-orm";

const CheckoutSchema = z.object({
  productId: z.string().uuid(),
  eventSlug: z.string().min(1),
  guestName: z.string().min(2).max(120),
  guestEmail: z.string().email().optional(),
});

export async function POST(req: NextRequest) {
  const paymentsEnabled = process.env.ENABLE_PAYMENTS === "true";

  try {
    const body = await req.json();
    const data = CheckoutSchema.parse(body);

    // Valida que produto e evento existem
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, data.productId))
      .limit(1);

    if (!product) {
      return NextResponse.json({ error: "Produto nao encontrado" }, { status: 404 });
    }

    const [event] = await db
      .select({ id: events.id })
      .from(events)
      .where(eq(events.slug, data.eventSlug))
      .limit(1);

    if (!event) {
      return NextResponse.json({ error: "Evento nao encontrado" }, { status: 404 });
    }

    // Cria a order com status PENDING
    const [order] = await db
      .insert(orders)
      .values({
        eventId: event.id,
        productId: product.id,
        guestName: data.guestName,
        guestEmail: data.guestEmail ?? "",
        amount: product.price,
        status: "PENDING",
        pixId: "",
        pixCode: "",
      })
      .returning();

    if (!paymentsEnabled) {
      // Feature flag desligado: retorna order criada sem Pix real
      console.warn("[checkout] ENABLE_PAYMENTS=false  Pix nao gerado (integracao Asaas pendente)");
      return NextResponse.json({
        order,
        pixCode: null,
        warning: "Integracao com Asaas pendente. ENABLE_PAYMENTS=false.",
      }, { status: 201 });
    }

    // TODO Sprint 1: Integrar Asaas API aqui
    // const asaasResponse = await createAsaasPayment({ order, event, product });
    // await db.update(orders).set({ pixId: asaasResponse.id, pixCode: asaasResponse.pixQrCode })
    //   .where(eq(orders.id, order.id));

    return NextResponse.json({ order, pixCode: null, info: "Asaas integration pending" }, { status: 201 });
  } catch (err) {
    console.error("[checkout] Error:", err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues.map((e) => e.message).join(", ") }, { status: 400 });
    }
    return NextResponse.json({ error: "Erro no checkout" }, { status: 500 });
  }
}
