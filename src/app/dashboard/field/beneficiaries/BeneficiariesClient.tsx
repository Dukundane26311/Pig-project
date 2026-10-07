"use client";

import Link from "next/link";
import { Search, Users } from "lucide-react";
import { useMemo, useState } from "react";

type Beneficiary = {
  id: string;
  fullName: string;
  beneficiaryNumber: string;
  districtStr: string | null;
  sectorStr: string | null;
  cellStr: string | null;
  status: string;
  registrationDate: string | Date;
};

export function BeneficiariesClient({
  initialBeneficiaries,
  initialQuery,
}: {
  initialBeneficiaries: Beneficiary[];
  initialQuery: string;
}) {
  const [searchTerm, setSearchTerm] = useState(initialQuery);

  const filteredBeneficiaries = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return initialBeneficiaries;

    return initialBeneficiaries.filter((beneficiary) => {
      const haystack = [
        beneficiary.fullName,
        beneficiary.beneficiaryNumber,
        beneficiary.districtStr,
        beneficiary.sectorStr,
        beneficiary.cellStr,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [initialBeneficiaries, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-serif text-[#1c2b23]">Beneficiaries</h2>
          <p className="mt-1 text-sm text-[#5d6e64]">Manage families participating in the revolving fund.</p>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-[#d9e1d8] overflow-hidden">
        <div className="p-4 border-b border-[#d9e1d8] flex gap-4">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-[#9db0a4]" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by name, ID, or district..."
              className="block w-full pl-10 pr-3 py-2 border border-[#d9e1d8] rounded-lg focus:ring-2 focus:ring-[#c9577a] focus:border-[#c9577a] sm:text-sm bg-[#f2f5f0] text-[#1c2b23]"
            />
          </div>
        </div>

        {filteredBeneficiaries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#d9e1d8]">
              <thead className="bg-[#f2f5f0]">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#5d6e64] uppercase tracking-wider">Beneficiary</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#5d6e64] uppercase tracking-wider">Location</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#5d6e64] uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#5d6e64] uppercase tracking-wider">Joined Date</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">Edit</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#d9e1d8]">
                {filteredBeneficiaries.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#e4ede6] flex items-center justify-center text-[#2c5a43] font-bold">
                          {b.fullName.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-[#1c2b23]">{b.fullName}</div>
                          <div className="text-sm text-[#5d6e64]">{b.beneficiaryNumber}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[#1c2b23]">{b.districtStr}</div>
                      <div className="text-sm text-[#5d6e64]">{b.sectorStr}, {b.cellStr}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#e4ede6] text-[#2c5a43]">
                        {b.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5d6e64]">
                      {new Date(b.registrationDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/dashboard/field/beneficiaries/${b.id}`} className="text-[#c9577a] hover:text-[#a63a3a]">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Users className="mx-auto h-12 w-12 text-[#9db0a4] mb-4" />
            <h3 className="text-lg font-medium text-[#1c2b23] mb-1">No beneficiaries match your search</h3>
            <p className="text-[#5d6e64]">Try another name, ID, or district.</p>
          </div>
        )}
      </div>
    </div>
  );
}
