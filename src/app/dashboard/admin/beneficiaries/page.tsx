import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Search, Users, Shield, MapPin, Phone } from "lucide-react";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { getActiveUser } from "@/lib/active-user";

export const dynamic = 'force-dynamic';

function maskNationalId(nid: string | null | undefined): string {
  if (!nid) return "Not provided";
  const trimmed = nid.trim();
  if (trimmed.length <= 6) return "••••••";
  return `${trimmed.substring(0, 5)}••••••${trimmed.substring(trimmed.length - 2)}`;
}

export default async function BeneficiariesPage() {
  const activeUser = await getActiveUser([Role.SUPER_ADMIN, Role.FIELD_OFFICER]);
  if (!activeUser) {
    redirect("/dashboard");
  }

  const isSuperAdmin = activeUser.role === Role.SUPER_ADMIN;

  const beneficiaries = await prisma.beneficiary.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      distributions: {
        select: { id: true },
      },
      returns: {
        select: { quantity: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-serif text-[#1c2b23]">Beneficiaries</h2>
          <p className="mt-1 text-sm text-[#5d6e64]">
            Manage eligible beneficiary families participating in the revolving livestock fund.
          </p>
        </div>
        <Link 
          href="/dashboard/admin/beneficiaries/new"
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#2c5a43] hover:bg-[#1c2b23] transition-colors"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Add Beneficiary
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
              placeholder="Search by name, ID, or district..."
              className="block w-full pl-10 pr-3 py-2 border border-[#d9e1d8] rounded-lg focus:ring-2 focus:ring-[#2c5a43] focus:border-[#2c5a43] sm:text-sm bg-[#f2f5f0] text-[#1c2b23]"
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-[#5d6e64] bg-[#f2f5f0] px-3 py-1.5 rounded-lg border border-[#d9e1d8]">
            <Shield className="h-3.5 w-3.5 text-[#2c5a43]" />
            <span>Privacy Protection Active: National IDs masked for compliance</span>
          </div>
        </div>

        {beneficiaries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#d9e1d8]">
              <thead className="bg-[#f2f5f0]">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[#5d6e64] uppercase tracking-wider">
                    Beneficiary & ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[#5d6e64] uppercase tracking-wider">
                    National ID (Masked)
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[#5d6e64] uppercase tracking-wider">
                    Administrative Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[#5d6e64] uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[#5d6e64] uppercase tracking-wider">
                    Fund Progress
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[#5d6e64] uppercase tracking-wider">
                    Joined Date
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#d9e1d8]">
                {beneficiaries.map((b) => {
                  const distributedPigs = b.distributions.length;
                  const returnedCount = b.returns.reduce((sum, r) => sum + r.quantity, 0);

                  return (
                    <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#e4ede6] flex items-center justify-center text-[#2c5a43] font-bold">
                            {b.fullName.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-[#1c2b23]">{b.fullName}</div>
                            <div className="text-xs font-mono text-[#5d6e64]">{b.beneficiaryNumber}</div>
                            {b.phone && (
                              <div className="text-xs text-[#9db0a4] flex items-center mt-0.5">
                                <Phone className="h-3 w-3 mr-1" />
                                {b.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs font-mono bg-[#f2f5f0] px-2 py-1 rounded border border-[#d9e1d8] text-[#1c2b23]">
                          {isSuperAdmin && b.nationalId ? b.nationalId : maskNationalId(b.nationalId)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[#1c2b23] flex items-center">
                          <MapPin className="h-3.5 w-3.5 mr-1 text-[#2c5a43]" />
                          {b.districtStr || 'Rwanda'}
                        </div>
                        <div className="text-xs text-[#5d6e64]">
                          {[b.sectorStr, b.cellStr, b.villageStr].filter(Boolean).join(", ") || 'Location registered'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          b.status === 'ACTIVE' 
                            ? 'bg-[#e4ede6] text-[#2c5a43]' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {b.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-[#5d6e64]">
                        <div>Pigs: <span className="font-semibold text-[#1c2b23]">{distributedPigs}</span></div>
                        <div>Piglets Ret: <span className="font-semibold text-[#2c5a43]">{returnedCount}</span></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5d6e64]">
                        {new Date(b.registrationDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link href={`/dashboard/admin/beneficiaries/${b.id}`} className="text-[#2c5a43] hover:text-[#1c2b23] font-semibold">
                          Profile →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center sm:p-12">
            <Users className="mx-auto h-12 w-12 text-[#9db0a4] mb-4" />
            <h3 className="text-lg font-medium text-[#1c2b23] mb-1">No beneficiaries registered yet</h3>
            <p className="text-[#5d6e64] mb-4">Get started by registering a new eligible beneficiary family.</p>
            <Link 
              href="/dashboard/admin/beneficiaries/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#2c5a43] hover:bg-[#1c2b23]"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" />
              Add Beneficiary
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
