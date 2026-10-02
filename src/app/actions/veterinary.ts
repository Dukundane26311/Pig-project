"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function createVeterinaryVisit(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const pigId = formData.get("pigId") as string;
  const diagnosis = formData.get("diagnosis") as string;
  const activityType = formData.get("activityType") as string;
  const treatment = formData.get("treatment") as string;
  const medication = formData.get("medication") as string;
  const notes = formData.get("notes") as string;
  const dateRaw = formData.get("date") as string;
  const followUpDateRaw = formData.get("followUpDate") as string;

  await prisma.veterinaryRecord.create({
    data: {
      pigId,
      veterinarianId: session.user.id,
      date: dateRaw ? new Date(dateRaw) : new Date(),
      activityType,
      diagnosis,
      treatment,
      medication,
      notes,
      followUpDate: followUpDateRaw ? new Date(followUpDateRaw) : null,
    }
  });

  // Also update the pig's current overall health status based on diagnosis
  await prisma.pig.update({
    where: { id: pigId },
    data: { healthStatus: diagnosis }
  });

  revalidatePath("/dashboard/veterinary");
  revalidatePath(`/dashboard/pigs/${pigId}`);
  redirect("/dashboard/veterinary");
}
