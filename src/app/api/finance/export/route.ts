import { NextResponse } from "next/server";
import { getFinanceUser } from "@/lib/finance-access";
import { prisma } from "@/lib/prisma";
import { Prisma, FinanceType } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const user = await getFinanceUser();
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const category = searchParams.get("category");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where: Prisma.FinanceTransactionWhereInput = { deletedAt: null };
  if (type && type !== "ALL" && Object.values(FinanceType).includes(type as FinanceType)) {
    where.type = type as FinanceType;
  }
  if (category) where.reference = category;
  if (from || to) {
    where.transactionDate = {};
    if (from) where.transactionDate.gte = new Date(from);
    if (to) where.transactionDate.lte = new Date(to);
  }

  const transactions = await prisma.financeTransaction.findMany({
    where,
    orderBy: { transactionDate: "desc" },
    include: { recordedBy: { select: { name: true } } },
  });

  const header = "Transaction ID,Date,Type,Category,Amount (RWF),Status,Recorded By,Description\n";
  const rows = transactions.map((t) => {
    const id = `"${t.transactionId}"`;
    const date = `"${t.transactionDate.toISOString().slice(0, 10)}"`;
    const tType = `"${t.type}"`;
    const cat = `"${t.reference || "N/A"}"`;
    const amount = t.amount.toString();
    const status = `"${t.status}"`;
    const recordedBy = `"${t.recordedBy?.name || "System"}"`;
    const description = `"${(t.description || "").replace(/"/g, '""')}"`;
    return [id, date, tType, cat, amount, status, recordedBy, description].join(",");
  });

  const csv = header + rows.join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="financial-transactions-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
