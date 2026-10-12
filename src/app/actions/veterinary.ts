"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PigHealthStatus, PigStatus, Role } from "@prisma/client";
import { getActiveUser } from "@/lib/active-user";

const diagnosisHealthStatusMap: Record<string, PigHealthStatus> = {
  healthy: "HEALTHY",
  sick: "SICK",
  illness: "SICK",
  ill: "SICK",
  treatment: "UNDER_TREATMENT",
  "under treatment": "UNDER_TREATMENT",
  recovering: "RECOVERED",
  recovered: "RECOVERED",
  critical: "CRITICAL",
  deceased: "DECEASED",
  dead: "DECEASED",
};

function getHealthStatusFromDiagnosis(diagnosis: string): PigHealthStatus | null {
  const normalized = diagnosis.trim().toLowerCase();
  return diagnosisHealthStatusMap[normalized] ?? null;
}

export async function createVeterinaryVisit(formData: FormData) {
  const user = await getActiveUser([Role.SUPER_ADMIN, Role.VETERINARIAN]);
  if (!user) throw new Error("Unauthorized");

  const pigId = formData.get("pigId") as string;
  const diagnosis = formData.get("diagnosis") as string;
  const activityType = formData.get("activityType") as string;
  const treatment = formData.get("treatment") as string;
  const medication = formData.get("medication") as string;
  const notes = formData.get("notes") as string;
  const dateRaw = formData.get("date") as string;
  const followUpDateRaw = formData.get("followUpDate") as string;
  const weight = parseFloat(formData.get("weight") as string) || null;
  const bodyCondition = formData.get("bodyCondition") as string;
  const status = ((formData.get("status") as string | null) || "COMPLETED").trim();

  const healthStatus = getHealthStatusFromDiagnosis(diagnosis);
  const exam = await prisma.$transaction(async (tx) => {
    const pig = await tx.pig.findUnique({
      where: { id: pigId },
      select: { id: true, tagNumber: true, healthStatus: true, status: true },
    });
    if (!pig) throw new Error("Pig not found.");

    const record = await tx.veterinaryRecord.create({
      data: {
        pigId,
        veterinarianId: user.id,
        date: dateRaw ? new Date(dateRaw) : new Date(),
        activityType,
        diagnosis,
        treatment,
        medication,
        notes,
        weight,
        bodyCondition,
        status,
        followUpDate: followUpDateRaw ? new Date(followUpDateRaw) : null,
      },
    });

    if (healthStatus) {
      await tx.pig.update({
        where: { id: pigId },
        data: {
          healthStatus,
          ...(healthStatus === PigHealthStatus.HEALTHY && pig.status === PigStatus.REGISTERED
            ? { status: PigStatus.ACTIVE }
            : {}),
        },
      });

      if (healthStatus === PigHealthStatus.HEALTHY) {
        await tx.pigReturn.updateMany({
          where: { pigId },
          data: {
            veterinaryVerified: true,
            verifiedByVetId: user.id,
          },
        });
      }
    }

    await tx.auditLog.create({
      data: {
        userId: user.id,
        role: user.role,
        action: "EXAMINED",
        entity: "VETERINARY_RECORD",
        entityId: record.id,
        previousValue: { healthStatus: pig.healthStatus, status: pig.status },
        newValue: {
          pigId: pig.id,
          pigTagNumber: pig.tagNumber,
          diagnosis,
          healthStatus: healthStatus ?? pig.healthStatus,
          status: healthStatus === PigHealthStatus.HEALTHY && pig.status === PigStatus.REGISTERED
            ? PigStatus.ACTIVE
            : pig.status,
        },
      },
    });

    return record;
  });

  // If status is CRITICAL, alert admins
  if (status === 'CRITICAL') {
    const admins = await prisma.user.findMany({ where: { role: 'SUPER_ADMIN' } });
    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map(a => ({
          userId: a.id,
          type: 'HEALTH_ALERT',
          title: 'Critical Pig Health Alert',
          message: `A critical health issue was recorded for Pig ID: ${pigId}`,
          relatedEntityType: 'VETERINARY_RECORD',
          relatedEntityId: exam.id,
        }))
      });
    }
  }

  revalidatePath("/dashboard/vet");
  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/admin/veterinary");
  revalidatePath("/dashboard/admin/pigs");
  revalidatePath("/dashboard/admin/pigs/new");
  revalidatePath("/dashboard/field/pigs");
  revalidatePath("/dashboard/field/pigs/new");
  revalidatePath("/api/pigs/available");
  
  if (user.role === Role.SUPER_ADMIN) {
    redirect("/dashboard/admin/veterinary");
  } else {
    redirect("/dashboard/vet");
  }
}

export async function recordVeterinaryBatchExamination(formData: FormData) {
  const user = await getActiveUser([Role.SUPER_ADMIN, Role.VETERINARIAN]);
  if (!user) throw new Error("Unauthorized");

  const totalExaminedRaw = formData.get("totalExamined");
  const sickPigsRaw = formData.get("sickPigs");
  const examinationDateRaw = formData.get("examinationDate") as string;
  const diseaseDescription = ((formData.get("diseaseDescription") as string) || "").trim();
  const treatmentDescription = ((formData.get("treatmentDescription") as string) || "").trim();

  const totalExamined = parseInt(String(totalExaminedRaw || 0), 10);
  const sickPigs = parseInt(String(sickPigsRaw || 0), 10);

  if (Number.isNaN(totalExamined) || totalExamined < 1) {
    return { success: false, error: "Number of pigs examined must be at least 1." };
  }

  if (Number.isNaN(sickPigs) || sickPigs < 0) {
    return { success: false, error: "Number of sick pigs cannot be negative." };
  }

  if (sickPigs > totalExamined) {
    return { success: false, error: "The number of sick pigs cannot exceed the total pigs examined." };
  }

  const healthyPigs = totalExamined - sickPigs;
  const examDate = examinationDateRaw ? new Date(examinationDateRaw) : new Date();

  await prisma.$transaction(async (tx) => {
    // Look for pigs to update: prioritize REGISTERED pigs awaiting initial check, then other pigs
    const existingPigs = await tx.pig.findMany({
      where: { deletedAt: null },
      orderBy: [
        { status: "desc" }, // REGISTERED first, then ACTIVE
        { dateReceived: "desc" },
        { createdAt: "desc" },
      ],
      take: totalExamined,
    });

    const allPigs = [...existingPigs];

    // If there are fewer pigs than totalExamined, create any remainder
    if (allPigs.length < totalExamined) {
      const needed = totalExamined - allPigs.length;
      const year = examDate.getFullYear();
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

      for (let i = 1; i <= needed; i++) {
        const tagNumber = `${prefix}${String(baseSequence + i).padStart(5, "0")}`;
        const newPig = await tx.pig.create({
          data: {
            tagNumber,
            status: PigStatus.ACTIVE,
            healthStatus: PigHealthStatus.HEALTHY,
            dateReceived: examDate,
            source: "Veterinary Intake Registry",
          },
        });
        allPigs.push(newPig);
      }
    }

    // Partition into sick and healthy
    const sickList = allPigs.slice(0, sickPigs);
    const healthyList = allPigs.slice(sickPigs, totalExamined);

    // Update sick pigs
    for (const pig of sickList) {
      await tx.pig.update({
        where: { id: pig.id },
        data: {
          healthStatus: PigHealthStatus.UNDER_TREATMENT,
          status: PigStatus.ACTIVE,
        },
      });

      await tx.veterinaryRecord.create({
        data: {
          pigId: pig.id,
          veterinarianId: user.id,
          date: examDate,
          activityType: "TREATMENT",
          diagnosis: diseaseDescription || "Illness identified during examination",
          treatment: treatmentDescription || "Treatment prescribed",
          status: "UNDER_TREATMENT",
          notes: `Batch exam of ${totalExamined} pigs: marked sick / under treatment.`,
        },
      });
    }

    // Update healthy pigs
    for (const pig of healthyList) {
      await tx.pig.update({
        where: { id: pig.id },
        data: {
          healthStatus: PigHealthStatus.HEALTHY,
          status: PigStatus.ACTIVE,
        },
      });

      await tx.veterinaryRecord.create({
        data: {
          pigId: pig.id,
          veterinarianId: user.id,
          date: examDate,
          activityType: "ROUTINE_CHECKUP",
          diagnosis: "Healthy",
          treatment: "Cleared",
          status: "COMPLETED",
          notes: `Batch exam of ${totalExamined} pigs: cleared healthy and ready for distribution.`,
        },
      });

      // Clear any pending return verification if applicable
      await tx.pigReturn.updateMany({
        where: { pigId: pig.id, veterinaryVerified: false },
        data: {
          veterinaryVerified: true,
          verifiedByVetId: user.id,
        },
      });
    }

    // Audit log
    await tx.auditLog.create({
      data: {
        userId: user.id,
        role: user.role,
        action: "EXAMINED",
        entity: "VETERINARY_RECORD",
        entityId: `BATCH-${Date.now()}`,
        newValue: {
          totalExamined,
          sickPigs,
          healthyPigs,
          diseaseDescription: diseaseDescription || "None",
          treatmentDescription: treatmentDescription || "None",
          examinationDate: examDate.toISOString(),
        },
      },
    });
  });

  revalidatePath("/dashboard/vet");
  revalidatePath("/dashboard/vet/veterinary");
  revalidatePath("/dashboard/vet/veterinary/new");
  revalidatePath("/dashboard/vet/queue");
  revalidatePath("/dashboard/vet/reports");
  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/admin/veterinary");
  revalidatePath("/dashboard/admin/veterinary/new");
  revalidatePath("/dashboard/admin/reports");
  revalidatePath("/dashboard/history");
  revalidatePath("/api/history");
  revalidatePath("/api/pigs/available");

  return {
    success: true,
    totalExamined,
    sickPigs,
    healthyPigs,
  };
}

export async function getVeterinaryDateSummaries() {
  const totalPigsAvailable = await prisma.pig.count({ where: { deletedAt: null } });

  const records = await prisma.veterinaryRecord.findMany({
    orderBy: { date: "asc" },
    select: {
      id: true,
      pigId: true,
      date: true,
      activityType: true,
      diagnosis: true,
      treatment: true,
      status: true,
      notes: true,
    },
  });

  // Group by date (YYYY-MM-DD)
  const dateMap = new Map<string, typeof records>();

  for (const rec of records) {
    const dateStr = new Date(rec.date).toISOString().split("T")[0];
    if (!dateMap.has(dateStr)) {
      dateMap.set(dateStr, []);
    }
    dateMap.get(dateStr)!.push(rec);
  }

  // Sorted chronological asc to calculate cumulative unique examined pigs avoiding double-counting
  const sortedDates = Array.from(dateMap.keys()).sort();
  const seenPigs = new Set<string>();
  const summary: Array<{
    date: string;
    pigsExamined: number;
    notYetExamined: number;
    sickPigs: number;
    diseaseDescription: string;
    treatmentDescription: string;
  }> = [];

  for (const dateStr of sortedDates) {
    const dayRecords = dateMap.get(dateStr)!;
    const dayPigs = new Set<string>();
    let sickCount = 0;
    const diseases = new Set<string>();
    const treatments = new Set<string>();

    for (const r of dayRecords) {
      if (r.pigId) {
        dayPigs.add(r.pigId);
        seenPigs.add(r.pigId);
      }

      const isSick =
        r.status === "UNDER_TREATMENT" ||
        r.activityType === "TREATMENT" ||
        (r.diagnosis &&
          r.diagnosis.toLowerCase() !== "healthy" &&
          r.diagnosis.toLowerCase() !== "none" &&
          r.diagnosis !== "-");

      if (isSick) {
        sickCount++;
      }

      if (
        r.diagnosis &&
        r.diagnosis.toLowerCase() !== "healthy" &&
        r.diagnosis.toLowerCase() !== "none" &&
        r.diagnosis !== "-"
      ) {
        diseases.add(r.diagnosis.trim());
      }
      if (
        r.treatment &&
        r.treatment.toLowerCase() !== "cleared" &&
        r.treatment.toLowerCase() !== "none" &&
        r.treatment !== "-"
      ) {
        treatments.add(r.treatment.trim());
      }
    }

    const pigsExamined = dayPigs.size || dayRecords.length;
    // Number not yet examined avoiding double counting
    const notYetExamined = Math.max(0, totalPigsAvailable - seenPigs.size);

    summary.push({
      date: dateStr,
      pigsExamined,
      notYetExamined,
      sickPigs: sickCount,
      diseaseDescription: Array.from(diseases).join(", ") || "None / All Healthy",
      treatmentDescription: Array.from(treatments).join(", ") || "Routine check / Cleared",
    });
  }

  // Sort descending for display (most recent date first)
  summary.reverse();

  return { summary, totalPigsAvailable };
}


