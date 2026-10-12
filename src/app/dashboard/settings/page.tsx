import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updatePersonalProfile, changeUserPassword } from "@/app/actions/user";
import { getUserPreferences } from "@/app/actions/settings";
import { User, Lock, Palette, CheckCircle, AlertCircle, Settings as SettingsIcon, ChevronRight } from "lucide-react";
import Link from "next/link";
import { SettingsPreferences } from "./settings-preferences";

export const dynamic = "force-dynamic";

export default async function PersonalSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const [user, initialPreferences] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    }),
    getUserPreferences(session.user.id),
  ]);

  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const profileSuccess = params.profileSuccess === "1";
  const profileError = typeof params.profileError === "string" ? params.profileError : null;
  const passwordSuccess = params.passwordSuccess === "1";
  const passwordError = typeof params.passwordError === "string" ? params.passwordError : null;

  return (
    <div className="space-y-8 max-w-4xl pb-12">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5d6d64]">User Workspace</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1b2d24]">Personal Settings</h1>
        <p className="mt-1 text-sm text-[#5d6d64]">
          Manage your personal profile, secure credentials, and individual display preferences.
        </p>
      </div>

      {profileSuccess && (
        <div className="flex items-center gap-3 rounded-xl border border-[#cfe4d7] bg-[#e7f4ed] p-4 text-sm text-[#064b36]">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <span>Your personal profile information has been successfully updated.</span>
        </div>
      )}

      {profileError && (
        <div className="flex items-center gap-3 rounded-xl border border-[#f5c6cb] bg-[#f8d7da] p-4 text-sm text-[#721c24]">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{profileError}</span>
        </div>
      )}

      {passwordSuccess && (
        <div className="flex items-center gap-3 rounded-xl border border-[#cfe4d7] bg-[#e7f4ed] p-4 text-sm text-[#064b36]">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <span>Your password has been changed successfully.</span>
        </div>
      )}

      {passwordError && (
        <div className="flex items-center gap-3 rounded-xl border border-[#f5c6cb] bg-[#f8d7da] p-4 text-sm text-[#721c24]">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{passwordError}</span>
        </div>
      )}

      {/* Profile Details */}
      <div className="rounded-[24px] border border-[#dfe7df] bg-white p-6 shadow-[0_4px_12px_rgba(16,28,23,0.03)]">
        <div className="flex items-center gap-3 border-b border-[#dfe7df] pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e3efe7] text-[#173d2e]">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#1b2d24]">Profile Information</h2>
            <p className="text-xs text-[#5d6d64]">Your registered identity within the Pig Project system.</p>
          </div>
        </div>

        <form action={updatePersonalProfile} className="mt-6 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-[#5d6d64]">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                defaultValue={user.name}
                className="mt-1.5 block w-full rounded-xl border border-[#dfe7df] bg-[#fcfdfc] px-3.5 py-2.5 text-sm text-[#1b2d24] focus:border-[#173d2e] focus:outline-none focus:ring-1 focus:ring-[#173d2e]"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-[#5d6d64]">
                Email Address (Account ID)
              </label>
              <input
                id="email"
                type="email"
                readOnly
                disabled
                defaultValue={user.email}
                className="mt-1.5 block w-full rounded-xl border border-[#dfe7df] bg-[#f3f5f1] px-3.5 py-2.5 text-sm text-[#7a8a82] cursor-not-allowed"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-xs font-semibold uppercase tracking-wider text-[#5d6d64]">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={user.phone ?? ""}
                placeholder="+250 780 000 000"
                className="mt-1.5 block w-full rounded-xl border border-[#dfe7df] bg-[#fcfdfc] px-3.5 py-2.5 text-sm text-[#1b2d24] focus:border-[#173d2e] focus:outline-none focus:ring-1 focus:ring-[#173d2e]"
              />
            </div>

            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-[#5d6d64]">
                Assigned Role
              </span>
              <div className="mt-1.5 inline-flex items-center rounded-xl bg-[#e3efe7] px-3.5 py-2 text-sm font-semibold text-[#173d2e]">
                {user.role}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="rounded-xl bg-[#173d2e] px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-[#102a22] transition"
            >
              Save Profile Details
            </button>
          </div>
        </form>
      </div>

      {/* Display Preferences */}
      <div className="rounded-[24px] border border-[#dfe7df] bg-white p-6 shadow-[0_4px_12px_rgba(16,28,23,0.03)]">
        <div className="flex items-center gap-3 border-b border-[#dfe7df] pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef3da] text-[#536334]">
            <Palette className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#1b2d24]">Individual Display Preferences</h2>
            <p className="text-xs text-[#5d6d64]">
              Personalize your workspace view. These settings belong to you and will not alter other users&apos; displays.
            </p>
          </div>
        </div>

        <SettingsPreferences initialPreferences={initialPreferences} />
      </div>

      {/* Change Password */}
      <div className="rounded-[24px] border border-[#dfe7df] bg-white p-6 shadow-[0_4px_12px_rgba(16,28,23,0.03)]">
        <div className="flex items-center gap-3 border-b border-[#dfe7df] pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7e3ea] text-[#a44d67]">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#1b2d24]">Change Password</h2>
            <p className="text-xs text-[#5d6d64]">Keep your account secure with a strong password.</p>
          </div>
        </div>

        <form action={changeUserPassword} className="mt-6 space-y-5">
          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label htmlFor="currentPassword" className="block text-xs font-semibold uppercase tracking-wider text-[#5d6d64]">
                Current Password
              </label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                required
                className="mt-1.5 block w-full rounded-xl border border-[#dfe7df] bg-[#fcfdfc] px-3.5 py-2.5 text-sm text-[#1b2d24] focus:border-[#173d2e] focus:outline-none focus:ring-1 focus:ring-[#173d2e]"
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-xs font-semibold uppercase tracking-wider text-[#5d6d64]">
                New Password
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                minLength={6}
                className="mt-1.5 block w-full rounded-xl border border-[#dfe7df] bg-[#fcfdfc] px-3.5 py-2.5 text-sm text-[#1b2d24] focus:border-[#173d2e] focus:outline-none focus:ring-1 focus:ring-[#173d2e]"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-semibold uppercase tracking-wider text-[#5d6d64]">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={6}
                className="mt-1.5 block w-full rounded-xl border border-[#dfe7df] bg-[#fcfdfc] px-3.5 py-2.5 text-sm text-[#1b2d24] focus:border-[#173d2e] focus:outline-none focus:ring-1 focus:ring-[#173d2e]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="rounded-xl bg-[#a44d67] px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-[#883e54] transition"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>

      {/* System Operational Settings Navigation Card */}
      <div className="rounded-[24px] border border-[#dfe7df] bg-white p-6 shadow-[0_4px_12px_rgba(16,28,23,0.03)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e3efe7] text-[#173d2e] shrink-0">
              <SettingsIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#1b2d24]">System Operational Settings</h2>
              <p className="text-xs text-[#5d6d64]">
                {user.role === "SUPER_ADMIN"
                  ? "Configure global operational variables, revolving targets, and operational policies stored in PostgreSQL."
                  : "View active system-wide operational policies, quarantine periods, and revolving targets."}
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/admin/settings"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-[#173d2e] bg-[#e3efe7] hover:bg-[#d5e7db] transition shadow-xs self-start sm:self-auto shrink-0"
          >
            <span>{user.role === "SUPER_ADMIN" ? "Manage System Settings" : "View System Settings"}</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
