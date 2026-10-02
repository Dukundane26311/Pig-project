import { prisma } from "@/lib/prisma";
import { Users, PiggyBank, RefreshCw, CheckSquare } from "lucide-react";

export default async function DashboardOverview() {
  const [totalBeneficiaries, totalPigs, activeTasks] = await Promise.all([
    prisma.beneficiary.count(),
    prisma.pig.count(),
    prisma.task.count({ where: { status: 'TODO' } })
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-serif text-[#1c2b23]">Project Overview</h2>
        <p className="mt-1 text-sm text-[#5d6e64]">Real-time statistics of the Pig Project Revolving Fund.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-[#d9e1d8]">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-[#e4ede6] rounded-md p-3">
                <Users className="h-6 w-6 text-[#2c5a43]" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-[#5d6e64] truncate">Beneficiary Families</dt>
                  <dd className="text-3xl font-semibold font-serif text-[#1c2b23]">{totalBeneficiaries}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-[#d9e1d8]">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-[#e4ede6] rounded-md p-3">
                <PiggyBank className="h-6 w-6 text-[#c9577a]" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-[#5d6e64] truncate">Registered Pigs</dt>
                  <dd className="text-3xl font-semibold font-serif text-[#1c2b23]">{totalPigs}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-[#d9e1d8]">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-[#e4ede6] rounded-md p-3">
                <RefreshCw className="h-6 w-6 text-[#2c5a43]" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-[#5d6e64] truncate">Repaid Piglets</dt>
                  <dd className="text-3xl font-semibold font-serif text-[#1c2b23]">0</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-[#d9e1d8]">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-[#e4ede6] rounded-md p-3">
                <CheckSquare className="h-6 w-6 text-[#1c2b23]" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-[#5d6e64] truncate">Pending Tasks</dt>
                  <dd className="text-3xl font-semibold font-serif text-[#1c2b23]">{activeTasks}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#d9e1d8] p-12 text-center text-[#5d6e64]">
        Charts and activity feeds will be populated here as data grows.
      </div>
    </div>
  );
}
