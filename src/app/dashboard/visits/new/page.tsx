import { createFieldVisit } from "@/app/actions/visit";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default async function NewVisitPage() {
  const beneficiaries = await prisma.beneficiary.findMany({
    orderBy: { fullName: 'asc' },
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/dashboard/visits"
          className="p-2 text-[#5d6e64] hover:bg-[#e4ede6] rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold font-serif text-[#1c2b23]">Log Field Visit</h2>
          <p className="mt-1 text-sm text-[#5d6e64]">Record observations and updates from a monitoring visit.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#d9e1d8] overflow-hidden">
        <form action={createFieldVisit} className="p-6 sm:p-8 space-y-8">
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="beneficiaryId" className="block text-sm font-medium text-[#5d6e64]">Select Beneficiary Family</label>
              <select id="beneficiaryId" name="beneficiaryId" required
                className="mt-1 block w-full border border-[#d9e1d8] rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#c9577a] focus:border-[#c9577a] sm:text-sm bg-white text-[#1c2b23]">
                <option value="">-- Select Beneficiary --</option>
                {beneficiaries.map(b => (
                  <option key={b.id} value={b.id}>{b.fullName} ({b.beneficiaryId})</option>
                ))}
              </select>
            </div>
            
            <div className="sm:col-span-2">
              <label htmlFor="purpose" className="block text-sm font-medium text-[#5d6e64]">Purpose of Visit</label>
              <input type="text" name="purpose" id="purpose" required placeholder="e.g. Routine checkup, Repayment follow-up"
                className="mt-1 block w-full border border-[#d9e1d8] rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#c9577a] focus:border-[#c9577a] sm:text-sm text-[#1c2b23] bg-white" />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="observations" className="block text-sm font-medium text-[#5d6e64]">General Observations</label>
              <textarea name="observations" id="observations" rows={3} required
                className="mt-1 block w-full border border-[#d9e1d8] rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#c9577a] focus:border-[#c9577a] sm:text-sm text-[#1c2b23] bg-white" />
            </div>

            <div>
              <label htmlFor="pigCondition" className="block text-sm font-medium text-[#5d6e64]">Condition of Pigs/Pen</label>
              <select id="pigCondition" name="pigCondition" required
                className="mt-1 block w-full border border-[#d9e1d8] rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#c9577a] focus:border-[#c9577a] sm:text-sm bg-white text-[#1c2b23]">
                <option value="EXCELLENT">Excellent</option>
                <option value="GOOD">Good</option>
                <option value="FAIR">Fair</option>
                <option value="POOR">Poor</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="nextVisitDate" className="block text-sm font-medium text-[#5d6e64]">Schedule Next Visit (Optional)</label>
              <input type="date" name="nextVisitDate" id="nextVisitDate"
                className="mt-1 block w-full border border-[#d9e1d8] rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#c9577a] focus:border-[#c9577a] sm:text-sm text-[#1c2b23] bg-white" />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-4 border-t border-[#d9e1d8]">
            <Link 
              href="/dashboard/visits"
              className="px-4 py-2 text-sm font-medium text-[#5d6e64] hover:text-[#1c2b23] transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="inline-flex items-center justify-center px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#2c5a43] hover:bg-[#1c2b23] transition-colors"
            >
              <Save className="-ml-1 mr-2 h-4 w-4" />
              Save Visit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
