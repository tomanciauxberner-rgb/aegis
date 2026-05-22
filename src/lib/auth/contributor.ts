import { db } from "@/db/client";
import { orgMembers } from "@/db/schema/tables";
import { eq } from "drizzle-orm";

const CONTRIBUTOR_ROLES = new Set(["owner", "admin", "analyst"]);

/**
 * Returns true if the user holds a contributor-level role in any org.
 * Viewers (the default for new accounts) cannot contribute data.
 */
export async function canContribute(userId: string): Promise<boolean> {
  const rows = await db
    .select({ role: orgMembers.role })
    .from(orgMembers)
    .where(eq(orgMembers.userId, userId));

  return rows.some((r) => CONTRIBUTOR_ROLES.has(r.role));
}
