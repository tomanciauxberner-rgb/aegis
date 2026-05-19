import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { scanText } from "@/lib/children/trigger-engine";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function getRateLimitKey(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded ? forwarded.split(",")[0].trim() : "unknown";
}

function checkRateLimit(key: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now >= entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  return { allowed: true, remaining: RATE_LIMIT_MAX - entry.count };
}

export async function POST(req: NextRequest) {
  const rateLimitKey = getRateLimitKey(req);
  const { allowed, remaining } = checkRateLimit(rateLimitKey);

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Retry in 60 seconds." },
      {
        status: 429,
        headers: {
          "Retry-After": "60",
          "X-RateLimit-Limit": String(RATE_LIMIT_MAX),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
      },
    }
  );

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    return NextResponse.json(
      { error: "Unauthorized. Valid session required." },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { text, jurisdiction } = body as { text?: unknown; jurisdiction?: unknown };

  if (typeof text !== "string" || text.trim().length === 0) {
    return NextResponse.json(
      { error: "Field 'text' is required and must be a non-empty string." },
      { status: 422 }
    );
  }

  if (text.length > 50_000) {
    return NextResponse.json(
      { error: "Text exceeds maximum length of 50,000 characters." },
      { status: 422 }
    );
  }

  if (jurisdiction !== undefined && typeof jurisdiction !== "string") {
    return NextResponse.json(
      { error: "Field 'jurisdiction' must be a string if provided." },
      { status: 422 }
    );
  }

  const result = scanText(text, {
    jurisdiction: typeof jurisdiction === "string" ? jurisdiction : undefined,
  });

  const { error: insertError } = await supabase
    .from("child_trigger_scans")
    .insert({
      user_id: session.user.id,
      input_hash: result.input_hash,
      signals: result.signals,
      obligations: result.obligations,
      jurisdiction_filter: jurisdiction ?? null,
      obligations_count: result.obligation_count,
    });

  if (insertError) {
    console.error("[trigger-scan] DB insert failed:", insertError.message);
  }

  return NextResponse.json(result, {
    status: 200,
    headers: {
      "X-RateLimit-Limit": String(RATE_LIMIT_MAX),
      "X-RateLimit-Remaining": String(remaining),
      "Cache-Control": "no-store",
    },
  });
}
