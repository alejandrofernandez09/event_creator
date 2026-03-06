import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * INVARIANTE FINANCEIRA: orders.status so deve ser alterado aqui.
 * Nunca atualizar orders.status em outros endpoints.
 *
 * TODO Sprint 1: Implementar validacao de assinatura Asaas via ASAAS_WEBHOOK_SECRET
 */
export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    // Log completo para inspecao na primeira integracao
    console.log("[webhook/asaas] Payload recebido:", JSON.stringify(payload, null, 2));

    const { event: webhookEvent, payment } = payload;

    if (!payment?.id || !webhookEvent) {
      return NextResponse.json({ error: "Payload invalido" }, { status: 400 });
    }

    // Apenas processar confirmacoes
    if (webhookEvent !== "PAYMENT_CONFIRMED" && payment?.status !== "CONFIRMED") {
      console.log(`[webhook/asaas] Evento ignorado: ${webhookEvent} / status: ${payment?.status}`);
      return NextResponse.json({ received: true, action: "ignored" });
    }

    // Busca a order pelo pix_id (id da cobranca no Asaas)
    const [order] = await db
      .select({ id: orders.id, status: orders.status })
      .from(orders)
      .where(eq(orders.pixId, payment.id))
      .limit(1);

    if (!order) {
      console.warn(`[webhook/asaas] Order nao encontrada para pixId: ${payment.id}`);
      return NextResponse.json({ error: "Order nao encontrada" }, { status: 404 });
    }

    // Idempotencia: nao re-processar se ja confirmado
    if (order.status === "CONFIRMED") {
      console.log(`[webhook/asaas] Order ${order.id} ja confirmada, ignorando`);
      return NextResponse.json({ received: true, action: "already_confirmed" });
    }

    await db
      .update(orders)
      .set({ status: "CONFIRMED", updatedAt: new Date() })
      .where(eq(orders.id, order.id));

    console.log(`[webhook/asaas] Order ${order.id} CONFIRMADA`);

    return NextResponse.json({ received: true, action: "confirmed", orderId: order.id });
  } catch (err) {
    console.error("[webhook/asaas] Error:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
