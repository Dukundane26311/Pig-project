import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, ShieldCheck, UserCircle2, History } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { DeleteUserButton } from "./DeleteUserButton";

export const dynamic = 'force-dynamic';

export default async function UsersManagementPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'SUPER_ADMIN') {
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif text-[#1c2b23]">Users</h1>
          <p className="mt-1 text-sm text-[#5d6e64]">Manage system users and roles.</p>
        </div>

        <Link
          href="/dashboard/admin/users/new"
          className="inline-flex items-center gap-2 rounded-md bg-[#2c5a43] px-4 py-2 text-sm font-medium text-white hover:bg-[#1c2b23]"
        >
          <Plus className="h-4 w-4" />
          Add User
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-[#d9e1d8] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#d9e1d8] text-left text-sm text-[#1c2b23]">
            <thead className="bg-[#f5f7f4] text-xs uppercase tracking-wide text-[#5d6e64]">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf2ee]">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[#5d6e64]">
                    No users found yet.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-[#f9faf8]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e8f0eb] text-[#2c5a43]">
                          <UserCircle2 className="h-5 w-5" />
                        </span>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#384b42]">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2 rounded-full bg-[#edf3ef] px-2.5 py-1 text-xs font-medium text-[#1c2b23]">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#5d6e64]">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/history?userId=${user.id}`}
                          className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold text-[#2c5a43] hover:bg-[#e4ede6] hover:text-[#1c2b23] border border-[#cfe0d4] transition"
                          title={`View activity history for ${user.name}`}
                        >
                          <History className="h-3.5 w-3.5" />
                          <span>History</span>
                        </Link>
                        <DeleteUserButton
                          userId={user.id}
                          userName={user.name}
                          isCurrentUser={user.id === session.user.id}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
