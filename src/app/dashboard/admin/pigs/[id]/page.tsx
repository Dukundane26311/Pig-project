import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Activity, PiggyBank, User, Calendar, MapPin, HeartPulse, FileText, Plus } from "lucide-react";
import Link from "next/link";
import { Role, PigStatus } from "@prisma/client";
import { getActiveUser } from "@/lib/active-user";

export const dynamic = 'force-dynamic';

function getStatusBadge(status: PigStatus) {
  switch (status) {
    case PigStatus.ACTIVE:
      return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">Available</span>;
    case PigStatus.REGISTERED:
      return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">Awaiting Inspection</span>;
    case PigStatus.DISTRIBUTED:
      return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Distributed</span>;
    case PigStatus.RETURNED:
    case PigStatus.RETURNED_PIGLETS:
      return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">Returned</span>;
    case PigStatus.DECEASED:
      return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">Deceased</span>;
    default:
      return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">{status}</span>;
  }
}

export default async function PigDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const activeUser = await getActiveUser([Role.SUPER_ADMIN, Role.FIELD_OFFICER, Role.VETERINARIAN]);
  if (!activeUser) {
    redirect("/dashboard");
  }

  const { id } = await params;
  const pig = await prisma.pig.findUnique({
    where: { id },
    include: {
      currentBeneficiary: true,
      distributions: {
        include: { beneficiary: true },
        orderBy: { distributionDate: 'desc' },
      },
      returns: {
        include: { beneficiary: true },
        orderBy: { returnDate: 'desc' },
      },
      vetVisits: {
        orderBy: { date: 'desc' },
        take: 10,
      },
      treatments: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!pig) notFound();

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/admin/pigs"
            className="p-2 text-[#5d6e64] hover:bg-[#e4ede6] rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold font-serif text-[#1c2b23]">Pig Profile: {pig.tagNumber}</h2>
              {getStatusBadge(pig.status)}
            </div>
            <p className="mt-1 text-sm text-[#5d6e64]">
              {pig.breed || 'Standard Breed'} • Sex: {pig.sex || 'Unknown'} • Health: {pig.healthStatus}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/vet/new?pigId=${pig.id}`}
            className="inline-flex items-center px-4 py-2 border border-[#d9e1d8] rounded-lg shadow-sm text-sm font-medium text-[#1c2b23] bg-white hover:bg-[#f2f5f0] transition-colors"
          >
            <HeartPulse className="h-4 w-4 mr-2 text-[#2c5a43]" />
            Record Vet Exam
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Details */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-[#d9e1d8] p-6">
            <h3 className="text-lg font-semibold text-[#1c2b23] mb-4 border-b border-[#d9e1d8] pb-2">
              Livestock Details
            </h3>
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-[#5d6e64]">Identification Tag</dt>
                <dd className="font-mono font-bold text-[#1c2b23]">{pig.tagNumber}</dd>
              </div>
              <div>
                <dt className="text-[#5d6e64]">Assigned Beneficiary</dt>
                <dd className="font-medium text-[#1c2b23]">
                  {pig.currentBeneficiary ? (
                    <Link href={`/dashboard/admin/beneficiaries/${pig.currentBeneficiary.id}`} className="text-[#2c5a43] hover:underline font-semibold flex items-center mt-1">
                      <User className="h-4 w-4 mr-1 text-[#2c5a43]" />
                      {pig.currentBeneficiary.fullName}
                    </Link>
                  ) : (
                    <span className="text-[#9db0a4] italic">Unassigned (In Project Herd)</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-[#5d6e64]">Breed & Sex</dt>
                <dd className="font-medium text-[#1c2b23]">{pig.breed || 'Unknown'} • {pig.sex || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-[#5d6e64]">Estimated Age / Weight</dt>
                <dd className="font-medium text-[#1c2b23]">
                  {pig.estimatedAge ? `${pig.estimatedAge} months` : 'Age unknown'} • {pig.currentWeight ? `${pig.currentWeight} kg` : 'Weight not recorded'}
                </dd>
              </div>
              <div>
                <dt className="text-[#5d6e64]">Source / Supplier</dt>
                <dd className="font-medium text-[#1c2b23]">{pig.source || 'Direct Procurement'}</dd>
              </div>
              <div>
                <dt className="text-[#5d6e64]">Current Location</dt>
                <dd className="font-medium text-[#1c2b23] flex items-center mt-0.5">
                  <MapPin className="h-3.5 w-3.5 mr-1 text-[#2c5a43]" />
                  {pig.currentLocation || 'Project Holding Facility'}
                </dd>
              </div>
              <div>
                <dt className="text-[#5d6e64]">Date Received</dt>
                <dd className="font-medium text-[#1c2b23] flex items-center mt-0.5">
                  <Calendar className="h-3.5 w-3.5 mr-1 text-[#9db0a4]" />
                  {pig.dateReceived ? new Date(pig.dateReceived).toLocaleDateString() : new Date(pig.createdAt).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </div>

          {pig.notes && (
            <div className="bg-white rounded-xl shadow-sm border border-[#d9e1d8] p-6">
              <h4 className="text-sm font-bold text-[#1c2b23] mb-3 flex items-center">
                <FileText className="h-4 w-4 mr-2 text-[#9db0a4]" /> Registration Notes
              </h4>
              <p className="text-sm text-[#5d6e64]">{pig.notes}</p>
            </div>
          )}
        </div>

        {/* Right Column: Distribution & Veterinary Timeline */}
        <div className="md:col-span-2 space-y-6">
          {/* Distribution History */}
          <div className="bg-white rounded-xl shadow-sm border border-[#d9e1d8] overflow-hidden">
            <div className="p-5 border-b border-[#d9e1d8] flex justify-between items-center bg-[#f2f5f0]">
              <div className="flex items-center gap-2">
                <PiggyBank className="h-5 w-5 text-[#2c5a43]" />
                <h3 className="text-base font-semibold text-[#1c2b23]">Distribution History & Commitments</h3>
              </div>
            </div>
            <div className="p-6">
              {pig.distributions.length > 0 ? (
                <div className="space-y-4">
                  {pig.distributions.map(dist => (
                    <div key={dist.id} className="p-4 bg-[#f2f5f0] rounded-lg border border-[#d9e1d8]">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-[#1c2b23]">
                            Distributed to {dist.beneficiary.fullName}
                          </div>
                          <div className="text-xs text-[#5d6e64] mt-0.5">
                            Beneficiary ID: {dist.beneficiary.beneficiaryNumber} • Location: {dist.beneficiary.districtStr || 'Beneficiary household'}
                          </div>
                        </div>
                        <div className="text-right text-xs text-[#9db0a4]">
                          {new Date(dist.distributionDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-[#d9e1d8] flex justify-between items-center text-xs">
                        <span className="text-[#5d6e64]">Revolving Obligation:</span>
                        <span className="font-bold text-[#2c5a43]">2 Returned Piglets Required</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#5d6e64]">No distribution recorded. Pig remains in project inventory.</p>
              )}
            </div>
          </div>

          {/* Veterinary Care History */}
          <div className="bg-white rounded-xl shadow-sm border border-[#d9e1d8] overflow-hidden">
            <div className="p-5 border-b border-[#d9e1d8] flex justify-between items-center bg-[#f2f5f0]">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-[#2c5a43]" />
                <h3 className="text-base font-semibold text-[#1c2b23]">Veterinary Clinical History</h3>
              </div>
              <Link
                href={`/dashboard/vet/new?pigId=${pig.id}`}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-[#2c5a43] hover:bg-[#1c2b23]"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Log Examination
              </Link>
            </div>
            <div>
              {pig.vetVisits.length > 0 ? (
                <ul className="divide-y divide-[#d9e1d8]">
                  {pig.vetVisits.map(visit => (
                    <li key={visit.id} className="p-5 hover:bg-gray-50 transition">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-[#1c2b23]">
                            {visit.treatment || 'Clinical Inspection & Assessment'}
                          </div>
                          <div className="text-sm text-[#5d6e64] mt-1">
                            Status Outcome: <span className="font-semibold text-[#1c2b23]">{visit.healthStatus}</span>
                          </div>
                          {visit.recommendations && (
                            <div className="text-xs text-[#9db0a4] mt-1 italic">
                              &ldquo;{visit.recommendations}&rdquo;
                            </div>
                          )}
                        </div>
                        <div className="text-right text-xs text-[#9db0a4]">
                          {new Date(visit.date).toLocaleDateString()}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-6 text-center text-sm text-[#5d6e64]">
                  No clinical visits recorded yet.
                </div>
              )}
            </div>
          </div>

          {/* Returned Piglets */}
          {pig.returns.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-[#d9e1d8] p-6">
              <h3 className="text-base font-semibold text-[#1c2b23] mb-4">Returned Offspring from this Lineage</h3>
              <div className="space-y-3">
                {pig.returns.map(ret => (
                  <div key={ret.id} className="p-3 bg-[#f2f5f0] rounded-lg border border-[#d9e1d8] flex justify-between items-center text-sm">
                    <div>
                      <span className="font-medium text-[#1c2b23]">{ret.quantity} Piglet(s) returned</span>
                      <span className="text-xs text-[#5d6e64] block">Beneficiary: {ret.beneficiary.fullName}</span>
                    </div>
                    <span className="text-xs text-[#9db0a4]">{new Date(ret.returnDate).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}