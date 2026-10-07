// @ts-nocheck
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Phone, Calendar, FileText, Activity, PiggyBank, Repeat, RotateCcw } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function BeneficiaryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const beneficiary = await prisma.beneficiary.findUnique({
    where: { id },
    include: {
      pigs: true,
      legacyReturns: true,
      distributions: { include: { pig: true } },
      legacyRepayments: true,
      fieldVisits: {
        orderBy: { date: 'desc' },
        take: 5
      }
    }
  });

  if (!beneficiary) {
    notFound();
  }

  // Calculate Revolving Fund Stats
  const pigsReceived = beneficiary.distributions.length;
  const pigletsReturned = beneficiary.legacyReturns.length;
  // Assume each pig received requires 3 piglets to be returned
  const expectedReturn = pigsReceived * 3;
  const outstandingReturn = Math.max(0, expectedReturn - pigletsReturned);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/dashboard/field/beneficiaries"
          className="p-2 text-[#5d6e64] hover:bg-[#e4ede6] rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold font-serif text-[#1c2b23]">Beneficiary Profile</h2>
          <p className="mt-1 text-sm text-[#5d6e64]">{beneficiary.currentBeneficiaryId}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-[#d9e1d8] overflow-hidden">
            <div className="bg-[#2c5a43] h-24"></div>
            <div className="px-6 pb-6 relative">
              <div className="h-20 w-20 bg-white rounded-full p-1 absolute -top-10 border-4 border-[#f2f5f0]">
                <div className="h-full w-full bg-[#e4ede6] rounded-full flex items-center justify-center text-[#2c5a43] text-2xl font-bold">
                  {beneficiary.fullName.charAt(0)}
                </div>
              </div>
              <div className="mt-12">
                <h3 className="text-xl font-bold text-[#1c2b23]">{beneficiary.fullName}</h3>
                <span className="inline-flex mt-2 px-2.5 py-1 text-xs font-semibold rounded-full bg-[#e4ede6] text-[#2c5a43]">
                  {beneficiary.status.replace(/_/g, ' ')}
                </span>
              </div>
              
              <div className="mt-6 space-y-4">
                <div className="flex items-center text-sm text-[#5d6e64]">
                  <Phone className="h-4 w-4 mr-3 text-[#9db0a4]" />
                  {beneficiary.phone || 'No phone provided'}
                </div>
                <div className="flex items-center text-sm text-[#5d6e64]">
                  <MapPin className="h-4 w-4 mr-3 text-[#9db0a4]" />
                  {beneficiary.district}, {beneficiary.sector}
                  <br />
                  {beneficiary.cell}, {beneficiary.village}
                </div>
                <div className="flex items-center text-sm text-[#5d6e64]">
                  <Calendar className="h-4 w-4 mr-3 text-[#9db0a4]" />
                  Joined {new Date(beneficiary.registrationDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-[#d9e1d8] p-6">
            <h4 className="text-sm font-bold text-[#1c2b23] mb-4 flex items-center">
              <RotateCcw className="h-4 w-4 mr-2 text-[#2c5a43]" /> Revolving Fund Summary
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#5d6e64]">Pigs Received:</span>
                <span className="font-bold text-[#1c2b23]">{pigsReceived}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#5d6e64]">Piglets Returned:</span>
                <span className="font-bold text-[#1c2b23]">{pigletsReturned}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-[#d9e1d8] pt-2">
                <span className="text-[#5d6e64] font-semibold">Outstanding Returns:</span>
                <span className={`font-bold ${outstandingReturn > 0 ? 'text-[#c9577a]' : 'text-[#2c5a43]'}`}>
                  {outstandingReturn}
                </span>
              </div>
            </div>
          </div>
          
          {beneficiary.notes && (
            <div className="bg-white rounded-xl shadow-sm border border-[#d9e1d8] p-6">
              <h4 className="text-sm font-bold text-[#1c2b23] mb-3 flex items-center">
                <FileText className="h-4 w-4 mr-2 text-[#9db0a4]" /> Internal Notes
              </h4>
              <p className="text-sm text-[#5d6e64]">{beneficiary.notes}</p>
            </div>
          )}
        </div>

        {/* Right Column: Assets & History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-[#d9e1d8] p-6">
            <h3 className="text-lg font-bold text-[#1c2b23] mb-4">Assigned Pigs</h3>
            {beneficiary.pigs.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {beneficiary.pigs.map(pig => (
                  <Link href={`/dashboard/field/pigs/${pig.id}`} key={pig.id} className="block p-4 border border-[#d9e1d8] rounded-lg hover:bg-[#f2f5f0] transition-colors">
                    <div className="font-medium text-[#2c5a43]">{pig.tagNumber}</div>
                    <div className="text-sm text-[#5d6e64] mt-1">{pig.breed} • {pig.sex}</div>
                    <div className="text-xs text-[#9db0a4] mt-2">Health: {pig.healthStatus || 'Unknown'}</div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#5d6e64]">No pigs assigned yet.</p>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-[#d9e1d8] p-6">
            <h3 className="text-lg font-bold text-[#1c2b23] mb-4">Distribution History</h3>
            {beneficiary.distributions.length > 0 ? (
              <div className="space-y-4">
                {beneficiary.distributions.map(dist => (
                  <div key={dist.id} className="flex gap-4 p-4 bg-[#f2f5f0] rounded-lg border border-[#d9e1d8]">
                    <div className="bg-white p-2 rounded-md h-10 w-10 flex items-center justify-center border border-[#d9e1d8]">
                      <PiggyBank className="h-5 w-5 text-[#2c5a43]" />
                    </div>
                    <div>
                      <div className="font-medium text-[#1c2b23]">Received Pig {dist.pig.tagNumber}</div>
                      <div className="text-xs text-[#9db0a4] mt-1">{new Date(dist.date).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#5d6e64]">No distributions recorded.</p>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-[#d9e1d8] p-6">
            <h3 className="text-lg font-bold text-[#1c2b23] mb-4">Recent Field Visits</h3>
            {beneficiary.fieldVisits.length > 0 ? (
              <div className="space-y-4">
                {beneficiary.fieldVisits.map(visit => (
                  <div key={visit.id} className="flex gap-4 p-4 bg-[#f2f5f0] rounded-lg border border-[#d9e1d8]">
                    <div className="bg-white p-2 rounded-md h-10 w-10 flex items-center justify-center border border-[#d9e1d8]">
                      <Activity className="h-5 w-5 text-[#2c5a43]" />
                    </div>
                    <div>
                      <div className="font-medium text-[#1c2b23]">{visit.purpose}</div>
                      <div className="text-sm text-[#5d6e64] mt-1">{visit.observations}</div>
                      <div className="text-xs text-[#9db0a4] mt-2">{new Date(visit.date).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#5d6e64]">No field visits recorded.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
