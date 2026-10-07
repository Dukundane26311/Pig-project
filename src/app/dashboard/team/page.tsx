import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Pencil, Plus, Trash2, Eye, EyeOff, Star, StarOff } from "lucide-react";
import { deleteTeamMember, toggleTeamMemberFeatured, toggleTeamMemberPublished } from "@/app/actions/team";

export const dynamic = "force-dynamic";

export default async function TeamManagementPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  const members = await prisma.teamMember.findMany({
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-[#1c2b23]">Team Members</h1>
          <p className="mt-1 text-sm text-[#5d6e64]">Manage the public team section and who appears on the website.</p>
        </div>
        <Link
          href="/dashboard/team/new"
          className="inline-flex items-center gap-2 rounded-lg bg-[#2c5a43] px-4 py-2 text-sm font-medium text-white hover:bg-[#1c2b23]"
        >
          <Plus className="h-4 w-4" />
          Add Team Member
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#d9e1d8] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#d9e1d8]">
            <thead className="bg-[#f2f5f0]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#1c2b23]">Name</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#1c2b23]">Role</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#1c2b23]">Status</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#1c2b23]">Featured</th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-[#1c2b23]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d9e1d8]">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-[#f2f5f0]">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e4ede6] text-sm font-bold text-[#2c5a43]">
                        {member.fullName.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase() || "TM"}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-[#1c2b23]">{member.fullName}</div>
                        <div className="text-xs text-[#5d6e64]">Order #{member.displayOrder}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-[#1c2b23]">{member.role}</td>
                  <td className="px-4 py-4">
                    <form action={toggleTeamMemberPublished.bind(null, member.id)}>
                      <button
                        type="submit"
                        className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          member.isPublished ? "bg-green-100 text-green-800" : "bg-[#e4ede6] text-[#5d6e64]"
                        }`}
                      >
                        {member.isPublished ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                        {member.isPublished ? "Published" : "Draft"}
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-4">
                    <form action={toggleTeamMemberFeatured.bind(null, member.id)}>
                      <button
                        type="submit"
                        className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          member.isFeatured ? "bg-[#fce7f3] text-[#9d3b60]" : "bg-[#f2f5f0] text-[#5d6e64]"
                        }`}
                      >
                        {member.isFeatured ? <Star className="h-3.5 w-3.5" /> : <StarOff className="h-3.5 w-3.5" />}
                        {member.isFeatured ? "Featured" : "Standard"}
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/dashboard/team/${member.id}/edit`}
                        className="inline-flex items-center gap-1 rounded-md border border-[#d9e1d8] bg-white px-2.5 py-1.5 text-xs font-medium text-[#1c2b23] hover:bg-[#f2f5f0]"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Link>
                      <form action={deleteTeamMember.bind(null, member.id)}>
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {members.length === 0 && (
          <div className="p-10 text-center text-sm text-[#5d6e64]">
            No team members have been added yet.
          </div>
        )}
      </div>
    </div>
  );
}
