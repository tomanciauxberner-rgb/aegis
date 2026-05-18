import { db } from "@/db/client";
import { sql } from "drizzle-orm";

const WINDOW_MS = 60 * 1000;

export async function rateLimitDistributed(
  identifier: string,
  maxRequests: number = 60
): Promise<{ success: boolean; remaining: number }> {
  try {
    const windowStart = new Date(Date.now() - WINDOW_MS).toISOString();

    const result = await db.execute(sql`
      INSERT INTO rate_limit_buckets (identifier, window_start, count)
      VALUES (
        ${identifier},
        date_trunc('minute', NOW()),
        1
      )
      ON CONFLICT (identifier, window_start)
      DO UPDATE SET count = rate_limit_buckets.count + 1
      RETURNING count
    `);

    const count = (result.rows[0] as { count: number })?.count ?? 1;

    await db.execute(sql`
      DELETE FROM rate_limit_buckets
      WHERE window_start < ${windowStart}::timestamptz
    `);

    if (count > maxRequests) {
      return { success: false, remaining: 0 };
    }

    return { success: true, remaining: maxRequests - count };
  } catch {
    return { success: true, remaining: maxRequests };
  }
}

const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const _WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 60;

export function rateLimit(
  identifier: string,
  maxRequests: number = MAX_REQUESTS,
  windowMs: number = _WINDOW_MS
): { success: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || now - entry.lastReset > windowMs) {
    rateLimitMap.set(identifier, { count: 1, lastReset: now });
    return { success: true, remaining: maxRequests - 1 };
  }

  if (entry.count >= maxRequests) {
    return { success: false, remaining: 0 };
  }

  entry.count++;
  return { success: true, remaining: maxRequests - entry.count };
}

if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitMap.entries()) {
      if (now - entry.lastReset > _WINDOW_MS * 2) {
        rateLimitMap.delete(key);
      }
    }
  }, _WINDOW_MS * 5);
}
