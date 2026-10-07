// @ts-nocheck
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ArrowLeft, Baby, RefreshCw } from "lucide-react";
import Link from "next/link";
import { markPigletReturned } from "@/app/actions/piglet";

export const dynamic = 'force-dynamic';

export default async function LitterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const litter = await prisma.litter.findUnique({
    where: { id },
    include: {
      pig: { include: { currentBeneficiary: true } },
      legacyReturns: { orderBy: { pigletId: 'asc' } }
    }
  });

  if (!litter) notFound();

  const returnedPiglets = litter.piglets.filter(p => p.status === 'AVAILABLE_FOR_REDISTRIBUTION' || p.status === 'REDISTRIBUTED').length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href={`/dashboard/pigs/${litter.pigId}`}
          className="p-2 text-[#5d6e64] hover:bg-[#e4ede6] rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold font-serif text-[#1c2b23]">Litter Management</h2>
          <p className="mt-1 text-sm text-[#5d6e64]">
            Mother: {litter.pig.tagNumber} • Born: {new Date(litter.dateOfBirth).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Repayment Progress */}
      <div className="bg-white rounded-xl shadow-sm border border-[#d9e1d8] p-6 mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-[#1c2b23] flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-[#2c5a43]" />
            Repayment Progress (3 Required)
          </h3>
          <span className="font-bold text-[#c9577a]">{returnedPiglets} / 3 Repaid</span>
        </div>
        <div className="w-full bg-[#f2f5f0] rounded-full h-2.5">
          <div className="bg-[#2c5a43] h-2.5 rounded-full" style={{ width: `${Math.min(100, (returnedPiglets / 3) * 100)}%` }}></div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-[#d9e1d8] overflow-hidden">
        <div className="p-4 border-b border-[#d9e1d8] bg-[#f2f5f0]">
          <h3 className="font-semibold text-[#1c2b23] flex items-center gap-2">
            <Baby className="h-5 w-5 text-[#c9577a]" />
            Piglets in Litter
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#d9e1d8]">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#5d6e64] uppercase tracking-wider">Piglet ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#5d6e64] uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[#5d6e64] uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#d9e1d8]">
              {litter.piglets.map(piglet => (
                <tr key={piglet.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-[#1c2b23]">{piglet.pigletId}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      piglet.status === 'WITH_MOTHER' ? 'bg-[#f2f5f0] text-[#5d6e64]' :
                      piglet.status === 'AVAILABLE_FOR_REDISTRIBUTION' ? 'bg-[#c9577a]/10 text-[#c9577a]' :
                      'bg-[#e4ede6] text-[#2c5a43]'
                    }`}>
                      {piglet.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {piglet.status === 'WITH_MOTHER' ? (
                      <form action={markPigletReturned}>
                        <input type="hidden" name="pigletId" value={piglet.id} />
                        <input type="hidden" name="beneficiaryId" value={litter.pig.currentBeneficiaryId || ''} />
                        <button type="submit" className="text-sm text-[#2c5a43] hover:underline font-medium">
                          Mark as Repaid to Fund
                        </button>
                      </form>
                    ) : (
                      <span className="text-sm text-[#9db0a4]">Repaid ✓</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
