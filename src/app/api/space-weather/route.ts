import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { spaceWeatherKp, spaceWeatherForecast, spaceWeatherSolar } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { ensureDb } from "@/lib/db/init";

export async function GET(request: NextRequest) {
  ensureDb();

  const type = request.nextUrl.searchParams.get("type") || "all";

  try {
    if (type === "kp" || type === "all") {
      const kpData = await db
        .select()
        .from(spaceWeatherKp)
        .orderBy(desc(spaceWeatherKp.timeTag))
        .limit(168); // Last 7 days of hourly data

      if (type === "kp") {
        return NextResponse.json(kpData);
      }

      const forecastData = await db
        .select()
        .from(spaceWeatherForecast)
        .orderBy(spaceWeatherForecast.timeTag);

      // Get latest of each solar data type
      const flareProbData = await db
        .select()
        .from(spaceWeatherSolar)
        .where(eq(spaceWeatherSolar.dataType, "flare_prob"))
        .orderBy(desc(spaceWeatherSolar.createdAt))
        .limit(1);

      const enlilData = await db
        .select()
        .from(spaceWeatherSolar)
        .where(eq(spaceWeatherSolar.dataType, "enlil"))
        .orderBy(desc(spaceWeatherSolar.createdAt))
        .limit(1);

      const auroraData = await db
        .select()
        .from(spaceWeatherSolar)
        .where(eq(spaceWeatherSolar.dataType, "aurora"))
        .orderBy(desc(spaceWeatherSolar.createdAt))
        .limit(1);

      const radioFluxData = await db
        .select()
        .from(spaceWeatherSolar)
        .where(eq(spaceWeatherSolar.dataType, "radio_flux"))
        .orderBy(desc(spaceWeatherSolar.createdAt))
        .limit(1);

      return NextResponse.json({
        kp: kpData,
        forecast: forecastData,
        flareProb: flareProbData[0] ? JSON.parse(flareProbData[0].payload) : null,
        enlil: enlilData[0] ? JSON.parse(enlilData[0].payload) : null,
        aurora: auroraData[0] ? JSON.parse(auroraData[0].payload) : null,
        radioFlux: radioFluxData[0] ? JSON.parse(radioFluxData[0].payload) : null,
      });
    }

    return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch data" },
      { status: 500 }
    );
  }
}
