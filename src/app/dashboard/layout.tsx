"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Users, Stethoscope, FileText, Shield, LogOut, Menu, X,
  ArrowRightCircle, ArrowLeftCircle, History, Settings,
  UserPlus, ImageIcon, TrendingUp, TrendingDown, RefreshCw, Calendar, PlusCircle, UserCog,
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
  { name: 'Distributions', href: '/dashboard/admin/distributions', icon: ArrowRightCircle },
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
              className={`group flex w-full items-center justify-between rounded-lg px-3 ${
                isMobile ? "py-2.5" : "py-2"
              } text-xs font-medium transition ${
                isChildActive
                  ? "bg-white/10 text-white font-semibold"
                  : "text-emerald-100/75 hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="flex items-center">
                <item.icon className={`mr-2.5 h-4 w-4 ${isChildActive ? "text-white" : "text-emerald-300/80"}`} />
                <span>{item.name}</span>
              </div>
              <ChevronDown
                className={`h-3.5 w-3.5 text-emerald-300/70 transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isOpen && (
              <div className="ml-3.5 space-y-1 border-l border-white/15 pl-3 pt-1">
                {item.children.map((sub) => {
                  const isSubActive = pathname === sub.href || pathname.startsWith(sub.href + "/");
                  return (
                    <Link
                      key={sub.name}
                      href={sub.href}
                      onClick={() => isMobile && setMobileMenuOpen(false)}
                      className={`flex items-center rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
                        isSubActive
                          ? "bg-emerald-500/20 text-emerald-200 font-semibold"
                          : "text-emerald-100/70 hover:bg-white/5 hover:text-white"
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
          className={`group flex items-center rounded-lg px-3 ${
            isMobile ? "py-2.5" : "py-2"
          } text-xs font-medium transition ${
            isActive ? "bg-white/10 text-white font-semibold shadow-xs" : "text-emerald-100/75 hover:bg-white/5 hover:text-white"
          }`}
        >
          <item.icon className={`mr-2.5 h-4 w-4 ${isActive ? "text-white" : "text-emerald-300/80"}`} />
          {item.name}
        </Link>
      );
    });
  };

  const userInitial = session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "U";

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 antialiased">
      <div className="flex min-h-screen">
        {/* Sleek, professional dark-forest sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-emerald-950/30 bg-[#072419] text-white md:flex md:flex-col shadow-xs">
          <div className="flex h-16 items-center border-b border-white/10 px-5">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-sm">
                P
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-300/80 leading-none">Pig Project</p>
                <h1 className="mt-0.5 text-sm font-bold tracking-tight text-white group-hover:text-emerald-200 transition-colors">Rwanda Operations</h1>
              </div>
            </Link>
          </div>

          <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
            {renderNav(navigation)}
          </nav>

          <div className="border-t border-white/10 bg-[#051c13] px-4 py-3.5">
            <div className="flex items-center justify-between gap-2">
              <Link href="/dashboard/settings" className="flex items-center gap-2.5 min-w-0 group hover:opacity-90 transition">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-700/50 text-white font-bold text-xs border border-white/10">
                  {userInitial}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-white group-hover:underline">{session?.user?.name}</p>
                  <p className="truncate text-[10px] text-emerald-300/70">{session?.user?.role}</p>
                </div>
              </Link>
              <div className="flex items-center gap-1 shrink-0">
                <Link
                  href="/dashboard/settings"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md text-emerald-200/70 hover:bg-white/10 hover:text-white transition-colors"
                  title="Personal Settings"
                  aria-label="Personal Settings"
                >
                  <Settings className="h-3.5 w-3.5" />
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md text-emerald-200/70 hover:bg-white/10 hover:text-white transition-colors"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
          {/* Mobile Header */}
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-md md:hidden">
            <div className="flex items-center justify-between px-4 py-2.5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Pig Project Rwanda</p>
                <h1 className="text-sm font-bold text-slate-900">Operations Workspace</h1>
              </div>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
                aria-label="Toggle navigation"
              >
                {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </header>

          {mobileMenuOpen && (
            <div className="max-h-[calc(100vh-57px)] overflow-y-auto border-b border-emerald-950/40 bg-[#072419] p-4 md:hidden text-white">
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
