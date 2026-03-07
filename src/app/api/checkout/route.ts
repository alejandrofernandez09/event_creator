import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { orders, products, events } from "@/db/schema";
import { eq } from "drizzle-orm";
import { findOrCreateCustomer, createPixPayment, getPixQrCode } from "@/lib/asaas";

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

    // Valida produto e evento
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, data.productId))
      .limit(1);

    if (!product) {
      return NextResponse.json({ error: "Produto nao encontrado" }, { status: 404 });
    }

    const [event] = await db
      .select({ id: events.id, name: events.name })
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
      console.warn("[checkout] ENABLE_PAYMENTS=false â€” Pix nao gerado");
      return NextResponse.json({
        orderId: order.id,
        pixCode: null,
        pixQrCodeImage: null,
        pixExpiry: null,
        warning: "Pagamentos desabilitados. Defina ENABLE_PAYMENTS=true para gerar Pix real.",
      }, { status: 201 });
    }

    // â”€â”€ IntegraÃ§Ã£o Asaas â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // 1. Cria ou encontra o customer no Asaas
    const customerId = await findOrCreateCustomer(data.guestName, data.guestEmail);

    // 2. Cria a cobranÃ§a PIX
    const payment = await createPixPayment({
      customerId,
      valueInCents: product.price,
      description: `Presente: ${product.name} â€” ${event.name}`,
      orderId: order.id,
    });

    // 3. Busca QR Code
    const qrCode = await getPixQrCode(payment.id);

    // 4. Persiste pixId, pixCode e pixExpiry na order
    await db
      .update(orders)
      .set({
        pixId: payment.id,
        pixCode: qrCode.payload,
        pixExpiry: new Date(qrCode.expirationDate),
        updatedAt: new Date(),
      })
      .where(eq(orders.id, order.id));

    console.log(`[checkout] Order ${order.id} criada â€” pixId ${payment.id}`);

    return NextResponse.json({
      orderId: order.id,
      pixCode: qrCode.payload,
      pixQrCodeImage: qrCode.encodedImage,
      pixExpiry: qrCode.expirationDate,
    }, { status: 201 });

  } catch (err) {
    console.error("[checkout] Error:", err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues.map((e) => e.message).join(", ") }, { status: 400 });
    }
    const msg = err instanceof Error ? err.message : "Erro no checkout";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
