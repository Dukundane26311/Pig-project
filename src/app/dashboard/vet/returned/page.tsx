import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";
import { RefreshCw, Stethoscope, ArrowLeft, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function VetReturnedPigletsPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "VETERINARIAN" && session.user.role !== "SUPER_ADMIN")) {
    redirect("/dashboard");
  }

  const returnedPiglets = await prisma.pigReturn.findMany({
    orderBy: { returnDate: "desc" },
    include: {
      pig: true,
      beneficiary: {
        select: {
          fullName: true,
          beneficiaryNumber: true,
          districtStr: true,
        },
      },
      recordedBy: { select: { name: true } },
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
            <h1 className="text-2xl font-bold font-serif text-[#1b2d24]">Returned Piglets Health Assessment</h1>
            <p className="text-xs text-[#5d6e64]">
              Inspect piglets returned by beneficiaries under the revolving fund agreement. Clearance is required before redistribution.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-[24px] border border-[#dfe7df] bg-white shadow-sm overflow-hidden">
        <div className="border-b border-[#dfe7df] bg-[#f8faf8] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <RefreshCw className="h-5 w-5 text-[#2d5b78]" />
            <span className="text-sm font-bold text-[#1b2d24]">
              Returned Livestock Health Status Ledger
            </span>
          </div>
          <span className="text-xs text-[#5d6e64]">
            Animals requiring treatment remain quarantined until veterinary recovery.
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#dfe7df]">
            <thead className="bg-[#f2f5f0]">
              <tr>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-[#1c2b23]">
                  Return Date
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-[#1c2b23]">
                  Pig Tag ID
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-[#1c2b23]">
                  Source Beneficiary
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-[#1c2b23]">
                  Health Clearance
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-[#1c2b23]">
                  Current Status
                </th>
                <th scope="col" className="px-6 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-[#1c2b23]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dfe7df] bg-white">
              {returnedPiglets.map((item) => (
                <tr key={item.id} className="hover:bg-[#f8faf8] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1b2d24]">
                    {format(new Date(item.returnDate), "MMM d, yyyy")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-sm font-bold text-[#173d2e] bg-[#e3efe7] px-2.5 py-1 rounded-md">
                      {item.pig?.tagNumber ?? "Registered Piglet"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm font-semibold text-[#1b2d24]">{item.beneficiary.fullName}</p>
                    <p className="text-xs text-[#7a8a82]">{item.beneficiary.beneficiaryNumber}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        item.veterinaryVerified
                          ? "bg-[#e3efe7] text-[#173d2e]"
                          : "bg-[#fef3c7] text-[#92400e]"
                      }`}
                    >
                      {item.veterinaryVerified ? "Cleared as Healthy" : "Awaiting Vet Check"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-xs font-medium text-[#5d6e64]">
                      {item.pig?.healthStatus ?? "UNCHECKED"} &bull; {item.pig?.status ?? "REGISTERED"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {item.pig ? (
                      <Link
                        href={`/dashboard/vet/veterinary/new?pigId=${item.pig.id}`}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#173d2e] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-[#102a22] transition"
                      >
                        <Stethoscope className="h-3.5 w-3.5" />
                        <span>{item.veterinaryVerified ? "Re-examine" : "Inspect & Clear"}</span>
                      </Link>
                    ) : (
                      <span className="text-xs text-[#7a8a82]">Legacy record</span>
                    )}
                  </td>
                </tr>
              ))}
              {returnedPiglets.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-[#5d6e64]">
                    <div className="flex flex-col items-center justify-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e3efe7] text-[#173d2e] mb-3">
                        <CheckCircle2 className="h-6 w-6" />
                      </div>
                      <p className="text-base font-semibold text-[#1b2d24]">No returned piglets pending review</p>
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
