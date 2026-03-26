import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

/**
 * Run migrations by creating tables directly from schema definitions.
 * This avoids needing drizzle-kit migrations for the initial setup.
 */
export function runMigrations(dbPath?: string) {
  const resolvedPath = dbPath || process.env.DATABASE_URL || "./data/cosmic-sleep.db";
  const dbDir = path.dirname(resolvedPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const sqlite = new Database(resolvedPath);
  sqlite.pragma("journal_mode = WAL");

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS space_weather_kp (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      time_tag TEXT NOT NULL UNIQUE,
      kp_index REAL NOT NULL,
      estimated_kp REAL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS space_weather_forecast (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      time_tag TEXT NOT NULL,
      metric TEXT NOT NULL,
      value REAL NOT NULL,
      fetched_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(time_tag, metric)
    );
    CREATE UNIQUE INDEX IF NOT EXISTS forecast_time_metric_idx
      ON space_weather_forecast(time_tag, metric);

    CREATE TABLE IF NOT EXISTS space_weather_solar (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      time_tag TEXT NOT NULL,
      data_type TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sleep_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      sleep_hours REAL NOT NULL,
      sleep_quality INTEGER NOT NULL,
      region TEXT,
      source TEXT NOT NULL DEFAULT 'self_report',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS poll_fingerprints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fingerprint_hash TEXT NOT NULL,
      ip_hash TEXT,
      date TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE UNIQUE INDEX IF NOT EXISTS fingerprint_date_idx
      ON poll_fingerprints(fingerprint_hash, date);
  `);

  // Migration: add ip_hash column if it doesn't exist
  const columns = sqlite.pragma("table_info(poll_fingerprints)") as { name: string }[];
  if (!columns.some((c) => c.name === "ip_hash")) {
    sqlite.exec("ALTER TABLE poll_fingerprints ADD COLUMN ip_hash TEXT");
  }

  // Migration: add submitted_at column to sleep_logs
  const sleepCols = sqlite.pragma("table_info(sleep_logs)") as { name: string }[];
  if (!sleepCols.some((c) => c.name === "submitted_at")) {
    sqlite.exec("ALTER TABLE sleep_logs ADD COLUMN submitted_at TEXT");
  }

  sqlite.close();
}
