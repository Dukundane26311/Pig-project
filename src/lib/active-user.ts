import "server-only";

import { Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getActiveUser(allowedRoles: readonly Role[]) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, role: true, isActive: true, deletedAt: true },
  });

  if (
    !user ||
    !user.isActive ||
    user.deletedAt ||
    !allowedRoles.includes(user.role)
  ) {
    return null;
  }

  return user;
}
