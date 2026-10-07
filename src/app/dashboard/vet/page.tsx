import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ClipboardList, Cross, Stethoscope, Syringe } from "lucide-react";

export default async function VetDashboard() {
  const session = await getServerSession(authOptions);

  const quickActions = [
    { label: "Exam queue", href: "/dashboard/vet/examinations", icon: Stethoscope },
    { label: "Health records", href: "/dashboard/vet/records", icon: ClipboardList },
    { label: "Vaccinations", href: "/dashboard/vet/vaccinations", icon: Syringe },
    { label: "Treatments", href: "/dashboard/vet/treatments", icon: Cross },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5d6d64]">Veterinary team</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1b2d24]">Welcome back, {session?.user?.name}</h1>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[24px] border border-[#dfe7df] bg-white p-5 shadow-[0_10px_24px_rgba(16,28,23,0.03)]">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e3efe7] text-[#173d2e]">
            <Stethoscope className="h-5 w-5" />
          </div>
          <p className="kpi-label">Pending exams</p>
          <p className="mt-3 text-4xl font-bold text-[#1b2d24]">—</p>
        </div>

        <div className="rounded-[24px] border border-[#dfe7df] bg-white p-5 shadow-[0_10px_24px_rgba(16,28,23,0.03)]">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef3da] text-[#536334]">
            <ClipboardList className="h-5 w-5" />
          </div>
          <p className="kpi-label">Follow-ups</p>
          <p className="mt-3 text-4xl font-bold text-[#1b2d24]">—</p>
        </div>
      </div>

      <div className="rounded-[28px] border border-[#dfe7df] bg-white p-6 shadow-[0_10px_24px_rgba(16,28,23,0.03)]">
        <h2 className="text-xl font-semibold text-[#1b2d24]">Health workflow</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map(({ label, href, icon: Icon }) => (
            <a key={label} href={href} className="rounded-[20px] border border-[#dfe7df] bg-[#f8faf8] p-4 hover:border-[#173d2e] hover:bg-[#f2f7f3]">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#e3efe7] text-[#173d2e]">
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-sm font-semibold text-[#1b2d24]">{label}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
