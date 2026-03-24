export async function register() {
  // Only run on the server side
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startNoaaCron } = await import("@/lib/noaa/cron");
    startNoaaCron();
  }
}
