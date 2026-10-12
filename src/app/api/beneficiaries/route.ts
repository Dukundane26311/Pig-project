import { Role, RevolvingStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { getActiveUser } from "@/lib/active-user";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const user = await getActiveUser([Role.SUPER_ADMIN, Role.FIELD_OFFICER]);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const eligibleForDistribution =
    new URL(request.url).searchParams.get("purpose") === "distribution";

  const rawBeneficiaries = await prisma.beneficiary.findMany({
    where: {
      deletedAt: null,
      ...(eligibleForDistribution ? { status: { in: ["ACTIVE", "AWAITING_PIGLET"] } } : {}),
    },
    orderBy: { fullName: "asc" },
    select: {
      id: true,
      fullName: true,
      beneficiaryNumber: true,
      nationalId: true,
      status: true,
      districtId: true,
      sectorId: true,
      cellId: true,
      villageId: true,
      districtStr: true,
      sectorStr: true,
      cellStr: true,
      villageStr: true,
      district: { select: { name: true } },
      sector: { select: { name: true } },
      cell: { select: { name: true } },
      village: { select: { name: true } },
      distributions: { select: { id: true } },
      returns: { select: { quantity: true } },
      revolvingCycles: {
        where: { status: { not: RevolvingStatus.CANCELLED } },
        select: { expectedReturn: true, status: true },
      },
      _count: {
        select: { legacyReturns: true },
      },
    },
  });

  const beneficiaries = rawBeneficiaries.map((b) => {
    const distributionsCount = b.distributions.length;
    const cycleObligation = b.revolvingCycles.reduce((sum, c) => sum + c.expectedReturn, 0);
    // Base obligation is 2 piglets per distributed pig received from the foundation
    const totalRequired = Math.max(cycleObligation, distributionsCount > 0 ? distributionsCount * 2 : 2);
    const totalReturned =
      b.returns.reduce((sum, r) => sum + (r.quantity ?? 1), 0) + (b._count?.legacyReturns ?? 0);
    const remaining = Math.max(0, totalRequired - totalReturned);

    const returnStatus =
      totalReturned >= totalRequired && totalRequired > 0
        ? "Completed"
        : totalReturned > 0
          ? "Partially Returned"
          : "Pending";

    return {
      id: b.id,
      fullName: b.fullName,
      beneficiaryNumber: b.beneficiaryNumber,
      nationalId: b.nationalId,
      status: b.status,
      districtId: b.districtId,
      sectorId: b.sectorId,
      cellId: b.cellId,
      villageId: b.villageId,
      district: b.district?.name || b.districtStr || "",
      sector: b.sector?.name || b.sectorStr || "",
      cell: b.cell?.name || b.cellStr || "",
      village: b.village?.name || b.villageStr || "",
      distributionsCount,
      totalRequired,
      totalReturned,
      remaining,
      returnStatus,
    };
  });

  return NextResponse.json(beneficiaries);
}
