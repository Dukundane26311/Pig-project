import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";
import { Calendar, ArrowLeft, Stethoscope, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function VetFollowUpsPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "VETERINARIAN" && session.user.role !== "SUPER_ADMIN")) {
    redirect("/dashboard");
  }

  const followUpExams = await prisma.veterinaryRecord.findMany({
    where: {
      followUpDate: { not: null },
    },
    orderBy: { followUpDate: "asc" },
    include: {
      pig: true,
      veterinarian: { select: { name: true } },
    },
  });

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
            <h1 className="text-2xl font-bold font-serif text-[#1b2d24]">Scheduled Veterinary Follow-ups</h1>
            <p className="text-xs text-[#5d6e64]">
              Manage scheduled animal re-examinations, ongoing treatment reviews, and recovery confirmations.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-[24px] border border-[#dfe7df] bg-white shadow-sm overflow-hidden">
        <div className="border-b border-[#dfe7df] bg-[#f8faf8] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Calendar className="h-5 w-5 text-[#2d5b78]" />
            <span className="text-sm font-bold text-[#1b2d24]">
              {followUpExams.length} Scheduled Follow-up Cases
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#dfe7df]">
            <thead className="bg-[#f2f5f0]">
              <tr>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-[#1c2b23]">
                  Follow-up Due Date
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-[#1c2b23]">
                  Pig Tag ID
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-[#1c2b23]">
                  Original Diagnosis
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-[#1c2b23]">
                  Prescribed Therapy
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-[#1c2b23]">
                  Recorded By
                </th>
                <th scope="col" className="px-6 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-[#1c2b23]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dfe7df] bg-white">
              {followUpExams.map((exam) => (
                <tr key={exam.id} className="hover:bg-[#f8faf8] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[#1b2d24]">
                    {exam.followUpDate ? format(new Date(exam.followUpDate), "MMM d, yyyy") : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-sm font-bold text-[#173d2e] bg-[#e3efe7] px-2.5 py-1 rounded-md">
                      {exam.pig.tagNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#1b2d24]">
                    {exam.diagnosis || "Follow-up required"}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#5d6e64]">
                    {exam.medication || exam.treatment || "Monitoring"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5d6e64]">
                    Dr. {exam.veterinarian.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Link
                      href={`/dashboard/vet/veterinary/new?pigId=${exam.pigId}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#173d2e] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-[#102a22] transition"
                    >
                      <Stethoscope className="h-3.5 w-3.5" />
                      <span>Conduct Follow-up</span>
                    </Link>
                  </td>
                </tr>
              ))}
              {followUpExams.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-[#5d6e64]">
                    <div className="flex flex-col items-center justify-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e3efe7] text-[#173d2e] mb-3">
                        <CheckCircle2 className="h-6 w-6" />
                      </div>
                      <p className="text-base font-semibold text-[#1b2d24]">No follow-ups currently due</p>
                    </div>
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
