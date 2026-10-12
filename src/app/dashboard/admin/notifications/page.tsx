import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { Bell, CheckCheck } from "lucide-react";
import { Role, NotificationType } from "@prisma/client";
import { getActiveUser } from "@/lib/active-user";

export const dynamic = 'force-dynamic';

export default async function NotificationsPage() {
  const activeUser = await getActiveUser([
    Role.SUPER_ADMIN,
    Role.FIELD_OFFICER,
    Role.VETERINARIAN,
    Role.FINANCE_OFFICER,
  ]);
  if (!activeUser) {
    redirect("/dashboard");
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: activeUser.id },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-serif text-[#1c2b23]">Notifications & Alerts</h1>
          <p className="mt-1 text-sm text-[#5d6e64]">System alerts and operational activity updates.</p>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-[#d9e1d8] overflow-hidden">
        {notifications.length > 0 ? (
          <ul className="divide-y divide-[#d9e1d8]">
            {notifications.map((notification) => {
              const isCritical =
                notification.type === NotificationType.ALERT ||
                notification.type === NotificationType.HEALTH_ALERT ||
                notification.type === NotificationType.MORTALITY_ALERT;

              return (
                <li key={notification.id} className={`p-4 transition ${!notification.isRead ? 'bg-[#f2f5f0]' : 'bg-white'}`}>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-0.5">
                      <Bell className={`h-5 w-5 ${isCritical ? 'text-red-500' : 'text-[#2c5a43]'}`} />
                    </div>
                    <div className="ml-3 w-full">
                      <div className="flex justify-between items-center">
                        <p className={`text-sm ${!notification.isRead ? 'text-[#1c2b23] font-bold' : 'text-[#5d6e64] font-medium'}`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-[#9db0a4]">
                          {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
                        </p>
                      </div>
                      <p className="text-sm text-[#5d6e64] mt-1">{notification.message}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="p-8 text-center text-sm text-[#5d6e64]">
            <CheckCheck className="h-8 w-8 text-[#9db0a4] mx-auto mb-2" />
            You have no notifications. All clear!
          </div>
        )}
      </div>
    </div>
  );
}
