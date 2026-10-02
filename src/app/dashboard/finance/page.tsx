import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, CreditCard, DollarSign, ArrowUpRight, ArrowDownRight, CheckCircle } from "lucide-react";
import { approveTransaction } from "@/app/actions/finance";

export const dynamic = 'force-dynamic';

export default async function FinancePage() {
  const transactions = await prisma.financeTransaction.findMany({
    include: { createdBy: true, approvedBy: true },
    orderBy: { date: 'desc' },
  });

  const totals = transactions.reduce((acc, curr) => {
    if (curr.status === 'APPROVED') {
      if (curr.type === 'INCOME') acc.income += Number(curr.amount);
      if (curr.type === 'EXPENSE') acc.expense += Number(curr.amount);
    }
    return acc;
  }, { income: 0, expense: 0 });

  const balance = totals.income - totals.expense;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-serif text-[#1c2b23]">Financial Management</h2>
          <p className="mt-1 text-sm text-[#5d6e64]">Track income, expenses, and fund balance.</p>
        </div>
        <Link 
          href="/dashboard/finance/new"
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#2c5a43] hover:bg-[#1c2b23] transition-colors"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          New Transaction
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-[#d9e1d8] p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-[#e4ede6] rounded-md p-3">
              <DollarSign className="h-6 w-6 text-[#2c5a43]" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-[#5d6e64] truncate">Total Fund Balance</dt>
                <dd className="text-2xl font-semibold font-serif text-[#1c2b23]">{balance.toLocaleString()} RWF</dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-[#d9e1d8] p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-50 rounded-md p-3">
              <ArrowUpRight className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-[#5d6e64] truncate">Total Income</dt>
                <dd className="text-xl font-semibold font-serif text-green-600">{totals.income.toLocaleString()} RWF</dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-[#d9e1d8] p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-red-50 rounded-md p-3">
              <ArrowDownRight className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-[#5d6e64] truncate">Total Expenses</dt>
                <dd className="text-xl font-semibold font-serif text-red-600">{totals.expense.toLocaleString()} RWF</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-[#d9e1d8] overflow-hidden">
        {transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#d9e1d8]">
              <thead className="bg-[#f2f5f0]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#5d6e64] uppercase tracking-wider">Date & ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#5d6e64] uppercase tracking-wider">Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#5d6e64] uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#5d6e64] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[#5d6e64] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#d9e1d8]">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-[#1c2b23]">{t.transactionId}</div>
                      <div className="text-sm text-[#5d6e64]">{new Date(t.date).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[#1c2b23]">{t.category}</div>
                      <div className="text-xs text-[#5d6e64] truncate max-w-xs">{t.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-bold ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                        {t.type === 'INCOME' ? '+' : '-'}{Number(t.amount).toLocaleString()} RWF
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        t.status === 'APPROVED' ? 'bg-[#e4ede6] text-[#2c5a43]' :
                        t.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {t.status === 'SUBMITTED' && (
                        <form action={approveTransaction}>
                          <input type="hidden" name="transactionId" value={t.id} />
                          <button type="submit" className="text-sm text-[#2c5a43] hover:underline font-medium inline-flex items-center">
                            <CheckCircle className="h-4 w-4 mr-1" /> Approve
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <CreditCard className="mx-auto h-12 w-12 text-[#9db0a4] mb-4" />
            <h3 className="text-lg font-medium text-[#1c2b23] mb-1">No transactions found</h3>
            <p className="text-[#5d6e64] mb-4">Record your first income or expense.</p>
          </div>
        )}
      </div>
    </div>
  );
}
