"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { format } from "date-fns";

type ReturnRow = {
  id: string;
  returnDate: string | Date;
  quantity?: number | null;
  notes?: string | null;
  beneficiary?: {
    fullName?: string | null;
  } | null;
};

export function ReturnsTableClient({ initialReturns }: { initialReturns: ReturnRow[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredReturns = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return initialReturns;
    }

    return initialReturns.filter((ret) =>
      ret.beneficiary?.fullName?.toLowerCase().includes(query)
    );
  }, [initialReturns, searchTerm]);

  return (
    <>
      <div className="flex justify-end">
        <div className="relative w-full max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-[#7d8d84]" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by beneficiary name..."
            className="w-full rounded-lg border border-[#d9e1d8] bg-[#f2f5f0] py-2.5 pl-9 pr-3 text-sm text-[#1c2b23] placeholder:text-[#7d8d84] focus:border-[#2c5a43] focus:outline-none focus:ring-2 focus:ring-[#2c5a43]/20"
          />
        </div>
      </div>

      <div className="bg-white shadow rounded-lg border border-[#d9e1d8] overflow-hidden">
        {filteredReturns.length === 0 ? (
          <div className="p-8 text-center text-[#5d6e64]">
            <p>No matching beneficiary found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#d9e1d8]">
              <thead className="bg-[#f2f5f0]">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-[#1c2b23] uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-[#1c2b23] uppercase tracking-wider">Beneficiary</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-[#1c2b23] uppercase tracking-wider">Number of Pigs</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-[#1c2b23] uppercase tracking-wider">Notes</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#d9e1d8]">
                {filteredReturns.map((ret) => (
                  <tr key={ret.id} className="hover:bg-[#f8faf8] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1c2b23]">
                      {format(new Date(ret.returnDate), "MMM d, yyyy")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1c2b23] font-medium">
                      {ret.beneficiary?.fullName ?? "Unknown beneficiary"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1c2b23]">
                      {ret.quantity ?? 0}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#5d6e64]">
                      {ret.notes || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
