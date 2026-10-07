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

  const role = normalizeRole((session.user as any).role);

  switch (role) {
    case "SUPER_ADMIN":
      redirect("/dashboard/admin");
    case "FIELD_OFFICER":
      redirect("/dashboard/field");
    case "VETERINARIAN":
      redirect("/dashboard/vet");
    case "FINANCE_OFFICER":
      redirect("/dashboard/finance");
    default:
      redirect("/login");
  }
}
