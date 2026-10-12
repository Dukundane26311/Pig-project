import { redirect } from "next/navigation";

export default function RevolvingFundRedirect() {
  redirect("/dashboard/admin/distributions");
}
