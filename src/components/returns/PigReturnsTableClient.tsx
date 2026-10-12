"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Calendar, Search, X, Plus, AlertTriangle, 
  CheckCircle2, Clock, Activity, ArrowLeftCircle
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { PigReturnDateSummary } from "@/app/actions/returns";

interface PigReturnsTableClientProps {
  records: PigReturnDateSummary[];
  totalPigletsReturned: number;
  cumulativeExamined: number;
  notYetExamined: number;
  totalSickIdentified: number;
  newRecordHref: string;
}

export function PigReturnsTableClient({
  records,
  totalPigletsReturned,
  cumulativeExamined,
  notYetExamined,
  totalSickIdentified,
  newRecordHref,
}: PigReturnsTableClientProps) {
  const [dateFilter, setDateFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // Date filter
      if (dateFilter && r.date !== dateFilter) {
        return false;
      }
      // Text search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesDate = r.date.toLowerCase().includes(query);
        const matchesDisease = r.diseaseDescription.toLowerCase().includes(query);
        const matchesTreatment = r.treatmentDescription.toLowerCase().includes(query);
        if (!matchesDate && !matchesDisease && !matchesTreatment) {
          return false;
        }
      }
      return true;
    });
  }, [records, dateFilter, searchTerm]);

  const clearFilters = () => {
    setDateFilter("");
    setSearchTerm("");
  };

  const formatDateDisplay = (dateStr: string) => {
    try {
      const parsed = parseISO(dateStr);
      return format(parsed, "MMM d, yyyy");
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Pig Return Records</h2>
          <p className="mt-1 text-xs text-slate-500">
            Date-based summary of revolving piglets returned by beneficiaries and health assessments.
          </p>
        </div>
        <Link 
          href={newRecordHref}
          className="inline-flex items-center justify-center px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-[#064e3b] hover:bg-[#053d2e] shadow-xs transition-all"
        >
          <Plus className="-ml-0.5 mr-1.5 h-3.5 w-3.5" />
          Record Return
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200/80 bg-white p-4.5 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Piglets Returned</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <ArrowLeftCircle className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{totalPigletsReturned}</p>
          <p className="mt-0.5 text-xs text-slate-500">Received from beneficiaries</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-4.5 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Cumulative Piglets Examined</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-emerald-700">{cumulativeExamined}</p>
          <p className="mt-0.5 text-xs text-slate-500">Clinically inspected & assessed</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-4.5 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Piglets Not Yet Examined</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-amber-700">{notYetExamined}</p>
          <p className="mt-0.5 text-xs text-slate-500">Awaiting clinical verification</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-4.5 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Sick Piglets Identified</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-700">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-rose-700">{totalSickIdentified}</p>
          <p className="mt-0.5 text-xs text-slate-500">Quarantined / in therapy</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
          {/* Date Picker Filter */}
          <div className="relative min-w-[220px]">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5d6e64]">
              <Calendar className="h-4 w-4" />
            </div>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="block w-full pl-10 pr-3.5 py-2 text-sm border border-[#d9e1d8] rounded-xl bg-[#fcfdfc] text-[#1c2b23] focus:border-[#2c5a43] focus:outline-none focus:ring-2 focus:ring-[#2c5a43]/20"
              placeholder="Filter by return date..."
            />
          </div>

          {/* Keyword Search */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5d6e64]">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search diseases, treatments, or date..."
              className="block w-full pl-10 pr-3.5 py-2 text-sm border border-[#d9e1d8] rounded-xl bg-[#fcfdfc] text-[#1c2b23] placeholder:text-[#9db0a4] focus:border-[#2c5a43] focus:outline-none focus:ring-2 focus:ring-[#2c5a43]/20"
            />
          </div>

          {/* Clear Filter Button */}
          {(dateFilter || searchTerm) && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#5d6e64] hover:text-[#1c2b23] bg-[#f2f5f0] hover:bg-[#e4ede6] transition shrink-0"
            >
              <X className="h-3.5 w-3.5" />
              <span>Clear Filter</span>
            </button>
          )}
        </div>

        <div className="text-xs font-medium text-[#5d6e64]">
          Showing <span className="font-bold text-[#1c2b23]">{filteredRecords.length}</span> of{" "}
          <span className="font-bold text-[#1c2b23]">{records.length}</span> return dates
        </div>
      </div>

      {/* Date-based Summary Table */}
      <div className="bg-white shadow-sm rounded-2xl border border-[#d9e1d8] overflow-hidden">
        {filteredRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#d9e1d8]">
              <thead className="bg-[#f2f5f0]">
                <tr>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-[#1c2b23]">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-[#1c2b23]">
                    Number of Piglets Returned
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-[#1c2b23]">
                    Number Not Yet Examined
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-[#1c2b23]">
                    Number of Sick Piglets
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-[#1c2b23]">
                    Disease Description
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-[#1c2b23]">
                    Treatment Description
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d9e1d8] bg-white">
                {filteredRecords.map((row) => (
                  <tr key={row.date} className="hover:bg-[#f8faf8] transition-colors">
                    {/* 1. Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[#1c2b23]">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-[#5d6e64]" />
                        <span>{formatDateDisplay(row.date)}</span>
                      </div>
                      <span className="text-xs text-[#7a8a82] ml-6 block font-mono">{row.date}</span>
                    </td>

                    {/* 2. Number of Piglets Returned */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#e3efe7] text-[#173d2e]">
                        {row.pigletsReturned}
                      </span>
                    </td>

                    {/* 3. Number Not Yet Examined */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#fef3c7] text-[#92400e]">
                        {row.notYetExamined}
                      </span>
                    </td>

                    {/* 4. Number of Sick Piglets */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                          row.sickPiglets > 0
                            ? "bg-[#fee2e2] text-[#b91c1c]"
                            : "bg-[#f3f4f6] text-[#4b5563]"
                        }`}
                      >
                        {row.sickPiglets}
                      </span>
                    </td>

                    {/* 5. Disease Description */}
                    <td className="px-6 py-4 text-sm text-[#1c2b23] max-w-xs break-words">
                      {row.diseaseDescription || "-"}
                    </td>

                    {/* 6. Treatment Description */}
                    <td className="px-6 py-4 text-sm text-[#5d6e64] max-w-xs break-words">
                      {row.treatmentDescription || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center sm:p-14">
            <ArrowLeftCircle className="mx-auto h-12 w-12 text-[#9db0a4] mb-3" />
            <h3 className="text-base font-semibold text-[#1c2b23] mb-1">
              {dateFilter || searchTerm ? "No matching return records" : "No piglet return records found"}
            </h3>
            <p className="text-xs text-[#5d6e64] max-w-md mx-auto mb-5">
              {dateFilter || searchTerm
                ? "No return entries match the selected date or search filter. Try clearing your filters."
                : "No revolving piglet returns have been recorded in the system yet."}
            </p>
            {dateFilter || searchTerm ? (
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-4 py-2 border border-[#d9e1d8] rounded-xl text-xs font-semibold text-[#1c2b23] bg-white hover:bg-[#f2f5f0] transition shadow-sm"
              >
                Clear Date Filter
              </button>
            ) : (
              <Link
                href={newRecordHref}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl text-xs font-semibold text-white bg-[#2c5a43] hover:bg-[#1c2b23] transition shadow-sm"
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Record Return
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
