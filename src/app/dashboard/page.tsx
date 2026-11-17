import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const normalizeRole = (role?: string | null) => {
  if (!role) return "";
  const value = role.replace(/^ROLE_/, "");
  return value === "ADMIN" ? "SUPER_ADMIN" : value;
};

export default async function DashboardRedirect() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user as { role?: string };
  const role = normalizeRole(user.role);

  switch (role) {
    case "SUPER_ADMIN":
    case "PROJECT_MANAGER":
      redirect("/dashboard/admin");
    case "FIELD_OFFICER":
    case "TRAINER":
      redirect("/dashboard/field");
    case "VETERINARIAN":
      redirect("/dashboard/vet");
    case "FINANCE_OFFICER":
      redirect("/dashboard/finance");
    case "FUNDER":
      redirect("/dashboard/admin/reports");
    default:
      redirect("/login");
  }
}
