import { sqliteTable, text, real, integer, uniqueIndex } from "drizzle-orm/sqlite-core";

// Hourly Kp index readings (downsampled from 1-min)
export const spaceWeatherKp = sqliteTable("space_weather_kp", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  timeTag: text("time_tag").notNull().unique(),
  kpIndex: real("kp_index").notNull(),
  estimatedKp: real("estimated_kp"),
  createdAt: text("created_at").notNull().default("(datetime('now'))"),
});

// 45-day Ap/F10.7 forecasts
export const spaceWeatherForecast = sqliteTable(
  "space_weather_forecast",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    timeTag: text("time_tag").notNull(),
    metric: text("metric").notNull(), // 'ap' | 'f107'
    value: real("value").notNull(),
    fetchedAt: text("fetched_at").notNull().default("(datetime('now'))"),
  },
  (table) => [
    uniqueIndex("forecast_time_metric_idx").on(table.timeTag, table.metric),
  ]
);

// Flare probs, solar wind, radio flux, aurora (JSON payloads)
export const spaceWeatherSolar = sqliteTable("space_weather_solar", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  timeTag: text("time_tag").notNull(),
  dataType: text("data_type").notNull(), // 'flare_prob' | 'enlil' | 'radio_flux' | 'aurora'
  payload: text("payload").notNull(), // JSON string
  createdAt: text("created_at").notNull().default("(datetime('now'))"),
});

// All sleep data: self-reports + seeded baseline data
export const sleepLogs = sqliteTable("sleep_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull(), // YYYY-MM-DD
  sleepHours: real("sleep_hours").notNull(),
  sleepQuality: integer("sleep_quality").notNull(), // 1-10
  region: text("region"), // optional geographic region
  source: text("source").notNull().default("self_report"), // 'self_report' | 'nhanes' | 'kaggle'
  createdAt: text("created_at").notNull().default("(datetime('now'))"),
});

// Anti-abuse: one report per visitor per day
export const pollFingerprints = sqliteTable(
  "poll_fingerprints",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    fingerprintHash: text("fingerprint_hash").notNull(),
    ipHash: text("ip_hash"), // SHA-256 of IP for daily cap
    date: text("date").notNull(), // YYYY-MM-DD
    createdAt: text("created_at").notNull().default("(datetime('now'))"),
  },
  (table) => [
    uniqueIndex("fingerprint_date_idx").on(table.fingerprintHash, table.date),
  ]
);
