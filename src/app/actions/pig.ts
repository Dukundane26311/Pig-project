"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function createPig(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }

  const beneficiaryId = formData.get("beneficiaryId") as string;
  const breed = formData.get("breed") as string;
  const sex = formData.get("sex") as string;
  const color = formData.get("color") as string;
  const source = formData.get("source") as string;
  const purchasePrice = parseFloat(formData.get("purchasePrice") as string) || 0;
  
  // Generate a random unique ID for the pig
  const count = await prisma.pig.count();
  const pigId = `PIG-${String(count + 1).padStart(6, '0')}`;

  await prisma.pig.create({
    data: {
      pigId,
      beneficiaryId: beneficiaryId || null,
      breed,
      sex,
      color,
      source,
      purchasePrice,
      dateReceived: new Date(),
      status: 'REGISTERED',
    },
  });

  revalidatePath("/dashboard/pigs");
  revalidatePath("/");
  redirect("/dashboard/pigs");
}
