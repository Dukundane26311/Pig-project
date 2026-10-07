"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { existsSync } from "node:fs";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { join } from "node:path";

const toBoolean = (value: FormDataEntryValue | null | undefined) =>
  value === "on" || value === "true" || value === "1";

const toOptionalString = (value: FormDataEntryValue | null | undefined) => {
  const result = value == null ? "" : String(value).trim();
  return result.length > 0 ? result : null;
};

async function saveMemberPhoto(file: File | null, existingPhotoUrl?: string | null) {
  if (!file || file.size === 0) {
    return existingPhotoUrl ?? null;
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Photo must be an image file.");
  }

  const uploadDir = join(process.cwd(), "public", "uploads", "team");
  await mkdir(uploadDir, { recursive: true });

  const extension = file.name.includes(".") ? file.name.split(".").pop() || "png" : "png";
  const fileName = `${randomUUID()}.${extension}`;
  const filePath = join(uploadDir, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  if (existingPhotoUrl && existingPhotoUrl.startsWith("/uploads/team/")) {
    const oldPath = join(process.cwd(), "public", existingPhotoUrl);
    if (existsSync(oldPath)) {
      await unlink(oldPath);
    }
  }

  return `/uploads/team/${fileName}`;
}

function ensureAdmin() {
  return getServerSession(authOptions).then((session) => {
    if (!session || session.user.role !== "SUPER_ADMIN") {
      throw new Error("Unauthorized");
    }
    return session;
  });
}

export async function createTeamMember(formData: FormData) {
  const session = await ensureAdmin();

  const fullName = toOptionalString(formData.get("fullName"));
  const role = toOptionalString(formData.get("role"));
  const bio = toOptionalString(formData.get("bio"));
  const specialization = toOptionalString(formData.get("specialization"));
  const email = toOptionalString(formData.get("email"));
  const phone = toOptionalString(formData.get("phone"));
  const linkedinUrl = toOptionalString(formData.get("linkedinUrl"));
  const displayOrder = Number(formData.get("displayOrder") ?? 0);
  const photo = formData.get("photo") as File | null;

  if (!fullName || !role) {
    throw new Error("Full name and role are required.");
  }

  const photoUrl = await saveMemberPhoto(photo);

  const member = await prisma.teamMember.create({
    data: {
      fullName,
      role,
      bio,
      specialization,
      email,
      phone,
      linkedinUrl,
      photoUrl,
      displayOrder: Number.isFinite(displayOrder) ? displayOrder : 0,
      isPublished: toBoolean(formData.get("isPublished")),
      isFeatured: toBoolean(formData.get("isFeatured")),
      showEmailPublic: toBoolean(formData.get("showEmailPublic")),
      showPhonePublic: toBoolean(formData.get("showPhonePublic")),
      showLinkedinPublic: toBoolean(formData.get("showLinkedinPublic")),
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "CREATED",
      entity: "TEAM_MEMBER",
      entityId: member.id,
      user: { connect: { id: session.user.id } },
      newValue: { fullName: member.fullName, role: member.role },
    },
  });

  revalidatePath("/");
  revalidatePath("/team");
  revalidatePath("/dashboard/team");
  redirect("/dashboard/team");
}

export async function updateTeamMember(id: string, formData: FormData) {
  const session = await ensureAdmin();

  const existing = await prisma.teamMember.findUnique({ where: { id } });
  if (!existing) {
    throw new Error("Team member not found.");
  }

  const fullName = toOptionalString(formData.get("fullName"));
  const role = toOptionalString(formData.get("role"));
  const bio = toOptionalString(formData.get("bio"));
  const specialization = toOptionalString(formData.get("specialization"));
  const email = toOptionalString(formData.get("email"));
  const phone = toOptionalString(formData.get("phone"));
  const linkedinUrl = toOptionalString(formData.get("linkedinUrl"));
  const displayOrder = Number(formData.get("displayOrder") ?? existing.displayOrder);
  const photo = formData.get("photo") as File | null;

  if (!fullName || !role) {
    throw new Error("Full name and role are required.");
  }

  const photoUrl = await saveMemberPhoto(photo, existing.photoUrl);

  const member = await prisma.teamMember.update({
    where: { id },
    data: {
      fullName,
      role,
      bio,
      specialization,
      email,
      phone,
      linkedinUrl,
      photoUrl,
      displayOrder: Number.isFinite(displayOrder) ? displayOrder : existing.displayOrder,
      isPublished: toBoolean(formData.get("isPublished")),
      isFeatured: toBoolean(formData.get("isFeatured")),
      showEmailPublic: toBoolean(formData.get("showEmailPublic")),
      showPhonePublic: toBoolean(formData.get("showPhonePublic")),
      showLinkedinPublic: toBoolean(formData.get("showLinkedinPublic")),
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "UPDATED",
      entity: "TEAM_MEMBER",
      entityId: member.id,
      user: { connect: { id: session.user.id } },
      newValue: { fullName: member.fullName, role: member.role },
    },
  });

  revalidatePath("/");
  revalidatePath("/team");
  revalidatePath("/dashboard/team");
  redirect("/dashboard/team");
}

export async function deleteTeamMember(id: string) {
  const session = await ensureAdmin();

  const member = await prisma.teamMember.findUnique({ where: { id } });
  if (!member) {
    throw new Error("Team member not found.");
  }

  if (member.photoUrl && member.photoUrl.startsWith("/uploads/team/")) {
    const photoPath = join(process.cwd(), "public", member.photoUrl);
    if (existsSync(photoPath)) {
      await unlink(photoPath);
    }
  }

  await prisma.teamMember.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      action: "DELETED",
      entity: "TEAM_MEMBER",
      entityId: id,
      user: { connect: { id: session.user.id } },
      newValue: { fullName: member.fullName, deleted: true },
    },
  });

  revalidatePath("/");
  revalidatePath("/team");
  revalidatePath("/dashboard/team");
  redirect("/dashboard/team");
}

export async function toggleTeamMemberPublished(id: string) {
  const session = await ensureAdmin();

  const member = await prisma.teamMember.findUnique({ where: { id } });
  if (!member) {
    throw new Error("Team member not found.");
  }

  const updated = await prisma.teamMember.update({
    where: { id },
    data: { isPublished: !member.isPublished },
  });

  await prisma.auditLog.create({
    data: {
      action: updated.isPublished ? "PUBLISHED" : "UNPUBLISHED",
      entity: "TEAM_MEMBER",
      entityId: member.id,
      user: { connect: { id: session.user.id } },
      newValue: { fullName: member.fullName, isPublished: updated.isPublished },
    },
  });

  revalidatePath("/");
  revalidatePath("/team");
  revalidatePath("/dashboard/team");
}

export async function toggleTeamMemberFeatured(id: string) {
  const session = await ensureAdmin();

  const member = await prisma.teamMember.findUnique({ where: { id } });
  if (!member) {
    throw new Error("Team member not found.");
  }

  const updated = await prisma.teamMember.update({
    where: { id },
    data: { isFeatured: !member.isFeatured },
  });

  await prisma.auditLog.create({
    data: {
      action: updated.isFeatured ? "FEATURED" : "UNFEATURED",
      entity: "TEAM_MEMBER",
      entityId: member.id,
      user: { connect: { id: session.user.id } },
      newValue: { fullName: member.fullName, isFeatured: updated.isFeatured },
    },
  });

  revalidatePath("/");
  revalidatePath("/team");
  revalidatePath("/dashboard/team");
}
