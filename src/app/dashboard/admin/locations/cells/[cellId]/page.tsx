import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { createVillage } from "@/app/actions/location";
import { LocationAddForm } from "@/components/LocationAddForm";
import { LocationBreadcrumb } from "@/components/LocationBreadcrumb";


export const dynamic = "force-dynamic";

export default async function CellVillagesPage({
  params,
}: {
  params: Promise<{ cellId: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPER_ADMIN") redirect("/dashboard");

  const { cellId } = await params;
  const cell = await prisma.cell.findUnique({
    where: { id: cellId },
    include: {
      sector: { include: { district: true } },
      villages: { orderBy: { name: "asc" } },
    },
  });

  if (!cell) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-[#1c2b23]">{cell.name} villages</h1>
        <p className="mt-1 text-sm text-[#5d6e64]">Villages in this cell.</p>
      </div>

      <LocationBreadcrumb
        items={[
          { href: "/dashboard/admin/locations", label: "Districts" },
          {
            href: `/dashboard/admin/locations/districts/${cell.sector.districtId}`,
            label: cell.sector.district.name,
          },
          {
            href: `/dashboard/admin/locations/sectors/${cell.sectorId}`,
            label: cell.sector.name,
          },
          { label: cell.name },
        ]}
      />

      <div className="bg-white shadow rounded-lg border border-[#d9e1d8] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#d9e1d8]">
            <thead className="bg-[#f2f5f0]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-[#1c2b23] uppercase tracking-wider">
                  Village
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-[#1c2b23] uppercase tracking-wider">
                  Code
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#d9e1d8]">
              {cell.villages.map((village) => (
                <tr key={village.id} className="hover:bg-[#f2f5f0] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1c2b23] font-medium">
                    {village.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1c2b23]">{village.code || "ΓÇö"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {cell.villages.length === 0 && (
          <div className="p-6 text-center text-sm text-[#5d6e64]">No villages in this cell yet.</div>
        )}
        <LocationAddForm
          action={createVillage}
          hiddenFields={{ cellId: cell.id }}
          nameLabel="New village"
          submitLabel="Add village"
        />
      </div>
    </div>
  );
}