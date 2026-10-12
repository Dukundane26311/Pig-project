"use server";

import { FinanceStatus, FinanceType, Prisma } from "@prisma/client";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getFinanceUser } from "@/lib/finance-access";
import { prisma } from "@/lib/prisma";

const incomeCategories = new Set([
  "Donor funding",
  "Pig sales",
  "Contributions",
  "Government Grant",
  "Other income",
  "DONOR_FUNDING",
  "PIG_SALES",
  "CONTRIBUTIONS",
  "OTHER",
]);

const expenseCategories = new Set([
  "Pig Purchase",
  "Transportation",
  "Veterinary Treatment",
  "Medication",
  "Feed",
  "Training",
  "Administration",
  "Other",
  "Pig purchase",
  "Veterinary",
  "Transport",
  "Salaries",
  "Insurance",
  "Other expenses",
  "PIG_PURCHASE",
  "VETERINARY",
  "TRANSPORT",
  "FEED",
  "TRAINING",
  "ADMINISTRATION",
  "OTHER",
]);

function readText(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

function parseTransactionDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error("Enter a valid transaction date.");
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new Error("Enter a valid transaction date.");
  }

  return date;
}

function parseAmount(value: string) {
  if (!/^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(value)) {
    throw new Error("Enter a positive amount with no more than two decimal places.");
  }

  const amount = new Prisma.Decimal(value);
  if (amount.isZero() || amount.greaterThan("9999999999.99")) {
    throw new Error("Amount must be greater than zero and within the supported limit.");
  }

  return amount;
}

export async function createFinanceTransaction(formData: FormData) {
  const user = await getFinanceUser();
  if (!user) throw new Error("Unauthorized");
  const rawType = readText(formData, "type");
  const type = rawType === FinanceType.INCOME || rawType === FinanceType.EXPENSE
    ? rawType
    : null;
  const category = readText(formData, "category");
  const amount = parseAmount(readText(formData, "amount"));
  const transactionDate = parseTransactionDate(readText(formData, "date"));
  const description = readText(formData, "description");
  const paymentMethod = readText(formData, "paymentMethod");
  const pigId = readText(formData, "pigId") || null;

  if (!type) {
    throw new Error("Select a valid income or expense transaction type.");
  }
  if (!category || category.length > 100) {
    throw new Error("Select a valid transaction category.");
  }
  if (!(type === FinanceType.INCOME ? incomeCategories : expenseCategories).has(category)) {
    throw new Error("The selected category is not valid for this transaction type.");
  }
  if (description.length > 2000 || paymentMethod.length > 100) {
    throw new Error("Transaction details exceed the allowed length.");
  }

  const transactionId = `FIN-${new Date().getUTCFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`;

  await prisma.$transaction(async (tx) => {
    const transaction = await tx.financeTransaction.create({
      data: {
        transactionId,
        transactionDate,
        type,
        reference: category,
        amount,
        description: description || null,
        paymentMethod: paymentMethod || null,
        pigId: pigId || null,
        recordedById: user.id,
        status: FinanceStatus.APPROVED,
        approvedById: user.id,
        approvedAt: new Date(),
      },
      select: { id: true, transactionId: true, type: true, status: true },
    });

    await tx.auditLog.create({
      data: {
        userId: user.id,
        role: user.role,
        action: "POSTED",
        entity: "FINANCE_TRANSACTION",
        entityId: transaction.id,
        newValue: {
          transactionId: transaction.transactionId,
          type: transaction.type,
          status: transaction.status,
          amount: amount.toString(),
        },
      },
    });
  });

  revalidatePath("/dashboard/finance");
  revalidatePath("/dashboard/admin/finance");
  revalidatePath("/dashboard/admin");
  redirect("/dashboard/finance");
}

export async function approveTransaction(formData: FormData) {
  const user = await getFinanceUser();
  if (!user || user.role !== "SUPER_ADMIN") throw new Error("Unauthorized");
  const id = readText(formData, "transactionId");
  if (!id || id.length > 64) {
    throw new Error("A valid transaction is required.");
  }

  await prisma.$transaction(async (tx) => {
    const transaction = await tx.financeTransaction.findFirst({
      where: { id, status: FinanceStatus.SUBMITTED, deletedAt: null },
      select: { id: true, transactionId: true, type: true },
    });
    if (!transaction) {
      throw new Error("Transaction was not found or is no longer awaiting approval.");
    }

    const result = await tx.financeTransaction.updateMany({
      where: { id: transaction.id, status: FinanceStatus.SUBMITTED, deletedAt: null },
      data: {
        status: FinanceStatus.APPROVED,
        approvedById: user.id,
        approvedAt: new Date(),
      },
    });
    if (result.count !== 1) {
      throw new Error("Transaction changed before approval; refresh and try again.");
    }

    await tx.auditLog.create({
      data: {
        userId: user.id,
        role: user.role,
        action: "APPROVED",
        entity: "FINANCE_TRANSACTION",
        entityId: transaction.id,
        previousValue: { status: FinanceStatus.SUBMITTED },
        newValue: {
          transactionId: transaction.transactionId,
          type: transaction.type,
          status: FinanceStatus.APPROVED,
        },
      },
    });
  });

  revalidatePath("/dashboard/finance");
  revalidatePath("/dashboard/admin/finance");
  revalidatePath("/dashboard/admin");
}
