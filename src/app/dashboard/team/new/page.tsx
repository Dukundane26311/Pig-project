import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { createTeamMember } from "@/app/actions/team";

export const dynamic = "force-dynamic";

export default async function NewTeamMemberPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/team" className="text-[#5d6e64] hover:text-[#1c2b23]">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-serif text-[#1c2b23]">Add Team Member</h1>
          <p className="mt-1 text-sm text-[#5d6e64]">Add a new published team profile for the public website.</p>
        </div>
      </div>

      <div className="rounded-xl border border-[#d9e1d8] bg-white p-6 shadow-sm">
        <form action={createTeamMember} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-[#1c2b23]">Full Name *</label>
              <input name="fullName" required className="w-full rounded-md border border-[#d9e1d8] p-2.5 focus:border-[#2c5a43] focus:ring-[#2c5a43]" placeholder="Jane Doe" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[#1c2b23]">Role *</label>
              <input name="role" required className="w-full rounded-md border border-[#d9e1d8] p-2.5 focus:border-[#2c5a43] focus:ring-[#2c5a43]" placeholder="Veterinarian" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[#1c2b23]">Specialization</label>
              <input name="specialization" className="w-full rounded-md border border-[#d9e1d8] p-2.5 focus:border-[#2c5a43] focus:ring-[#2c5a43]" placeholder="Animal Health" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[#1c2b23]">Email</label>
              <input type="email" name="email" className="w-full rounded-md border border-[#d9e1d8] p-2.5 focus:border-[#2c5a43] focus:ring-[#2c5a43]" placeholder="name@valueprotocols.rw" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[#1c2b23]">Phone</label>
              <input name="phone" className="w-full rounded-md border border-[#d9e1d8] p-2.5 focus:border-[#2c5a43] focus:ring-[#2c5a43]" placeholder="+250 78..." />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[#1c2b23]">LinkedIn URL</label>
              <input name="linkedinUrl" className="w-full rounded-md border border-[#d9e1d8] p-2.5 focus:border-[#2c5a43] focus:ring-[#2c5a43]" placeholder="https://linkedin.com/in/..." />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[#1c2b23]">Display Order</label>
              <input type="number" name="displayOrder" defaultValue={0} className="w-full rounded-md border border-[#d9e1d8] p-2.5 focus:border-[#2c5a43] focus:ring-[#2c5a43]" />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-[#1c2b23]">Profile Photo</label>
              <input type="file" name="photo" accept="image/*" className="w-full rounded-md border border-[#d9e1d8] p-2.5 file:mr-3 file:rounded file:border-0 file:bg-[#e4ede6] file:px-3 file:py-2 file:text-sm file:font-medium file:text-[#2c5a43]" />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-[#1c2b23]">Professional Bio</label>
              <textarea name="bio" rows={5} className="w-full rounded-md border border-[#d9e1d8] p-2.5 focus:border-[#2c5a43] focus:ring-[#2c5a43]" placeholder="Describe the team member's experience and responsibilities." />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            <label className="flex items-center gap-2 text-sm text-[#1c2b23]"><input type="checkbox" name="isPublished" defaultChecked /> Publish publicly</label>
            <label className="flex items-center gap-2 text-sm text-[#1c2b23]"><input type="checkbox" name="isFeatured" /> Mark as featured</label>
            <label className="flex items-center gap-2 text-sm text-[#1c2b23]"><input type="checkbox" name="showEmailPublic" /> Show email publicly</label>
            <label className="flex items-center gap-2 text-sm text-[#1c2b23]"><input type="checkbox" name="showPhonePublic" /> Show phone publicly</label>
            <label className="flex items-center gap-2 text-sm text-[#1c2b23]"><input type="checkbox" name="showLinkedinPublic" /> Show LinkedIn publicly</label>
          </div>

          <div className="flex justify-end gap-3">
            <Link href="/dashboard/team" className="rounded-md border border-[#d9e1d8] bg-white px-4 py-2 text-sm font-medium text-[#5d6e64] hover:bg-[#f2f5f0]">
              Cancel
            </Link>
            <button type="submit" className="inline-flex items-center gap-2 rounded-md bg-[#2c5a43] px-4 py-2 text-sm font-medium text-white hover:bg-[#1c2b23]">
              <Save className="h-4 w-4" />
              Save Team Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
