"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type LocationOption = { id: string; name: string; code: string | null };

function toOptions<T extends { id: string; name: string; code: string | null }>(
  rows: T[]
): LocationOption[] {
  return rows.map(({ id, name, code }) => ({ id, name, code }));
}

async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  return session;
}

async function requireAdmin() {
  const session = await requireSession();
  if (session.user.role !== "SUPER_ADMIN") throw new Error("Unauthorized");
  return session;
}

export async function getDistricts() {
  await requireSession();
  return toOptions(await prisma.district.findMany({ orderBy: { name: "asc" } }));
}

export async function getSectors(districtId: string) {
  await requireSession();
  if (!districtId) return [];
  return toOptions(
    await prisma.sector.findMany({
      where: { districtId },
      orderBy: { name: "asc" },
    })
  );
}

export async function getCells(sectorId: string) {
  await requireSession();
  if (!sectorId) return [];
  return toOptions(
    await prisma.cell.findMany({
      where: { sectorId },
      orderBy: { name: "asc" },
    })
  );
}

export async function getVillages(cellId: string) {
  await requireSession();
  if (!cellId) return [];
  return toOptions(
    await prisma.village.findMany({
      where: { cellId },
      orderBy: { name: "asc" },
    })
  );
}

export async function createDistrict(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") || "").trim();
  const code = String(formData.get("code") || "").trim() || null;
  if (!name) throw new Error("District name is required");

  await prisma.district.create({ data: { name, code } });
  revalidatePath("/dashboard/admin/locations");
}

export async function createSector(formData: FormData) {
  await requireAdmin();
  const districtId = String(formData.get("districtId") || "");
  const name = String(formData.get("name") || "").trim();
  const code = String(formData.get("code") || "").trim() || null;
  if (!districtId || !name) throw new Error("Sector name is required");

  await prisma.sector.create({ data: { name, code, districtId } });
  revalidatePath("/dashboard/admin/locations");
  revalidatePath(`/dashboard/admin/locations/districts/${districtId}`);
}

export async function createCell(formData: FormData) {
  await requireAdmin();
  const sectorId = String(formData.get("sectorId") || "");
  const name = String(formData.get("name") || "").trim();
  const code = String(formData.get("code") || "").trim() || null;
  if (!sectorId || !name) throw new Error("Cell name is required");

  await prisma.cell.create({ data: { name, code, sectorId } });
  revalidatePath("/dashboard/admin/locations");
  revalidatePath(`/dashboard/admin/locations/sectors/${sectorId}`);
}

export async function createVillage(formData: FormData) {
  await requireAdmin();
  const cellId = String(formData.get("cellId") || "");
  const name = String(formData.get("name") || "").trim();
  const code = String(formData.get("code") || "").trim() || null;
  if (!cellId || !name) throw new Error("Village name is required");

  await prisma.village.create({ data: { name, code, cellId } });
  revalidatePath("/dashboard/admin/locations");
  revalidatePath(`/dashboard/admin/locations/cells/${cellId}`);
}
