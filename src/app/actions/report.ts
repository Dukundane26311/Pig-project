"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { getActiveUser } from "@/lib/active-user";

export async function createEmployeeReport(formData: FormData) {
  const user = await getActiveUser([Role.FIELD_OFFICER, Role.SUPER_ADMIN]);
  if (!user) {
    throw new Error("Unauthorized");
  }

  const dateValue = formData.get("date");
  const workDoneValue = formData.get("workDone");
  const dateRaw = typeof dateValue === "string" ? dateValue : "";
  const workDone = typeof workDoneValue === "string" ? workDoneValue.trim() : "";
  const date = new Date(dateRaw);
  if (!dateRaw || Number.isNaN(date.getTime()) || !workDone) {
    throw new Error("Enter a valid report date and work summary.");
  }
  if (workDone.length > 10000) throw new Error("Work summary is too long.");

  const readCount = (fieldName: string) => {
    const raw = formData.get(fieldName);
    if (raw == null || raw === "") return 0;
    const value = typeof raw === "string" ? Number(raw) : Number.NaN;
    if (!Number.isInteger(value) || value < 0 || value > 100000) {
      throw new Error(`Enter a valid ${fieldName} count.`);
    }
    return value;
  };
  const readOptionalText = (fieldName: string, limit = 5000) => {
    const raw = formData.get(fieldName);
    if (raw == null) return null;
    if (typeof raw !== "string") throw new Error(`Invalid ${fieldName} value.`);
    const value = raw.trim();
    if (value.length > limit) throw new Error(`${fieldName} is too long.`);
    return value || null;
  };

  await prisma.employeeReport.create({
    data: {
      date,
      employeeId: user.id,
      workDone,
      familiesVisited: readCount("familiesVisited"),
      pigsDistributed: readCount("pigsDistributed"),
      pigsReturned: readCount("pigsReturned"),
      problemsFound: readOptionalText("problemsFound"),
      otherActivities: readOptionalText("otherActivities"),
      comment: readOptionalText("comment"),
    },
  });

  revalidatePath("/dashboard/field/reports");
  redirect("/dashboard/field/reports");
}
