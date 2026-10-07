import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Shield } from "lucide-react";
import { format } from "date-fns";

export const dynamic = 'force-dynamic';

export default async function AuditLogsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'SUPER_ADMIN') {
    redirect("/dashboard");
  }

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100, // Limit to recent 100 for performance
    include: {
      user: true
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-serif text-[#1c2b23]">System Audit Logs</h1>
          <p className="mt-1 text-sm text-[#5d6e64]">Append-only log of critical system actions.</p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg border border-[#d9e1d8] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#d9e1d8]">
            <thead className="bg-[#f2f5f0]">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-[#1c2b23] uppercase tracking-wider">Timestamp</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-[#1c2b23] uppercase tracking-wider">User</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-[#1c2b23] uppercase tracking-wider">Action</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-[#1c2b23] uppercase tracking-wider">Entity</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#d9e1d8]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-[#f2f5f0] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1c2b23]">
                    {format(new Date(log.createdAt), 'MMM d, yyyy HH:mm:ss')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1c2b23] font-medium">
                    {log.user?.email || 'System'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1c2b23]">
                    {log.action}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5d6e64]">
                    {log.entity} ({log.entityId})
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {logs.length === 0 && (
          <div className="p-6 text-center text-sm text-[#5d6e64]">
            No audit logs found.
          </div>
        )}
      </div>
    </div>
  );
}
