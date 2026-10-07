"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Users, PiggyBank, Activity, Stethoscope, 
  CheckSquare, CreditCard, FileText, Shield, LogOut, Menu, X,
  ArrowRightCircle, ArrowLeftCircle, Repeat, Map, Bell, History, Settings,
  UserPlus, MapPin, User, ClipboardList, Syringe, Cross, Calendar, AlertTriangle,
  ImageIcon, TrendingUp, TrendingDown
} from "lucide-react";
import { useState } from "react";

const adminNavigation = [
  { name: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
  { name: 'Beneficiaries', href: '/dashboard/admin/beneficiaries', icon: Users },
  { name: 'Livestock', href: '/dashboard/admin/pigs', icon: PiggyBank },
  { name: 'Veterinary', href: '/dashboard/admin/veterinary', icon: Stethoscope },
  { name: 'Pig Distribution', href: '/dashboard/admin/distributions', icon: ArrowRightCircle },
  { name: 'Pig Returns', href: '/dashboard/admin/returns', icon: ArrowLeftCircle },
  { name: 'Transfers', href: '/dashboard/admin/transfers', icon: Repeat },
  { name: 'Revolving Fund', href: '/dashboard/admin/revolving', icon: Activity },
  { name: 'Locations', href: '/dashboard/admin/locations', icon: Map },
  { name: 'Users', href: '/dashboard/admin/users', icon: Shield },
  { name: 'Reports', href: '/dashboard/admin/reports', icon: FileText },
  { name: 'Website Content', href: '/dashboard/admin/website', icon: ImageIcon },
  { name: 'Gallery', href: '/dashboard/gallery', icon: ImageIcon },
  { name: 'Team Members', href: '/dashboard/team', icon: Users },
  { name: 'Stories', href: '/dashboard/admin/reports', icon: FileText },
  { name: 'Notifications', href: '/dashboard/admin/notifications', icon: Bell },
  { name: 'Audit Logs', href: '/dashboard/admin/audit', icon: History },
  { name: 'System Settings', href: '/dashboard/admin/settings', icon: Settings },
];

const fieldNavigation = [
  { name: 'Dashboard', href: '/dashboard/field', icon: LayoutDashboard },
  { name: 'Beneficiaries', href: '/dashboard/field/beneficiaries', icon: Users },
  { name: 'Register Beneficiary', href: '/dashboard/field/beneficiaries/new', icon: UserPlus },
  { name: 'Pig Distribution', href: '/dashboard/field/distributions', icon: ArrowRightCircle },
  { name: 'Pig Returns', href: '/dashboard/field/returns', icon: ArrowLeftCircle },
  { name: 'Daily Reports', href: '/dashboard/field/reports', icon: FileText },
  { name: 'My Assigned Area', href: '/dashboard/field/area', icon: MapPin },
  { name: 'Notifications', href: '/dashboard/field/notifications', icon: Bell },
  { name: 'My Profile', href: '/dashboard/field/profile', icon: User },
];

const vetNavigation = [
  { name: 'Dashboard', href: '/dashboard/vet', icon: LayoutDashboard },
  { name: 'Animals', href: '/dashboard/vet/animals', icon: PiggyBank },
  { name: 'Veterinary Examinations', href: '/dashboard/vet/examinations', icon: Stethoscope },
  { name: 'Health Records', href: '/dashboard/vet/records', icon: ClipboardList },
  { name: 'Vaccinations', href: '/dashboard/vet/vaccinations', icon: Syringe },
  { name: 'Treatments', href: '/dashboard/vet/treatments', icon: Cross },
  { name: 'Follow-ups', href: '/dashboard/vet/followups', icon: Calendar },
  { name: 'Health Alerts', href: '/dashboard/vet/alerts', icon: AlertTriangle },
  { name: 'My Assigned Area', href: '/dashboard/vet/area', icon: MapPin },
  { name: 'Notifications', href: '/dashboard/vet/notifications', icon: Bell },
  { name: 'My Profile', href: '/dashboard/vet/profile', icon: User },
];

const financeNavigation = [
  { name: 'Dashboard', href: '/dashboard/finance', icon: LayoutDashboard },
  { name: 'Income', href: '/dashboard/finance/income', icon: TrendingUp },
  { name: 'Expenses', href: '/dashboard/finance/expenses', icon: TrendingDown },
  { name: 'Reports', href: '/dashboard/finance/reports', icon: FileText },
  { name: 'My Profile', href: '/dashboard/finance/profile', icon: User },
];


const normalizeRole = (role?: string | null) => {
  if (!role) return "";
  const value = role.replace(/^ROLE_/, "");
  return value === "ADMIN" ? "SUPER_ADMIN" : value;
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const role = normalizeRole(session?.user?.role as string | undefined);
  let navigation: any[] = [];
  if (role === 'SUPER_ADMIN') navigation = adminNavigation;
  if (role === 'FIELD_OFFICER') navigation = fieldNavigation;
  if (role === 'VETERINARIAN') navigation = vetNavigation;
  if (role === 'FINANCE_OFFICER') navigation = financeNavigation;

  return (
    <div className="min-h-screen bg-[#f3f5f1] text-[#1b2d24]">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-[#dfe7df] bg-[#173d2e] text-white md:flex md:flex-col">
          <div className="flex h-20 items-center border-b border-white/10 px-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#dfe9e3]">Pig Project</p>
              <h1 className="mt-1 text-lg font-semibold tracking-tight">Rwanda</h1>
            </div>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    isActive ? "bg-[#e4efe6] text-[#173d2e] shadow-sm" : "text-[#dfe9e3] hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <item.icon className={`mr-3 h-4 w-4 ${isActive ? "text-[#173d2e]" : "text-[#bdd0c5]"}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-white/10 bg-[#102a22] px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{session?.user?.name}</p>
                <p className="truncate text-xs text-[#bfd0c4]">{session?.user?.role}</p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#dfe9e3] hover:bg-white/5 hover:text-white"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-[#dfe7df] bg-[#f8f7f5]/90 backdrop-blur-sm md:hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#5d6d64]">Pig Project</p>
                <h1 className="text-base font-semibold text-[#1b2d24]">Rwanda</h1>
              </div>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#dfe7df] bg-white text-[#173d2e]"
                aria-label="Toggle navigation"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </header>

          {mobileMenuOpen && (
            <div className="border-b border-[#dfe7df] bg-[#173d2e] p-4 md:hidden">
              <nav className="space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center rounded-xl px-3 py-3 text-sm font-medium text-[#edf4ee] hover:bg-white/5"
                  >
                    <item.icon className="mr-3 h-4 w-4 text-[#bfd0c4]" />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          )}

          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
