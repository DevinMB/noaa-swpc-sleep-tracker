import { NextResponse } from "next/server";
import { syncAllNoaaData } from "@/lib/noaa/sync";
import { ensureDb } from "@/lib/db/init";

export async function POST() {
  try {
    ensureDb();
    const result = await syncAllNoaaData();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Sync failed" },
      { status: 500 }
    );
  }
}
