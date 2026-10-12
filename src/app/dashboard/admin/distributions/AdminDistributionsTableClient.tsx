"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Calendar, Search, X } from "lucide-react";
import Link from "next/link";

export type AdminDistributionRow = {
  dist: {
    id: string;
    distributionDate: string | Date;
    beneficiaryId: string;
    pig: {
      tagNumber: string;
      breed: string | null;
    };
    beneficiary: {
      id: string;
      fullName: string;
      beneficiaryNumber: string;
      districtStr: string | null;
    };
  };
  required: number;
  returned: number;
  outstanding: number;
  status: string;
};

interface AdminDistributionsTableClientProps {
  initialRows: AdminDistributionRow[];
}

export function AdminDistributionsTableClient({ initialRows }: AdminDistributionsTableClientProps) {
  const [dateFilter, setDateFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return initialRows.filter(({ dist }) => {
      if (q) {
        const matchesBeneficiary = dist.beneficiary.fullName.toLowerCase().includes(q) ||
          dist.beneficiary.beneficiaryNumber.toLowerCase().includes(q);
        const matchesTag = dist.pig.tagNumber.toLowerCase().includes(q);
        if (!matchesBeneficiary && !matchesTag) return false;
      }

      if (dateFilter) {
        try {
          const dStr = format(new Date(dist.distributionDate), "yyyy-MM-dd");
          if (dStr !== dateFilter) return false;
        } catch {
          return false;
        }
      }

      return true;
    });
  }, [initialRows, dateFilter, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Date Search & Beneficiary Filter above table */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        {/* Date search field */}
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-[#dfe7df] shadow-sm">
          <Calendar className="h-4 w-4 text-[#2c5a43]" />
          <label htmlFor="adminDateFilter" className="text-xs font-semibold text-[#5d6e64] whitespace-nowrap">
            Distribution Date:
          </label>
          <input
            type="date"
            id="adminDateFilter"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="text-xs text-[#1c2b23] bg-transparent focus:outline-none"
          />
          {dateFilter && (
            <button
              type="button"
              onClick={() => setDateFilter("")}
              title="Clear date filter"
              className="inline-flex items-center gap-1 text-xs text-[#2c5a43] hover:text-red-600 font-medium ml-1"
            >
              <X className="h-3.5 w-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Beneficiary search */}
        <div className="relative w-full sm:max-w-xs">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-[#7d8d84]" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search beneficiary or tag..."
            className="w-full rounded-lg border border-[#dfe7df] bg-white py-2 pl-9 pr-3 text-xs text-[#1c2b23] placeholder:text-[#7d8d84] focus:border-[#2c5a43] focus:outline-none focus:ring-2 focus:ring-[#2c5a43]/20 shadow-sm"
          />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50/75 px-5 py-3.5 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Two-Piglet Return Tracking Ledger</h2>
            <p className="text-xs text-slate-500">
              Each distributed pig creates a requirement of 2 returned piglets (Outstanding = 2 - Returned).
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          {filteredRows.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              <p>
                {dateFilter
                  ? `No pigs found distributed on ${dateFilter}.`
                  : "No matching distribution records found."}
              </p>
              {dateFilter && (
                <button
                  type="button"
                  onClick={() => setDateFilter("")}
                  className="mt-2 text-xs text-emerald-700 underline font-medium hover:text-emerald-900 cursor-pointer"
                >
                  Clear date filter to see all distributions
                </button>
              )}
            </div>
          ) : (
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50/75">
                <tr>
                  <th scope="col" className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Beneficiary
                  </th>
                  <th scope="col" className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Date
                  </th>
                  <th scope="col" className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Required
                  </th>
                  <th scope="col" className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Returned
                  </th>
                  <th scope="col" className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Outstanding
                  </th>
                  <th scope="col" className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Return Status
                  </th>
                  <th scope="col" className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredRows.map(({ dist, required, returned, outstanding, status }) => (
                  <tr key={dist.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <p className="text-sm font-semibold text-slate-900">{dist.beneficiary.fullName}</p>
                      <p className="text-xs text-slate-500">
                        {dist.beneficiary.beneficiaryNumber} &bull; {dist.beneficiary.districtStr ?? "Rwanda"}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs text-slate-600">
                      {format(new Date(dist.distributionDate), "MMM d, yyyy")}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-center text-xs font-bold text-slate-900">
                      {required}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-center text-xs font-bold text-emerald-700">
                      {returned}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-center text-xs font-bold text-rose-600">
                      {outstanding}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                          status === "Completed"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                            : status === "Partially Returned"
                            ? "bg-blue-50 text-blue-700 border-blue-200/60"
                            : "bg-rose-50 text-rose-700 border-rose-200/60"
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-right text-xs font-medium">
                      <Link
                        href={`/dashboard/admin/beneficiaries/${dist.beneficiary.id}`}
                        className="text-emerald-700 hover:text-emerald-900 font-semibold transition-colors"
                      >
                        View Family
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
