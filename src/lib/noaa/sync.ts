import { db } from "@/lib/db";
import { spaceWeatherKp, spaceWeatherForecast, spaceWeatherSolar } from "@/lib/db/schema";
import {
  fetchKpIndex,
  fetchForecast,
  fetchSolarProbabilities,
  fetchSolarWind,
  fetchAurora,
  fetchRadioFlux,
} from "./client";
import { downsampleKpToHourly } from "./transform";
import { sql } from "drizzle-orm";

/**
 * Sync all NOAA data endpoints to the local SQLite database.
 * Uses INSERT OR IGNORE for idempotent upserts.
 */
export async function syncAllNoaaData(): Promise<{
  kpRecords: number;
  forecastRecords: number;
  solarRecords: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let kpRecords = 0;
  let forecastRecords = 0;
  let solarRecords = 0;

  // 1. Sync Kp Index (downsampled to hourly)
  try {
    const rawKp = await fetchKpIndex();
    const hourlyKp = downsampleKpToHourly(rawKp);

    for (const entry of hourlyKp) {
      await db
        .insert(spaceWeatherKp)
        .values({
          timeTag: entry.timeTag,
          kpIndex: entry.kpIndex,
          estimatedKp: entry.estimatedKp,
        })
        .onConflictDoUpdate({
          target: spaceWeatherKp.timeTag,
          set: {
            kpIndex: sql`excluded.kp_index`,
            estimatedKp: sql`excluded.estimated_kp`,
          },
        });
    }
    kpRecords = hourlyKp.length;
  } catch (e) {
    errors.push(`Kp Index: ${e instanceof Error ? e.message : String(e)}`);
  }

  // 2. Sync 45-Day Forecast
  try {
    const forecast = await fetchForecast();
    for (const entry of forecast) {
      await db
        .insert(spaceWeatherForecast)
        .values({
          timeTag: entry.time,
          metric: entry.metric,
          value: entry.value,
        })
        .onConflictDoNothing();
      forecastRecords++;
    }
  } catch (e) {
    errors.push(`Forecast: ${e instanceof Error ? e.message : String(e)}`);
  }

  // 3. Sync Solar Probabilities
  try {
    const probs = await fetchSolarProbabilities();
    if (probs.length > 0) {
      // Store latest snapshot as a single JSON payload
      await db.insert(spaceWeatherSolar).values({
        timeTag: new Date().toISOString(),
        dataType: "flare_prob",
        payload: JSON.stringify(probs),
      });
      solarRecords++;
    }
  } catch (e) {
    errors.push(`Solar Probs: ${e instanceof Error ? e.message : String(e)}`);
  }

  // 4. Sync Solar Wind (Enlil)
  try {
    const wind = await fetchSolarWind();
    if (wind.length > 0) {
      // Store latest batch as JSON
      await db.insert(spaceWeatherSolar).values({
        timeTag: new Date().toISOString(),
        dataType: "enlil",
        payload: JSON.stringify(wind),
      });
      solarRecords++;
    }
  } catch (e) {
    errors.push(`Solar Wind: ${e instanceof Error ? e.message : String(e)}`);
  }

  // 5. Sync Aurora
  try {
    const aurora = await fetchAurora();
    await db.insert(spaceWeatherSolar).values({
      timeTag: aurora["Observation Time"],
      dataType: "aurora",
      payload: JSON.stringify(aurora),
    });
    solarRecords++;
  } catch (e) {
    errors.push(`Aurora: ${e instanceof Error ? e.message : String(e)}`);
  }

  // 6. Sync Radio Flux
  try {
    const flux = await fetchRadioFlux();
    if (flux.length > 0) {
      await db.insert(spaceWeatherSolar).values({
        timeTag: new Date().toISOString(),
        dataType: "radio_flux",
        payload: JSON.stringify(flux),
      });
      solarRecords++;
    }
  } catch (e) {
    errors.push(`Radio Flux: ${e instanceof Error ? e.message : String(e)}`);
  }

  return { kpRecords, forecastRecords, solarRecords, errors };
}
