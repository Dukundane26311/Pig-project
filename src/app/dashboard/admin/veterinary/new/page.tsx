import { createVeterinaryVisit } from "@/app/actions/veterinary";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";


export const dynamic = 'force-dynamic';

export default async function NewVetVisitPage({ searchParams }: { searchParams: Promise<{ pigId?: string }> }) {
  const { pigId } = await searchParams;
  const pigs = await prisma.pig.findMany({
    orderBy: { tagNumber: 'asc' },
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href={pigId ? `/dashboard/pigs/${pigId}` : "/dashboard/veterinary"}
          className="p-2 text-[#5d6e64] hover:bg-[#e4ede6] rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold font-serif text-[#1c2b23]">Log Veterinary Visit</h2>
          <p className="mt-1 text-sm text-[#5d6e64]">Record a health checkup, vaccination, or treatment.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#d9e1d8] overflow-hidden">
        <form action={createVeterinaryVisit} className="p-6 sm:p-8 space-y-8">
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="pigId" className="block text-sm font-medium text-[#5d6e64]">Select Pig</label>
              <select id="pigId" name="pigId" required defaultValue={pigId || ""}
                className="mt-1 block w-full border border-[#d9e1d8] rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#c9577a] focus:border-[#c9577a] sm:text-sm bg-white text-[#1c2b23]">
                <option value="">-- Select Pig --</option>
                {pigs.map(p => (
                  <option key={p.id} value={p.id}>{p.tagNumber} ({p.breed || 'Unknown'})</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-[#5d6e64]">Date of Visit</label>
              <input type="date" name="date" id="date" required defaultValue={new Date().toISOString().split('T')[0]}
                className="mt-1 block w-full border border-[#d9e1d8] rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#c9577a] focus:border-[#c9577a] sm:text-sm text-[#1c2b23] bg-white" />
            </div>

            <div>
              <label htmlFor="activityType" className="block text-sm font-medium text-[#5d6e64]">Activity Type</label>
              <select id="activityType" name="activityType" required
                className="mt-1 block w-full border border-[#d9e1d8] rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#c9577a] focus:border-[#c9577a] sm:text-sm bg-white text-[#1c2b23]">
                <option value="CHECKUP">Routine Checkup</option>
                <option value="VACCINATION">Vaccination</option>
                <option value="TREATMENT">Treatment / Illness</option>
                <option value="EMERGENCY">Emergency</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="diagnosis" className="block text-sm font-medium text-[#5d6e64]">Diagnosis / Current Health Status</label>
              <input type="text" name="diagnosis" id="diagnosis" placeholder="e.g. Healthy, Swine Fever, Recovering" required
                className="mt-1 block w-full border border-[#d9e1d8] rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#c9577a] focus:border-[#c9577a] sm:text-sm text-[#1c2b23] bg-white" />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="treatment" className="block text-sm font-medium text-[#5d6e64]">Treatment Administered</label>
              <textarea name="treatment" id="treatment" rows={2}
                className="mt-1 block w-full border border-[#d9e1d8] rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#c9577a] focus:border-[#c9577a] sm:text-sm text-[#1c2b23] bg-white" />
            </div>
            
            <div className="sm:col-span-2">
              <label htmlFor="medication" className="block text-sm font-medium text-[#5d6e64]">Medications / Prescriptions</label>
              <input type="text" name="medication" id="medication"
                className="mt-1 block w-full border border-[#d9e1d8] rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#c9577a] focus:border-[#c9577a] sm:text-sm text-[#1c2b23] bg-white" />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="notes" className="block text-sm font-medium text-[#5d6e64]">General Notes</label>
              <textarea name="notes" id="notes" rows={2}
                className="mt-1 block w-full border border-[#d9e1d8] rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#c9577a] focus:border-[#c9577a] sm:text-sm text-[#1c2b23] bg-white" />
            </div>

            <div>
              <label htmlFor="followUpDate" className="block text-sm font-medium text-[#5d6e64]">Follow-up Date (Optional)</label>
              <input type="date" name="followUpDate" id="followUpDate"
                className="mt-1 block w-full border border-[#d9e1d8] rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#c9577a] focus:border-[#c9577a] sm:text-sm text-[#1c2b23] bg-white" />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-4 border-t border-[#d9e1d8]">
            <Link 
              href={pigId ? `/dashboard/pigs/${pigId}` : "/dashboard/veterinary"}
              className="px-4 py-2 text-sm font-medium text-[#5d6e64] hover:text-[#1c2b23] transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="inline-flex items-center justify-center px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#2c5a43] hover:bg-[#1c2b23] transition-colors"
            >
              <Save className="-ml-1 mr-2 h-4 w-4" />
              Save Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
