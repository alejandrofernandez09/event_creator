import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    await db.execute(sql`SELECT 1`);
    return NextResponse.json({ status: "ok", db: "ok", ts: new Date().toISOString() });
  } catch (err) {
    console.error("[health] DB error:", err);
    return NextResponse.json({ status: "error", db: "unreachable" }, { status: 503 });
  }
}
