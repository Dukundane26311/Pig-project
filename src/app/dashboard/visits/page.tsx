import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Search, Activity } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function VisitsPage() {
  const visits = await prisma.fieldVisit.findMany({
    include: { beneficiary: true, fieldOfficer: true },
    orderBy: { date: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-serif text-[#1c2b23]">Field Visits</h2>
          <p className="mt-1 text-sm text-[#5d6e64]">Track monitoring and evaluation visits to beneficiaries.</p>
        </div>
        <Link 
          href="/dashboard/visits/new"
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#2c5a43] hover:bg-[#1c2b23] transition-colors"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Log Visit
        </Link>
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-[#d9e1d8] overflow-hidden">
        {visits.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#d9e1d8]">
              <thead className="bg-[#f2f5f0]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#5d6e64] uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#5d6e64] uppercase tracking-wider">Beneficiary</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#5d6e64] uppercase tracking-wider">Purpose</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#5d6e64] uppercase tracking-wider">Field Officer</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#d9e1d8]">
                {visits.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1c2b23] font-medium">
                      {new Date(v.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1c2b23]">
                      {v.beneficiary.fullName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5d6e64]">
                      {v.purpose}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5d6e64]">
                      {v.fieldOfficer.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Activity className="mx-auto h-12 w-12 text-[#9db0a4] mb-4" />
            <h3 className="text-lg font-medium text-[#1c2b23] mb-1">No field visits logged</h3>
            <p className="text-[#5d6e64] mb-4">Start monitoring beneficiaries by logging a field visit.</p>
          </div>
        )}
      </div>
    </div>
  );
}
