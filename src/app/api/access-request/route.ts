import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db/client";
import { accessRequests } from "@/db/schema/access-requests";
import { rateLimitDistributed } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const BodySchema = z.object({
  fullName: z.string().trim().min(2).max(160),
  roleTitle: z.string().trim().max(200).optional().or(z.literal("")),
  organisation: z.string().trim().max(200).optional().or(z.literal("")),
  email: z.string().trim().email().max(254),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "anon";
  const { success } = await rateLimitDistributed(`access-request:${ip}`, 5);
  if (!success) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the form fields.", details: parsed.error.flatten() }, { status: 400 });
  }

  const { fullName, roleTitle, organisation, email, message } = parsed.data;

  try {
    await db.insert(accessRequests).values({
      fullName,
      roleTitle: roleTitle || null,
      organisation: organisation || null,
      email,
      message: message || null,
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    console.error("[access-request]", e);
    return NextResponse.json({ error: "Could not submit request." }, { status: 500 });
  }
}
