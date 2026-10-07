import { createBeneficiary } from "@/app/actions/beneficiary";
import { LocationPicker } from "@/components/LocationPicker";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function NewBeneficiaryPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/dashboard/field/beneficiaries"
          className="p-2 text-[#5d6e64] hover:bg-[#e4ede6] rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold font-serif text-[#1c2b23]">Add Beneficiary</h2>
          <p className="mt-1 text-sm text-[#5d6e64]">Register a new family to receive a piglet.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#d9e1d8] overflow-hidden">
        <form action={createBeneficiary} className="p-6 sm:p-8 space-y-8">
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-[#1c2b23] border-b border-[#d9e1d8] pb-2">Personal Information</h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="fullName" className="block text-sm font-medium text-[#5d6e64]">Full Name</label>
                <input type="text" name="fullName" id="fullName" required
                  className="mt-1 block w-full border border-[#d9e1d8] rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#c9577a] focus:border-[#c9577a] sm:text-sm text-[#1c2b23] bg-white" />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-[#5d6e64]">Phone Number</label>
                <input type="text" name="phone" id="phone"
                  className="mt-1 block w-full border border-[#d9e1d8] rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#c9577a] focus:border-[#c9577a] sm:text-sm text-[#1c2b23] bg-white" />
              </div>
              <div>
                <label htmlFor="savingsGroup" className="block text-sm font-medium text-[#5d6e64]">Savings Group (1-10)</label>
                <input type="text" name="savingsGroup" id="savingsGroup"
                  className="mt-1 block w-full border border-[#d9e1d8] rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#c9577a] focus:border-[#c9577a] sm:text-sm text-[#1c2b23] bg-white" />
              </div>
            </div>

            <h3 className="text-lg font-medium text-[#1c2b23] border-b border-[#d9e1d8] pb-2 pt-4">Location</h3>
            <LocationPicker />
          </div>

          <div className="pt-4 flex items-center justify-end gap-4 border-t border-[#d9e1d8]">
            <Link 
              href="/dashboard/field/beneficiaries"
              className="px-4 py-2 text-sm font-medium text-[#5d6e64] hover:text-[#1c2b23] transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="inline-flex items-center justify-center px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#2c5a43] hover:bg-[#1c2b23] transition-colors"
            >
              <Save className="-ml-1 mr-2 h-4 w-4" />
              Save Beneficiary
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
