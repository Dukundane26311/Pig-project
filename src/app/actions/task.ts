"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Role, TaskPriority, TaskStatus } from "@prisma/client";
import { getActiveUser } from "@/lib/active-user";

export async function createTask(formData: FormData) {
  const user = await getActiveUser([Role.SUPER_ADMIN]);
  if (!user) throw new Error("Unauthorized");

  const titleValue = formData.get("title");
  const descriptionValue = formData.get("description");
  const priorityValue = formData.get("priority");
  const assignedUserValue = formData.get("assignedUserId");
  const dueDateValue = formData.get("dueDate");
  const title = typeof titleValue === "string" ? titleValue.trim() : "";
  const description = typeof descriptionValue === "string" ? descriptionValue.trim() : "";
  const assignedUserId = typeof assignedUserValue === "string" ? assignedUserValue : "";
  if (!title || title.length > 200) throw new Error("Enter a task title of 1-200 characters.");
  if (description.length > 5000) throw new Error("Task description is too long.");
  if (!assignedUserId) throw new Error("Select an assignee.");

  const priority = Object.values(TaskPriority).find((value) => value === priorityValue);
  if (!priority) throw new Error("Select a valid task priority.");

  const dueDateRaw = typeof dueDateValue === "string" ? dueDateValue : "";
  const parsedDate = dueDateRaw ? new Date(dueDateRaw) : null;
  if (parsedDate && (Number.isNaN(parsedDate.getTime()) || parsedDate.getFullYear() < 1900 || parsedDate.getFullYear() > 2099)) {
    throw new Error("Enter a valid task due date.");
  }

  const assignee = await prisma.user.findFirst({
    where: { id: assignedUserId, isActive: true, deletedAt: null },
    select: { id: true },
  });
  if (!assignee) throw new Error("The selected assignee is not active.");

  await prisma.task.create({
    data: {
      title,
      description: description || null,
      priority,
      assignedUserId,
      status: TaskStatus.TODO,
      dueDate: parsedDate,
    }
  });

  revalidatePath("/dashboard/admin/tasks");
  redirect("/dashboard/admin/tasks");
}

export async function completeTask(formData: FormData) {
  const user = await getActiveUser([
    Role.SUPER_ADMIN,
    Role.FIELD_OFFICER,
    Role.VETERINARIAN,
    Role.FINANCE_OFFICER,
  ]);
  if (!user) throw new Error("Unauthorized");

  const taskIdValue = formData.get("taskId");
  const taskId = typeof taskIdValue === "string" ? taskIdValue : "";
  if (!taskId) throw new Error("Task is required.");

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { assignedUserId: true, status: true },
  });
  if (!task) throw new Error("Task not found.");
  if (user.role !== Role.SUPER_ADMIN && task.assignedUserId !== user.id) {
    throw new Error("You can only complete tasks assigned to you.");
  }
  if (task.status === TaskStatus.COMPLETED) {
    throw new Error("This task is already completed.");
  }

  const updated = await prisma.task.updateMany({
    where: { id: taskId, status: { in: [TaskStatus.TODO, TaskStatus.IN_PROGRESS] } },
    data: {
      status: TaskStatus.COMPLETED,
      completedAt: new Date(),
    }
  });
  if (updated.count !== 1) throw new Error("The task could not be completed.");

  revalidatePath("/dashboard/admin/tasks");
}
