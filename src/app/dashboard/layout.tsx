"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Users, Stethoscope, FileText, Shield, LogOut, Menu, X,
  ArrowRightCircle, ArrowLeftCircle, History, Settings,
  UserPlus, ImageIcon, TrendingUp, TrendingDown, Clock, RefreshCw, Calendar, PlusCircle, UserCog,
  Send, ChevronDown
} from "lucide-react";
import { useState } from "react";

type NavItem = {
  name: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: { name: string; href: string }[];
};

const adminNavigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
  { name: 'Beneficiaries', href: '/dashboard/admin/beneficiaries', icon: Users },
  { name: 'Pig Register', href: '/dashboard/admin/pigs/new', icon: PlusCircle },
  { name: 'Register', href: '/dashboard/admin/distributions', icon: ArrowRightCircle },
  { name: 'Veterinary', href: '/dashboard/admin/veterinary', icon: Stethoscope },
  { name: 'Finance', href: '/dashboard/admin/finance', icon: TrendingUp },
  {
    name: 'Post',
    icon: Send,
    children: [
      { name: 'Post Gallery', href: '/dashboard/gallery' },
      { name: 'Post Our Team', href: '/dashboard/team' },
    ],
  },
  { name: 'Reports', href: '/dashboard/admin/reports', icon: FileText },
  { name: 'Historical Records', href: '/dashboard/history', icon: History },
  { name: 'Website Content', href: '/dashboard/admin/website', icon: ImageIcon },
  { name: 'Users', href: '/dashboard/admin/users', icon: Shield },
  { name: 'System Settings', href: '/dashboard/admin/settings', icon: Settings },
  { name: 'Personal Settings', href: '/dashboard/settings', icon: UserCog },
];

const fieldNavigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard/field', icon: LayoutDashboard },
  { name: 'Pig Register', href: '/dashboard/field/pigs/new', icon: PlusCircle },
  { name: 'Beneficiaries', href: '/dashboard/field/beneficiaries', icon: Users },
  { name: 'Register Beneficiary', href: '/dashboard/field/beneficiaries/new', icon: UserPlus },
  { name: 'Pig Distribution', href: '/dashboard/field/distributions', icon: ArrowRightCircle },
  { name: 'Piglet Returns', href: '/dashboard/field/returns', icon: ArrowLeftCircle },
  { name: 'Operational Reports', href: '/dashboard/field/reports', icon: FileText },
  { name: 'Historical Records', href: '/dashboard/history', icon: History },
  { name: 'Personal Settings', href: '/dashboard/settings', icon: UserCog },
];

const vetNavigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard/vet', icon: LayoutDashboard },
  { name: 'Veterinary Records', href: '/dashboard/vet/veterinary', icon: Stethoscope },
  { name: 'Returned Piglets', href: '/dashboard/vet/returned', icon: RefreshCw },
  { name: 'Follow-ups', href: '/dashboard/vet/follow-ups', icon: Calendar },
  { name: 'Veterinary Reports', href: '/dashboard/vet/reports', icon: FileText },
  { name: 'Historical Records', href: '/dashboard/history', icon: History },
  { name: 'Personal Settings', href: '/dashboard/settings', icon: UserCog },
];

const financeNavigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard/finance', icon: LayoutDashboard },
  { name: 'Record Income', href: '/dashboard/finance/new?type=INCOME', icon: TrendingUp },
  { name: 'Record Expense', href: '/dashboard/finance/new?type=EXPENSE', icon: TrendingDown },
  { name: 'Financial Reports', href: '/dashboard/finance/reports', icon: FileText },
  { name: 'Historical Records', href: '/dashboard/history', icon: History },
  { name: 'Personal Settings', href: '/dashboard/settings', icon: UserCog },
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

  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>(() => {
    const isPostActive = pathname.startsWith('/dashboard/gallery') || pathname.startsWith('/dashboard/team');
    return { Post: isPostActive };
  });

  const toggleDropdown = (name: string) => {
    setOpenDropdowns((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const role = normalizeRole(session?.user?.role as string | undefined);
  let navigation: NavItem[] = [];
  if (role === 'SUPER_ADMIN') navigation = adminNavigation;
  if (role === 'FIELD_OFFICER') navigation = fieldNavigation;
  if (role === 'VETERINARIAN') navigation = vetNavigation;
  if (role === 'FINANCE_OFFICER') navigation = financeNavigation;

  const renderNav = (items: NavItem[], isMobile = false) => {
    return items.map((item) => {
      if (item.children) {
        const isChildActive = item.children.some((child) => 
          pathname === child.href || pathname.startsWith(child.href + "/")
        );
        const isOpen = openDropdowns[item.name] ?? isChildActive;

        return (
          <div key={item.name} className="space-y-1">
            <button
              type="button"
              onClick={() => toggleDropdown(item.name)}
              className={`group flex w-full items-center justify-between rounded-xl px-3 ${
                isMobile ? "py-3" : "py-2.5"
              } text-sm font-medium transition ${
                isChildActive
                  ? "bg-white/10 text-white font-semibold"
                  : "text-[#dfe9e3] hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="flex items-center">
                <item.icon className={`mr-3 h-4 w-4 ${isChildActive ? "text-white" : "text-[#bdd0c5]"}`} />
                <span>{item.name}</span>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-[#bdd0c5] transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isOpen && (
              <div className="ml-4 space-y-1 border-l border-white/15 pl-3 pt-1">
                {item.children.map((sub) => {
                  const isSubActive = pathname === sub.href || pathname.startsWith(sub.href + "/");
                  return (
                    <Link
                      key={sub.name}
                      href={sub.href}
                      onClick={() => isMobile && setMobileMenuOpen(false)}
                      className={`flex items-center rounded-lg px-3 py-2 text-xs font-medium transition ${
                        isSubActive
                          ? "bg-[#e4efe6] text-[#173d2e] font-semibold shadow-sm"
                          : "text-[#dfe9e3] hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {sub.name}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      }

      const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));
      return (
        <Link
          key={item.name}
          href={item.href!}
          onClick={() => isMobile && setMobileMenuOpen(false)}
          className={`group flex items-center rounded-xl px-3 ${
            isMobile ? "py-3" : "py-2.5"
          } text-sm font-medium transition ${
            isActive ? "bg-[#e4efe6] text-[#173d2e] shadow-sm font-semibold" : "text-[#dfe9e3] hover:bg-white/5 hover:text-white"
          }`}
        >
          <item.icon className={`mr-3 h-4 w-4 ${isActive ? "text-[#173d2e]" : "text-[#bdd0c5]"}`} />
          {item.name}
        </Link>
      );
    });
  };

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
            {renderNav(navigation)}
          </nav>

          <div className="border-t border-white/10 bg-[#102a22] px-4 py-4">
            <div className="flex items-center justify-between gap-2">
              <Link href="/dashboard/settings" className="min-w-0 group hover:opacity-80 transition">
                <p className="truncate text-sm font-semibold text-white group-hover:underline">{session?.user?.name}</p>
                <p className="truncate text-xs text-[#bfd0c4]">{session?.user?.role}</p>
              </Link>
              <div className="flex items-center gap-1 shrink-0">
                <Link
                  href="/dashboard/settings"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#dfe9e3] hover:bg-white/5 hover:text-white"
                  title="Personal Settings"
                  aria-label="Personal Settings"
                >
                  <Settings className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#dfe9e3] hover:bg-white/5 hover:text-white"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
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
            <div className="max-h-[calc(100vh-65px)] overflow-y-auto border-b border-[#dfe7df] bg-[#173d2e] p-4 md:hidden">
              <nav className="space-y-1">
                {renderNav(navigation, true)}
              </nav>
            </div>
          )}

          <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl min-w-0">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
