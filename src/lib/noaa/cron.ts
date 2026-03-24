import cron from "node-cron";
import { syncAllNoaaData } from "./sync";
import { ensureDb } from "@/lib/db/init";

let cronStarted = false;

/**
 * Start the NOAA data sync cron job (every 5 minutes).
 * Safe to call multiple times — only starts once.
 */
export function startNoaaCron() {
  if (cronStarted) return;
  cronStarted = true;

  ensureDb();

  // Run immediately on startup
  console.log("[NOAA Cron] Running initial sync...");
  syncAllNoaaData()
    .then((result) => {
      console.log("[NOAA Cron] Initial sync complete:", {
        kp: result.kpRecords,
        forecast: result.forecastRecords,
        solar: result.solarRecords,
        errors: result.errors.length > 0 ? result.errors : "none",
      });
    })
    .catch((err) => {
      console.error("[NOAA Cron] Initial sync failed:", err);
    });

  // Schedule every 5 minutes
  cron.schedule("*/5 * * * *", async () => {
    console.log("[NOAA Cron] Syncing NOAA data...");
    try {
      const result = await syncAllNoaaData();
      console.log("[NOAA Cron] Sync complete:", {
        kp: result.kpRecords,
        forecast: result.forecastRecords,
        solar: result.solarRecords,
        errors: result.errors.length > 0 ? result.errors : "none",
      });
    } catch (err) {
      console.error("[NOAA Cron] Sync failed:", err);
    }
  });

  console.log("[NOAA Cron] Scheduled to run every 5 minutes");
}
