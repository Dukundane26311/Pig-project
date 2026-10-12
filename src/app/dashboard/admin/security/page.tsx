import { redirect } from "next/navigation";

export default function SecurityPage() {
  redirect("/dashboard/admin/audit");
}
