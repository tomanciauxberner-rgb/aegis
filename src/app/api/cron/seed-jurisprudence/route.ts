import { NextRequest, NextResponse } from "next/server";
import { seedJurisprudenceCases } from "@/lib/jurisprudence/seed";

const CRON_SECRET = process.env.CRON_SECRET;

export async function POST(request: NextRequest) {
  if (CRON_SECRET) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const result = await seedJurisprudenceCases();
  return NextResponse.json(result);
}
