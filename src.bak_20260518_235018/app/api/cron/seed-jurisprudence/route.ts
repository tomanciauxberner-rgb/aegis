import { NextRequest, NextResponse } from "next/server";
import { seedJurisprudenceCases } from "@/lib/jurisprudence/seed";
import { verifyCronSecret } from "@/lib/cron-auth";

export async function POST(request: NextRequest) {
  const authError = verifyCronSecret(request);
  if (authError) return authError;

  const result = await seedJurisprudenceCases();
  return NextResponse.json(result);
}
