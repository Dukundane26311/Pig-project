"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function createFieldVisit(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const beneficiaryId = formData.get("beneficiaryId") as string;
  const pigId = formData.get("pigId") as string;
  const purpose = formData.get("purpose") as string;
  const observations = formData.get("observations") as string;
  const pigCondition = formData.get("pigCondition") as string;
  const beneficiaryCondition = formData.get("beneficiaryCondition") as string;
  const actionsTaken = formData.get("actionsTaken") as string;
  const recommendations = formData.get("recommendations") as string;
  const nextVisitDateRaw = formData.get("nextVisitDate") as string;

  await prisma.fieldVisit.create({
    data: {
      beneficiaryId,
      pigId: pigId || null,
      fieldOfficerId: session.user.id,
      date: new Date(),
      purpose,
      observations,
      pigCondition,
      beneficiaryCondition,
      actionsTaken,
      recommendations,
      nextVisitDate: nextVisitDateRaw ? new Date(nextVisitDateRaw) : null,
    }
  });

  revalidatePath("/dashboard/visits");
  redirect("/dashboard/visits");
}
