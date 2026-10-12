export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import { PigHealthStatus, PigStatus, Prisma, Role } from "@prisma/client";
import { formatRwf } from "@/lib/format-rwf";
import { getActiveUser } from "@/lib/active-user";
import { redirect } from "next/navigation";
import { 
  ArrowDownRight, 
  RefreshCw, 
  Package, 
  Wallet, 
  HeartPulse 
} from "lucide-react";

export default async function AdminDashboardOverview() {
  if (!(await getActiveUser([Role.SUPER_ADMIN]))) {
    redirect("/dashboard");
  }

  const [
    distributionCount,
    distributedPigsStatus,
    returnedQuantityAggr,
    returnedPigletsCount,
    returnedStatusPigs,
    pigsInStock,
    incomeAggr,
    expenseAggr,
    pigsWithHealthProblems,
  ] = await Promise.all([
    // 1. Pigs Distributed: total number of pigs given to beneficiaries
    prisma.pigDistribution.count(),
    prisma.pig.count({ where: { status: PigStatus.DISTRIBUTED, deletedAt: null } }),

    // 2. Pigs Returned: total number of pigs returned by beneficiaries
    prisma.pigReturn.aggregate({ _sum: { quantity: true } }),
    prisma.piglet.count({ where: { returnedFromId: { not: null } } }),
    prisma.pig.count({ where: { status: PigStatus.RETURNED, deletedAt: null } }),

    // 3. Pigs in Stock: number of pigs currently available in the inventory
    prisma.pig.count({
      where: {
        deletedAt: null,
        currentBeneficiaryId: null,
        status: {
          notIn: [PigStatus.DISTRIBUTED, PigStatus.DECEASED, PigStatus.SOLD, PigStatus.INACTIVE],
        },
      },
    }),

    // 4. Total Money Balance: current financial balance (total income minus total expenses) in RWF
    prisma.financeTransaction.aggregate({
      _sum: { amount: true },
      where: { type: "INCOME", status: "APPROVED", deletedAt: null },
    }),
    prisma.financeTransaction.aggregate({
      _sum: { amount: true },
      where: { type: "EXPENSE", status: "APPROVED", deletedAt: null },
    }),

    // 5. Pigs with Health Problems: total number of pigs requiring veterinary attention
    prisma.pig.count({
      where: {
        healthStatus: {
          in: [PigHealthStatus.SICK, PigHealthStatus.CRITICAL, PigHealthStatus.UNDER_TREATMENT],
        },
        deletedAt: null,
      },
    }),
  ]);

  const pigsDistributed = Math.max(distributionCount, distributedPigsStatus);

  const pigsReturned = Math.max(
    (returnedQuantityAggr._sum.quantity ?? 0) + returnedPigletsCount,
    returnedStatusPigs,
  );

  const totalIncome = incomeAggr._sum.amount ?? new Prisma.Decimal(0);
  const totalExpenses = expenseAggr._sum.amount ?? new Prisma.Decimal(0);
  const totalMoneyBalance = formatRwf(totalIncome.minus(totalExpenses));

  const summaryCards = [
    {
      title: "Pigs Distributed",
      value: pigsDistributed,
      icon: ArrowDownRight,
      tone: "bg-emerald-50 text-emerald-700",
    },
    {
      title: "Pigs Returned",
      value: pigsReturned,
      icon: RefreshCw,
      tone: "bg-blue-50 text-blue-700",
    },
    {
      title: "Pigs in Stock",
      value: pigsInStock,
      icon: Package,
      tone: "bg-amber-50 text-amber-700",
    },
    {
      title: "Total Money Balance",
      value: totalMoneyBalance,
      icon: Wallet,
      tone: "bg-emerald-50 text-emerald-700",
    },
    {
      title: "Pigs with Health Problems",
      value: pigsWithHealthProblems,
      icon: HeartPulse,
      tone: "bg-rose-50 text-rose-700",
    },
  ];

  return (
    <div className="space-y-6 pb-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Operations Control</p>
        <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Admin Dashboard</h2>
        <p className="mt-1 text-xs text-slate-500">Live operational overview across livestock, distributions, returns, and fund balance.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {summaryCards.map(({ title, value, icon: Icon, tone }, idx) => (
          <div 
            key={idx} 
            className="rounded-xl border border-slate-200/80 bg-white p-4.5 shadow-xs hover:border-slate-300 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-slate-500">{title}</p>
                <p className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
              </div>
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tone}`}>
                <Icon className="h-4.5 w-4.5" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
