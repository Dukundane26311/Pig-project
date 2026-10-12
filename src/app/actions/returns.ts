"use server";

import { prisma } from "@/lib/prisma";
import { getActiveUser } from "@/lib/active-user";
import { PigHealthStatus, PigStatus, Role, RevolvingStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export type PigReturnDateSummary = {
  date: string;
  pigletsReturned: number;
  notYetExamined: number;
  sickPiglets: number;
  diseaseDescription: string;
  treatmentDescription: string;
};

export async function getBeneficiaryReturnOptions() {
  const beneficiaries = await prisma.beneficiary.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      fullName: true,
      beneficiaryNumber: true,
      districtStr: true,
    },
    orderBy: { fullName: "asc" },
  });
  return beneficiaries;
}

export async function recordBatchPigReturn(formData: FormData) {
  const user = await getActiveUser([Role.SUPER_ADMIN, Role.FIELD_OFFICER, Role.VETERINARIAN]);
  if (!user) throw new Error("Unauthorized");

  const quantityRaw = formData.get("quantity") || formData.get("pigletsReturned");
  const returnDateRaw = formData.get("returnDate") as string;
  const sickPigletsRaw = formData.get("sickPiglets");
  const diseaseDescription = ((formData.get("diseaseDescription") as string) || "").trim();
  const treatmentDescription = ((formData.get("treatmentDescription") as string) || "").trim();
  const beneficiaryIdRaw = formData.get("beneficiaryId") as string;

  const quantity = parseInt(String(quantityRaw || 0), 10);
  const sickPiglets = parseInt(String(sickPigletsRaw || 0), 10);

  if (Number.isNaN(quantity) || quantity < 1) {
    return { success: false, error: "Number of piglets returned must be at least 1." };
  }

  if (Number.isNaN(sickPiglets) || sickPiglets < 0) {
    return { success: false, error: "Number of sick piglets cannot be negative." };
  }

  if (sickPiglets > quantity) {
    return { success: false, error: "The number of sick piglets cannot exceed the total number returned." };
  }

  const healthyPiglets = quantity - sickPiglets;
  const returnDate = returnDateRaw ? new Date(returnDateRaw) : new Date();

  await prisma.$transaction(async (tx) => {
    let beneficiary = null;
    if (beneficiaryIdRaw && beneficiaryIdRaw.trim()) {
      beneficiary = await tx.beneficiary.findUnique({
        where: { id: beneficiaryIdRaw.trim() },
      });
    }
    if (!beneficiary) {
      beneficiary = await tx.beneficiary.findFirst({
        where: { deletedAt: null },
        orderBy: { createdAt: "asc" },
      });
    }
    if (!beneficiary) {
      throw new Error("No registered beneficiary found. Please ensure at least one beneficiary exists in the system.");
    }

    const year = returnDate.getFullYear();
    const prefix = `PF-RW-${year}-`;
    const lastPig = await tx.pig.findFirst({
      where: {
        OR: [
          { tagNumber: { startsWith: prefix } },
          { tagNumber: { startsWith: `PIG-${year}-` } },
        ],
      },
      orderBy: { tagNumber: "desc" },
    });

    let baseSequence = 0;
    if (lastPig) {
      const parts = lastPig.tagNumber.split("-");
      const seq = parseInt(parts[parts.length - 1], 10);
      if (!Number.isNaN(seq)) baseSequence = seq;
    }

    let firstPigId: string | null = null;

    // 1. Sick piglets (status REGISTERED, healthStatus UNDER_TREATMENT)
    for (let i = 1; i <= sickPiglets; i++) {
      const tagNumber = `${prefix}${String(baseSequence + i).padStart(5, "0")}`;
      const pigAsset = await tx.pig.create({
        data: {
          tagNumber,
          status: PigStatus.REGISTERED,
          healthStatus: PigHealthStatus.UNDER_TREATMENT,
          dateReceived: returnDate,
          source: `Returned Piglet (${beneficiary.fullName})`,
          notes: diseaseDescription ? `Returned sick: ${diseaseDescription}` : "Returned piglet under treatment",
        },
      });
      if (!firstPigId) firstPigId = pigAsset.id;

      await tx.veterinaryRecord.create({
        data: {
          pigId: pigAsset.id,
          veterinarianId: user.id,
          date: returnDate,
          activityType: "TREATMENT",
          diagnosis: diseaseDescription || "Illness identified on return",
          treatment: treatmentDescription || "Treatment prescribed",
          status: "UNDER_TREATMENT",
          notes: `Returned piglet found sick upon intake.`,
        },
      });
    }

    // 2. Healthy piglets (status REGISTERED, healthStatus HEALTHY)
    for (let i = 1; i <= healthyPiglets; i++) {
      const tagNumber = `${prefix}${String(baseSequence + sickPiglets + i).padStart(5, "0")}`;
      const pigAsset = await tx.pig.create({
        data: {
          tagNumber,
          status: PigStatus.REGISTERED,
          healthStatus: PigHealthStatus.HEALTHY,
          dateReceived: returnDate,
          source: `Returned Piglet (${beneficiary.fullName})`,
          notes: "Returned piglet - healthy",
        },
      });
      if (!firstPigId) firstPigId = pigAsset.id;

      await tx.veterinaryRecord.create({
        data: {
          pigId: pigAsset.id,
          veterinarianId: user.id,
          date: returnDate,
          activityType: "ROUTINE_CHECKUP",
          diagnosis: "Healthy",
          treatment: "Cleared",
          status: "COMPLETED",
          notes: "Returned piglet cleared healthy.",
        },
      });
    }

    // 3. Create PigReturn record
    const metaNotes = {
      sickPiglets,
      healthyPiglets,
      diseaseDescription: diseaseDescription || null,
      treatmentDescription: treatmentDescription || null,
    };

    await tx.pigReturn.create({
      data: {
        beneficiaryId: beneficiary.id,
        recordedById: user.id,
        returnDate,
        quantity,
        pigId: firstPigId,
        veterinaryVerified: sickPiglets === 0,
        condition: `Healthy: ${healthyPiglets}, Sick: ${sickPiglets}`,
        notes: JSON.stringify(metaNotes),
      },
    });

    // 4. Update revolving cycle obligation if applicable
    const activeCycle = await tx.revolvingCycle.findFirst({
      where: { beneficiaryId: beneficiary.id, status: { not: RevolvingStatus.COMPLETED } },
      orderBy: { startDate: "asc" },
    });
    if (activeCycle) {
      const prevReturns = await tx.pigReturn.aggregate({
        _sum: { quantity: true },
        where: { beneficiaryId: beneficiary.id },
      });
      const totalRet = (prevReturns._sum.quantity ?? 0);
      if (totalRet >= activeCycle.expectedReturn) {
        await tx.revolvingCycle.update({
          where: { id: activeCycle.id },
          data: { status: RevolvingStatus.COMPLETED },
        });
      } else if (totalRet > 0) {
        await tx.revolvingCycle.update({
          where: { id: activeCycle.id },
          data: { status: RevolvingStatus.PARTIALLY_COMPLETED },
        });
      }
    }

    // 5. Audit Log
    await tx.auditLog.create({
      data: {
        userId: user.id,
        role: user.role,
        action: "RETURNED",
        entity: "PIG_RETURN",
        entityId: `RETURN-BATCH-${Date.now()}`,
        newValue: {
          beneficiary: beneficiary.fullName,
          quantity,
          sickPiglets,
          healthyPiglets,
          diseaseDescription,
          treatmentDescription,
          returnDate: returnDate.toISOString(),
        },
      },
    });
  });

  revalidatePath("/dashboard/field/returns");
  revalidatePath("/dashboard/field/returns/new");
  revalidatePath("/dashboard/field");
  revalidatePath("/dashboard/vet");
  revalidatePath("/dashboard/vet/returned");
  revalidatePath("/dashboard/admin/returns");
  revalidatePath("/dashboard/admin/distributions");
  revalidatePath("/dashboard/history");

  return {
    success: true,
    quantity,
    sickPiglets,
    healthyPiglets,
  };
}

export async function getPigReturnDateSummaries() {
  const returns = await prisma.pigReturn.findMany({
    orderBy: { returnDate: "asc" },
    include: {
      beneficiary: { select: { fullName: true, beneficiaryNumber: true } },
    },
  });

  const totalPigletsReturned = returns.reduce((sum, r) => sum + r.quantity, 0);

  // Group by returnDate (YYYY-MM-DD)
  const dateMap = new Map<string, typeof returns>();
  for (const ret of returns) {
    const dStr = new Date(ret.returnDate).toISOString().split("T")[0];
    if (!dateMap.has(dStr)) {
      dateMap.set(dStr, []);
    }
    dateMap.get(dStr)!.push(ret);
  }

  const sortedDates = Array.from(dateMap.keys()).sort();
  let cumulativeExamined = 0;
  let cumulativeReturned = 0;
  let totalSickSum = 0;

  const dateSummaries: PigReturnDateSummary[] = [];

  for (const dateStr of sortedDates) {
    const dayReturns = dateMap.get(dateStr)!;
    let dayReturned = 0;
    let dayExamined = 0;
    let daySick = 0;
    const diseases = new Set<string>();
    const treatments = new Set<string>();

    for (const r of dayReturns) {
      dayReturned += r.quantity;
      cumulativeReturned += r.quantity;

      let parsedSick = 0;
      let parsedDisease = "";
      let parsedTreatment = "";

      if (r.notes) {
        try {
          const parsed = JSON.parse(r.notes);
          if (typeof parsed === "object" && parsed !== null) {
            parsedSick = Number(parsed.sickPiglets) || 0;
            if (parsed.diseaseDescription) parsedDisease = String(parsed.diseaseDescription);
            if (parsed.treatmentDescription) parsedTreatment = String(parsed.treatmentDescription);
          }
        } catch {
          if (r.condition && r.condition.includes("Sick:")) {
            const match = r.condition.match(/Sick:\s*(\d+)/);
            if (match) parsedSick = parseInt(match[1], 10);
          }
        }
      }

      const isExamined = Boolean(r.veterinaryVerified || (r.notes && r.notes.includes("sickPiglets")) || (r.condition && r.condition.includes("Sick:")));
      const examinedCount = isExamined ? r.quantity : 0;

      dayExamined += examinedCount;
      cumulativeExamined += examinedCount;

      daySick += parsedSick;
      totalSickSum += parsedSick;

      if (parsedDisease && parsedDisease.toLowerCase() !== "none" && parsedDisease.toLowerCase() !== "healthy") {
        diseases.add(parsedDisease);
      }
      if (parsedTreatment && parsedTreatment.toLowerCase() !== "none" && parsedTreatment.toLowerCase() !== "cleared") {
        treatments.add(parsedTreatment);
      }
    }

    const notYetExamined = Math.max(0, totalPigletsReturned - cumulativeExamined);

    dateSummaries.push({
      date: dateStr,
      pigletsReturned: dayReturned,
      notYetExamined,
      sickPiglets: daySick,
      diseaseDescription: Array.from(diseases).join(", ") || "None / All Healthy",
      treatmentDescription: Array.from(treatments).join(", ") || "Routine check / Cleared",
    });
  }

  dateSummaries.reverse();

  const notYetExamined = Math.max(0, totalPigletsReturned - cumulativeExamined);

  return {
    summaries: dateSummaries,
    totalPigletsReturned,
    cumulativeExamined,
    notYetExamined,
    totalSickIdentified: totalSickSum,
  };
}
