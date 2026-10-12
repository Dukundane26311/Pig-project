import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";
import { FileText, ArrowLeft, Stethoscope, HeartPulse, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function VetReportsPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "VETERINARIAN" && session.user.role !== "SUPER_ADMIN")) {
    redirect("/dashboard");
  }

  const [
    totalExams,
    healthyCount,
    sickCount,
    allRecords,
  ] = await Promise.all([
    prisma.veterinaryRecord.count(),
    prisma.pig.count({ where: { healthStatus: "HEALTHY", deletedAt: null } }),
    prisma.pig.count({ where: { healthStatus: { in: ["SICK", "UNDER_TREATMENT", "CRITICAL"] }, deletedAt: null } }),
    prisma.veterinaryRecord.findMany({
      orderBy: { date: "desc" },
      take: 50,
      include: {
        pig: { select: { tagNumber: true, breed: true } },
        veterinarian: { select: { name: true } },
      },
    }),
  ]);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/vet"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#dfe7df] bg-white text-[#5d6e64] hover:bg-[#f3f5f1] transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold font-serif text-[#1b2d24]">Veterinary Health Reports</h1>
            <p className="text-xs text-[#5d6e64]">
              Aggregated clinical overview generated automatically from verified animal examinations.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div className="rounded-[20px] border border-[#dfe7df] bg-white p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#5d6d64]">Total Examinations</span>
          <p className="mt-3 text-3xl font-bold text-[#1b2d24]">{totalExams}</p>
          <p className="mt-1 text-xs text-[#7a8a82]">Cumulative medical checks</p>
        </div>
        <div className="rounded-[20px] border border-[#dfe7df] bg-white p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#5d6d64]">Active Healthy Herd</span>
          <p className="mt-3 text-3xl font-bold text-[#173d2e]">{healthyCount}</p>
          <p className="mt-1 text-xs text-[#7a8a82]">Cleared animals</p>
        </div>
        <div className="rounded-[20px] border border-[#dfe7df] bg-white p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#5d6d64]">Clinical Intervention Cases</span>
          <p className="mt-3 text-3xl font-bold text-[#a44d67]">{sickCount}</p>
          <p className="mt-1 text-xs text-[#7a8a82]">Currently in treatment</p>
        </div>
      </div>

      <div className="rounded-[24px] border border-[#dfe7df] bg-white shadow-sm overflow-hidden">
        <div className="border-b border-[#dfe7df] bg-[#f8faf8] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FileText className="h-5 w-5 text-[#173d2e]" />
            <span className="text-sm font-bold text-[#1b2d24]">Clinical Examination History</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#dfe7df]">
            <thead className="bg-[#f2f5f0]">
              <tr>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-[#1c2b23]">
                  Date
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-[#1c2b23]">
                  Pig Tag
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-[#1c2b23]">
                  Activity
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-[#1c2b23]">
                  Diagnosis
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-[#1c2b23]">
                  Therapy / Medication
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-[#1c2b23]">
                  Examined By
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dfe7df] bg-white">
              {allRecords.map((r) => (
                <tr key={r.id} className="hover:bg-[#f8faf8] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1b2d24]">
                    {format(new Date(r.date), "MMM d, yyyy")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-xs font-bold text-[#173d2e] bg-[#e3efe7] px-2 py-1 rounded">
                      {r.pig.tagNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1b2d24]">
                    {r.activityType}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#1b2d24]">
                    {r.diagnosis || "Routine"}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#5d6e64]">
                    {r.medication || r.treatment || "None prescribed"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5d6e64]">
                    Dr. {r.veterinarian.name}
                  </td>
                </tr>
              ))}
              {allRecords.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-[#5d6e64]">
                    No examination records available for reporting.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
