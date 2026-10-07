// @ts-nocheck
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ArrowLeft, Plus, Baby, Activity } from "lucide-react";
import Link from "next/link";


export const dynamic = 'force-dynamic';

export default async function PigDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pig = await prisma.pig.findUnique({
    where: { id },
    include: {
      currentBeneficiary: true,
      litters: {
        include: { legacyReturns: true },
        orderBy: { dateOfBirth: 'desc' }
      },
      vetVisits: { orderBy: { date: 'desc' } }
    }
  });

  if (!pig) notFound();

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/pigs"
          className="p-2 text-[#5d6e64] hover:bg-[#e4ede6] rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold font-serif text-[#1c2b23]">Pig Profile: {pig.tagNumber}</h2>
          <p className="mt-1 text-sm text-[#5d6e64]">
            {pig.breed || 'Unknown breed'} ΓÇó {pig.sex} ΓÇó Current Status: 
            <span className="ml-2 px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#c9577a]/10 text-[#c9577a]">
              {pig.status.replace(/_/g, ' ')}
            </span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Details */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-[#d9e1d8] p-6">
            <h3 className="text-lg font-semibold text-[#1c2b23] mb-4 border-b border-[#d9e1d8] pb-2">Information</h3>
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-[#5d6e64]">Owner (Beneficiary)</dt>
                <dd className="font-medium text-[#1c2b23]">{pig.currentBeneficiary?.fullName || 'Unassigned'}</dd>
              </div>
              <div>
                <dt className="text-[#5d6e64]">Color / Description</dt>
                <dd className="font-medium text-[#1c2b23]">{pig.color || '-'}</dd>
              </div>
              <div>
                <dt className="text-[#5d6e64]">Source</dt>
                <dd className="font-medium text-[#1c2b23]">{pig.source || '-'}</dd>
              </div>
              <div>
                <dt className="text-[#5d6e64]">Purchase Price</dt>
                <dd className="font-medium text-[#1c2b23]">{pig.purchasePrice ? `${pig.purchasePrice} RWF` : '-'}</dd>
              </div>
              <div>
                <dt className="text-[#5d6e64]">Date Received</dt>
                <dd className="font-medium text-[#1c2b23]">{pig.dateReceived ? new Date(pig.dateReceived).toLocaleDateString() : '-'}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Right Column: Reproduction & Health */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Litters Section */}
          <div className="bg-white rounded-xl shadow-sm border border-[#d9e1d8] overflow-hidden">
            <div className="p-6 border-b border-[#d9e1d8] flex justify-between items-center bg-[#f2f5f0]">
              <div className="flex items-center gap-2">
                <Baby className="h-5 w-5 text-[#2c5a43]" />
                <h3 className="text-lg font-semibold text-[#1c2b23]">Reproduction (Litters)</h3>
              </div>
              {pig.sex === 'FEMALE' && (
                <Link
                  href={`/dashboard/litters/new?pigId=${pig.id}`}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded shadow-sm text-white bg-[#2c5a43] hover:bg-[#1c2b23]"
                >
                  <Plus className="h-4 w-4 mr-1" /> Record Birth
                </Link>
              )}
            </div>
            <div className="p-0">
              {pig.litters.length > 0 ? (
                <ul className="divide-y divide-[#d9e1d8]">
                  {pig.litters.map(litter => (
                    <li key={litter.id} className="p-6 hover:bg-gray-50 transition">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-[#1c2b23]">Born on {new Date(litter.dateOfBirth).toLocaleDateString()}</p>
                          <p className="text-sm text-[#5d6e64] mt-1">
                            {litter.numberBorn} born ΓÇó {litter.numberSurvived} survived ΓÇó {litter.numberLost} lost
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-[#c9577a]">{litter.piglets.length} active piglets</p>
                          <Link href={`/dashboard/litters/${litter.id}`} className="text-sm text-[#2c5a43] hover:underline mt-1 block">
                            Manage Piglets ΓåÆ
                          </Link>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-8 text-center text-[#5d6e64]">
                  No litters recorded yet.
                </div>
              )}
            </div>
          </div>

          {/* Vet Visits Section */}
          <div className="bg-white rounded-xl shadow-sm border border-[#d9e1d8] overflow-hidden">
            <div className="p-6 border-b border-[#d9e1d8] flex justify-between items-center bg-[#f2f5f0]">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-[#c9577a]" />
                <h3 className="text-lg font-semibold text-[#1c2b23]">Veterinary History</h3>
              </div>
              <Link
                href={`/veterinary/new?pigId=${pig.id}`}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded shadow-sm text-white bg-[#2c5a43] hover:bg-[#1c2b23]"
              >
                <Plus className="h-4 w-4 mr-1" /> Log Vet Visit
              </Link>
            </div>
            <div className="p-0">
              {pig.vetVisits.length > 0 ? (
                <ul className="divide-y divide-[#d9e1d8]">
                  {pig.vetVisits.map(visit => (
                    <li key={visit.id} className="p-6">
                      <p className="font-medium text-[#1c2b23]">{new Date(visit.date).toLocaleDateString()}</p>
                      <p className="text-sm text-[#5d6e64] mt-1">Status: {visit.healthStatus}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-8 text-center text-[#5d6e64]">
                  No veterinary visits recorded yet.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}