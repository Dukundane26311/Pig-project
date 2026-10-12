import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import {
  formatRole,
  formatModule,
  formatActivity,
  getRecordReference,
  formatChangeDescription,
} from "@/lib/audit-format";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized: Please log in to view historical records." },
      { status: 401 }
    );
  }

  // Identify the logged-in user in database
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      deletedAt: true,
    },
  });

  if (!currentUser || !currentUser.isActive || currentUser.deletedAt) {
    return NextResponse.json(
      { error: "Unauthorized: User account is inactive or not found." },
      { status: 401 }
    );
  }

  const isAdmin = currentUser.role === Role.SUPER_ADMIN;
  const { searchParams } = new URL(request.url);

  // BACKEND PERMISSION ENFORCEMENT:
  // Admin: Can view all historical records or optionally filter by target user.
  // Employee/Registrar, Veterinary, Finance: Strictly restricted to their own userId only!
  let queryUserId: string | undefined = undefined;
  if (isAdmin) {
    const requestedUserId = searchParams.get("userId")?.trim();
    if (requestedUserId) {
      queryUserId = requestedUserId;
    }
  } else {
    // Force logged-in user ID. Completely ignore and forbid overriding via URL/query parameters!
    queryUserId = currentUser.id;
  }

  // Date filter (YYYY-MM-DD)
  const dateParam = searchParams.get("date")?.trim();
  let dateRangeFilter: { gte?: Date; lte?: Date } | undefined = undefined;
  if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    const startDate = new Date(`${dateParam}T00:00:00.000Z`);
    const endDate = new Date(`${dateParam}T23:59:59.999Z`);
    dateRangeFilter = {
      gte: startDate,
      lte: endDate,
    };
  }

  // Module filter
  const moduleParam = searchParams.get("module")?.trim();

  // Search keyword
  const keyword = searchParams.get("q")?.trim().toLowerCase();

  try {
    const rawLogs = await prisma.auditLog.findMany({
      where: {
        ...(queryUserId ? { userId: queryUserId } : {}),
        ...(dateRangeFilter ? { createdAt: dateRangeFilter } : {}),
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

    const activities = rawLogs
      .map((log) => {
        const role = log.role || log.user?.role;
        const formattedRoleName = formatRole(role);
        const moduleName = formatModule(log.entity);
        const activityName = formatActivity(log.action, log.entity);
        const recordRef = getRecordReference(log);
        const description = formatChangeDescription(log);

        return {
          id: log.id,
          userId: log.userId,
          userName: log.user?.name || "System Actor",
          userEmail: log.user?.email || "automated@system",
          userRole: formattedRoleName,
          rawRole: role || null,
          dateTime: log.createdAt.toISOString(),
          dateFormatted: log.createdAt.toLocaleDateString(),
          timeFormatted: log.createdAt.toLocaleTimeString(),
          actionPerformed: activityName,
          rawAction: log.action,
          module: moduleName,
          rawEntity: log.entity,
          recordReference: recordRef,
          description,
          previousValue: log.previousValue,
          newValue: log.newValue,
        };
      })
      .filter((item) => {
        if (moduleParam && moduleParam !== "ALL") {
          if (item.module.toLowerCase() !== moduleParam.toLowerCase()) return false;
        }
        if (keyword) {
          const match =
            item.userName.toLowerCase().includes(keyword) ||
            item.userEmail.toLowerCase().includes(keyword) ||
            item.actionPerformed.toLowerCase().includes(keyword) ||
            item.module.toLowerCase().includes(keyword) ||
            item.recordReference.toLowerCase().includes(keyword) ||
            item.description.toLowerCase().includes(keyword);
          if (!match) return false;
        }
        return true;
      });

    return NextResponse.json({
      success: true,
      user: {
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.role,
        isAdmin,
      },
      count: activities.length,
      data: activities,
    });
  } catch (err: any) {
    console.error("Failed to query historical records:", err);
    return NextResponse.json(
      { error: "Failed to retrieve historical records." },
      { status: 500 }
    );
  }
}

// Strict Read-Only Enforcement: Block modification or deletion of historical records
export async function POST() {
  return NextResponse.json(
    { error: "Historical records are read-only and immutable. Creation via API is prohibited." },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: "Historical records are read-only and immutable. Editing audit history is prohibited." },
    { status: 405 }
  );
}

export async function PATCH() {
  return NextResponse.json(
    { error: "Historical records are read-only and immutable. Editing audit history is prohibited." },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: "Historical records are read-only and immutable. Deleting audit history is prohibited." },
    { status: 405 }
  );
}
