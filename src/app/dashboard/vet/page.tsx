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
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-[20px] border border-[#dfe7df] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#5d6d64]">Awaiting Inspection</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#fef3c7] text-[#92400e]">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-[#92400e]">{pigsAwaitingInspection}</p>
          <p className="mt-1 text-xs text-[#7a8a82]">Incoming pigs in queue</p>
        </div>

        <div className="rounded-[20px] border border-[#dfe7df] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#5d6d64]">Returned Piglets</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e7f0fb] text-[#2d5b78]">
              <RefreshCw className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-[#2d5b78]">{returnedPigletsAwaitingCheck}</p>
          <p className="mt-1 text-xs text-[#7a8a82]">Awaiting health clearance</p>
        </div>

        <div className="rounded-[20px] border border-[#dfe7df] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#5d6d64]">Healthy Animals</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e3efe7] text-[#173d2e]">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-[#173d2e]">{healthyPigs}</p>
          <p className="mt-1 text-xs text-[#7a8a82]">Cleared & distribution-ready</p>
        </div>

        <div className="rounded-[20px] border border-[#dfe7df] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#5d6d64]">Under Treatment</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f7e3ea] text-[#a44d67]">
              <HeartPulse className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-[#a44d67]">{pigsUnderTreatment}</p>
          <p className="mt-1 text-xs text-[#7a8a82]">Sick or in therapy</p>
        </div>

        <div className="rounded-[20px] border border-[#dfe7df] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#5d6d64]">Deceased Cases</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f3f4f6] text-[#4b5563]">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-[#4b5563]">{deceasedPigs}</p>
          <p className="mt-1 text-xs text-[#7a8a82]">Reported mortalities</p>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="rounded-[24px] border border-[#dfe7df] bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-[#1b2d24]">Veterinary Operational Workflows</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map(({ label, href, icon: Icon, count }) => (
            <Link
              key={label}
              href={href}
              className="flex items-center justify-between rounded-xl border border-[#dfe7df] bg-[#fcfdfc] p-4 hover:border-[#173d2e] hover:bg-[#e4efe6]/30 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e3efe7] text-[#173d2e]">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-semibold text-[#1b2d24] group-hover:text-[#173d2e]">{label}</span>
              </div>
              {typeof count === "number" && count > 0 && (
                <span className="rounded-full bg-[#92400e] px-2 py-0.5 text-xs font-bold text-white">
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
