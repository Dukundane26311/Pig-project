import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import { 
  ArrowRightCircle, CheckCircle2, Clock, RefreshCw, PlusCircle
} from "lucide-react";
import { AdminDistributionsTableClient } from "./AdminDistributionsTableClient";

export const dynamic = "force-dynamic";

export default async function AdminDistributionsAndReturnsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  const [distributions, returns, returnLedger] = await Promise.all([
    prisma.pigDistribution.findMany({
      orderBy: { distributionDate: "desc" },
      include: {
        pig: true,
        beneficiary: {
          select: {
            id: true,
            fullName: true,
            beneficiaryNumber: true,
            phone: true,
            districtStr: true,
            sectorStr: true,
          },
        },
        distributedBy: { select: { name: true } },
      },
    }),
    prisma.pigReturn.groupBy({
      by: ["beneficiaryId"],
      _sum: { quantity: true },
    }),
    prisma.pigReturn.findMany({
      orderBy: { returnDate: "desc" },
      take: 20,
      include: {
        pig: { select: { id: true, tagNumber: true, healthStatus: true, status: true } },
        beneficiary: { select: { id: true, fullName: true, beneficiaryNumber: true } },
        recordedBy: { select: { name: true } },
      },
    }),
  ]);

  const returnMap = new Map<string, number>();
  for (const item of returns) {
    returnMap.set(item.beneficiaryId, item._sum.quantity ?? 0);
  }

  // Calculate distribution obligation statuses
  const rows = distributions.map((dist) => {
    const totalReturned = returnMap.get(dist.beneficiaryId) ?? 0;
    const required = 2;
    const returned = Math.min(required, totalReturned);
    const outstanding = Math.max(0, required - returned);
    let status: "Outstanding" | "Partially Returned" | "Completed" = "Outstanding";
    if (returned >= 2) status = "Completed";
    else if (returned === 1) status = "Partially Returned";

    return {
      dist,
      required,
      returned,
      outstanding,
      status,
    };
  });

  const totalDistributions = distributions.length;
  const completedCount = rows.filter((r) => r.status === "Completed").length;
  const partialCount = rows.filter((r) => r.status === "Partially Returned").length;
  const outstandingCount = rows.filter((r) => r.status === "Outstanding").length;
  const totalPigletsReturned = returns.reduce((sum, r) => sum + (r._sum.quantity ?? 0), 0);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Operations Engine</p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Pig Distributions & Return Obligations</h1>
          <p className="mt-1 text-xs text-slate-500">
            Monitor livestock distribution agreements and track the revolving mandate of two returned piglets per family.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            href="/dashboard/field/distributions/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[#064e3b] px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#053d2e] transition"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Record Distribution</span>
          </Link>
          <Link
            href="/dashboard/field/returns/new"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Record Returned Piglet</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-xl border border-slate-200/80 bg-white p-4.5 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Distributions</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <ArrowRightCircle className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{totalDistributions}</p>
          <p className="mt-0.5 text-xs text-slate-500">Families receiving livestock</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-4.5 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Piglets Returned</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <RefreshCw className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-emerald-700">{totalPigletsReturned}</p>
          <p className="mt-0.5 text-xs text-slate-500">Revolving into the fund</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-4.5 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Completed</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{completedCount}</p>
          <p className="mt-0.5 text-xs text-slate-500">Both 2 piglets fulfilled</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-4.5 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Partially Returned</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-blue-700">{partialCount}</p>
          <p className="mt-0.5 text-xs text-slate-500">1 of 2 piglets returned</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-4.5 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Outstanding</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-700">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-rose-700">{outstandingCount}</p>
          <p className="mt-0.5 text-xs text-slate-500">Awaiting first return</p>
        </div>
      </div>

      {/* Main Two-Piglet Return Obligation Tracking Table with Date Search */}
      <AdminDistributionsTableClient initialRows={rows} />

      {/* Traceable Returned Piglets Ledger */}
      <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50/75 px-5 py-3.5 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Recent Returned Piglet Records</h2>
            <p className="text-xs text-slate-500">
              Traceable records of piglets returned by beneficiaries under the revolving fund agreement.
            </p>
          </div>
          <Link
            href="/dashboard/field/returns/new"
            className="text-xs font-semibold text-[#173d2e] hover:underline"
          >
            + New Return
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#dfe7df]">
            <thead className="bg-[#f2f5f0]">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#1c2b23]">
                  Return Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#1c2b23]">
                  Returning Beneficiary
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#1c2b23]">
                  Health Inspection Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#1c2b23]">
                  Receiving Officer
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dfe7df] bg-white">
              {returnLedger.map((ret) => (
                <tr key={ret.id} className="hover:bg-[#f8faf8] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1b2d24]">
                    {format(new Date(ret.returnDate), "MMM d, yyyy")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm font-medium text-[#1b2d24]">{ret.beneficiary.fullName}</p>
                    <p className="text-xs text-[#7a8a82]">{ret.beneficiary.beneficiaryNumber}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        ret.veterinaryVerified
                          ? "bg-[#e3efe7] text-[#173d2e]"
                          : "bg-[#fef3c7] text-[#92400e]"
                      }`}
                    >
                      {ret.veterinaryVerified ? "Cleared by Vet" : "Awaiting Vet Inspection"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5d6e64]">
                    {ret.recordedBy?.name ?? "Field Staff"}
                  </td>
                </tr>
              ))}
              {returnLedger.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-[#5d6e64]">
                    No returned piglets recorded in the ledger yet.
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
