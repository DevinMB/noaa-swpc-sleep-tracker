import { db } from "@/lib/db";
import { spaceWeatherKp, sleepLogs } from "@/lib/db/schema";
import { sql, desc } from "drizzle-orm";
import { pearsonCorrelation, linearRegression, mean } from "@/lib/utils/stats";

export interface CorrelationPoint {
  date: string;
  avgKp: number;
  avgSleepQuality: number;
  avgSleepHours: number;
  sleepReports: number;
}

export interface CorrelationResult {
  points: CorrelationPoint[];
  kpVsQuality: { r: number; pValue: number; n: number };
  kpVsHours: { r: number; pValue: number; n: number };
  regression: { slope: number; intercept: number; rSquared: number };
  stormImpact: {
    normalAvgQuality: number;
    stormAvgQuality: number;
    percentChange: number;
  };
}

/**
 * Compute correlation data between daily Kp averages and daily sleep averages.
 */
export async function computeCorrelation(): Promise<CorrelationResult> {
  // Get daily Kp averages
  const dailyKp = await db
    .select({
      date: sql<string>`substr(${spaceWeatherKp.timeTag}, 1, 10)`,
      avgKp: sql<number>`AVG(${spaceWeatherKp.kpIndex})`,
    })
    .from(spaceWeatherKp)
    .groupBy(sql`substr(${spaceWeatherKp.timeTag}, 1, 10)`)
    .orderBy(desc(sql`substr(${spaceWeatherKp.timeTag}, 1, 10)`));

  // Get daily sleep averages
  const dailySleep = await db
    .select({
      date: sleepLogs.date,
      avgQuality: sql<number>`AVG(${sleepLogs.sleepQuality})`,
      avgHours: sql<number>`AVG(${sleepLogs.sleepHours})`,
      count: sql<number>`COUNT(*)`,
    })
    .from(sleepLogs)
    .groupBy(sleepLogs.date)
    .orderBy(desc(sleepLogs.date));

  // Join on date
  const sleepMap = new Map(dailySleep.map((s) => [s.date, s]));
  const points: CorrelationPoint[] = [];

  for (const kp of dailyKp) {
    const sleep = sleepMap.get(kp.date);
    if (sleep) {
      points.push({
        date: kp.date,
        avgKp: Math.round(kp.avgKp * 100) / 100,
        avgSleepQuality: Math.round(sleep.avgQuality * 100) / 100,
        avgSleepHours: Math.round(sleep.avgHours * 100) / 100,
        sleepReports: sleep.count,
      });
    }
  }

  // Sort chronologically
  points.sort((a, b) => a.date.localeCompare(b.date));

  // Compute correlations
  const kpValues = points.map((p) => p.avgKp);
  const qualityValues = points.map((p) => p.avgSleepQuality);
  const hoursValues = points.map((p) => p.avgSleepHours);

  const kpVsQuality = pearsonCorrelation(kpValues, qualityValues);
  const kpVsHours = pearsonCorrelation(kpValues, hoursValues);
  const regression = linearRegression(kpValues, qualityValues);

  // Storm impact analysis: compare sleep on high-Kp days (>= 4) vs normal days
  const normalDays = points.filter((p) => p.avgKp < 4);
  const stormDays = points.filter((p) => p.avgKp >= 4);

  const normalAvgQuality = normalDays.length > 0
    ? mean(normalDays.map((p) => p.avgSleepQuality))
    : 0;
  const stormAvgQuality = stormDays.length > 0
    ? mean(stormDays.map((p) => p.avgSleepQuality))
    : 0;

  const percentChange = normalAvgQuality > 0
    ? ((stormAvgQuality - normalAvgQuality) / normalAvgQuality) * 100
    : 0;

  return {
    points,
    kpVsQuality,
    kpVsHours,
    regression,
    stormImpact: {
      normalAvgQuality: Math.round(normalAvgQuality * 100) / 100,
      stormAvgQuality: Math.round(stormAvgQuality * 100) / 100,
      percentChange: Math.round(percentChange * 10) / 10,
    },
  };
}
