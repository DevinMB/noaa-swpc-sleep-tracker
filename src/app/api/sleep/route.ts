import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sleepLogs, pollFingerprints } from "@/lib/db/schema";
import { desc, eq, and, sql } from "drizzle-orm";
import { ensureDb } from "@/lib/db/init";
import { SleepReportSchema } from "@/lib/sleep/types";
import { checkRateLimit } from "@/lib/utils/rateLimit";
import { createHash } from "crypto";

// Max self-report submissions per IP per day
const MAX_REPORTS_PER_IP_PER_DAY = 3;

export async function GET(request: NextRequest) {
  ensureDb();

  const days = parseInt(request.nextUrl.searchParams.get("days") || "30");
  const source = request.nextUrl.searchParams.get("source"); // filter by source

  try {
    let query = db.select().from(sleepLogs).orderBy(desc(sleepLogs.date));

    if (source) {
      query = query.where(eq(sleepLogs.source, source)) as typeof query;
    }

    const data = await query.limit(days * 50); // generous limit

    // Also compute daily averages
    const dailyAvg = await db
      .select({
        date: sleepLogs.date,
        avgHours: sql<number>`AVG(${sleepLogs.sleepHours})`,
        avgQuality: sql<number>`AVG(${sleepLogs.sleepQuality})`,
        count: sql<number>`COUNT(*)`,
      })
      .from(sleepLogs)
      .groupBy(sleepLogs.date)
      .orderBy(desc(sleepLogs.date))
      .limit(days);

    return NextResponse.json({ logs: data, dailyAverages: dailyAvg });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch sleep data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  ensureDb();

  // Rate limit by IP (short-term burst protection)
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  const rateCheck = checkRateLimit(`sleep:${ip}`, { maxRequests: 5, windowMs: 60_000 });
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const parsed = SleepReportSchema.parse(body);

    // Honeypot check — if the hidden "website" field is filled, it's a bot
    if (parsed.website && parsed.website.length > 0) {
      // Silently accept but don't store (don't let bots know they were caught)
      return NextResponse.json({ success: true, id: -1 });
    }

    // Hash the fingerprint and IP server-side
    const fingerprintHash = createHash("sha256")
      .update(parsed.fingerprint)
      .digest("hex");

    const ipHash = createHash("sha256")
      .update(ip)
      .digest("hex");

    const now = new Date();
    const utcTimestamp = now.toISOString();
    const today = utcTimestamp.slice(0, 10);

    // Check if this fingerprint already submitted today
    const existingFingerprint = await db
      .select()
      .from(pollFingerprints)
      .where(
        and(
          eq(pollFingerprints.fingerprintHash, fingerprintHash),
          eq(pollFingerprints.date, today)
        )
      )
      .limit(1);

    if (existingFingerprint.length > 0) {
      return NextResponse.json(
        { error: "You've already submitted a report today. Come back tomorrow!" },
        { status: 409 }
      );
    }

    // Check daily IP cap — prevents abuse even with rotating fingerprints
    const ipSubmissionsToday = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(pollFingerprints)
      .where(
        and(
          eq(pollFingerprints.ipHash, ipHash),
          eq(pollFingerprints.date, today)
        )
      );

    const ipCount = ipSubmissionsToday[0]?.count ?? 0;
    if (ipCount >= MAX_REPORTS_PER_IP_PER_DAY) {
      return NextResponse.json(
        { error: "Daily submission limit reached for your network. Come back tomorrow!" },
        { status: 429 }
      );
    }

    // Store the fingerprint + IP hash
    await db.insert(pollFingerprints).values({
      fingerprintHash,
      ipHash,
      date: today,
      createdAt: utcTimestamp,
    });

    // Store the sleep report
    const result = await db.insert(sleepLogs).values({
      date: today,
      sleepHours: parsed.sleepHours,
      sleepQuality: parsed.sleepQuality,
      region: parsed.region || null,
      source: "self_report",
      submittedAt: utcTimestamp,
      createdAt: utcTimestamp,
    });

    return NextResponse.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input. Please check your data." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save report" },
      { status: 500 }
    );
  }
}
