"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { getActiveUser } from "@/lib/active-user";

export async function createBeneficiary(formData: FormData) {
  const user = await getActiveUser([Role.SUPER_ADMIN, Role.FIELD_OFFICER]);
  if (!user) {
    throw new Error("Unauthorized");
  }

  const fullName = String(formData.get("fullName") || "").trim();
  const nationalId = String(formData.get("nationalId") || "").trim() || null;
  const gender = String(formData.get("gender") || "").trim() || null;
  const householdSizeStr = formData.get("householdSize");
  const householdSize = householdSizeStr ? parseInt(String(householdSizeStr), 10) : null;
  const notes = String(formData.get("notes") || "").trim() || null;
  const districtId = String(formData.get("districtId") || "") || null;
  const sectorId = String(formData.get("sectorId") || "") || null;
  const cellId = String(formData.get("cellId") || "") || null;
  const villageId = String(formData.get("villageId") || "") || null;
  const phone = String(formData.get("phone") || "").trim() || null;
  const savingsGroup = String(formData.get("savingsGroup") || "").trim() || null;

  if (!fullName) {
    throw new Error("Full name is required");
  }

  const [district, sector, cell, village] = await Promise.all([
    districtId
      ? prisma.district.findFirst({
          where: {
            OR: [
              { id: districtId },
              { code: districtId },
              { name: { equals: districtId, mode: "insensitive" } },
            ],
          },
        })
      : null,
    sectorId
      ? prisma.sector.findFirst({
          where: {
            OR: [
              { id: sectorId },
              { code: sectorId },
              { name: { equals: sectorId, mode: "insensitive" } },
            ],
          },
        })
      : null,
    cellId
      ? prisma.cell.findFirst({
          where: {
            OR: [
              { id: cellId },
              { code: cellId },
              { name: { equals: cellId, mode: "insensitive" } },
            ],
          },
        })
      : null,
    villageId
      ? prisma.village.findFirst({
          where: {
            OR: [
              { id: villageId },
              { code: villageId },
              { name: { equals: villageId, mode: "insensitive" } },
            ],
          },
        })
      : null,
  ]);

  const districtStr = district?.name || (formData.get("district") as string) || null;
  const sectorStr = sector?.name || (formData.get("sector") as string) || null;
  const cellStr = cell?.name || (formData.get("cell") as string) || null;
  const villageStr = village?.name || (formData.get("village") as string) || null;
  
  // Generate unique ID for the beneficiary
  const count = await prisma.beneficiary.count();
  const beneficiaryNumber = `BEN-${String(count + 1).padStart(6, "0")}`;

  const beneficiary = await prisma.beneficiary.create({
    data: {
      beneficiaryNumber,
      fullName,
      nationalId,
      gender,
      householdSize: householdSize && !Number.isNaN(householdSize) ? householdSize : null,
      notes,
      districtStr,
      sectorStr,
      cellStr,
      villageStr,
      districtId: district ? district.id : null,
      sectorId: sector ? sector.id : null,
      cellId: cell ? cell.id : null,
      villageId: village ? village.id : null,
      phone,
      savingsGroup,
      registrationDate: new Date(),
      createdById: user.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      role: user.role,
      action: "CREATED",
      entity: "BENEFICIARY",
      entityId: beneficiary.id,
      newValue: {
        beneficiaryNumber: beneficiary.beneficiaryNumber,
        fullName: beneficiary.fullName,
      },
    },
  });

  revalidatePath("/dashboard/admin/beneficiaries");
  revalidatePath("/dashboard/field/beneficiaries");
  revalidatePath("/");
  redirect(
    user.role === Role.FIELD_OFFICER
      ? "/dashboard/field/beneficiaries"
      : "/dashboard/admin/beneficiaries"
  );
}
