"use server";

import { PigletStatus, Prisma, Role, RevolvingStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getActiveUser } from "@/lib/active-user";
import { prisma } from "@/lib/prisma";

export async function markPigletReturned(formData: FormData) {
  const user = await getActiveUser([Role.SUPER_ADMIN]);
  if (!user) throw new Error("Unauthorized");

  const pigletIdValue = formData.get("pigletId");
  const beneficiaryIdValue = formData.get("beneficiaryId");
  const pigletId = typeof pigletIdValue === "string" ? pigletIdValue : "";
  const submittedBeneficiaryId =
    typeof beneficiaryIdValue === "string" ? beneficiaryIdValue : "";
  if (!pigletId) throw new Error("Piglet is required.");

  const litterId = await prisma.$transaction(async (tx) => {
    const piglet = await tx.piglet.findUnique({
      where: { id: pigletId },
      select: {
        id: true,
        status: true,
        litterId: true,
      },
    });
    if (!piglet) throw new Error("Piglet not found.");
    if (piglet.status !== PigletStatus.WITH_MOTHER) {
      throw new Error("Only a piglet that is still with its mother can be recorded as returned.");
    }

    const litter = await tx.litter.findUnique({
      where: { id: piglet.litterId },
      select: {
        id: true,
        motherPig: { select: { currentBeneficiaryId: true } },
      },
    });
    if (!litter) throw new Error("The piglet's litter could not be found.");
    const beneficiaryId = litter.motherPig.currentBeneficiaryId;
    if (!beneficiaryId || (submittedBeneficiaryId && submittedBeneficiaryId !== beneficiaryId)) {
      throw new Error("The piglet is not linked to the submitted beneficiary.");
    }

    const [cycles, distributions, recordedReturns, earlierPigletReturns] = await Promise.all([
      tx.revolvingCycle.findMany({
        where: { beneficiaryId, status: { not: RevolvingStatus.CANCELLED } },
        orderBy: [{ startDate: "asc" }, { createdAt: "asc" }],
        select: { id: true, expectedReturn: true, status: true },
      }),
      tx.pigDistribution.count({ where: { beneficiaryId } }),
      tx.pigReturn.aggregate({ _sum: { quantity: true }, where: { beneficiaryId } }),
      tx.piglet.count({ where: { returnedFromId: beneficiaryId } }),
    ]);
    const expectedFromCycles = cycles.reduce((total, cycle) => total + cycle.expectedReturn, 0);
    const expectedReturns = Math.max(expectedFromCycles, distributions * 2);
    const returnedBefore = (recordedReturns._sum.quantity ?? 0) + earlierPigletReturns;
    if (expectedReturns - returnedBefore < 1) {
      throw new Error("This beneficiary has no outstanding piglet return obligation.");
    }

    const updated = await tx.piglet.updateMany({
      where: { id: pigletId, status: PigletStatus.WITH_MOTHER },
      data: {
        status: PigletStatus.RETURNED,
        returnedDate: new Date(),
        returnedFromId: beneficiaryId,
      },
    });
    if (updated.count !== 1) throw new Error("The piglet was already recorded as returned.");

    let remainingReturns = returnedBefore + 1;
    for (const cycle of cycles) {
      const acceptedForCycle = Math.min(cycle.expectedReturn, remainingReturns);
      const nextStatus = acceptedForCycle >= cycle.expectedReturn
        ? RevolvingStatus.COMPLETED
        : acceptedForCycle > 0
          ? RevolvingStatus.PARTIALLY_COMPLETED
          : cycle.status;
      remainingReturns = Math.max(0, remainingReturns - cycle.expectedReturn);
      if (nextStatus !== cycle.status) {
        await tx.revolvingCycle.update({
          where: { id: cycle.id },
          data: { status: nextStatus },
        });
      }
    }

    await tx.auditLog.create({
      data: {
        userId: user.id,
        role: user.role,
        action: "RETURNED",
        entity: "PIGLET",
        entityId: pigletId,
        newValue: { beneficiaryId, status: PigletStatus.RETURNED },
      },
    });

    return piglet.litterId;
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

  revalidatePath(`/dashboard/admin/litters/${litterId}`);
  revalidatePath("/dashboard/admin/returns");
  revalidatePath("/dashboard/admin/revolving");
  revalidatePath("/dashboard/admin/beneficiaries");
  revalidatePath("/dashboard/admin");
}
