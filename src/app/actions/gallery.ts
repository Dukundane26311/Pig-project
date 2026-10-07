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

const fileIsAllowed = (file: File | null) => {
  if (!file || file.size === 0) return true;
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  return allowedTypes.includes(file.type) && file.size <= 5 * 1024 * 1024;
};

const saveGalleryImage = async (file: File | null, existingImageUrl?: string | null) => {
  if (!file || file.size === 0) {
    return existingImageUrl ?? null;
  }

  if (!fileIsAllowed(file)) {
    throw new Error("Only JPG, PNG, and WebP images up to 5 MB are allowed.");
  }

  const uploadDir = join(process.cwd(), "public", "uploads", "gallery");
  await mkdir(uploadDir, { recursive: true });

  const extension = file.name.includes(".") ? file.name.split(".").pop() || "jpg" : "jpg";
  const fileName = `${randomUUID()}.${extension}`;
  const filePath = join(uploadDir, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  if (existingImageUrl && existingImageUrl.startsWith("/uploads/gallery/")) {
    const oldPath = join(process.cwd(), "public", existingImageUrl);
    if (existsSync(oldPath)) {
      await unlink(oldPath);
    }
  }

  return `/uploads/gallery/${fileName}`;
};

const ensureAdmin = async () => {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
};

export async function createGalleryItem(formData: FormData) {
  const session = await ensureAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const photographer = String(formData.get("photographer") ?? "").trim();
  const displayOrder = Number(formData.get("displayOrder") ?? 0);
  const photoDateValue = String(formData.get("photoDate") ?? "");
  const photo = formData.get("image") as File | null;

  if (!title) throw new Error("Title is required.");
  if (!photo || photo.size === 0) throw new Error("A gallery image is required.");

  const imageUrl = await saveGalleryImage(photo);
  if (!imageUrl) {
    throw new Error("The gallery image could not be saved.");
  }

  const item = await prisma.galleryItem.create({
    data: {
      title,
      description: description || null,
      imageUrl,
      category: category || "Other",
      location: location || null,
      photographer: photographer || null,
      photoDate: photoDateValue ? new Date(photoDateValue) : null,
      displayOrder: Number.isFinite(displayOrder) ? displayOrder : 0,
      isPublished: formData.get("isPublished") === "on" || formData.get("isPublished") === "true",
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "CREATED",
      entity: "GALLERY_ITEM",
      entityId: item.id,
      user: { connect: { id: session.user.id } },
      newValue: { title: item.title, imageUrl: item.imageUrl, category: item.category },
    },
  });

  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath("/dashboard/gallery");
  redirect("/dashboard/gallery");
}

export async function updateGalleryItem(id: string, formData: FormData) {
  const session = await ensureAdmin();
  const existing = await prisma.galleryItem.findUnique({ where: { id } });
  if (!existing) throw new Error("Gallery item not found.");

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const photographer = String(formData.get("photographer") ?? "").trim();
  const displayOrder = Number(formData.get("displayOrder") ?? existing.displayOrder);
  const photoDateValue = String(formData.get("photoDate") ?? "");
  const photo = formData.get("image") as File | null;

  if (!title) throw new Error("Title is required.");

  const imageUrl = await saveGalleryImage(photo, existing.imageUrl) ?? existing.imageUrl;
  if (!imageUrl) {
    throw new Error("The gallery image could not be saved.");
  }

  const updated = await prisma.galleryItem.update({
    where: { id },
    data: {
      title,
      description: description || null,
      imageUrl,
      category: category || "Other",
      location: location || null,
      photographer: photographer || null,
      photoDate: photoDateValue ? new Date(photoDateValue) : null,
      displayOrder: Number.isFinite(displayOrder) ? displayOrder : existing.displayOrder,
      isPublished: formData.get("isPublished") === "on" || formData.get("isPublished") === "true",
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "UPDATED",
      entity: "GALLERY_ITEM",
      entityId: updated.id,
      user: { connect: { id: session.user.id } },
      newValue: { title: updated.title, imageUrl: updated.imageUrl, category: updated.category },
    },
  });

  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath("/dashboard/gallery");
  redirect("/dashboard/gallery");
}

export async function deleteGalleryItem(id: string) {
  const session = await ensureAdmin();
  const item = await prisma.galleryItem.findUnique({ where: { id } });
  if (!item) throw new Error("Gallery item not found.");

  if (item.imageUrl && item.imageUrl.startsWith("/uploads/gallery/")) {
    const filePath = join(process.cwd(), "public", item.imageUrl);
    if (existsSync(filePath)) {
      await unlink(filePath);
    }
  }

  await prisma.galleryItem.delete({ where: { id } });
  await prisma.auditLog.create({
    data: {
      action: "DELETED",
      entity: "GALLERY_ITEM",
      entityId: id,
      user: { connect: { id: session.user.id } },
      newValue: { title: item.title, deleted: true },
    },
  });

  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath("/dashboard/gallery");
  redirect("/dashboard/gallery");
}

export async function toggleGalleryItemPublished(id: string) {
  const session = await ensureAdmin();
  const item = await prisma.galleryItem.findUnique({ where: { id } });
  if (!item) throw new Error("Gallery item not found.");

  const updated = await prisma.galleryItem.update({
    where: { id },
    data: { isPublished: !item.isPublished },
  });

  await prisma.auditLog.create({
    data: {
      action: updated.isPublished ? "PUBLISHED" : "UNPUBLISHED",
      entity: "GALLERY_ITEM",
      entityId: item.id,
      user: { connect: { id: session.user.id } },
      newValue: { title: item.title, isPublished: updated.isPublished },
    },
  });

  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath("/dashboard/gallery");
}
