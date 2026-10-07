import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, TrendingDown, TrendingUp } from "lucide-react";
import { createFinanceTransaction } from "@/app/actions/finance";

export const dynamic = 'force-dynamic';

export default async function NewFinanceTransactionPage({
  searchParams,
}: {
  searchParams: { type?: string };
}) {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user.role !== 'FINANCE_OFFICER' && session.user.role !== 'SUPER_ADMIN')) {
    redirect("/dashboard");
  }

  const isIncome = searchParams.type === 'INCOME';
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/finance" className="text-[#5d6e64] hover:text-[#1c2b23]">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-serif text-[#1c2b23] flex items-center">
            {isIncome ? (
              <><TrendingUp className="h-6 w-6 mr-2 text-[#2c5a43]" /> Record New Income</>
            ) : (
              <><TrendingDown className="h-6 w-6 mr-2 text-[#a44d67]" /> Record New Expense</>
            )}
          </h1>
          <p className="mt-1 text-sm text-[#5d6e64]">Enter details for the financial transaction.</p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg border border-[#d9e1d8] p-6">
        <form action={createFinanceTransaction} className="space-y-6">
          <input type="hidden" name="type" value={isIncome ? "INCOME" : "EXPENSE"} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#1c2b23] mb-1">Date *</label>
              <input 
                type="date" 
                name="date" 
                defaultValue={today}
                required
                className="w-full rounded-md border-[#d9e1d8] shadow-sm focus:border-[#2c5a43] focus:ring-[#2c5a43] sm:text-sm p-2 border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1c2b23] mb-1">Amount (RWF) *</label>
              <input 
                type="number" 
                name="amount"
                min="0"
                step="0.01"
                required
                placeholder="10000"
                className="w-full rounded-md border-[#d9e1d8] shadow-sm focus:border-[#2c5a43] focus:ring-[#2c5a43] sm:text-sm p-2 border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1c2b23] mb-1">
                {isIncome ? "Income Source *" : "Expense Category *"}
              </label>
              <select 
                name="category" 
                required
                className="w-full rounded-md border-[#d9e1d8] shadow-sm focus:border-[#2c5a43] focus:ring-[#2c5a43] sm:text-sm p-2 border bg-white"
              >
                <option value="">Select...</option>
                {isIncome ? (
                  <>
                    <option value="Donor funding">Donor funding</option>
                    <option value="Pig sales">Pig sales</option>
                    <option value="Contributions">Contributions</option>
                    <option value="Other income">Other income</option>
                  </>
                ) : (
                  <>
                    <option value="Pig purchase">Pig purchase</option>
                    <option value="Veterinary">Veterinary</option>
                    <option value="Transport">Transport</option>
                    <option value="Feed">Feed</option>
                    <option value="Training">Training</option>
                    <option value="Salaries">Salaries</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Other expenses">Other expenses</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1c2b23] mb-1">Payment Method</label>
              <select 
                name="paymentMethod" 
                className="w-full rounded-md border-[#d9e1d8] shadow-sm focus:border-[#2c5a43] focus:ring-[#2c5a43] sm:text-sm p-2 border bg-white"
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Mobile Money">Mobile Money</option>
                <option value="Cash">Cash</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#1c2b23] mb-1">Description / Notes</label>
              <textarea 
                name="description" 
                rows={3}
                placeholder="Details about this transaction..."
                className="w-full rounded-md border-[#d9e1d8] shadow-sm focus:border-[#2c5a43] focus:ring-[#2c5a43] sm:text-sm p-2 border"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Link 
              href="/dashboard/finance"
              className="bg-white py-2 px-4 border border-[#d9e1d8] rounded-md shadow-sm text-sm font-medium text-[#5d6e64] hover:bg-gray-50 mr-3"
            >
              Cancel
            </Link>
            <button 
              type="submit"
              className="inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#2c5a43] hover:bg-[#1c2b23] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2c5a43]"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
