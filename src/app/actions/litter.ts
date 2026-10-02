"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function createLitter(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const pigId = formData.get("pigId") as string;
  const dateOfBirth = formData.get("dateOfBirth") as string;
  const numberOfPigletsBorn = parseInt(formData.get("numberOfPigletsBorn") as string, 10);
  const numberSurvived = parseInt(formData.get("numberSurvived") as string, 10);
  const numberLost = numberOfPigletsBorn - numberSurvived;

  // Create the litter
  const litter = await prisma.litter.create({
    data: {
      pigId,
      dateOfBirth: new Date(dateOfBirth),
      numberOfPigletsBorn,
      numberSurvived,
      numberLost,
    }
  });

  // Automatically generate Piglet records for the survivors
  const pigletCount = await prisma.piglet.count();
  
  const pigletsData = Array.from({ length: numberSurvived }).map((_, index) => {
    return {
      pigletId: `PGL-${String(pigletCount + index + 1).padStart(6, '0')}`,
      litterId: litter.id,
      birthDate: new Date(dateOfBirth),
      status: 'WITH_MOTHER' as const,
    };
  });

  if (pigletsData.length > 0) {
    await prisma.piglet.createMany({
      data: pigletsData
    });
  }

  // Update mother pig status
  await prisma.pig.update({
    where: { id: pigId },
    data: { status: 'PIGLETS_RECORDED' }
  });

  revalidatePath(`/dashboard/pigs/${pigId}`);
  redirect(`/dashboard/pigs/${pigId}`);
}
