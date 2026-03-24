import { NextResponse } from "next/server";
import { computeCorrelation } from "@/lib/sleep/correlate";
import { ensureDb } from "@/lib/db/init";

export async function GET() {
  ensureDb();

  try {
    const result = await computeCorrelation();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to compute correlations" },
      { status: 500 }
    );
  }
}
