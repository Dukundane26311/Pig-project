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

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxHeroImageSize = 10 * 1024 * 1024;

const ensureAdmin = async () => {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
};

const deleteStoredImage = async (imageUrl?: string | null) => {
  if (!imageUrl || !imageUrl.startsWith("/uploads/website/hero/")) {
    return;
  }

  const filePath = join(process.cwd(), "public", imageUrl);
  if (existsSync(filePath)) {
    await unlink(filePath);
  }
};

const saveHeroImage = async (file: File | null, existingImageUrl?: string | null) => {
  if (!file || file.size === 0) {
    return existingImageUrl ?? null;
  }

  if (!allowedTypes.has(file.type)) {
    throw new Error("Hero image must be JPG, PNG, or WebP.");
  }

  if (file.size > maxHeroImageSize) {
    throw new Error("Hero image must be 10 MB or smaller.");
  }

  const uploadDir = join(process.cwd(), "public", "uploads", "website", "hero");
  await mkdir(uploadDir, { recursive: true });

  const extension = file.name.includes(".") ? file.name.split(".").pop()?.toLowerCase() || "jpg" : "jpg";
  const fileName = `${randomUUID()}.${extension}`;
  const filePath = join(uploadDir, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  if (existingImageUrl && existingImageUrl.startsWith("/uploads/website/hero/")) {
    const previousPath = join(process.cwd(), "public", existingImageUrl);
    if (existsSync(previousPath)) {
      await unlink(previousPath);
    }
  }

  return `/uploads/website/hero/${fileName}`;
};

export async function saveHeroSection(formData: FormData) {
  const session = await ensureAdmin();

  const title = String(formData.get("title") ?? "").trim() || "One Piglet. One Family. A Fund That Keeps Moving.";
  const description = String(formData.get("description") ?? "").trim() || "The revolving livestock model helps families build stable income through pig production, communal accountability, and a cycle of return that grows opportunity across Rwanda.";
  const primaryButtonText = String(formData.get("primaryButtonText") ?? "").trim() || "Learn How It Works";
  const primaryButtonLink = String(formData.get("primaryButtonLink") ?? "").trim() || "#how-it-works";
  const secondaryButtonText = String(formData.get("secondaryButtonText") ?? "").trim() || "See Our Impact";
  const secondaryButtonLink = String(formData.get("secondaryButtonLink") ?? "").trim() || "#impact";
  const imageAlt = String(formData.get("imageAlt") ?? "").trim() || "Pig production and community support in Rwanda";
  const removeImage = formData.get("removeImage") === "true";
  const file = formData.get("heroImage") as File | null;

  const currentContent = await prisma.websiteContent.findFirst({
    where: { page: "home", section: "hero" },
  });

  let imageUrl = currentContent?.imageUrl ?? null;

  if (removeImage) {
    await deleteStoredImage(currentContent?.imageUrl ?? null);
    imageUrl = null;
  } else if (file && file.size > 0) {
    imageUrl = await saveHeroImage(file, currentContent?.imageUrl ?? null);
  }

  await prisma.websiteContent.upsert({
    where: { page_section: { page: "home", section: "hero" } },
    update: {
      title,
      description,
      primaryButtonText,
      primaryButtonLink,
      secondaryButtonText,
      secondaryButtonLink,
      imageUrl,
      imageAlt,
    },
    create: {
      page: "home",
      section: "hero",
      title,
      description,
      primaryButtonText,
      primaryButtonLink,
      secondaryButtonText,
      secondaryButtonLink,
      imageUrl,
      imageAlt,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "UPDATED",
      entity: "WEBSITE_CONTENT",
      entityId: currentContent?.id ?? "home:hero",
      user: { connect: { id: session.user.id } },
      newValue: {
        page: "home",
        section: "hero",
        title,
        description,
        imageUrl,
        imageAlt,
      },
    },
  });

  revalidatePath("/");
  revalidatePath("/dashboard/admin/website");
  redirect("/dashboard/admin/website?success=1");
}
