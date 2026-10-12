import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, PlusCircle, Calendar } from "lucide-react";
import { format } from "date-fns";
import { getActiveUser } from "@/lib/active-user";

export const dynamic = 'force-dynamic';

export default async function EmployeeReportsPage() {
  const user = await getActiveUser([Role.FIELD_OFFICER, Role.SUPER_ADMIN]);
  if (!user) {
    redirect("/dashboard");
  }

  const reports = await prisma.employeeReport.findMany({
    where: user.role === Role.FIELD_OFFICER ? { employeeId: user.id } : undefined,
    orderBy: { date: "desc" },
    include: { employee: { select: { name: true } } },
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-serif text-[#1c2b23]">Daily Reports</h1>
          <p className="mt-1 text-sm text-[#5d6e64]">View your submitted daily activity reports.</p>
        </div>
        <Link href="/dashboard/field/reports/new" className="inline-flex items-center px-4 py-2 bg-[#2c5a43] text-white text-sm font-medium rounded-md hover:bg-[#1c2b23] transition-colors">
          <PlusCircle className="h-4 w-4 mr-2" />
          New Report
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg border border-[#d9e1d8] overflow-hidden">
        {reports.length === 0 ? (
          <div className="p-8 text-center text-[#5d6e64]">
            <FileText className="h-12 w-12 mx-auto text-[#bfd0c4] mb-3" />
            <p>No reports submitted yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#d9e1d8]">
            {reports.map((report) => (
              <div key={report.id} className="p-5 hover:bg-[#f8faf8] transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center text-sm font-bold text-[#1c2b23]">
                      <Calendar className="h-4 w-4 mr-2 text-[#5d6e64]" />
                      {format(new Date(report.date), 'MMM d, yyyy')}
                      {user.role === Role.SUPER_ADMIN && <span className="ml-3 px-2 py-0.5 bg-[#e4ede6] text-[#2c5a43] rounded-full text-xs font-medium">{report.employee.name}</span>}
                    </div>
                    <h3 className="mt-2 font-medium text-[#1c2b23]">{report.workDone}</h3>
                    <div className="mt-3 flex gap-4 text-sm text-[#5d6e64]">
                      <span className="bg-[#f2f5f0] px-2 py-1 rounded">Visited: {report.familiesVisited}</span>
                      <span className="bg-[#f2f5f0] px-2 py-1 rounded">Distributed: {report.pigsDistributed}</span>
                      <span className="bg-[#f2f5f0] px-2 py-1 rounded">Returned: {report.pigsReturned}</span>
                    </div>
                    {report.problemsFound && (
                      <div className="mt-3 text-sm text-[#a63a3a] bg-[#a63a3a]/10 p-2 rounded">
                        <strong>Problems:</strong> {report.problemsFound}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
