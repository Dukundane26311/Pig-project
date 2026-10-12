import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { HistoricalRecordsClient, SerializedAuditLog } from "./HistoricalRecordsClient";

export const dynamic = "force-dynamic";

export default async function HistoricalRecordsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
    },
  });

  if (!currentUser || !currentUser.isActive) {
    redirect("/login");
  }

  const isAdmin = currentUser.role === Role.SUPER_ADMIN;
  const params = await searchParams;
  const targetUserIdParam = typeof params.userId === "string" ? params.userId.trim() : undefined;

  // Enforce access control:
  // Non-admins can strictly only query their own activities!
  const queryUserId = isAdmin ? targetUserIdParam : currentUser.id;

  // If Admin passed targetUserId, load user details for filter display
  let targetUserFilter: { id: string; name: string; email: string; role: string } | null = null;
  if (isAdmin && targetUserIdParam) {
    targetUserFilter = await prisma.user.findUnique({
      where: { id: targetUserIdParam },
      select: { id: true, name: true, email: true, role: true },
    });
  }

  // Load all users for Admin dropdown
  let allUsers: { id: string; name: string; email: string; role: string }[] = [];
  if (isAdmin) {
    allUsers = await prisma.user.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true, role: true },
    });
  }

  // Query audit logs
  const rawLogs = await prisma.auditLog.findMany({
    where: {
      ...(queryUserId ? { userId: queryUserId } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 1000,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  const serializedLogs: SerializedAuditLog[] = rawLogs.map((log) => ({
    id: log.id,
    userId: log.userId,
    role: log.role,
    action: log.action,
    entity: log.entity,
    entityId: log.entityId,
    previousValue: log.previousValue,
    newValue: log.newValue,
    ipAddress: log.ipAddress,
    userAgent: log.userAgent,
    createdAt: log.createdAt.toISOString(),
    user: log.user
      ? {
          id: log.user.id,
          name: log.user.name,
          email: log.user.email,
          role: log.user.role,
        }
      : null,
  }));

  return (
    <HistoricalRecordsClient
      initialLogs={serializedLogs}
      currentUser={currentUser}
      isAdmin={isAdmin}
      targetUserFilter={targetUserFilter}
      allUsers={allUsers}
    />
  );
}
