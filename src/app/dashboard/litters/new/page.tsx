import { createLitter } from "@/app/actions/litter";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function NewLitterPage({ searchParams }: { searchParams: Promise<{ pigId?: string }> }) {
  const { pigId } = await searchParams;
  if (!pigId) notFound();

  const pig = await prisma.pig.findUnique({
    where: { id: pigId },
    include: { beneficiary: true }
  });

  if (!pig) notFound();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href={`/dashboard/pigs/${pigId}`}
          className="p-2 text-[#5d6e64] hover:bg-[#e4ede6] rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold font-serif text-[#1c2b23]">Record Litter (Birth)</h2>
          <p className="mt-1 text-sm text-[#5d6e64]">Log a new birth for pig {pig.pigId}.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#d9e1d8] overflow-hidden">
        <div className="bg-[#f2f5f0] p-6 border-b border-[#d9e1d8]">
          <p className="text-sm text-[#5d6e64]">
            <strong>Mother Pig:</strong> {pig.pigId} ({pig.breed}) <br />
            <strong>Owner:</strong> {pig.beneficiary?.fullName || 'Unknown'}
          </p>
        </div>

        <form action={createLitter} className="p-6 sm:p-8 space-y-8">
          <input type="hidden" name="pigId" value={pig.id} />
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-[#5d6e64]">Date of Birth</label>
              <input type="date" name="dateOfBirth" id="dateOfBirth" required defaultValue={new Date().toISOString().split('T')[0]}
                className="mt-1 block w-full border border-[#d9e1d8] rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#c9577a] focus:border-[#c9577a] sm:text-sm text-[#1c2b23] bg-white" />
            </div>
            
            <div>
              <label htmlFor="numberOfPigletsBorn" className="block text-sm font-medium text-[#5d6e64]">Total Piglets Born</label>
              <input type="number" name="numberOfPigletsBorn" id="numberOfPigletsBorn" min="1" required
                className="mt-1 block w-full border border-[#d9e1d8] rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#c9577a] focus:border-[#c9577a] sm:text-sm text-[#1c2b23] bg-white" />
              <p className="mt-1 text-xs text-[#5d6e64]">Includes both alive and stillborn</p>
            </div>
            
            <div>
              <label htmlFor="numberSurvived" className="block text-sm font-medium text-[#5d6e64]">Piglets Survived (Alive)</label>
              <input type="number" name="numberSurvived" id="numberSurvived" min="0" required
                className="mt-1 block w-full border border-[#d9e1d8] rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#c9577a] focus:border-[#c9577a] sm:text-sm text-[#1c2b23] bg-white" />
              <p className="mt-1 text-xs text-[#5d6e64]">We will generate records for these survivors.</p>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-4 border-t border-[#d9e1d8]">
            <Link 
              href={`/dashboard/pigs/${pig.id}`}
              className="px-4 py-2 text-sm font-medium text-[#5d6e64] hover:text-[#1c2b23] transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="inline-flex items-center justify-center px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#2c5a43] hover:bg-[#1c2b23] transition-colors"
            >
              <Save className="-ml-1 mr-2 h-4 w-4" />
              Save & Generate Piglets
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
