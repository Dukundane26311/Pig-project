"use client";

import { useMemo, useState } from "react";
import {
  History,
  Calendar,
  Search,
  X,
  Filter,
  User,
  Shield,
  Eye,
  ArrowRight,
  Info,
  CheckCircle2,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import {
  formatRole,
  formatModule,
  formatActivity,
  getRecordReference,
  formatChangeDescription,
} from "@/lib/audit-format";

export interface SerializedAuditLog {
  id: string;
  userId: string | null;
  role: string | null;
  action: string;
  entity: string;
  entityId: string;
  previousValue: any;
  newValue: any;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
}

interface Props {
  initialLogs: SerializedAuditLog[];
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  isAdmin: boolean;
  targetUserFilter?: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  allUsers?: {
    id: string;
    name: string;
    email: string;
    role: string;
  }[];
}

export function HistoricalRecordsClient({
  initialLogs,
  currentUser,
  isAdmin,
  targetUserFilter,
  allUsers = [],
}: Props) {
  const [logs] = useState<SerializedAuditLog[]>(initialLogs);
  const [dateFilter, setDateFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [moduleFilter, setModuleFilter] = useState<string>("ALL");
  const [selectedUserId, setSelectedUserId] = useState<string>(
    targetUserFilter ? targetUserFilter.id : ""
  );

  // Modal inspection state
  const [inspectedLog, setInspectedLog] = useState<SerializedAuditLog | null>(null);

  // Filter computation
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // 1. Date filter (comparing YYYY-MM-DD in local time)
      if (dateFilter) {
        const logDate = new Date(log.createdAt);
        const yyyy = logDate.getFullYear();
        const mm = String(logDate.getMonth() + 1).padStart(2, "0");
        const dd = String(logDate.getDate()).padStart(2, "0");
        const logDateStr = `${yyyy}-${mm}-${dd}`;
        if (logDateStr !== dateFilter) return false;
      }

      // 2. User filter (for Admin)
      if (isAdmin && selectedUserId) {
        if (log.userId !== selectedUserId) return false;
      }

      // 3. Module filter
      if (moduleFilter !== "ALL") {
        const mod = formatModule(log.entity).toLowerCase();
        if (mod !== moduleFilter.toLowerCase()) return false;
      }

      // 4. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const userName = (log.user?.name || "").toLowerCase();
        const userEmail = (log.user?.email || "").toLowerCase();
        const ref = getRecordReference(log).toLowerCase();
        const act = formatActivity(log.action, log.entity).toLowerCase();
        const desc = formatChangeDescription(log).toLowerCase();
        const mod = formatModule(log.entity).toLowerCase();
        const entityId = (log.entityId || "").toLowerCase();

        const match =
          userName.includes(q) ||
          userEmail.includes(q) ||
          ref.includes(q) ||
          act.includes(q) ||
          desc.includes(q) ||
          mod.includes(q) ||
          entityId.includes(q);

        if (!match) return false;
      }

      return true;
    });
  }, [logs, dateFilter, selectedUserId, moduleFilter, searchQuery, isAdmin]);

  // Unique module list for filter dropdown
  const moduleOptions = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((l) => set.add(formatModule(l.entity)));
    return Array.from(set).sort();
  }, [logs]);

  // Clear all filters
  const handleClearFilters = () => {
    setDateFilter("");
    setSearchQuery("");
    setModuleFilter("ALL");
    if (isAdmin) {
      setSelectedUserId("");
    }
  };

  const hasActiveFilters = Boolean(
    dateFilter || searchQuery || moduleFilter !== "ALL" || (isAdmin && selectedUserId)
  );

  const selectedTargetUser = useMemo(() => {
    if (!isAdmin || !selectedUserId) return null;
    return allUsers.find((u) => u.id === selectedUserId) || targetUserFilter;
  }, [isAdmin, selectedUserId, allUsers, targetUserFilter]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <History className="h-5 w-5 text-emerald-700" /> Historical Records
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            {isAdmin
              ? "Comprehensive audit trail and activity history across all users and modules."
              : `Activity history recorded for your account (${currentUser.name || currentUser.email}).`}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <Shield className="h-3.5 w-3.5 text-emerald-700" />
          <span>Immutable System Audit Trail</span>
        </div>
      </div>

      {/* Target User Banner if filtered */}
      {selectedTargetUser && (
        <div className="flex items-center justify-between rounded-xl border border-[#cfe0d4] bg-[#eef4f0] p-4 text-sm text-[#1c2b23] shadow-xs animate-fade-in">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2c5a43] text-white">
              <User className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold text-sm">
                Filtering activities for: <span className="text-[#2c5a43]">{selectedTargetUser.name}</span>{" "}
                <span className="text-xs font-normal text-[#5d6e64]">({selectedTargetUser.email})</span>
              </p>
              <p className="text-xs text-[#5d6e64]">
                Role: <span className="font-medium text-[#1c2b23]">{formatRole(selectedTargetUser.role)}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSelectedUserId("")}
            className="text-xs font-semibold text-[#2c5a43] hover:underline hover:text-[#1c2b23] px-3 py-1.5 rounded-lg border border-[#cfe0d4] bg-white transition"
          >
            Show All Users
          </button>
        </div>
      )}

      {/* Controls & Filter Bar */}
      <div className="bg-white rounded-xl shadow-xs border border-[#d9e1d8] p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Date Filter */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#5d6e64] mb-1.5 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-[#2c5a43]" /> Search by Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-[#d9e1d8] rounded-lg text-sm text-[#1c2b23] bg-[#fbfcfb] focus:ring-1 focus:ring-[#2c5a43] focus:border-[#2c5a43]"
              />
              {dateFilter && (
                <button
                  type="button"
                  onClick={() => setDateFilter("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9db0a4] hover:text-[#1c2b23]"
                  title="Clear date"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* 2. Search Text */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#5d6e64] mb-1.5 flex items-center gap-1.5">
              <Search className="h-3.5 w-3.5 text-[#2c5a43]" /> Search Records
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Name, ref, keyword..."
                className="block w-full px-3 py-2 border border-[#d9e1d8] rounded-lg text-sm text-[#1c2b23] bg-[#fbfcfb] focus:ring-1 focus:ring-[#2c5a43] focus:border-[#2c5a43]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9db0a4] hover:text-[#1c2b23]"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* 3. Module Filter */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#5d6e64] mb-1.5 flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-[#2c5a43]" /> Module / Page
            </label>
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-[#d9e1d8] rounded-lg text-sm text-[#1c2b23] bg-[#fbfcfb] focus:ring-1 focus:ring-[#2c5a43] focus:border-[#2c5a43]"
            >
              <option value="ALL">All Modules</option>
              {moduleOptions.map((mod) => (
                <option key={mod} value={mod}>
                  {mod}
                </option>
              ))}
            </select>
          </div>

          {/* 4. User Filter (Admin only) */}
          {isAdmin ? (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5d6e64] mb-1.5 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-[#2c5a43]" /> Filter by User
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="block w-full px-3 py-2 border border-[#d9e1d8] rounded-lg text-sm text-[#1c2b23] bg-[#fbfcfb] focus:ring-1 focus:ring-[#2c5a43] focus:border-[#2c5a43]"
              >
                <option value="">All Users</option>
                {allUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({formatRole(u.role)})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-end">
              <div className="text-xs text-[#5d6e64] bg-[#f8faf8] border border-[#d9e1d8] rounded-lg p-2.5 w-full">
                Viewing personal activity history. Total logged:{" "}
                <span className="font-bold text-[#1c2b23]">{logs.length}</span>
              </div>
            </div>
          )}
        </div>

        {/* Clear Filters bar */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-[#edf2ee] text-xs">
            <span className="text-[#5d6e64]">
              Found <strong className="text-[#1c2b23]">{filteredLogs.length}</strong> matching record(s) out of{" "}
              {logs.length} total.
            </span>
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-[#2c5a43] hover:text-[#1c2b23] font-semibold hover:underline inline-flex items-center gap-1"
            >
              <RotateCcwIcon className="h-3.5 w-3.5" /> Clear all filters &amp; view all history
            </button>
          </div>
        )}
      </div>

      {/* Activity History Table */}
      <div className="bg-white shadow-xs rounded-xl border border-[#d9e1d8] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#d9e1d8]">
            <thead className="bg-[#f2f5f0]">
              <tr>
                <th scope="col" className="px-5 py-3.5 text-left text-xs font-bold text-[#1c2b23] uppercase tracking-wider">
                  Date and Time
                </th>
                <th scope="col" className="px-5 py-3.5 text-left text-xs font-bold text-[#1c2b23] uppercase tracking-wider">
                  User Name
                </th>
                <th scope="col" className="px-5 py-3.5 text-left text-xs font-bold text-[#1c2b23] uppercase tracking-wider">
                  User Role
                </th>
                <th scope="col" className="px-5 py-3.5 text-left text-xs font-bold text-[#1c2b23] uppercase tracking-wider">
                  Activity Performed
                </th>
                <th scope="col" className="px-5 py-3.5 text-left text-xs font-bold text-[#1c2b23] uppercase tracking-wider">
                  Module / Page
                </th>
                <th scope="col" className="px-5 py-3.5 text-left text-xs font-bold text-[#1c2b23] uppercase tracking-wider">
                  Record ID / Ref
                </th>
                <th scope="col" className="px-5 py-3.5 text-left text-xs font-bold text-[#1c2b23] uppercase tracking-wider">
                  Description of Changes
                </th>
                <th scope="col" className="px-5 py-3.5 text-right text-xs font-bold text-[#1c2b23] uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#edf2ee]">
              {filteredLogs.map((log) => {
                const activityText = formatActivity(log.action, log.entity);
                const moduleText = formatModule(log.entity);
                const reference = getRecordReference(log);
                const description = formatChangeDescription(log);
                const roleFormatted = formatRole(log.role || log.user?.role);
                const dateObj = new Date(log.createdAt);

                return (
                  <tr key={log.id} className="hover:bg-[#f9faf8] transition-colors">
                    {/* Date and Time */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs text-[#1c2b23]">
                      <div className="font-semibold">{format(dateObj, "MMM d, yyyy")}</div>
                      <div className="text-[#5d6e64] font-mono text-[11px]">{format(dateObj, "HH:mm:ss")}</div>
                    </td>

                    {/* User Name */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs">
                      <div className="font-semibold text-[#1c2b23]">{log.user?.name || "System Actor"}</div>
                      <div className="text-[11px] text-[#5d6e64]">{log.user?.email || "Automated"}</div>
                    </td>

                    {/* User Role */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#eef3da] text-[#536334]">
                        {roleFormatted}
                      </span>
                    </td>

                    {/* Activity Performed */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#e4ede6] text-[#2c5a43] border border-[#cfe0d4]">
                        {activityText}
                      </span>
                    </td>

                    {/* Module / Page */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs font-medium text-[#1c2b23]">
                      <span className="inline-block px-2 py-0.5 rounded bg-[#f2f5f0] text-[#1c2b23] border border-[#d9e1d8] text-[11px]">
                        {moduleText}
                      </span>
                    </td>

                    {/* Record ID or Reference */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs font-mono text-[#384b42]">
                      <span className="truncate max-w-[120px] inline-block" title={reference}>
                        {reference}
                      </span>
                    </td>

                    {/* Description of Changes */}
                    <td className="px-5 py-3.5 text-xs text-[#5d6e64] max-w-xs">
                      <p className="line-clamp-2 leading-relaxed" title={description}>
                        {description}
                      </p>
                    </td>

                    {/* Details Action */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-right text-xs">
                      <button
                        type="button"
                        onClick={() => setInspectedLog(log)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-[#2c5a43] hover:text-[#1c2b23] hover:bg-[#e4ede6] rounded transition"
                      >
                        <Eye className="h-3.5 w-3.5" /> View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="p-12 text-center text-sm text-[#5d6e64]">
            <History className="h-10 w-10 text-[#9db0a4] mx-auto mb-3" />
            <h3 className="text-base font-semibold text-[#1c2b23]">No activities found</h3>
            <p className="mt-1 text-xs text-[#5d6e64] max-w-sm mx-auto">
              {hasActiveFilters
                ? "No historical records match your selected filter criteria. Try adjusting the date, module, or search query."
                : "No historical activity records have been recorded yet."}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#2c5a43] hover:text-[#1c2b23] border border-[#d9e1d8] rounded-lg bg-white hover:bg-[#f2f5f0] transition"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Detailed Audit Modal */}
      {inspectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-[#d9e1d8] w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-in">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#d9e1d8] px-6 py-4 bg-[#f8faf8]">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-[#2c5a43]" />
                <h3 className="font-serif font-bold text-lg text-[#1c2b23]">
                  Activity Record Details
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectedLog(null)}
                className="text-[#9db0a4] hover:text-[#1c2b23] p-1 rounded-full hover:bg-[#e4ede6] transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5 overflow-y-auto">
              {/* Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-[#f8faf8] border border-[#d9e1d8] text-xs">
                <div>
                  <span className="text-[#5d6e64] block font-medium">Timestamp</span>
                  <span className="font-semibold text-[#1c2b23]">
                    {format(new Date(inspectedLog.createdAt), "MMM d, yyyy HH:mm:ss")}
                  </span>
                </div>
                <div>
                  <span className="text-[#5d6e64] block font-medium">Actor</span>
                  <span className="font-semibold text-[#1c2b23]">
                    {inspectedLog.user?.name || "System"}
                  </span>
                </div>
                <div>
                  <span className="text-[#5d6e64] block font-medium">Role</span>
                  <span className="font-semibold text-[#2c5a43]">
                    {formatRole(inspectedLog.role || inspectedLog.user?.role)}
                  </span>
                </div>
                <div>
                  <span className="text-[#5d6e64] block font-medium">Module</span>
                  <span className="font-semibold text-[#1c2b23]">
                    {formatModule(inspectedLog.entity)}
                  </span>
                </div>
              </div>

              {/* Activity & Reference */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#5d6e64]">
                    Activity Action
                  </span>
                  <span className="px-2.5 py-1 text-xs font-bold rounded bg-[#e4ede6] text-[#2c5a43] border border-[#cfe0d4]">
                    {formatActivity(inspectedLog.action, inspectedLog.entity)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#5d6e64] font-medium">Target Record Reference:</span>
                  <span className="font-mono font-semibold text-[#1c2b23]">
                    {getRecordReference(inspectedLog)} ({inspectedLog.entityId})
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-[#5d6e64] mb-1">
                  Change Description
                </span>
                <p className="text-sm text-[#1c2b23] bg-[#fdfefe] p-3 rounded-lg border border-[#d9e1d8] leading-relaxed">
                  {formatChangeDescription(inspectedLog)}
                </p>
              </div>

              {/* Before and After Diffs */}
              <div className="space-y-3">
                {inspectedLog.previousValue && (
                  <div>
                    <span className="block text-xs font-semibold uppercase tracking-wider text-[#c9577a] mb-1">
                      Previous Value (Before Change)
                    </span>
                    <pre className="text-xs font-mono p-3 rounded-lg bg-[#fbf5f7] border border-[#f5c6cb] text-[#721c24] overflow-x-auto max-h-40">
                      {JSON.stringify(inspectedLog.previousValue, null, 2)}
                    </pre>
                  </div>
                )}

                {inspectedLog.newValue && (
                  <div>
                    <span className="block text-xs font-semibold uppercase tracking-wider text-[#2c5a43] mb-1">
                      New Value (Recorded State)
                    </span>
                    <pre className="text-xs font-mono p-3 rounded-lg bg-[#f0f6f2] border border-[#cfe0d4] text-[#1c2b23] overflow-x-auto max-h-48">
                      {JSON.stringify(inspectedLog.newValue, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-[#d9e1d8] px-6 py-3 bg-[#f8faf8] text-xs text-[#5d6e64]">
              <span>Audit ID: <code className="font-mono text-[11px]">{inspectedLog.id}</code></span>
              <button
                type="button"
                onClick={() => setInspectedLog(null)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-[#2c5a43] hover:bg-[#1c2b23] rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RotateCcwIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}
