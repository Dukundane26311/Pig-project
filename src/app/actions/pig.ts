"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function generatePigId() {
  const year = new Date().getFullYear();
  const lastPig = await prisma.pig.findFirst({
    where: { tagNumber: { startsWith: `PIG-${year}-` } },
    orderBy: { tagNumber: 'desc' }
  });

  if (!lastPig) return `PIG-${year}-000001`;

  const lastSequence = parseInt(lastPig.tagNumber.split('-')[2]);
  const newSequence = String(lastSequence + 1).padStart(6, '0');
  
  return `PIG-${year}-${newSequence}`;
}

export async function createPig(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  if (!['SUPER_ADMIN', 'FIELD_OFFICER'].includes(session.user.role)) {
    throw new Error("Forbidden");
  }

  const beneficiaryId = formData.get("beneficiaryId") as string;
  const breed = formData.get("breed") as string;
  const sexValue = formData.get("sex") as string | null;
  const sex = sexValue && sexValue !== "" ? (sexValue === "MALE" ? "MALE" : "FEMALE") : null;
  const color = formData.get("color") as string;

  const tagNumber = await generatePigId();

  await prisma.pig.create({
    data: {
      tagNumber,
      currentBeneficiaryId: beneficiaryId || null,
      breed: breed || null,
      sex,
      notes: color || null,
      dateReceived: new Date(),
      status: 'REGISTERED',
    },
  });

  revalidatePath("/dashboard/admin/pigs");
  revalidatePath("/dashboard/field/pigs");
  revalidatePath("/");
  
  if (session.user.role === 'SUPER_ADMIN') redirect("/dashboard/admin/pigs");
  redirect("/dashboard/field/pigs");
}
