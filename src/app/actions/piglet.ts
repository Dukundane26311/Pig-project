"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function markPigletReturned(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const pigletId = formData.get("pigletId") as string;
  const beneficiaryId = formData.get("beneficiaryId") as string;

  await prisma.piglet.update({
    where: { id: pigletId },
    data: {
      status: 'AVAILABLE_FOR_REDISTRIBUTION',
      returnedDate: new Date(),
      returnedFromId: beneficiaryId || null,
    }
  });

  // Automatically update the beneficiary's repayment status
  if (beneficiaryId) {
    const returnedCount = await prisma.piglet.count({
      where: { returnedFromId: beneficiaryId }
    });

    if (returnedCount >= 3) {
      await prisma.beneficiary.update({
        where: { id: beneficiaryId },
        data: { status: 'REPAID_3_PIGLETS' }
      });
    } else if (returnedCount > 0) {
      await prisma.beneficiary.update({
        where: { id: beneficiaryId },
        data: { status: 'PARTIALLY_REPAID' }
      });
    }
  }

  revalidatePath("/dashboard/litters/[id]", "page");
  revalidatePath("/dashboard/pigs/[id]", "page");
  revalidatePath("/dashboard/beneficiaries/[id]", "page");
}
