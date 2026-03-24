import type { KpReading } from "./types";

interface HourlyKp {
  timeTag: string; // ISO string rounded to the hour
  kpIndex: number; // average Kp for that hour
  estimatedKp: number; // average estimated Kp
}

/**
 * Downsample 1-minute Kp readings to hourly averages.
 */
export function downsampleKpToHourly(readings: KpReading[]): HourlyKp[] {
  const buckets = new Map<string, { kpSum: number; estSum: number; count: number }>();

  for (const reading of readings) {
    const date = new Date(reading.time_tag);
    // Round down to the hour
    date.setMinutes(0, 0, 0);
    const hourKey = date.toISOString();

    const existing = buckets.get(hourKey);
    if (existing) {
      existing.kpSum += reading.kp_index;
      existing.estSum += reading.estimated_kp;
      existing.count += 1;
    } else {
      buckets.set(hourKey, {
        kpSum: reading.kp_index,
        estSum: reading.estimated_kp,
        count: 1,
      });
    }
  }

  return Array.from(buckets.entries())
    .map(([timeTag, bucket]) => ({
      timeTag,
      kpIndex: Math.round((bucket.kpSum / bucket.count) * 100) / 100,
      estimatedKp: Math.round((bucket.estSum / bucket.count) * 100) / 100,
    }))
    .sort((a, b) => a.timeTag.localeCompare(b.timeTag));
}

/**
 * Get the most recent Kp reading from a list.
 */
export function getLatestKp(readings: KpReading[]): KpReading | null {
  if (readings.length === 0) return null;
  return readings.reduce((latest, current) =>
    current.time_tag > latest.time_tag ? current : latest
  );
}

/**
 * Compute daily average Kp from hourly data.
 */
export function computeDailyKpAverage(
  hourlyData: HourlyKp[]
): { date: string; avgKp: number }[] {
  const dayBuckets = new Map<string, { sum: number; count: number }>();

  for (const entry of hourlyData) {
    const date = entry.timeTag.slice(0, 10); // YYYY-MM-DD
    const existing = dayBuckets.get(date);
    if (existing) {
      existing.sum += entry.kpIndex;
      existing.count += 1;
    } else {
      dayBuckets.set(date, { sum: entry.kpIndex, count: 1 });
    }
  }

  return Array.from(dayBuckets.entries())
    .map(([date, bucket]) => ({
      date,
      avgKp: Math.round((bucket.sum / bucket.count) * 100) / 100,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
