"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";

export async function createUser(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }

  const name = (formData.get("name") as string | null)?.trim() ?? "";
  const email = (formData.get("email") as string | null)?.trim().toLowerCase() ?? "";
  const phone = (formData.get("phone") as string | null)?.trim() ?? "";
  const password = (formData.get("password") as string | null)?.trim() ?? "";
  const role = formData.get("role") as "SUPER_ADMIN" | "FIELD_OFFICER" | "VETERINARIAN" | "FINANCE_OFFICER";

  if (!name || !email || !password || !role) {
    redirect("/dashboard/admin/users/new?error=Missing+required+fields");
  }

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
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        phone: normalizedPhone,
        password: hashedPassword,
        role,
        isActive: true,
      },
    });

    const actorUser = session.user.email
      ? await prisma.user.findUnique({ where: { email: session.user.email.toLowerCase() } })
      : null;

    if (actorUser) {
      await prisma.auditLog.create({
        data: {
          action: "CREATED",
          entity: "USER",
          entityId: newUser.id,
          user: { connect: { id: actorUser.id } },
          newValue: { name, email, role },
        },
      });
    }

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
