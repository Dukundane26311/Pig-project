import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { createGalleryItem } from "@/app/actions/gallery";

export const dynamic = "force-dynamic";

export default async function NewGalleryItemPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/gallery" className="text-[#5d6e64] hover:text-[#1c2b23]">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-serif text-[#1c2b23]">Add Gallery Photo</h1>
          <p className="mt-1 text-sm text-[#5d6e64]">Upload a project photo to the public gallery.</p>
        </div>
      </div>

      <div className="rounded-xl border border-[#d9e1d8] bg-white p-6 shadow-sm">
        <form action={createGalleryItem} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-[#1c2b23]">Title *</label>
              <input name="title" required className="w-full rounded-md border border-[#d9e1d8] p-2.5 focus:border-[#2c5a43] focus:ring-[#2c5a43]" placeholder="Pig Distribution in Gasabo" />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-[#1c2b23]">Description</label>
              <textarea name="description" rows={4} className="w-full rounded-md border border-[#d9e1d8] p-2.5 focus:border-[#2c5a43] focus:ring-[#2c5a43]" placeholder="Supporting a vulnerable family with their first pig under the revolving fund model." />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[#1c2b23]">Category</label>
              <select name="category" defaultValue="Pig Distribution" className="w-full rounded-md border border-[#d9e1d8] p-2.5 bg-white focus:border-[#2c5a43] focus:ring-[#2c5a43]">
                <option>Pig Distribution</option>
                <option>Beneficiary Families</option>
                <option>Field Visits</option>
                <option>Veterinary Care</option>
                <option>Training & Workshops</option>
                <option>Community Activities</option>
                <option>Piglets & Livestock</option>
                <option>Project Events</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[#1c2b23]">Location</label>
              <input name="location" className="w-full rounded-md border border-[#d9e1d8] p-2.5 focus:border-[#2c5a43] focus:ring-[#2c5a43]" placeholder="Gasabo District, Rwanda" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[#1c2b23]">Photo Date</label>
              <input type="date" name="photoDate" className="w-full rounded-md border border-[#d9e1d8] p-2.5 focus:border-[#2c5a43] focus:ring-[#2c5a43]" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[#1c2b23]">Photographer / Source</label>
              <input name="photographer" className="w-full rounded-md border border-[#d9e1d8] p-2.5 focus:border-[#2c5a43] focus:ring-[#2c5a43]" placeholder="Field team" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[#1c2b23]">Display Order</label>
              <input type="number" name="displayOrder" defaultValue={0} className="w-full rounded-md border border-[#d9e1d8] p-2.5 focus:border-[#2c5a43] focus:ring-[#2c5a43]" />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-[#1c2b23]">Photo *</label>
              <input type="file" name="image" accept="image/jpeg,image/png,image/webp" required className="w-full rounded-md border border-[#d9e1d8] p-2.5 file:mr-3 file:rounded file:border-0 file:bg-[#e4ede6] file:px-3 file:py-2 file:text-sm file:font-medium file:text-[#2c5a43]" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" name="isPublished" defaultChecked className="h-4 w-4" />
            <label className="text-sm text-[#1c2b23]">Publish publicly</label>
          </div>

          <div className="flex justify-end gap-3">
            <Link href="/dashboard/gallery" className="rounded-md border border-[#d9e1d8] bg-white px-4 py-2 text-sm font-medium text-[#5d6e64] hover:bg-[#f2f5f0]">
              Cancel
            </Link>
            <button type="submit" className="inline-flex items-center gap-2 rounded-md bg-[#2c5a43] px-4 py-2 text-sm font-medium text-white hover:bg-[#1c2b23]">
              <Save className="h-4 w-4" />
              Save Photo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
