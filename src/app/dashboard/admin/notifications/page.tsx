// @ts-nocheck
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { Bell } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'SUPER_ADMIN') {
    redirect("/dashboard");
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-serif text-[#1c2b23]">Notifications</h1>
          <p className="mt-1 text-sm text-[#5d6e64]">View system alerts and critical updates.</p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg border border-[#d9e1d8] overflow-hidden">
        <ul className="divide-y divide-[#d9e1d8]">
          {notifications.map((notification) => (
            <li key={notification.id} className={`p-4 ${!notification.isRead ? 'bg-[#f2f5f0]' : 'bg-white'}`}>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Bell className={`h-6 w-6 ${notification.type === 'CRITICAL' ? 'text-red-500' : 'text-[#2c5a43]'}`} />
                </div>
                <div className="ml-3 w-full">
                  <div className="flex justify-between items-center">
                    <p className={`text-sm font-medium ${!notification.isRead ? 'text-[#1c2b23] font-bold' : 'text-[#5d6e64]'}`}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-[#5d6e64]">
                      {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
                    </p>
                  </div>
                  <p className="text-sm text-[#5d6e64] mt-1">{notification.message}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
        {notifications.length === 0 && (
          <div className="p-6 text-center text-sm text-[#5d6e64]">
            You have no notifications.
          </div>
        )}
      </div>
    </div>
  );
}
