import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSystemSettings } from "@/app/actions/settings";
import { SettingsTableClient } from "./SettingsTableClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const settings = await getSystemSettings();

  return (
    <SettingsTableClient
      initialSettings={settings}
      userRole={session.user.role}
    />
  );
}
