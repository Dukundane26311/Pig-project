import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Truck } from "lucide-react";
import { format } from "date-fns";

export const dynamic = 'force-dynamic';

export default async function DistributionsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'SUPER_ADMIN') {
    redirect("/dashboard");
  }

  const distributions = await prisma.pigDistribution.findMany({
    orderBy: { distributionDate: 'desc' },
    include: {
      pig: true,
      beneficiary: true,
      distributedBy: true
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-serif text-[#1c2b23]">Pig Distributions</h1>
          <p className="mt-1 text-sm text-[#5d6e64]">Track pigs distributed to beneficiaries.</p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg border border-[#d9e1d8] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#d9e1d8]">
            <thead className="bg-[#f2f5f0]">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-[#1c2b23] uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-[#1c2b23] uppercase tracking-wider">Pig Tag</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-[#1c2b23] uppercase tracking-wider">Beneficiary</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-[#1c2b23] uppercase tracking-wider">Distributed By</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#d9e1d8]">
              {distributions.map((dist) => (
                <tr key={dist.id} className="hover:bg-[#f2f5f0] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1c2b23]">
                    {format(new Date(dist.distributionDate), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1c2b23] font-medium">
                    {dist.pig.tagNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1c2b23]">
                    {dist.beneficiary.fullName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5d6e64]">
                    {dist.distributedBy.name}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {distributions.length === 0 && (
          <div className="p-6 text-center text-sm text-[#5d6e64]">
            No distributions recorded yet.
          </div>
        )}
      </div>
    </div>
  );
}
