import { createTask } from "@/app/actions/task";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";


export const dynamic = 'force-dynamic';

export default async function NewTaskPage() {
  const users = await prisma.user.findMany({
    orderBy: { name: 'asc' },
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/dashboard/tasks"
          className="p-2 text-[#5d6e64] hover:bg-[#e4ede6] rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold font-serif text-[#1c2b23]">Create Task</h2>
          <p className="mt-1 text-sm text-[#5d6e64]">Assign a new task to a team member.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#d9e1d8] overflow-hidden">
        <form action={createTask} className="p-6 sm:p-8 space-y-8">
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-[#5d6e64]">Task Title</label>
              <input type="text" name="title" id="title" required
                className="mt-1 block w-full border border-[#d9e1d8] rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#c9577a] focus:border-[#c9577a] sm:text-sm text-[#1c2b23] bg-white" />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-[#5d6e64]">Description</label>
              <textarea name="description" id="description" rows={3}
                className="mt-1 block w-full border border-[#d9e1d8] rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#c9577a] focus:border-[#c9577a] sm:text-sm text-[#1c2b23] bg-white" />
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-[#5d6e64]">Priority</label>
              <select id="priority" name="priority" required
                className="mt-1 block w-full border border-[#d9e1d8] rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#c9577a] focus:border-[#c9577a] sm:text-sm bg-white text-[#1c2b23]">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-[#5d6e64]">Due Date</label>
              <input type="date" name="dueDate" id="dueDate" required
                className="mt-1 block w-full border border-[#d9e1d8] rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#c9577a] focus:border-[#c9577a] sm:text-sm text-[#1c2b23] bg-white" />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="assignedUserId" className="block text-sm font-medium text-[#5d6e64]">Assign To</label>
              <select id="assignedUserId" name="assignedUserId" required
                className="mt-1 block w-full border border-[#d9e1d8] rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-[#c9577a] focus:border-[#c9577a] sm:text-sm bg-white text-[#1c2b23]">
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-4 border-t border-[#d9e1d8]">
            <Link 
              href="/dashboard/tasks"
              className="px-4 py-2 text-sm font-medium text-[#5d6e64] hover:text-[#1c2b23] transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="inline-flex items-center justify-center px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#2c5a43] hover:bg-[#1c2b23] transition-colors"
            >
              <Save className="-ml-1 mr-2 h-4 w-4" />
              Assign Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
