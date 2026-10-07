"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function createFinanceTransaction(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const type = formData.get("type") as "INCOME" | "EXPENSE";
  const category = formData.get("category") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const description = formData.get("description") as string;
  const paymentMethod = formData.get("paymentMethod") as string;
  const dateRaw = formData.get("date") as string;

  const count = await prisma.financeTransaction.count();
  const transactionId = `FIN-${String(count + 1).padStart(6, '0')}`;

  await prisma.financeTransaction.create({
    data: {
      transactionId,
      transactionDate: new Date(dateRaw),
      type,
      reference: category,
      amount,
      description,
      paymentMethod,
      recordedById: session.user.id,
      status: 'SUBMITTED',
    }
  });

  revalidatePath("/dashboard/finance");
  redirect("/dashboard/finance");
}

export async function approveTransaction(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'FINANCE_OFFICER')) {
    throw new Error("Unauthorized");
  }

  const transactionId = formData.get("transactionId") as string;

  await prisma.financeTransaction.update({
    where: { id: transactionId },
    data: {
      status: 'APPROVED',
      approvedById: session.user.id,
      approvedAt: new Date(),
    }
  });

  revalidatePath("/dashboard/finance");
}
