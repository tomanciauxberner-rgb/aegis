import { db } from "@/db/client";
import { auditLog } from "@/db/schema";

type AuditAction =
  | "system.create"
  | "system.update"
  | "system.delete"
  | "fria.create"
  | "fria.update"
  | "fria.publish"
  | "fria.export"
  | "fria.notify_authority"
  | "org.update"
  | "member.invite"
  | "member.remove"
  | "member.role_change"
  | "auth.login"
  | "auth.logout";

interface AuditEntry {
  orgId: string;
  userId: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export async function writeAuditLog(entry: AuditEntry): Promise<void> {
  try {
    await db.insert(auditLog).values({
      orgId: entry.orgId,
      userId: entry.userId,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
      details: entry.details,
      ipAddress: entry.ipAddress,
      userAgent: entry.userAgent,
    });
  } catch (error) {
    console.error("[AUDIT] Failed to write audit log:", error);
  }
}
