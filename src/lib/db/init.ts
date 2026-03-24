import { runMigrations } from "./migrate";

let initialized = false;

/**
 * Ensure database tables exist. Safe to call multiple times.
 */
export function ensureDb() {
  if (initialized) return;
  runMigrations();
  initialized = true;
}
