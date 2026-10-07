import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createDistrict } from "@/app/actions/location";
import { LocationAddForm } from "@/components/LocationAddForm";
import { LocationBreadcrumb } from "@/components/LocationBreadcrumb";

export const dynamic = "force-dynamic";

export default async function LocationsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  const districts = await prisma.district.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { sectors: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-[#1c2b23]">Geographic Locations</h1>
        <p className="mt-1 text-sm text-[#5d6e64]">
          Navigate District → Sector → Cell → Village to manage operating areas.
        </p>
      </div>

      <LocationBreadcrumb items={[{ label: "Districts" }]} />

      <div className="bg-white shadow rounded-lg border border-[#d9e1d8] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#d9e1d8]">
            <thead className="bg-[#f2f5f0]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-[#1c2b23] uppercase tracking-wider">
                  District
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-[#1c2b23] uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-[#1c2b23] uppercase tracking-wider">
                  Sectors
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Open</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#d9e1d8]">
              {districts.map((district) => (
                <tr key={district.id} className="hover:bg-[#f2f5f0] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1c2b23] font-medium">
                    {district.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1c2b23]">{district.code || "—"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5d6e64]">
                    {district._count.sectors}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/dashboard/admin/locations/districts/${district.id}`}
                      className="text-[#2c5a43] hover:text-[#1c2b23]"
                    >
                      View sectors
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {districts.length === 0 && (
          <div className="p-6 text-center text-sm text-[#5d6e64]">No districts configured yet.</div>
        )}
        <LocationAddForm action={createDistrict} nameLabel="New district" submitLabel="Add district" />
      </div>
    </div>
  );
}
