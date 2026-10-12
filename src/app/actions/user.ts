"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { Prisma, Role } from "@prisma/client";
import { getActiveUser } from "@/lib/active-user";

const assignableRoles = [
  "SUPER_ADMIN",
  "FIELD_OFFICER",
  "VETERINARIAN",
  "FINANCE_OFFICER",
] as const;

type AssignableRole = (typeof assignableRoles)[number];

function isAssignableRole(value: string): value is AssignableRole {
  return assignableRoles.some((role) => role === value);
}

export async function createUser(formData: FormData) {
  const actor = await getActiveUser([Role.SUPER_ADMIN]);
  if (!actor) throw new Error("Unauthorized");

  const nameValue = formData.get("name");
  const emailValue = formData.get("email");
  const phoneValue = formData.get("phone");
  const passwordValue = formData.get("password");
  const roleValue = formData.get("role");
  const name = typeof nameValue === "string" ? nameValue.trim() : "";
  const email = typeof emailValue === "string" ? emailValue.trim().toLowerCase() : "";
  const phone = typeof phoneValue === "string" ? phoneValue.trim() : "";
  const password = typeof passwordValue === "string" ? passwordValue : "";
  const requestedRole = typeof roleValue === "string" ? roleValue : "";

  if (!name || !email || !password.trim() || !requestedRole) {
    redirect("/dashboard/admin/users/new?error=Missing+required+fields");
  }
  if (!isAssignableRole(requestedRole)) {
    redirect("/dashboard/admin/users/new?error=Select+a+valid+user+role");
  }
  const role = requestedRole;

  const normalizedPhone = phone || null;

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        ...(normalizedPhone ? [{ phone: normalizedPhone }] : []),
      ],
    },
  });

  if (existingUser) {
    if (existingUser.email === email) {
      redirect("/dashboard/admin/users/new?error=User+with+this+email+already+exists");
    }

    if (normalizedPhone && existingUser.phone === normalizedPhone) {
      redirect("/dashboard/admin/users/new?error=A+user+with+this+phone+number+already+exists");
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          phone: normalizedPhone,
          password: hashedPassword,
          role,
          isActive: true,
        },
      });

      await tx.auditLog.create({
        data: {
          action: "CREATED",
          entity: "USER",
          entityId: newUser.id,
          userId: actor.id,
          role: actor.role,
          newValue: { name, email, role },
        },
      });
    });

    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard/admin/users");
    redirect("/dashboard/admin/users");
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const target = Array.isArray(error.meta?.target) ? error.meta.target.join(", ") : "";

      if (target.includes("phone")) {
        redirect("/dashboard/admin/users/new?error=A+user+with+this+phone+number+already+exists");
      }

      if (target.includes("email")) {
        redirect("/dashboard/admin/users/new?error=User+with+this+email+already+exists");
      }
    }

    throw error;
  }
}

export async function updatePersonalProfile(formData: FormData) {
  const { getServerSession } = await import("next-auth");
  const { authOptions } = await import("@/lib/auth");
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  if (!name) {
    redirect("/dashboard/settings?profileError=Full+Name+is+required");
  }

  try {
    const prevUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, phone: true, role: true },
    });

    if (phone) {
      const existingWithPhone = await prisma.user.findFirst({
        where: {
          phone,
          NOT: { id: session.user.id },
        },
      });
      if (existingWithPhone) {
        redirect("/dashboard/settings?profileError=Phone+number+is+already+registered+to+another+user");
      }
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        phone: phone || null,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        role: prevUser?.role || null,
        action: "UPDATED",
        entity: "USER_PROFILE",
        entityId: session.user.id,
        previousValue: { name: prevUser?.name, phone: prevUser?.phone },
        newValue: { name, phone: phone || null },
      },
    });
  } catch (err: any) {
    if (err?.message?.includes("NEXT_REDIRECT")) throw err;
    redirect(`/dashboard/settings?profileError=${encodeURIComponent(err?.message || "Failed to update profile")}`);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/history");
  redirect("/dashboard/settings?profileSuccess=1");
}

export async function changeUserPassword(formData: FormData) {
  const { getServerSession } = await import("next-auth");
  const { authOptions } = await import("@/lib/auth");
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const currentPassword = String(formData.get("currentPassword") || "");
  const newPassword = String(formData.get("newPassword") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (!currentPassword || !newPassword) {
    redirect("/dashboard/settings?passwordError=Missing+required+fields");
  }
  if (newPassword.length < 6) {
    redirect("/dashboard/settings?passwordError=Password+must+be+at+least+6+characters");
  }
  if (newPassword !== confirmPassword) {
    redirect("/dashboard/settings?passwordError=Passwords+do+not+match");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user) throw new Error("User not found");

  const matches = await bcrypt.compare(currentPassword, user.password);
  if (!matches) {
    redirect("/dashboard/settings?passwordError=Current+password+is+incorrect");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      role: user.role,
      action: "PASSWORD_CHANGED",
      entity: "USER_SECURITY",
      entityId: user.id,
      newValue: { changedAt: new Date().toISOString() },
    },
  });

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/history");
  redirect("/dashboard/settings?passwordSuccess=1");
}

export async function deleteUser(userId: string) {
  const actor = await getActiveUser([Role.SUPER_ADMIN]);
  if (!actor) {
    return { success: false, error: "Unauthorized" };
  }

  if (actor.id === userId) {
    return { success: false, error: "You cannot delete your own account" };
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!targetUser) {
    return { success: false, error: "User not found" };
  }

  try {
    try {
      await prisma.user.delete({ where: { id: userId } });
    } catch {
      await prisma.user.update({
        where: { id: userId },
        data: {
          deletedAt: new Date(),
          isActive: false,
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        action: "DELETED",
        entity: "USER",
        entityId: userId,
        userId: actor.id,
        role: actor.role,
        newValue: { name: targetUser.name, email: targetUser.email, role: targetUser.role },
      },
    });

    revalidatePath("/dashboard/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete user:", error);
    return { success: false, error: "Failed to delete user" };
  }
}
