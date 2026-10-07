"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function createBeneficiary(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }

  const fullName = formData.get("fullName") as string;
  const districtId = String(formData.get("districtId") || "") || null;
  const sectorId = String(formData.get("sectorId") || "") || null;
  const cellId = String(formData.get("cellId") || "") || null;
  const villageId = String(formData.get("villageId") || "") || null;
  const phone = formData.get("phone") as string;
  const savingsGroup = formData.get("savingsGroup") as string;

  const [district, sector, cell, village] = await Promise.all([
    districtId ? prisma.district.findUnique({ where: { id: districtId } }) : null,
    sectorId ? prisma.sector.findUnique({ where: { id: sectorId } }) : null,
    cellId ? prisma.cell.findUnique({ where: { id: cellId } }) : null,
    villageId ? prisma.village.findUnique({ where: { id: villageId } }) : null,
  ]);

  const districtStr = district?.name || (formData.get("district") as string) || null;
  const sectorStr = sector?.name || (formData.get("sector") as string) || null;
  const cellStr = cell?.name || (formData.get("cell") as string) || null;
  const villageStr = village?.name || (formData.get("village") as string) || null;
  
  // Generate a random unique ID for the beneficiary
  const count = await prisma.beneficiary.count();
  const beneficiaryNumber = `BEN-${String(count + 1).padStart(6, '0')}`;

  await prisma.beneficiary.create({
    data: {
      beneficiaryNumber,
      fullName,
      districtStr,
      sectorStr,
      cellStr,
      villageStr,
      districtId,
      sectorId,
      cellId,
      villageId,
      phone,
      savingsGroup,
      registrationDate: new Date(),
      createdById: session.user.id,
    },
  });

  revalidatePath("/dashboard/admin/beneficiaries");
  revalidatePath("/dashboard/field/beneficiaries");
  revalidatePath("/");
  redirect(
    session.user.role === "FIELD_OFFICER"
      ? "/dashboard/field/beneficiaries"
      : "/dashboard/admin/beneficiaries"
  );
}
