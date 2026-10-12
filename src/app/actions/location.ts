"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import { getActiveUser } from "@/lib/active-user";

type LocationOption = { id: string; name: string; code: string | null };

function toOptions<T extends { id: string; name: string; code: string | null }>(
  rows: T[]
): LocationOption[] {
  return rows.map(({ id, name, code }) => ({ id, name, code }));
}

async function requireSession() {
  const user = await getActiveUser([Role.SUPER_ADMIN, Role.FIELD_OFFICER]);
  if (!user) throw new Error("Unauthorized");
  return user;
}

async function requireAdmin() {
  const user = await getActiveUser([Role.SUPER_ADMIN]);
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function getDistricts(): Promise<LocationOption[]> {
  try {
    const fromDb = await prisma.district.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, code: true },
    });
    if (fromDb.length > 0) {
      return toOptions(fromDb);
    }
  } catch (err) {
    console.error("Error loading districts from database, falling back to rwanda-geo:", err);
  }

  try {
    const rg = await import("rwanda-geo");
    const districts = rg.getAllDistricts();
    return districts
      .map((d) => ({ id: d.code, name: d.name, code: d.code }))
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch (err) {
    console.error("Failed to load districts from rwanda-geo:", err);
    return [];
  }
}

export async function getSectors(districtIdOrName: string): Promise<LocationOption[]> {
  if (!districtIdOrName) return [];
  const normalized = districtIdOrName.trim();
  try {
    const fromDb = await prisma.sector.findMany({
      where: {
        OR: [
          { districtId: normalized },
          { district: { code: normalized } },
          { district: { name: { equals: normalized, mode: "insensitive" } } },
        ],
      },
      orderBy: { name: "asc" },
      select: { id: true, name: true, code: true },
    });
    if (fromDb.length > 0) {
      return toOptions(fromDb);
    }
  } catch (err) {
    console.error("Error loading sectors from database, falling back to rwanda-geo:", err);
  }

  try {
    const rg = await import("rwanda-geo");
    const allDistricts = rg.getAllDistricts();
    const dMatch = allDistricts.find(
      (d) =>
        d.code.toLowerCase() === normalized.toLowerCase() ||
        d.name.toLowerCase() === normalized.toLowerCase()
    );
    const code = dMatch ? dMatch.code : normalized;
    const sectors = rg.getSectorsByDistrict(code);
    return sectors
      .map((s) => ({ id: s.code, name: s.name, code: s.code }))
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch (err) {
    console.error("Failed to load sectors from rwanda-geo:", err);
    return [];
  }
}

export async function getCells(sectorIdOrName: string): Promise<LocationOption[]> {
  if (!sectorIdOrName) return [];
  const normalized = sectorIdOrName.trim();
  try {
    const fromDb = await prisma.cell.findMany({
      where: {
        OR: [
          { sectorId: normalized },
          { sector: { code: normalized } },
          { sector: { name: { equals: normalized, mode: "insensitive" } } },
        ],
      },
      orderBy: { name: "asc" },
      select: { id: true, name: true, code: true },
    });
    if (fromDb.length > 0) {
      return toOptions(fromDb);
    }
  } catch (err) {
    console.error("Error loading cells from database, falling back to rwanda-geo:", err);
  }

  try {
    const rg = await import("rwanda-geo");
    const allSectors = rg.getAllSectors();
    const sMatch = allSectors.find(
      (s) =>
        s.code.toLowerCase() === normalized.toLowerCase() ||
        s.name.toLowerCase() === normalized.toLowerCase()
    );
    const code = sMatch ? sMatch.code : normalized;
    const cells = rg.getCellsBySector(code);
    return cells
      .map((c) => ({ id: c.code, name: c.name, code: c.code }))
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch (err) {
    console.error("Failed to load cells from rwanda-geo:", err);
    return [];
  }
}

export async function getVillages(cellIdOrName: string): Promise<LocationOption[]> {
  if (!cellIdOrName) return [];
  const normalized = cellIdOrName.trim();
  try {
    const fromDb = await prisma.village.findMany({
      where: {
        OR: [
          { cellId: normalized },
          { cell: { code: normalized } },
          { cell: { name: { equals: normalized, mode: "insensitive" } } },
        ],
      },
      orderBy: { name: "asc" },
      select: { id: true, name: true, code: true },
    });
    if (fromDb.length > 0) {
      return toOptions(fromDb);
    }
  } catch (err) {
    console.error("Error loading villages from database, falling back to rwanda-geo:", err);
  }

  try {
    const rg = await import("rwanda-geo");
    const allCells = rg.getAllCells();
    const cMatch = allCells.find(
      (c) =>
        c.code.toLowerCase() === normalized.toLowerCase() ||
        c.name.toLowerCase() === normalized.toLowerCase()
    );
    const code = cMatch ? cMatch.code : normalized;
    const villages = rg.getVillagesByCell(code);
    return villages
      .map((v) => ({ id: v.code, name: v.name, code: v.code }))
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch (err) {
    console.error("Failed to load villages from rwanda-geo:", err);
    return [];
  }
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
