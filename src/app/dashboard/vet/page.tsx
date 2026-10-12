import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { 
  Stethoscope, Clock, HeartPulse, RefreshCw, AlertTriangle, 
  PlusCircle, CheckCircle2, FileText
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function VetDashboard() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "VETERINARIAN" && session.user.role !== "SUPER_ADMIN")) {
    redirect("/dashboard");
  }

  const [
    pigsAwaitingInspection,
    healthyPigs,
    pigsUnderTreatment,
    returnedPigletsAwaitingCheck,
    deceasedPigs,
  ] = await Promise.all([
    // Newly received pigs registered & awaiting first vet check
    prisma.pig.count({
      where: { status: "REGISTERED", deletedAt: null },
    }),
    prisma.pig.count({
      where: { healthStatus: "HEALTHY", deletedAt: null },
    }),
    prisma.pig.count({
      where: { healthStatus: { in: ["SICK", "UNDER_TREATMENT", "CRITICAL"] }, deletedAt: null },
    }),
    prisma.pigReturn.count({
      where: { veterinaryVerified: false },
    }),
    prisma.pig.count({
      where: { status: "DECEASED", deletedAt: null },
    }),
  ]);

  const quickActions = [
    { label: "Returned Piglets", href: "/dashboard/vet/returned", icon: RefreshCw, count: returnedPigletsAwaitingCheck },
    { label: "Record Health Exam", href: "/dashboard/vet/veterinary/new", icon: PlusCircle },
    { label: "All Vet Records", href: "/dashboard/vet/veterinary", icon: Stethoscope },
    { label: "Veterinary Reports", href: "/dashboard/vet/reports", icon: FileText },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5d6e64]">Veterinary Health Workspace</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#1b2d24]">
          Welcome back, Dr. {session.user.name}
        </h1>
        <p className="mt-1 text-sm text-[#5d6e64]">
          Inspect incoming pigs, clear returned piglets for redistribution, and record medical diagnoses and treatments.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-xl border border-slate-200/80 bg-white p-4.5 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Awaiting Inspection</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-amber-700">{pigsAwaitingInspection}</p>
          <p className="mt-0.5 text-xs text-slate-500">Incoming pigs in queue</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-4.5 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Returned Piglets</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <RefreshCw className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-blue-700">{returnedPigletsAwaitingCheck}</p>
          <p className="mt-0.5 text-xs text-slate-500">Awaiting health clearance</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-4.5 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Healthy Animals</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-emerald-700">{healthyPigs}</p>
          <p className="mt-0.5 text-xs text-slate-500">Cleared & distribution-ready</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-4.5 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Under Treatment</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-700">
              <HeartPulse className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-rose-700">{pigsUnderTreatment}</p>
          <p className="mt-0.5 text-xs text-slate-500">Sick or in therapy</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-4.5 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Deceased Cases</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-700">{deceasedPigs}</p>
          <p className="mt-0.5 text-xs text-slate-500">Reported mortalities</p>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900">Veterinary Operational Workflows</h2>
        <div className="mt-3.5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map(({ label, href, icon: Icon, count }) => (
            <Link
              key={label}
              href={href}
              className="flex items-center justify-between rounded-lg border border-slate-200/80 bg-slate-50/50 p-3.5 hover:border-emerald-600/50 hover:bg-white hover:shadow-xs transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-xs font-semibold text-slate-800 group-hover:text-emerald-800">{label}</span>
              </div>
              {typeof count === "number" && count > 0 && (
                <span className="rounded-full bg-amber-600 px-2 py-0.5 text-[10px] font-bold text-white">
                  {count}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
