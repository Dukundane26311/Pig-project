"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function createTask(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const priority = formData.get("priority") as any;
  const assignedUserId = formData.get("assignedUserId") as string;
  const dueDateRaw = formData.get("dueDate") as string;

  let parsedDate = null;
  if (dueDateRaw) {
    const d = new Date(dueDateRaw);
    if (!isNaN(d.getTime()) && d.getFullYear() > 1900 && d.getFullYear() < 2100) {
      parsedDate = d;
    }
  }

  await prisma.task.create({
    data: {
      title,
      description,
      priority,
      assignedUserId,
      status: "TODO",
      dueDate: parsedDate,
    }
  });

  revalidatePath("/dashboard/tasks");
  redirect("/dashboard/tasks");
}

export async function completeTask(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const taskId = formData.get("taskId") as string;

  await prisma.task.update({
    where: { id: taskId },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
    }
  });

  revalidatePath("/dashboard/tasks");
}
