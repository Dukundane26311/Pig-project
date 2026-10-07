import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createSector } from "@/app/actions/location";
import { LocationAddForm } from "@/components/LocationAddForm";
import { LocationBreadcrumb } from "@/components/LocationBreadcrumb";

export const dynamic = "force-dynamic";

export default async function DistrictSectorsPage({
  params,
}: {
  params: Promise<{ districtId: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPER_ADMIN") redirect("/dashboard");

  const { districtId } = await params;
  const district = await prisma.district.findUnique({
    where: { id: districtId },
    include: {
      sectors: {
        orderBy: { name: "asc" },
        include: { _count: { select: { cells: true } } },
      },
    },
  });

  if (!district) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-[#1c2b23]">{district.name} sectors</h1>
        <p className="mt-1 text-sm text-[#5d6e64]">Open a sector to navigate into its cells.</p>
      </div>

      <LocationBreadcrumb
        items={[
          { href: "/dashboard/admin/locations", label: "Districts" },
          { label: district.name },
        ]}
      />

      <div className="bg-white shadow rounded-lg border border-[#d9e1d8] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#d9e1d8]">
            <thead className="bg-[#f2f5f0]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-[#1c2b23] uppercase tracking-wider">
                  Sector
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-[#1c2b23] uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-[#1c2b23] uppercase tracking-wider">
                  Cells
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Open</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#d9e1d8]">
              {district.sectors.map((sector) => (
                <tr key={sector.id} className="hover:bg-[#f2f5f0] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1c2b23] font-medium">
                    {sector.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1c2b23]">{sector.code || "—"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5d6e64]">{sector._count.cells}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/dashboard/admin/locations/sectors/${sector.id}`}
                      className="text-[#2c5a43] hover:text-[#1c2b23]"
                    >
                      View cells
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {district.sectors.length === 0 && (
          <div className="p-6 text-center text-sm text-[#5d6e64]">No sectors in this district yet.</div>
        )}
        <LocationAddForm
          action={createSector}
          hiddenFields={{ districtId: district.id }}
          nameLabel="New sector"
          submitLabel="Add sector"
        />
      </div>
    </div>
  );
}
