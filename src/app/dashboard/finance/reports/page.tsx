import { FinanceStatus, FinanceType, Prisma } from "@prisma/client";
import { getFinanceUser } from "@/lib/finance-access";
import { formatRwf } from "@/lib/format-rwf";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  from?: string | string[];
  to?: string | string[];
  type?: string | string[];
  status?: string | string[];
  category?: string | string[];
}>;

function firstValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value.trim() : "";
}

function parseDate(value: string, endOfDay = false) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    return null;
  }
  if (endOfDay) date.setUTCDate(date.getUTCDate() + 1);
  return date;
}

export default async function FinanceReportsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  if (!(await getFinanceUser())) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const from = firstValue(params.from);
  const to = firstValue(params.to);
  const rawType = firstValue(params.type);
  const rawStatus = firstValue(params.status);
  const category = firstValue(params.category);
  const startDate = from ? parseDate(from) : null;
  const endDate = to ? parseDate(to, true) : null;
  const selectedType = Object.values(FinanceType).includes(rawType as FinanceType)
    ? (rawType as FinanceType)
    : null;
  const selectedStatus = Object.values(FinanceStatus).includes(rawStatus as FinanceStatus)
    ? (rawStatus as FinanceStatus)
    : null;
  const invalidDate = (!!from && !startDate) || (!!to && !endDate);
  const invalidType = !!rawType && rawType !== "ALL" && !selectedType;
  const invalidStatus = !!rawStatus && rawStatus !== "ALL" && !selectedStatus;

  const where: Prisma.FinanceTransactionWhereInput = {
    deletedAt: null,
    ...(startDate || endDate
      ? {
          transactionDate: {
            ...(startDate ? { gte: startDate } : {}),
            ...(endDate ? { lt: endDate } : {}),
          },
        }
      : {}),
    ...(selectedType ? { type: selectedType } : {}),
    ...(selectedStatus ? { status: selectedStatus } : {}),
    ...(category ? { reference: category } : {}),
  };

  const [transactions, totalMatching, income, expenses, categories] = await Promise.all([
    prisma.financeTransaction.findMany({
      where,
      orderBy: [{ transactionDate: "desc" }, { createdAt: "desc" }],
      take: 500,
      select: {
        id: true,
        transactionId: true,
        type: true,
        amount: true,
        reference: true,
        description: true,
        transactionDate: true,
        status: true,
        recordedBy: { select: { name: true } },
      },
    }),
    prisma.financeTransaction.count({ where }),
    prisma.financeTransaction.aggregate({
      _sum: { amount: true },
      where: { ...where, type: FinanceType.INCOME, status: FinanceStatus.APPROVED },
    }),
    prisma.financeTransaction.aggregate({
      _sum: { amount: true },
      where: { ...where, type: FinanceType.EXPENSE, status: FinanceStatus.APPROVED },
    }),
    prisma.financeTransaction.findMany({
      where: { deletedAt: null, reference: { not: null } },
      distinct: ["reference"],
      orderBy: { reference: "asc" },
      select: { reference: true },
    }),
  ]);

  const totalIncome = income._sum.amount ?? new Prisma.Decimal(0);
  const totalExpenses = expenses._sum.amount ?? new Prisma.Decimal(0);
  const balance = totalIncome.minus(totalExpenses);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5d6d64]">Finance Team</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1b2d24]">Financial Reports</h1>
        <p className="mt-2 text-sm text-[#5d6d64]">
          Summaries include approved transactions only. The transaction history also shows submitted and rejected records.
        </p>
        <div>
          <a
            href="/api/finance/export"
            download
            className="inline-flex items-center gap-2 rounded-xl bg-[#173d2e] px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-[#102a22] transition"
          >
            Export to CSV
          </a>
        </div>
      </header>

      {(invalidDate || invalidType || invalidStatus) && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          One or more filters are invalid. Correct the date, transaction type, or status and apply again.
        </p>
      )}

      <form method="get" className="grid gap-4 rounded-xl border border-[#d9e1d8] bg-white p-4 sm:grid-cols-2 lg:grid-cols-6">
        <label className="text-sm font-medium text-[#1c2b23]">
          From
          <input type="date" name="from" defaultValue={from} className="mt-1 w-full rounded-md border border-[#d9e1d8] p-2" />
        </label>
        <label className="text-sm font-medium text-[#1c2b23]">
          To
          <input type="date" name="to" defaultValue={to} className="mt-1 w-full rounded-md border border-[#d9e1d8] p-2" />
        </label>
        <label className="text-sm font-medium text-[#1c2b23]">
          Type
          <select name="type" defaultValue={selectedType ?? "ALL"} className="mt-1 w-full rounded-md border border-[#d9e1d8] bg-white p-2">
            <option value="ALL">All types</option>
            {Object.values(FinanceType).map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium text-[#1c2b23]">
          Status
          <select name="status" defaultValue={selectedStatus ?? "ALL"} className="mt-1 w-full rounded-md border border-[#d9e1d8] bg-white p-2">
            <option value="ALL">All statuses</option>
            {Object.values(FinanceStatus).map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium text-[#1c2b23]">
          Category
          <select name="category" defaultValue={category} className="mt-1 w-full rounded-md border border-[#d9e1d8] bg-white p-2">
            <option value="">All categories</option>
            {categories.flatMap(({ reference }) => reference ? [reference] : []).map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </label>
        <div className="flex items-end gap-2">
          <button type="submit" className="rounded-md bg-[#2c5a43] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1c2b23]">
            Apply filters
          </button>
          <a href="/dashboard/finance/reports" className="rounded-md border border-[#d9e1d8] px-4 py-2 text-sm font-semibold text-[#5d6e64] hover:bg-[#f5f7f4]">
            Clear
          </a>
        </div>
      </form>

      <section aria-label="Posted financial totals" className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Approved income", value: totalIncome },
          { label: "Approved expenses", value: totalExpenses },
          { label: "Posted balance", value: balance },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-[#d9e1d8] bg-white p-5">
            <p className="text-sm font-medium text-[#5d6e64]">{label}</p>
            <p className="mt-2 break-words text-2xl font-bold text-[#1c2b23]">{formatRwf(value)}</p>
          </div>
        ))}
      </section>

      <section className="overflow-hidden rounded-xl border border-[#d9e1d8] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#d9e1d8] px-4 py-4 sm:px-6">
          <h2 className="text-lg font-semibold text-[#1c2b23]">Transaction history</h2>
          <p className="text-sm text-[#5d6e64]">
            Showing {transactions.length} of {totalMatching} matching transactions
            {totalMatching > transactions.length ? " (latest 500)" : ""}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[850px] divide-y divide-[#d9e1d8] text-left text-sm">
            <thead className="bg-[#f5f7f4] text-xs uppercase tracking-wide text-[#5d6e64]">
              <tr>
                <th className="px-4 py-3">Transaction</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Type / Category</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Recorded by</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf2ee]">
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-[#1c2b23]">{transaction.transactionId}</span>
                    {transaction.description && <p className="mt-1 max-w-sm truncate text-xs text-[#5d6e64]">{transaction.description}</p>}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-[#384b42]">{transaction.transactionDate.toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className="font-medium">{transaction.type}</span>
                    <p className="text-xs text-[#5d6e64]">{transaction.reference || "Uncategorised"}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-semibold text-[#1c2b23]">{formatRwf(transaction.amount)}</td>
                  <td className="px-4 py-3">{transaction.status}</td>
                  <td className="px-4 py-3 text-[#5d6e64]">{transaction.recordedBy.name}</td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-[#5d6e64]">No transactions match these filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
