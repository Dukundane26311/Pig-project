import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TrendingUp, TrendingDown, Wallet, FileText, PlusCircle } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export const dynamic = 'force-dynamic';

export default async function FinanceDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== 'FINANCE_OFFICER' && session.user.role !== 'SUPER_ADMIN')) {
    redirect("/dashboard");
  }

  const [incomeAggr, expenseAggr, allIncome, allExpenses] = await Promise.all([
    prisma.financeTransaction.aggregate({ _sum: { amount: true }, where: { type: "INCOME" } }),
    prisma.financeTransaction.aggregate({ _sum: { amount: true }, where: { type: "EXPENSE" } }),
    prisma.financeTransaction.findMany({ 
      where: { type: "INCOME" }, 
      orderBy: { transactionDate: 'desc' }, 
      take: 10,
      include: { recordedBy: true }
    }),
    prisma.financeTransaction.findMany({ 
      where: { type: "EXPENSE" }, 
      orderBy: { transactionDate: 'desc' }, 
      take: 10,
      include: { recordedBy: true }
    }),
  ]);

  const totalIncome = Number(incomeAggr._sum.amount || 0);
  const totalExpenses = Number(expenseAggr._sum.amount || 0);
  const balance = totalIncome - totalExpenses;

  const quickActions = [
    { label: "Record Income", href: "/dashboard/finance/new?type=INCOME", icon: PlusCircle },
    { label: "Record Expense", href: "/dashboard/finance/new?type=EXPENSE", icon: PlusCircle },
    { label: "Finance Reports", href: "/dashboard/admin/reports", icon: FileText },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5d6d64]">Finance Team</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1b2d24]">Welcome back, {session?.user?.name}</h1>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-[24px] border border-[#dfe7df] bg-white p-5 shadow-[0_10px_24px_rgba(16,28,23,0.03)]">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e3efe7] text-[#173d2e]">
            <TrendingUp className="h-5 w-5" />
          </div>
          <p className="kpi-label text-[#5d6d64] text-sm font-medium">Total Income</p>
          <p className="mt-3 text-4xl font-bold text-[#1b2d24]">{totalIncome.toLocaleString()} RWF</p>
        </div>

        <div className="rounded-[24px] border border-[#dfe7df] bg-white p-5 shadow-[0_10px_24px_rgba(16,28,23,0.03)]">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f7e3ea] text-[#a44d67]">
            <TrendingDown className="h-5 w-5" />
          </div>
          <p className="kpi-label text-[#5d6d64] text-sm font-medium">Total Expenses</p>
          <p className="mt-3 text-4xl font-bold text-[#1b2d24]">{totalExpenses.toLocaleString()} RWF</p>
        </div>

        <div className="rounded-[24px] border border-[#dfe7df] bg-white p-5 shadow-[0_10px_24px_rgba(16,28,23,0.03)]">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef3da] text-[#536334]">
            <Wallet className="h-5 w-5" />
          </div>
          <p className="kpi-label text-[#5d6d64] text-sm font-medium">Current Balance</p>
          <p className="mt-3 text-4xl font-bold text-[#1b2d24]">{balance.toLocaleString()} RWF</p>
        </div>
      </div>

      <div className="rounded-[28px] border border-[#dfe7df] bg-white p-6 shadow-[0_10px_24px_rgba(16,28,23,0.03)]">
        <h2 className="text-xl font-semibold text-[#1b2d24]">Quick actions</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {quickActions.map(({ label, href, icon: Icon }) => (
            <Link key={label} href={href} className="rounded-[20px] border border-[#dfe7df] bg-[#f8faf8] p-4 hover:border-[#173d2e] hover:bg-[#f2f7f3] transition-colors">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#e3efe7] text-[#173d2e]">
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-sm font-semibold text-[#1b2d24]">{label}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* INCOME TABLE */}
        <div className="bg-white shadow rounded-2xl border border-[#d9e1d8] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#d9e1d8] bg-[#f2f5f0] flex justify-between items-center">
            <h2 className="text-lg font-bold text-[#1b2d24] flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-[#2c5a43]" /> Recent Income
            </h2>
            <Link href="/dashboard/finance/new?type=INCOME" className="text-sm text-[#2c5a43] hover:underline font-medium">Add Income</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#d9e1d8]">
              <thead className="bg-[#f8faf8]">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-[#5d6e64] uppercase">Date</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-[#5d6e64] uppercase">Source</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-[#5d6e64] uppercase">Amount</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-[#5d6e64] uppercase">Recorded By</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#d9e1d8]">
                {allIncome.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#f8faf8] transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-[#1b2d24]">{format(new Date(tx.transactionDate), 'MMM d, yyyy')}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-[#1b2d24] font-medium">{tx.reference || 'General'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-[#2c5a43]">+{Number(tx.amount).toLocaleString()} RWF</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-[#5d6e64]">{tx.recordedBy.name}</td>
                  </tr>
                ))}
                {allIncome.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-sm text-[#5d6e64]">No recent income records.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* EXPENSE TABLE */}
        <div className="bg-white shadow rounded-2xl border border-[#d9e1d8] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#d9e1d8] bg-[#f7e3ea] flex justify-between items-center">
            <h2 className="text-lg font-bold text-[#1b2d24] flex items-center">
              <TrendingDown className="h-5 w-5 mr-2 text-[#a44d67]" /> Recent Expenses
            </h2>
            <Link href="/dashboard/finance/new?type=EXPENSE" className="text-sm text-[#a44d67] hover:underline font-medium">Add Expense</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#d9e1d8]">
              <thead className="bg-[#fcf8fa]">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-[#5d6e64] uppercase">Date</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-[#5d6e64] uppercase">Category</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-[#5d6e64] uppercase">Amount</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-[#5d6e64] uppercase">Recorded By</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#d9e1d8]">
                {allExpenses.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#fcf8fa] transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-[#1b2d24]">{format(new Date(tx.transactionDate), 'MMM d, yyyy')}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-[#1b2d24] font-medium">{tx.reference || 'General'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-[#a44d67]">{Number(tx.amount).toLocaleString()} RWF</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-[#5d6e64]">{tx.recordedBy.name}</td>
                  </tr>
                ))}
                {allExpenses.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-sm text-[#5d6e64]">No recent expense records.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
