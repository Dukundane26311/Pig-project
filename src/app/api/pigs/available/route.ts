import { PigHealthStatus, PigStatus, Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { getActiveUser } from "@/lib/active-user";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getActiveUser([Role.SUPER_ADMIN, Role.FIELD_OFFICER]);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pigs = await prisma.pig.findMany({
    where: {
      deletedAt: null,
      status: PigStatus.ACTIVE,
      healthStatus: PigHealthStatus.HEALTHY,
      currentBeneficiaryId: null,
    },
    orderBy: { tagNumber: "asc" },
    select: {
      id: true,
      tagNumber: true,
      breed: true,
      sex: true,
    },
  });

  return NextResponse.json(pigs);
}
