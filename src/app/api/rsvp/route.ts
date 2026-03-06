import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { rsvps, events } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendRsvpConfirmation } from "@/lib/email";
import { parseThemeJson } from "@/lib/theme";

const RsvpSchema = z.object({
  eventSlug: z.string().min(1),
  guestName: z.string().min(2).max(120),
  guestEmail: z.string().email().nullish(),
  phone: z.string().max(20).nullish(),
  status: z.enum(["confirmed", "declined"]).default("confirmed"),
  message: z.string().max(300).nullish(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = RsvpSchema.parse(body);

    const [event] = await db
      .select({ id: events.id, name: events.name, date: events.date, slug: events.slug, themeJson: events.themeJson })
      .from(events)
      .where(eq(events.slug, data.eventSlug))
      .limit(1);

    if (!event) {
      return NextResponse.json({ error: "Evento nao encontrado" }, { status: 404 });
    }

    const [rsvp] = await db
      .insert(rsvps)
      .values({
        eventId: event.id,
        guestName: data.guestName,
        guestEmail: data.guestEmail ?? "",
        phone: data.phone ?? "",
        status: data.status,
        message: data.message ?? "",
      })
      .returning();

    console.log(`[rsvp] ${data.guestName}  ${data.status} para evento ${data.eventSlug}`);

    // Disparo assincrono: nao bloqueia a resposta HTTP
    if (data.guestEmail) {
      const theme = parseThemeJson(event.themeJson);
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
      const eventDate = new Date(event.date).toLocaleDateString("pt-BR", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
      });
      sendRsvpConfirmation({
        to: data.guestEmail,
        guestName: data.guestName,
        eventName: event.name,
        eventDate,
        status: data.status,
        message: data.message ?? null,
        primaryColor: theme.colors.primary,
        secondaryColor: theme.colors.secondary,
        eventUrl: `${baseUrl}/${event.slug}`,
      }).catch((e) => console.error("[rsvp] Email fire-and-forget error:", e));
    }

    return NextResponse.json({ rsvp }, { status: 201 });
  } catch (err) {
    console.error("[rsvp] Error:", err);
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues.map((e) => e.message).join(", ") },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Erro ao registrar RSVP" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "slug obrigatorio" }, { status: 400 });
  }
  const [event] = await db
    .select({ id: events.id })
    .from(events)
    .where(eq(events.slug, slug))
    .limit(1);

  if (!event) {
    return NextResponse.json({ error: "Evento nao encontrado" }, { status: 404 });
  }

  const list = await db
    .select()
    .from(rsvps)
    .where(eq(rsvps.eventId, event.id))
    .orderBy(rsvps.createdAt);

  return NextResponse.json({ rsvps: list, total: list.length });
}
