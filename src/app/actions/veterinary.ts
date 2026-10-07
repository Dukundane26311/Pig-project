"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { PigHealthStatus } from "@prisma/client";

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
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  if (!['SUPER_ADMIN', 'VETERINARIAN'].includes(session.user.role)) {
    throw new Error("Forbidden: Only Veterinarians or Admins can record exams.");
  }

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

  const exam = await prisma.veterinaryRecord.create({
    data: {
      pigId,
      veterinarianId: session.user.id,
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
    }
  });

  const healthStatus = getHealthStatusFromDiagnosis(diagnosis);
  if (healthStatus) {
    await prisma.pig.update({
      where: { id: pigId },
      data: { healthStatus }
    });
  }

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
  revalidatePath("/dashboard/admin/veterinary");
  
  if (session.user.role === 'SUPER_ADMIN') {
    redirect("/dashboard/admin/veterinary");
  } else {
    redirect("/dashboard/vet");
  }
}
