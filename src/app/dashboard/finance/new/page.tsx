import { createFinanceTransaction } from "@/app/actions/finance";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function NewTransactionPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/dashboard/finance"
          className="p-2 text-[#5d6e64] hover:bg-[#e4ede6] rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold font-serif text-[#1c2b23]">New Transaction</h2>
          <p className="mt-1 text-sm text-[#5d6e64]">Log an income or expense record.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#d9e1d8] overflow-hidden">
        <form action={createFinanceTransaction} className="p-6 sm:p-8 space-y-8">
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-[#5d6e64]">Type</label>
              <select id="type" name="type" required
                className="mt-1 block w-full border border-[#d9e1d8] rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#c9577a] focus:border-[#c9577a] sm:text-sm bg-white text-[#1c2b23]">
                <option value="EXPENSE">Expense</option>
                <option value="INCOME">Income</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-[#5d6e64]">Category</label>
              <select id="category" name="category" required
                className="mt-1 block w-full border border-[#d9e1d8] rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#c9577a] focus:border-[#c9577a] sm:text-sm bg-white text-[#1c2b23]">
                <option value="PIG_PURCHASE">Pig Purchase</option>
                <option value="VETERINARY">Veterinary</option>
                <option value="TRANSPORT">Transport</option>
                <option value="DONOR_FUNDING">Donor Funding</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-[#5d6e64]">Amount (RWF)</label>
              <input type="number" name="amount" id="amount" min="0" step="1" required
                className="mt-1 block w-full border border-[#d9e1d8] rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#c9577a] focus:border-[#c9577a] sm:text-sm text-[#1c2b23] bg-white" />
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-[#5d6e64]">Transaction Date</label>
              <input type="date" name="date" id="date" required defaultValue={new Date().toISOString().split('T')[0]}
                className="mt-1 block w-full border border-[#d9e1d8] rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#c9577a] focus:border-[#c9577a] sm:text-sm text-[#1c2b23] bg-white" />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-[#5d6e64]">Description</label>
              <input type="text" name="description" id="description" required
                className="mt-1 block w-full border border-[#d9e1d8] rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#c9577a] focus:border-[#c9577a] sm:text-sm text-[#1c2b23] bg-white" />
            </div>
            
            <div className="sm:col-span-2">
              <label htmlFor="paymentMethod" className="block text-sm font-medium text-[#5d6e64]">Payment Method / Reference</label>
              <input type="text" name="paymentMethod" id="paymentMethod" placeholder="e.g., Momo, Bank Transfer TR-123"
                className="mt-1 block w-full border border-[#d9e1d8] rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#c9577a] focus:border-[#c9577a] sm:text-sm text-[#1c2b23] bg-white" />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-4 border-t border-[#d9e1d8]">
            <Link 
              href="/dashboard/finance"
              className="px-4 py-2 text-sm font-medium text-[#5d6e64] hover:text-[#1c2b23] transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="inline-flex items-center justify-center px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#2c5a43] hover:bg-[#1c2b23] transition-colors"
            >
              <Save className="-ml-1 mr-2 h-4 w-4" />
              Submit Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
