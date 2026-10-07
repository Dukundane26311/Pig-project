import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { createEmployeeReport } from "@/app/actions/report";

export const dynamic = 'force-dynamic';

export default async function NewEmployeeReportPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'FIELD_OFFICER') {
    redirect("/dashboard");
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/field/reports" className="text-[#5d6e64] hover:text-[#1c2b23]">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-serif text-[#1c2b23]">Submit Daily Report</h1>
          <p className="mt-1 text-sm text-[#5d6e64]">Log your field activities and observations for today.</p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg border border-[#d9e1d8] p-6">
        <form action={createEmployeeReport} className="space-y-6">
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
              <label className="block text-sm font-medium text-[#1c2b23] mb-1">Families Visited</label>
              <input 
                type="number" 
                name="familiesVisited"
                defaultValue={0}
                min={0}
                className="w-full rounded-md border-[#d9e1d8] shadow-sm focus:border-[#2c5a43] focus:ring-[#2c5a43] sm:text-sm p-2 border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1c2b23] mb-1">Pigs Distributed</label>
              <input 
                type="number" 
                name="pigsDistributed"
                defaultValue={0}
                min={0}
                className="w-full rounded-md border-[#d9e1d8] shadow-sm focus:border-[#2c5a43] focus:ring-[#2c5a43] sm:text-sm p-2 border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1c2b23] mb-1">Pigs Returned</label>
              <input 
                type="number" 
                name="pigsReturned"
                defaultValue={0}
                min={0}
                className="w-full rounded-md border-[#d9e1d8] shadow-sm focus:border-[#2c5a43] focus:ring-[#2c5a43] sm:text-sm p-2 border"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#1c2b23] mb-1">Work Done Today *</label>
              <textarea 
                name="workDone" 
                required
                rows={3}
                placeholder="Brief summary of main activities..."
                className="w-full rounded-md border-[#d9e1d8] shadow-sm focus:border-[#2c5a43] focus:ring-[#2c5a43] sm:text-sm p-2 border"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#1c2b23] mb-1">Problems Found</label>
              <textarea 
                name="problemsFound" 
                rows={2}
                placeholder="Any sick pigs, beneficiary issues, etc."
                className="w-full rounded-md border-[#d9e1d8] shadow-sm focus:border-[#a63a3a] focus:ring-[#a63a3a] sm:text-sm p-2 border"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#1c2b23] mb-1">Other Activities / Comments</label>
              <textarea 
                name="comment" 
                rows={2}
                placeholder="Additional notes"
                className="w-full rounded-md border-[#d9e1d8] shadow-sm focus:border-[#2c5a43] focus:ring-[#2c5a43] sm:text-sm p-2 border"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Link 
              href="/dashboard/field"
              className="bg-white py-2 px-4 border border-[#d9e1d8] rounded-md shadow-sm text-sm font-medium text-[#5d6e64] hover:bg-gray-50 mr-3"
            >
              Cancel
            </Link>
            <button 
              type="submit"
              className="inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#2c5a43] hover:bg-[#1c2b23] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2c5a43]"
            >
              <Save className="h-4 w-4 mr-2" />
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
