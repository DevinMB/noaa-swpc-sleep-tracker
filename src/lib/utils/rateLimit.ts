/**
 * Simple in-memory rate limiter.
 * Tracks request counts per key (e.g., IP address) within a sliding window.
 */
const store = new Map<string, { count: number; resetAt: number }>();

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export function checkRateLimit(
  key: string,
  config: RateLimitConfig = { maxRequests: 5, windowMs: 60_000 }
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = store.get(key);

  // Clean up expired entries periodically
  if (store.size > 10_000) {
    for (const [k, v] of store.entries()) {
      if (v.resetAt < now) store.delete(k);
    }
  }

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true, remaining: config.maxRequests - 1, resetAt: now + config.windowMs };
  }

  if (entry.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: config.maxRequests - entry.count, resetAt: entry.resetAt };
}
