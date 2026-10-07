import { createPig } from "@/app/actions/pig";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default async function NewPigPage() {
  const beneficiaries = await prisma.beneficiary.findMany({
    orderBy: { fullName: 'asc' },
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/dashboard/admin/pigs"
          className="p-2 text-[#5d6e64] hover:bg-[#e4ede6] rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold font-serif text-[#1c2b23]">Register Pig</h2>
          <p className="mt-1 text-sm text-[#5d6e64]">Add a registered pig into the fund.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#d9e1d8] overflow-hidden">
        <form action={createPig} className="p-6 sm:p-8 space-y-8">
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-[#1c2b23] border-b border-[#d9e1d8] pb-2">Pig Profile</h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="breed" className="block text-sm font-medium text-[#5d6e64]">Breed</label>
                <input type="text" name="breed" id="breed"
                  className="mt-1 block w-full border border-[#d9e1d8] rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#c9577a] focus:border-[#c9577a] sm:text-sm text-[#1c2b23] bg-white" />
              </div>
              <div>
                <label htmlFor="sex" className="block text-sm font-medium text-[#5d6e64]">Sex</label>
                <select id="sex" name="sex"
                  className="mt-1 block w-full border border-[#d9e1d8] rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#c9577a] focus:border-[#c9577a] sm:text-sm bg-white text-[#1c2b23]">
                  <option value="FEMALE">Female (Sow/Gilt)</option>
                  <option value="MALE">Male (Boar)</option>
                </select>
              </div>
              <div>
                <label htmlFor="color" className="block text-sm font-medium text-[#5d6e64]">Color / Description</label>
                <input type="text" name="color" id="color"
                  className="mt-1 block w-full border border-[#d9e1d8] rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#c9577a] focus:border-[#c9577a] sm:text-sm text-[#1c2b23] bg-white" />
              </div>
            </div>

            <h3 className="text-lg font-medium text-[#1c2b23] border-b border-[#d9e1d8] pb-2 pt-4">Assignment</h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="beneficiaryId" className="block text-sm font-medium text-[#5d6e64]">Assign to Beneficiary</label>
                <select id="beneficiaryId" name="beneficiaryId"
                  className="mt-1 block w-full border border-[#d9e1d8] rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#c9577a] focus:border-[#c9577a] sm:text-sm bg-white text-[#1c2b23]">
                  <option value="">-- Do not assign yet --</option>
                  {beneficiaries.map(b => (
                    <option key={b.id} value={b.id}>{b.fullName} ({b.beneficiaryNumber})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-4 border-t border-[#d9e1d8]">
            <Link 
              href="/dashboard/admin/pigs"
              className="px-4 py-2 text-sm font-medium text-[#5d6e64] hover:text-[#1c2b23] transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="inline-flex items-center justify-center px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#2c5a43] hover:bg-[#1c2b23] transition-colors"
            >
              <Save className="-ml-1 mr-2 h-4 w-4" />
              Register Pig
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
