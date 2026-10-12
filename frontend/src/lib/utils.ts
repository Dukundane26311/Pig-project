import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr?: string | null, fmt = "dd MMM yyyy"): string {
  if (!dateStr) return "—";
  try {
    return format(parseISO(dateStr), fmt);
  } catch {
    return dateStr;
  }
}

export function formatCurrency(amount: string | number, currency = "RWF"): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "—";
  return new Intl.NumberFormat("en-RW", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num) + ` ${currency}`;
}

export function formatNumber(n: number | string): string {
  const num = typeof n === "string" ? parseInt(n) : n;
  if (isNaN(num)) return "0";
  return new Intl.NumberFormat("en").format(num);
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-800",
    REPAID: "bg-blue-100 text-blue-800",
    HEALTHY: "bg-green-100 text-green-800",
    COMPLETED: "bg-blue-100 text-blue-800",
    APPROVED: "bg-green-100 text-green-800",
    PENDING: "bg-yellow-100 text-yellow-800",
    PENDING_APPROVAL: "bg-yellow-100 text-yellow-800",
    SICK: "bg-red-100 text-red-800",
    CRITICAL: "bg-red-100 text-red-800",
    DECEASED: "bg-gray-100 text-gray-600",
    INACTIVE: "bg-gray-100 text-gray-600",
    SUSPENDED: "bg-orange-100 text-orange-700",
    OVERDUE: "bg-red-100 text-red-800",
    REJECTED: "bg-red-100 text-red-800",
    PREGNANT: "bg-purple-100 text-purple-800",
    DISTRIBUTED: "bg-teal-100 text-teal-800",
    AVAILABLE: "bg-emerald-100 text-emerald-800",
    WITH_MOTHER: "bg-green-100 text-green-800",
    GROWING: "bg-lime-100 text-lime-800",
    DRAFT: "bg-gray-100 text-gray-700",
  };
  return map[status] ?? "bg-gray-100 text-gray-600";
}

export function truncate(str: string, length = 100): string {
  return str.length > length ? str.slice(0, length) + "…" : str;
}
