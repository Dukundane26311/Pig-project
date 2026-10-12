import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Search, PiggyBank, HeartPulse, User } from "lucide-react";
import { Role, PigStatus } from "@prisma/client";
import { redirect } from "next/navigation";
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
      return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">Returned Offspring</span>;
    case PigStatus.DECEASED:
      return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">Deceased</span>;
    default:
      return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">{status}</span>;
  }
}

export default async function PigsPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string }>;
}) {
  const activeUser = await getActiveUser([Role.SUPER_ADMIN, Role.FIELD_OFFICER, Role.VETERINARIAN]);
  if (!activeUser) {
    redirect("/dashboard");
  }

  const resolvedParams = searchParams ? await searchParams : {};
  const statusFilter = resolvedParams.status as PigStatus | undefined;

  const whereClause = statusFilter && Object.values(PigStatus).includes(statusFilter)
    ? { status: statusFilter }
    : {};

  const [pigs, totalCount, availableCount, distributedCount, awaitingVetCount] = await Promise.all([
    prisma.pig.findMany({
      where: whereClause,
      include: {
        currentBeneficiary: {
          select: { fullName: true, beneficiaryNumber: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.pig.count(),
    prisma.pig.count({ where: { status: PigStatus.ACTIVE } }),
    prisma.pig.count({ where: { status: PigStatus.DISTRIBUTED } }),
    prisma.pig.count({ where: { status: PigStatus.REGISTERED } }),
  ]);

  const displayAvailable = availableCount;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-serif text-[#1c2b23]">Pig Inventory & Livestock Registry</h2>
          <p className="mt-1 text-sm text-[#5d6e64]">
            Track received pigs, health clearances, distributions, and returned offspring.
          </p>
        </div>
        <Link 
          href="/dashboard/admin/pigs/new"
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#2c5a43] hover:bg-[#1c2b23] transition-colors"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Receive / Register Pig
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/dashboard/admin/pigs" className="bg-white p-4 rounded-xl border border-[#d9e1d8] hover:border-[#2c5a43] transition-colors">
          <div className="text-xs font-semibold text-[#5d6e64] uppercase">Total Herd Registered</div>
          <div className="text-2xl font-bold font-serif text-[#1c2b23] mt-1">{totalCount}</div>
        </Link>
        <Link href="/dashboard/admin/pigs?status=ACTIVE" className="bg-white p-4 rounded-xl border border-[#d9e1d8] hover:border-emerald-600 transition-colors">
          <div className="text-xs font-semibold text-emerald-700 uppercase">Available for Distribution</div>
          <div className="text-2xl font-bold font-serif text-emerald-800 mt-1">{displayAvailable}</div>
        </Link>
        <Link href="/dashboard/admin/pigs?status=DISTRIBUTED" className="bg-white p-4 rounded-xl border border-[#d9e1d8] hover:border-blue-600 transition-colors">
          <div className="text-xs font-semibold text-blue-700 uppercase">Distributed with Families</div>
          <div className="text-2xl font-bold font-serif text-blue-800 mt-1">{distributedCount}</div>
        </Link>
        <Link href="/dashboard/admin/pigs?status=REGISTERED" className="bg-white p-4 rounded-xl border border-[#d9e1d8] hover:border-amber-600 transition-colors">
          <div className="text-xs font-semibold text-amber-700 uppercase">Awaiting Vet Clearance</div>
          <div className="text-2xl font-bold font-serif text-amber-800 mt-1">{awaitingVetCount}</div>
        </Link>
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-[#d9e1d8] overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-center border-b border-[#d9e1d8] p-4 gap-4">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-[#9db0a4]" />
            </div>
            <input
              type="text"
              placeholder="Search by ID, breed, or beneficiary..."
              className="block w-full pl-10 pr-3 py-2 border border-[#d9e1d8] rounded-lg focus:ring-2 focus:ring-[#2c5a43] focus:border-[#2c5a43] sm:text-sm bg-[#f2f5f0] text-[#1c2b23]"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto text-xs">
            <Link
              href="/dashboard/admin/pigs"
              className={`px-3 py-1.5 rounded-lg border font-medium ${
                !statusFilter ? 'bg-[#2c5a43] text-white border-[#2c5a43]' : 'bg-[#f2f5f0] text-[#5d6e64] border-[#d9e1d8]'
              }`}
            >
              All ({totalCount})
            </Link>
            <Link
              href="/dashboard/admin/pigs?status=ACTIVE"
              className={`px-3 py-1.5 rounded-lg border font-medium ${
                statusFilter === PigStatus.ACTIVE ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-[#f2f5f0] text-[#5d6e64] border-[#d9e1d8]'
              }`}
            >
              Available ({availableCount})
            </Link>
            <Link
              href="/dashboard/admin/pigs?status=DISTRIBUTED"
              className={`px-3 py-1.5 rounded-lg border font-medium ${
                statusFilter === PigStatus.DISTRIBUTED ? 'bg-blue-700 text-white border-blue-700' : 'bg-[#f2f5f0] text-[#5d6e64] border-[#d9e1d8]'
              }`}
            >
              Distributed ({distributedCount})
            </Link>
            <Link
              href="/dashboard/admin/pigs?status=REGISTERED"
              className={`px-3 py-1.5 rounded-lg border font-medium ${
                statusFilter === PigStatus.REGISTERED ? 'bg-amber-700 text-white border-amber-700' : 'bg-[#f2f5f0] text-[#5d6e64] border-[#d9e1d8]'
              }`}
            >
              Pending Vet ({awaitingVetCount})
            </Link>
          </div>
        </div>

        {pigs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#d9e1d8]">
              <thead className="bg-[#f2f5f0]">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[#5d6e64] uppercase tracking-wider">
                    Tag / ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[#5d6e64] uppercase tracking-wider">
                    Breed & Sex
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[#5d6e64] uppercase tracking-wider">
                    Assigned Beneficiary
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[#5d6e64] uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[#5d6e64] uppercase tracking-wider">
                    Health
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[#5d6e64] uppercase tracking-wider">
                    Date Received
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">View</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#d9e1d8]">
                {pigs.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-9 w-9 rounded-full bg-[#e4ede6] flex items-center justify-center text-[#2c5a43]">
                          <PiggyBank className="h-4 w-4" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-semibold font-mono text-[#1c2b23]">{p.tagNumber}</div>
                          <div className="text-xs text-[#9db0a4]">{p.source || 'Standard Receiving'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1c2b23]">
                      <div>{p.breed || 'Standard'}</div>
                      <div className="text-xs text-[#5d6e64]">{p.sex}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {p.currentBeneficiary ? (
                        <div>
                          <div className="font-medium text-[#1c2b23] flex items-center">
                            <User className="h-3.5 w-3.5 mr-1 text-[#2c5a43]" />
                            {p.currentBeneficiary.fullName}
                          </div>
                          <div className="text-xs font-mono text-[#9db0a4]">{p.currentBeneficiary.beneficiaryNumber}</div>
                        </div>
                      ) : (
                        <span className="text-xs text-[#9db0a4] italic">Not assigned (In Project Herd)</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(p.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="inline-flex items-center text-xs font-medium text-[#5d6e64]">
                        <HeartPulse className="h-3.5 w-3.5 mr-1 text-[#2c5a43]" />
                        {p.healthStatus || 'Pending Exam'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5d6e64]">
                      {p.dateReceived ? new Date(p.dateReceived).toLocaleDateString() : new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/dashboard/admin/pigs/${p.id}`} className="text-[#2c5a43] hover:text-[#1c2b23] font-semibold">
                        View Profile →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center sm:p-12">
            <PiggyBank className="mx-auto h-12 w-12 text-[#9db0a4] mb-4" />
            <h3 className="text-lg font-medium text-[#1c2b23] mb-1">No livestock records found</h3>
            <p className="text-[#5d6e64] mb-4">Register new incoming pigs or check other status filters.</p>
            <Link 
              href="/dashboard/admin/pigs/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#2c5a43] hover:bg-[#1c2b23]"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" />
              Register Pig
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
