import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, ShieldCheck, UserCheck, UserX, BarChart3, PieChart, Activity } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function UserAnalyticsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      lastLoginAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const totalUsers = users.length;
  const activeStaff = users.filter((u) => u.isActive).length;
  const inactiveStaff = totalUsers - activeStaff;

  // Role distribution map
  const roleCounts: Record<Role, number> = {
    SUPER_ADMIN: 0,
    PROJECT_MANAGER: 0,
    FIELD_OFFICER: 0,
    VETERINARIAN: 0,
    FINANCE_OFFICER: 0,
    TRAINER: 0,
    FUNDER: 0,
  };

  for (const user of users) {
    if (user.role in roleCounts) {
      roleCounts[user.role]++;
    }
  }

  const roleLabels: Record<Role, { label: string; description: string; color: string }> = {
    SUPER_ADMIN: { label: "Super Administrator", description: "Full administrative system access", color: "bg-purple-600" },
    PROJECT_MANAGER: { label: "Project Manager", description: "Operations and project monitoring", color: "bg-blue-600" },
    FIELD_OFFICER: { label: "Field Officer / Employee", description: "Beneficiaries, distributions, and returns", color: "bg-emerald-600" },
    VETERINARIAN: { label: "Veterinarian", description: "Pig health exams, vaccinations, and treatments", color: "bg-teal-600" },
    FINANCE_OFFICER: { label: "Finance Officer", description: "Income, expenses, and fund balance", color: "bg-amber-600" },
    TRAINER: { label: "Trainer", description: "Beneficiary education and training", color: "bg-indigo-600" },
    FUNDER: { label: "Funder", description: "Project monitoring and executive reports", color: "bg-rose-600" },
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/admin/users"
            className="p-2 text-[#5d6e64] hover:bg-[#e4ede6] rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5d6d64]">System Administration</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#1b2d24]">User Access & Role Analytics</h1>
            <p className="mt-1 text-sm text-[#5d6e64]">
              Graphical summary and distribution analysis of registered staff accounts and system permissions.
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/admin/users/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#2c5a43] px-4 py-2 text-sm font-medium text-white hover:bg-[#1c2b23] shadow-sm transition"
        >
          <Users className="h-4 w-4" />
          Register New User
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-5 sm:grid-cols-3">
        <div className="rounded-[24px] border border-[#dfe7df] bg-white p-5 shadow-[0_10px_24px_rgba(16,28,23,0.03)]">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e3efe7] text-[#173d2e]">
            <Users className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium text-[#5d6d64]">Total Registered Users</p>
          <p className="mt-3 text-3xl font-bold text-[#1b2d24] sm:text-4xl">{totalUsers}</p>
          <p className="mt-1 text-xs text-[#5d6e64]">Active system accounts</p>
        </div>

        <div className="rounded-[24px] border border-[#dfe7df] bg-white p-5 shadow-[0_10px_24px_rgba(16,28,23,0.03)]">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <UserCheck className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium text-[#5d6e64]">Active Staff Accounts</p>
          <p className="mt-3 text-3xl font-bold text-emerald-700 sm:text-4xl">{activeStaff}</p>
          <p className="mt-1 text-xs text-emerald-600">Currently authorized for access</p>
        </div>

        <div className="rounded-[24px] border border-[#dfe7df] bg-white p-5 shadow-[0_10px_24px_rgba(16,28,23,0.03)]">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-700">
            <UserX className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium text-[#5d6e64]">Inactive Accounts</p>
          <p className="mt-3 text-3xl font-bold text-rose-700 sm:text-4xl">{inactiveStaff}</p>
          <p className="mt-1 text-xs text-rose-600">Suspended or disabled staff</p>
        </div>
      </div>

      {/* Role Distribution Visual Section */}
      <div className="rounded-[24px] border border-[#dfe7df] bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3 border-b border-[#dfe7df] pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef3da] text-[#536334]">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#1b2d24]">User Role Distribution</h2>
            <p className="text-xs text-[#5d6e64]">Proportional allocation of staff across project permission levels.</p>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          {(Object.keys(roleCounts) as Role[]).map((roleKey) => {
            const count = roleCounts[roleKey];
            const percentage = totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0;
            const meta = roleLabels[roleKey];

            return (
              <div key={roleKey} className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#1b2d24]">{meta.label}</span>
                    <span className="text-xs text-[#5d6e64]">({roleKey})</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-semibold text-[#5d6e64]">
                    <span>{count} {count === 1 ? 'user' : 'users'}</span>
                    <span className="rounded-full bg-[#f2f5f0] px-2 py-0.5 text-[#1b2d24]">{percentage}%</span>
                  </div>
                </div>

                <p className="text-xs text-[#5d6e64]">{meta.description}</p>

                {/* Progress bar */}
                <div className="h-3 w-full overflow-hidden rounded-full bg-[#f2f5f0]">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${meta.color}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Staff Activity Summary */}
      <div className="rounded-[24px] border border-[#dfe7df] bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3 border-b border-[#dfe7df] pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e3efe7] text-[#173d2e]">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#1b2d24]">Staff Directory & Login Status</h2>
            <p className="text-xs text-[#5d6e64]">Overview of all registered users and their account status.</p>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-[#dfe7df]">
            <thead className="bg-[#f2f5f0]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#1b2d24] uppercase">Staff Member</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#1b2d24] uppercase">Email / Username</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#1b2d24] uppercase">Assigned Role</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#1b2d24] uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#1b2d24] uppercase">Last Login</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dfe7df] bg-white text-sm text-[#1b2d24]">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-[#f9faf8] transition-colors">
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-[#5d6e64]">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-[#e4ede6] px-2.5 py-1 text-xs font-semibold text-[#2c5a43]">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#5d6e64]">
                    {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'Never logged in'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
