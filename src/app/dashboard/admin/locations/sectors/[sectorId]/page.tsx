import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createCell } from "@/app/actions/location";
import { LocationAddForm } from "@/components/LocationAddForm";
import { LocationBreadcrumb } from "@/components/LocationBreadcrumb";


export const dynamic = 'force-dynamic';

export const dynamic = "force-dynamic";

export default async function SectorCellsPage({
  params,
}: {
  params: Promise<{ sectorId: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPER_ADMIN") redirect("/dashboard");

  const { sectorId } = await params;
  const sector = await prisma.sector.findUnique({
    where: { id: sectorId },
    include: {
      district: true,
      cells: {
        orderBy: { name: "asc" },
        include: { _count: { select: { villages: true } } },
      },
    },
  });

  if (!sector) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-[#1c2b23]">{sector.name} cells</h1>
        <p className="mt-1 text-sm text-[#5d6e64]">Open a cell to navigate into its villages.</p>
      </div>

      <LocationBreadcrumb
        items={[
          { href: "/dashboard/admin/locations", label: "Districts" },
          { href: `/dashboard/admin/locations/districts/${sector.districtId}`, label: sector.district.name },
          { label: sector.name },
        ]}
      />

      <div className="bg-white shadow rounded-lg border border-[#d9e1d8] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#d9e1d8]">
            <thead className="bg-[#f2f5f0]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-[#1c2b23] uppercase tracking-wider">
                  Cell
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-[#1c2b23] uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-[#1c2b23] uppercase tracking-wider">
                  Villages
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Open</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#d9e1d8]">
              {sector.cells.map((cell) => (
                <tr key={cell.id} className="hover:bg-[#f2f5f0] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1c2b23] font-medium">
                    {cell.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1c2b23]">{cell.code || "ΓÇö"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5d6e64]">{cell._count.villages}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/dashboard/admin/locations/cells/${cell.id}`}
                      className="text-[#2c5a43] hover:text-[#1c2b23]"
                    >
                      View villages
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {sector.cells.length === 0 && (
          <div className="p-6 text-center text-sm text-[#5d6e64]">No cells in this sector yet.</div>
        )}
        <LocationAddForm
          action={createCell}
          hiddenFields={{ sectorId: sector.id }}
          nameLabel="New cell"
          submitLabel="Add cell"
        />
      </div>
    </div>
  );
}