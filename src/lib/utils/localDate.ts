/**
 * Derive a local YYYY-MM-DD string from a sleep log.
 * - New rows: use submittedAt (full ISO UTC timestamp), converted to viewer's timezone.
 * - Legacy rows (submittedAt is null): treat as {date}T12:00:00Z (noon UTC — safe for most timezones).
 */
export function getLocalDate(log: { date: string; submittedAt: string | null }): string {
  const ts = log.submittedAt ?? `${log.date}T12:00:00Z`;
  const d = new Date(ts);
  return toLocalDateStr(d);
}

/** Format a Date as YYYY-MM-DD in the viewer's local timezone. */
export function toLocalDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
