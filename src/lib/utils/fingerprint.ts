/**
 * Generate a browser fingerprint from canvas, screen, timezone, and UA.
 * This is NOT meant to be a tracking mechanism — it's used solely to
 * enforce one-report-per-day. The raw fingerprint is never stored;
 * only a SHA-256 hash is sent to the server.
 *
 * Designed to be resilient in restricted browsers (Telegram, in-app webviews)
 * where crypto.subtle or canvas may not be available.
 */
export async function generateFingerprint(): Promise<string> {
  const components: string[] = [];

  // Screen
  try {
    components.push(`${screen.width}x${screen.height}x${screen.colorDepth}`);
  } catch {
    components.push("screen-unavailable");
  }

  // Timezone
  try {
    components.push(Intl.DateTimeFormat().resolvedOptions().timeZone);
  } catch {
    components.push("tz-unavailable");
  }

  // User Agent
  try {
    components.push(navigator.userAgent);
  } catch {
    components.push("ua-unavailable");
  }

  // Canvas fingerprint
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.textBaseline = "top";
      ctx.font = "14px Arial";
      ctx.fillStyle = "#f60";
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = "#069";
      ctx.fillText("CosmicSleep fingerprint", 2, 15);
      ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
      ctx.fillText("CosmicSleep fingerprint", 4, 17);
      components.push(canvas.toDataURL());
    }
  } catch {
    components.push("canvas-unavailable");
  }

  // Languages
  try {
    components.push(navigator.languages?.join(",") || navigator.language || "");
  } catch {
    components.push("lang-unavailable");
  }

  const raw = components.join("|");

  // Use crypto.subtle if available, otherwise fall back to a simple hash
  try {
    if (typeof crypto !== "undefined" && crypto.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(raw);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    }
  } catch {
    // Fall through to simple hash
  }

  // Simple fallback hash (djb2) for browsers without crypto.subtle
  let hash = 5381;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) + hash + raw.charCodeAt(i)) >>> 0;
  }
  return hash.toString(16).padStart(16, "0");
}
