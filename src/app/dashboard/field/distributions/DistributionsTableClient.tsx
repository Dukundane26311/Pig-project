"use client";

import { useMemo, useState } from "react";
import { Search, Calendar, X } from "lucide-react";
import { format } from "date-fns";

type DistributionRow = {
  id: string;
  distributionDate: string | Date;
  notes?: string | null;
  pig?: {
    tagNumber?: string | null;
  } | null;
  beneficiary?: {
    fullName?: string | null;
  } | null;
};

export function DistributionsTableClient({ initialDistributions }: { initialDistributions: DistributionRow[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const filteredDistributions = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return initialDistributions.filter((dist) => {
      // 1. Beneficiary search filter
      if (query && !dist.beneficiary?.fullName?.toLowerCase().includes(query)) {
        return false;
      }

      // 2. Specific date search filter
      if (dateFilter) {
        try {
          const distDateStr = format(new Date(dist.distributionDate), "yyyy-MM-dd");
          if (distDateStr !== dateFilter) {
            return false;
          }
        } catch {
          return false;
        }
      }

      return true;
    });
  }, [initialDistributions, searchTerm, dateFilter]);

  return (
    <div className="space-y-4">
      {/* Date Search & Beneficiary Search above the table */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        {/* Date search field */}
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-[#d9e1d8] shadow-sm">
          <Calendar className="h-4 w-4 text-[#2c5a43]" />
          <label htmlFor="distributionDateFilter" className="text-xs font-semibold text-[#5d6e64] whitespace-nowrap">
            Distribution Date:
          </label>
          <input
            type="date"
            id="distributionDateFilter"
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

        {/* Beneficiary name search */}
        <div className="relative w-full sm:max-w-xs">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-[#7d8d84]" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by beneficiary name..."
            className="w-full rounded-lg border border-[#d9e1d8] bg-white py-2 pl-9 pr-3 text-xs text-[#1c2b23] placeholder:text-[#7d8d84] focus:border-[#2c5a43] focus:outline-none focus:ring-2 focus:ring-[#2c5a43]/20 shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white shadow rounded-lg border border-[#d9e1d8] overflow-hidden">
        {filteredDistributions.length === 0 ? (
          <div className="p-8 text-center text-[#5d6e64]">
            <p>
              {dateFilter
                ? `No pigs found distributed on ${dateFilter}.`
                : "No matching distribution records found."}
            </p>
            {dateFilter && (
              <button
                type="button"
                onClick={() => setDateFilter("")}
                className="mt-2 text-xs text-[#2c5a43] underline font-medium hover:text-[#1c2b23]"
              >
                Clear date filter to see all distributions
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#d9e1d8]">
              <thead className="bg-[#f2f5f0]">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-[#1c2b23] uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-[#1c2b23] uppercase tracking-wider">Beneficiary</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-[#1c2b23] uppercase tracking-wider">Notes</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#d9e1d8]">
                {filteredDistributions.map((dist) => (
                  <tr key={dist.id} className="hover:bg-[#f8faf8] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1c2b23]">
                      {format(new Date(dist.distributionDate), "MMM d, yyyy")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1c2b23]">
                      {dist.beneficiary?.fullName ?? "Unknown beneficiary"}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#5d6e64]">
                      {dist.notes || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
