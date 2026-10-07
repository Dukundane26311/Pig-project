// @ts-nocheck
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, CheckSquare, CheckCircle, Clock } from "lucide-react";
import { completeTask } from "@/app/actions/task";

export const dynamic = 'force-dynamic';

export default async function TasksPage() {
  const tasks = await prisma.task.findMany({
    include: { assignedUser: true, currentBeneficiary: true, pig: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-serif text-[#1c2b23]">Task Management</h2>
          <p className="mt-1 text-sm text-[#5d6e64]">Assign and track team activities and follow-ups.</p>
        </div>
        <Link 
          href="/dashboard/tasks/new"
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#2c5a43] hover:bg-[#1c2b23] transition-colors"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          New Task
        </Link>
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-[#d9e1d8] overflow-hidden">
        {tasks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#d9e1d8]">
              <thead className="bg-[#f2f5f0]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#5d6e64] uppercase tracking-wider">Task</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#5d6e64] uppercase tracking-wider">Assigned To</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#5d6e64] uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#5d6e64] uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[#5d6e64] uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#d9e1d8]">
                {tasks.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {t.status === 'COMPLETED' ? (
                          <CheckCircle className="h-5 w-5 text-[#2c5a43] mr-3" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-500 mr-3" />
                        )}
                        <div>
                          <div className={`text-sm font-medium ${t.status === 'COMPLETED' ? 'text-[#9db0a4] line-through' : 'text-[#1c2b23]'}`}>{t.title}</div>
                          <div className="text-xs text-[#5d6e64]">{t.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1c2b23]">
                      {t.assignedUser.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        t.priority === 'CRITICAL' || t.priority === 'HIGH' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5d6e64]">
                      {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'No date'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      {t.status !== 'COMPLETED' && (
                        <form action={completeTask}>
                          <input type="hidden" name="taskId" value={t.id} />
                          <button type="submit" className="text-[#2c5a43] hover:underline font-medium">
                            Mark Done
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <CheckSquare className="mx-auto h-12 w-12 text-[#9db0a4] mb-4" />
            <h3 className="text-lg font-medium text-[#1c2b23] mb-1">No tasks assigned</h3>
            <p className="text-[#5d6e64] mb-4">Create tasks to track your team's fieldwork and administration.</p>
          </div>
        )}
      </div>
    </div>
  );
}
