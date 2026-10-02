import { Shield, Key, AlertTriangle } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export default async function SecurityPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'PROJECT_MANAGER')) {
    redirect("/dashboard");
  }

  const logs = await prisma.auditLog.findMany({
    take: 50,
    orderBy: { createdAt: 'desc' },
    include: { user: true }
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-serif text-[#1c2b23]">Security Center</h2>
          <p className="mt-1 text-sm text-[#5d6e64]">System audit logs, OTP, and user security management.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-[#d9e1d8] p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-[#e4ede6] rounded-md p-3">
              <Key className="h-6 w-6 text-[#2c5a43]" />
            </div>
            <div className="ml-5">
              <h3 className="text-lg font-bold text-[#1c2b23]">OTP Configurations</h3>
              <p className="text-sm text-[#5d6e64] mt-1">Manage One-Time Password requirements for sensitive operations.</p>
            </div>
          </div>
          <div className="mt-6 border-t border-[#d9e1d8] pt-4">
            <button className="text-[#2c5a43] text-sm font-medium hover:underline">
              Configure Settings &rarr;
            </button>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-[#d9e1d8] p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-50 rounded-md p-3">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-5">
              <h3 className="text-lg font-bold text-[#1c2b23]">Role & Permissions</h3>
              <p className="text-sm text-[#5d6e64] mt-1">Edit RBAC (Role-Based Access Control) matrix.</p>
            </div>
          </div>
          <div className="mt-6 border-t border-[#d9e1d8] pt-4">
            <button className="text-[#2c5a43] text-sm font-medium hover:underline">
              Manage Roles &rarr;
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-[#d9e1d8] overflow-hidden mt-8">
        <div className="p-4 border-b border-[#d9e1d8] bg-[#f2f5f0] flex items-center">
          <Shield className="h-5 w-5 text-[#2c5a43] mr-2" />
          <h3 className="text-lg font-bold text-[#1c2b23]">Recent Audit Logs</h3>
        </div>
        
        {logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#d9e1d8]">
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#5d6e64] uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#5d6e64] uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#5d6e64] uppercase tracking-wider">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#5d6e64] uppercase tracking-wider">Entity</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#d9e1d8]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5d6e64]">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#1c2b23]">
                      {log.user?.name || "System"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5d6e64]">
                      {log.action}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5d6e64]">
                      {log.entityType} ({log.entityId})
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-[#5d6e64]">
            No audit logs recorded yet.
          </div>
        )}
      </div>
    </div>
  );
}
