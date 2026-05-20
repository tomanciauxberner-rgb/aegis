import { db } from "@/db/client";
import { organizations, orgMembers } from "@/db/schema/tables";
import { eq } from "drizzle-orm";

export async function getOrCreateOrg(userId: string): Promise<string> {
  const existing = await db
    .select({ orgId: orgMembers.orgId })
    .from(orgMembers)
    .where(eq(orgMembers.userId, userId))
    .limit(1);

  if (existing.length > 0) return existing[0].orgId;

  const [org] = await db
    .insert(organizations)
    .values({
      name: "My Organization",
      slug: `org-${userId.slice(0, 8)}`,
      plan: "starter",
    })
    .returning({ id: organizations.id });

  await db.insert(orgMembers).values({
    orgId: org.id,
    userId,
    role: "owner",
  });

  return org.id;
}
