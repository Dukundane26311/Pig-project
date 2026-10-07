import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { format } from "date-fns";

export const dynamic = 'force-dynamic';

export default async function ReturnsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'SUPER_ADMIN') {
    redirect("/dashboard");
  }

  const returns = await prisma.pigReturn.findMany({
    orderBy: { returnDate: 'desc' },
    include: {
      pig: true,
      beneficiary: true,
      recordedBy: true
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-serif text-[#1c2b23]">Piglet Returns</h1>
          <p className="mt-1 text-sm text-[#5d6e64]">Track piglets returned to the program by beneficiaries.</p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg border border-[#d9e1d8] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#d9e1d8]">
            <thead className="bg-[#f2f5f0]">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-[#1c2b23] uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-[#1c2b23] uppercase tracking-wider">Beneficiary</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-[#1c2b23] uppercase tracking-wider">Quantity</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-[#1c2b23] uppercase tracking-wider">Recorded By</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#d9e1d8]">
              {returns.map((ret) => (
                <tr key={ret.id} className="hover:bg-[#f2f5f0] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1c2b23]">
                    {format(new Date(ret.returnDate), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1c2b23]">
                    {ret.beneficiary.fullName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1c2b23] font-medium">
                    {ret.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5d6e64]">
                    {ret.recordedBy.name}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {returns.length === 0 && (
          <div className="p-6 text-center text-sm text-[#5d6e64]">
            No returns recorded yet.
          </div>
        )}
      </div>
    </div>
  );
}
