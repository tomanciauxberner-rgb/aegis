import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { aiSystems, orgMembers } from "@/db/schema/tables";
import { eq, and } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const member = await db
      .select({ orgId: orgMembers.orgId })
      .from(orgMembers)
      .where(eq(orgMembers.userId, user.id))
      .limit(1);

    if (!member.length) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await db
      .update(aiSystems)
      .set({ status: "archived" })
      .where(and(eq(aiSystems.id, id), eq(aiSystems.orgId, member[0].orgId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[systems/delete]", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
