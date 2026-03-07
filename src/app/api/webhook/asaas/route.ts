import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * INVARIANTE FINANCEIRA: orders.status so deve ser alterado aqui.
 * Nunca atualizar orders.status em outros endpoints.
 */
export async function POST(req: NextRequest) {
  // ── Validação do token do webhook ────────────────────────────
  // Asaas envia o token configurado no header "asaas-access-token"
  const webhookSecret = process.env.ASAAS_WEBHOOK_SECRET;
  if (webhookSecret) {
    const receivedToken = req.headers.get("asaas-access-token");
    if (receivedToken !== webhookSecret) {
      console.warn("[webhook/asaas] Token invalido — requisicao rejeitada");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const payload = await req.json();

    const { event: webhookEvent, payment } = payload as {
      event: string;
      payment?: { id: string; status: string; value: number; netValue: number };
    };

    if (!payment?.id || !webhookEvent) {
      return NextResponse.json({ error: "Payload invalido" }, { status: 400 });
    }

    console.log(`[webhook/asaas] event=${webhookEvent} paymentId=${payment.id} status=${payment.status}`);

    // Processar confirmação de pagamento
    const isConfirmed =
      webhookEvent === "PAYMENT_CONFIRMED" ||
      webhookEvent === "PAYMENT_RECEIVED" ||
      payment.status === "CONFIRMED" ||
      payment.status === "RECEIVED";

    if (!isConfirmed) {
      return NextResponse.json({ received: true, action: "ignored", event: webhookEvent });
    }

    // Busca order pelo pixId (externalReference do Asaas é o orderId,
    // mas guardamos o paymentId do Asaas como pixId)
    const [order] = await db
      .select({ id: orders.id, status: orders.status })
      .from(orders)
      .where(eq(orders.pixId, payment.id))
      .limit(1);

    if (!order) {
      console.warn(`[webhook/asaas] Order nao encontrada para pixId: ${payment.id}`);
      // Retorna 200 para evitar reenvio desnecessário pelo Asaas
      return NextResponse.json({ received: true, action: "not_found" });
    }

    // Idempotência: ignorar se já confirmada
    if (order.status === "CONFIRMED") {
      console.log(`[webhook/asaas] Order ${order.id} ja confirmada — ignorando`);
      return NextResponse.json({ received: true, action: "already_confirmed" });
    }

    await db
      .update(orders)
      .set({ status: "CONFIRMED", updatedAt: new Date() })
      .where(eq(orders.id, order.id));

    console.log(`[webhook/asaas] Order ${order.id} CONFIRMADA — valor R$${(payment.netValue ?? payment.value).toFixed(2)}`);

    return NextResponse.json({ received: true, action: "confirmed", orderId: order.id });

  } catch (err) {
    console.error("[webhook/asaas] Error:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
