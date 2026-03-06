import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { events, accounts } from "@/db/schema";
import { slugify } from "@/lib/utils";
import { ThemeJsonSchema, DEFAULT_THEME } from "@/lib/theme";
import { eq } from "drizzle-orm";

const CreateEventSchema = z.object({
  name: z.string().min(2).max(120),
  date: z.string().datetime(),
  description: z.string().max(500).optional(),
  themeJson: ThemeJsonSchema.optional(),
  // Para a POC: receber o accountId direto (sem auth)
  accountId: z.string().uuid().optional(),
  // Ou criar uma conta on-the-fly
  ownerName: z.string().min(2).optional(),
  ownerEmail: z.string().email().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = CreateEventSchema.parse(body);

    let accountId = data.accountId;

    // Se nao passou accountId, cria uma conta simples
    if (!accountId) {
      if (!data.ownerEmail || !data.ownerName) {
        return NextResponse.json(
          { error: "Informe accountId OU ownerName + ownerEmail" },
          { status: 400 }
        );
      }
      // Verifica se ja existe conta com esse email
      const existing = await db
        .select({ id: accounts.id })
        .from(accounts)
        .where(eq(accounts.email, data.ownerEmail))
        .limit(1);

      if (existing.length > 0) {
        accountId = existing[0].id;
      } else {
        const [newAccount] = await db
          .insert(accounts)
          .values({ ownerName: data.ownerName, email: data.ownerEmail })
          .returning({ id: accounts.id });
        accountId = newAccount.id;
      }
    }

    // Gera slug unico
    const baseSlug = slugify(data.name);
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    const theme = data.themeJson ?? DEFAULT_THEME;

    const [event] = await db
      .insert(events)
      .values({
        slug,
        accountId,
        name: data.name,
        date: new Date(data.date),
        themeJson: JSON.stringify(theme),
        description: data.description ?? "",
      })
      .returning();

    return NextResponse.json({ event, url: `/${event.slug}` }, { status: 201 });
  } catch (err) {
    console.error("[events] Error:", err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: "Erro ao criar evento" }, { status: 500 });
  }
}

export async function GET() {
  const allEvents = await db
    .select({
      id: events.id,
      slug: events.slug,
      name: events.name,
      date: events.date,
      createdAt: events.createdAt,
    })
    .from(events)
    .orderBy(events.createdAt);
  return NextResponse.json({ events: allEvents });
}
