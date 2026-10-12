import { prisma } from "@/lib/prisma";

export type AuditEntity =
  | "PIG"
  | "PIG_RECEIPT"
  | "BENEFICIARY"
  | "DISTRIBUTION"
  | "RETURN"
  | "VETERINARY"
  | "FINANCE"
  | "USER"
  | "USER_PROFILE"
  | "USER_SECURITY"
  | "SETTING"
  | "AUTH"
  | "REPORT";

export async function logActivity({
  userId,
  role,
  action,
  entity,
  entityId,
  previousValue,
  newValue,
  ipAddress,
  userAgent,
}: {
  userId?: string | null;
  role?: string | null;
  action: string;
  entity: AuditEntity | string;
  entityId: string;
  previousValue?: any;
  newValue?: any;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  try {
    return await prisma.auditLog.create({
      data: {
        userId: userId || null,
        role: role ? String(role) : null,
        action,
        entity,
        entityId: String(entityId),
        previousValue: previousValue ? previousValue : undefined,
        newValue: newValue ? newValue : undefined,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
      },
    });
  } catch (err) {
    console.error("Failed to record activity audit log:", err);
  }
}
