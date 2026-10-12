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
      tone: "bg-[#eef3da] text-[#536334]",
    },
    {
      title: "Pigs Returned",
      value: pigsReturned,
      icon: RefreshCw,
      tone: "bg-[#eef3da] text-[#536334]",
    },
    {
      title: "Pigs in Stock",
      value: pigsInStock,
      icon: Package,
      tone: "bg-[#e3efe7] text-[#173d2e]",
    },
    {
      title: "Total Money Balance",
      value: totalMoneyBalance,
      icon: Wallet,
      tone: "bg-[#eef3da] text-[#536334]",
    },
    {
      title: "Pigs with Health Problems",
      value: pigsWithHealthProblems,
      icon: HeartPulse,
      tone: "bg-[#f7e3ea] text-[#a44d67]",
    },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5d6d64]">Pig Project Rwanda</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#1b2d24]">Admin Dashboard</h2>
        <p className="mt-2 text-sm text-[#5d6d64]">One Piglet. One Family. A Fund That Keeps Moving.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {summaryCards.map(({ title, value, icon: Icon, tone }, idx) => (
          <div 
            key={idx} 
            className="rounded-[16px] border border-[#dfe7df] bg-white p-5 shadow-[0_4px_12px_rgba(16,28,23,0.03)] hover:shadow-[0_8px_24px_rgba(16,28,23,0.06)] transition-shadow"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#5d6d64]">{title}</p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-[#1b2d24] font-serif">{value}</p>
              </div>
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
