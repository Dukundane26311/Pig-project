import "server-only";

import { Role } from "@prisma/client";
import { getActiveUser } from "@/lib/active-user";

export async function getFinanceUser() {
  return getActiveUser([Role.SUPER_ADMIN, Role.FINANCE_OFFICER]);
}
