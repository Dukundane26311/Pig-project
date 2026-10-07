"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createEmployeeReport(formData: FormData) {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user.role !== "FIELD_OFFICER" && session.user.role !== "SUPER_ADMIN")) {
    throw new Error("Unauthorized");
  }

  const employeeReportModel = (prisma as any).employeeReport;

  if (!employeeReportModel) {
    throw new Error("Daily reports are temporarily unavailable. Please regenerate the Prisma client.");
  }

  const date = formData.get("date") as string;
  const workDone = formData.get("workDone") as string;
  const familiesVisited = parseInt(formData.get("familiesVisited") as string) || 0;
  const pigsDistributed = parseInt(formData.get("pigsDistributed") as string) || 0;
  const pigsReturned = parseInt(formData.get("pigsReturned") as string) || 0;
  const problemsFound = formData.get("problemsFound") as string;
  const otherActivities = formData.get("otherActivities") as string;
  const comment = formData.get("comment") as string;

  if (!date || !workDone) {
    throw new Error("Missing required fields");
  }

  await employeeReportModel.create({
    data: {
      date: new Date(date),
      employeeId: session.user.id,
      workDone,
      familiesVisited,
      pigsDistributed,
      pigsReturned,
      problemsFound,
      otherActivities,
      comment,
    },
  });

  revalidatePath("/dashboard/field/reports");
  redirect("/dashboard/field/reports");
}
