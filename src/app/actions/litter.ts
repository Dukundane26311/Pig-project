"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { getActiveUser } from "@/lib/active-user";

export async function createLitter(formData: FormData) {
  const user = await getActiveUser([Role.SUPER_ADMIN, Role.FIELD_OFFICER, Role.VETERINARIAN]);
  if (!user) throw new Error("Unauthorized");

  const pigIdValue = formData.get("pigId");
  const dateOfBirthValue = formData.get("dateOfBirth");
  const pigId = typeof pigIdValue === "string" ? pigIdValue : "";
  const dateOfBirthRaw = typeof dateOfBirthValue === "string" ? dateOfBirthValue : "";
  const numberBorn = Number(formData.get("numberBorn"));
  const numberSurvived = Number(formData.get("numberSurvived"));
  if (!pigId || !dateOfBirthRaw) throw new Error("Pig and birth date are required.");
  const dateOfBirth = new Date(dateOfBirthRaw);
  if (Number.isNaN(dateOfBirth.getTime())) throw new Error("Enter a valid birth date.");
  if (
    !Number.isInteger(numberBorn) ||
    !Number.isInteger(numberSurvived) ||
    numberBorn < 1 ||
    numberBorn > 50 ||
    numberSurvived < 0 ||
    numberSurvived > numberBorn
  ) {
    throw new Error("Enter valid born and surviving piglet counts.");
  }
  const numberLost = numberBorn - numberSurvived;

  await prisma.$transaction(async (tx) => {
    const pig = await tx.pig.findFirst({
      where: { id: pigId, deletedAt: null },
      select: { id: true },
    });
    if (!pig) throw new Error("Pig not found.");

    const litter = await tx.litter.create({
      data: {
        motherPigId: pig.id,
        actualBirthDate: dateOfBirth,
        numberBorn,
        numberAlive: numberSurvived,
        numberDead: numberLost,
        recordedById: user.id,
      },
    });

    const pigletCount = await tx.piglet.count();
    const pigletsData = Array.from({ length: numberSurvived }, (_, index) => ({
      tagNumber: `PGL-${String(pigletCount + index + 1).padStart(6, "0")}`,
      litterId: litter.id,
      birthDate: dateOfBirth,
      status: "WITH_MOTHER" as const,
    }));

    if (pigletsData.length > 0) {
      await tx.piglet.createMany({ data: pigletsData });
    }

    await tx.pig.update({
      where: { id: pigId },
      data: { status: "PIGLETS_RECORDED" },
    });
  });

  revalidatePath(`/dashboard/admin/pigs/${pigId}`);
  revalidatePath(`/dashboard/field/pigs/${pigId}`);
  redirect(user.role === Role.SUPER_ADMIN
    ? `/dashboard/admin/pigs/${pigId}`
    : `/dashboard/field/pigs/${pigId}`);
}
