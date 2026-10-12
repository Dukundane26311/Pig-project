import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Activity, User, Calendar, MapPin } from "lucide-react";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { getActiveUser } from "@/lib/active-user";

export const dynamic = 'force-dynamic';

export default async function VisitsPage() {
  const activeUser = await getActiveUser([Role.SUPER_ADMIN, Role.FIELD_OFFICER]);
  if (!activeUser) {
    redirect("/dashboard");
  }

  const visits = await prisma.fieldVisit.findMany({
    include: {
      beneficiary: {
        select: { fullName: true, beneficiaryNumber: true, districtStr: true },
      },
      fieldOfficer: {
        select: { name: true, role: true },
      },
      pig: {
        select: { tagNumber: true },
      },
    },
    orderBy: { date: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-serif text-[#1c2b23]">Field Monitoring Visits</h2>
          <p className="mt-1 text-sm text-[#5d6e64]">
            Track monitoring and evaluation visits to beneficiary households.
          </p>
        </div>
        <Link 
          href="/dashboard/admin/visits/new"
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#2c5a43] hover:bg-[#1c2b23] transition-colors"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Log Field Visit
        </Link>
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-[#d9e1d8] overflow-hidden">
        {visits.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#d9e1d8]">
              <thead className="bg-[#f2f5f0]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#5d6e64] uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#5d6e64] uppercase tracking-wider">Beneficiary</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#5d6e64] uppercase tracking-wider">Purpose & Observations</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#5d6e64] uppercase tracking-wider">Condition</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#5d6e64] uppercase tracking-wider">Field Officer</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#d9e1d8]">
                {visits.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1c2b23] font-medium">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1.5 text-[#9db0a4]" />
                        {new Date(v.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1c2b23]">
                      <div className="font-medium">{v.beneficiary.fullName}</div>
                      <div className="text-xs font-mono text-[#9db0a4]">{v.beneficiary.beneficiaryNumber}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#5d6e64]">
                      <div className="font-medium text-[#1c2b23]">{v.purpose}</div>
                      <div className="text-xs text-[#9db0a4] line-clamp-1">{v.observations}</div>
                      {v.pig && (
                        <div className="text-xs text-[#2c5a43] mt-0.5">Assigned Pig: {v.pig.tagNumber}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-[#e4ede6] text-[#2c5a43]">
                        {v.pigCondition || 'Good'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5d6e64]">
                      <div className="flex items-center">
                        <User className="h-3.5 w-3.5 mr-1 text-[#9db0a4]" />
                        {v.fieldOfficer.name || 'Officer'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-[#5d6e64]">
            <Activity className="h-10 w-10 mx-auto text-[#9db0a4] mb-3" />
            <p className="font-medium text-[#1c2b23]">No field visits recorded yet</p>
            <p className="text-sm mt-1">Record the first monitoring visit using the button above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
