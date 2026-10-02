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
  const district = formData.get("district") as string;
  const sector = formData.get("sector") as string;
  const cell = formData.get("cell") as string;
  const village = formData.get("village") as string;
  const phone = formData.get("phone") as string;
  const savingsGroup = formData.get("savingsGroup") as string;
  
  // Generate a random unique ID for the beneficiary
  const count = await prisma.beneficiary.count();
  const beneficiaryId = `BEN-${String(count + 1).padStart(6, '0')}`;

  await prisma.beneficiary.create({
    data: {
      beneficiaryId,
      fullName,
      district,
      sector,
      cell,
      village,
      phone,
      savingsGroup,
      dateJoined: new Date(),
    },
  });

  revalidatePath("/dashboard/beneficiaries");
  revalidatePath("/");
  redirect("/dashboard/beneficiaries");
}
