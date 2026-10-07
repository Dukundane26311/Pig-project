import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Settings } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'SUPER_ADMIN') {
    redirect("/dashboard");
  }

  const settings = await prisma.systemSetting.findMany({
    orderBy: { key: 'asc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-serif text-[#1c2b23]">System Settings</h1>
          <p className="mt-1 text-sm text-[#5d6e64]">Configure global variables like revolving return amounts and defaults.</p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg border border-[#d9e1d8] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#d9e1d8]">
            <thead className="bg-[#f2f5f0]">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-[#1c2b23] uppercase tracking-wider">Key</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-[#1c2b23] uppercase tracking-wider">Value</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-[#1c2b23] uppercase tracking-wider">Description</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#d9e1d8]">
              {settings.map((setting) => (
                <tr key={setting.id} className="hover:bg-[#f2f5f0] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#1c2b23]">
                    {setting.key}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1c2b23]">
                    {setting.value}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5d6e64]">
                    {setting.description || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-[#2c5a43] hover:text-[#1c2b23]">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {settings.length === 0 && (
          <div className="p-6 text-center text-sm text-[#5d6e64]">
            No system settings configured. <button className="text-[#2c5a43] hover:underline ml-1">Create one</button>
          </div>
        )}
      </div>
    </div>
  );
}
