"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  PiggyBank, 
  Activity, 
  Stethoscope, 
  CheckSquare, 
  CreditCard,
  FileText,
  Shield,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Beneficiaries', href: '/dashboard/beneficiaries', icon: Users },
  { name: 'Pigs & Piglets', href: '/dashboard/pigs', icon: PiggyBank },
  { name: 'Field Visits', href: '/dashboard/visits', icon: Activity },
  { name: 'Veterinary', href: '/dashboard/veterinary', icon: Stethoscope },
  { name: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
  { name: 'Finance', href: '/dashboard/finance', icon: CreditCard, adminOnly: true },
  { name: 'Reports', href: '/dashboard/reports', icon: FileText },
  { name: 'Security Center', href: '/dashboard/security', icon: Shield, adminOnly: true },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = session?.user?.role === 'SUPER_ADMIN' || session?.user?.role === 'PROJECT_MANAGER';

  return (
    <div className="min-h-screen bg-[#f2f5f0] flex">
      {/* Sidebar Desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-[#1c2b23] text-white">
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-[#2c5a43]">
            <h1 className="text-xl font-bold font-serif truncate">Pig Project Fund</h1>
          </div>
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="px-2 space-y-1">
              {navigation.map((item) => {
                if (item.adminOnly && !isAdmin) return null;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive ? 'bg-[#c9577a] text-white' : 'text-[#e4ede6] hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <item.icon className={`mr-3 flex-shrink-0 h-5 w-5 ${isActive ? 'text-white' : 'text-[#9db0a4] group-hover:text-white'}`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex bg-[#121b16] p-4">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{session?.user?.name}</p>
                  <p className="text-xs font-medium text-[#9db0a4] truncate">{session?.user?.role}</p>
                </div>
                <button onClick={() => signOut({ callbackUrl: '/login' })} className="p-2 text-[#9db0a4] hover:text-white hover:bg-white/10 rounded-full transition-colors">
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:pl-64 flex flex-col flex-1">
        {/* Mobile header */}
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-[#f2f5f0]">
          <div className="flex items-center justify-between px-4 py-2 bg-white rounded-lg shadow-sm mx-2 mt-2 border border-[#d9e1d8]">
            <h1 className="text-lg font-bold font-serif text-[#1c2b23]">Pig Project Fund</h1>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="h-10 w-10 inline-flex items-center justify-center rounded-md text-[#5d6e64] hover:text-[#1c2b23] focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu (simplified overlay) */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-[#1c2b23] text-white pt-20 px-4">
             <nav className="space-y-2">
              {navigation.map((item) => {
                if (item.adminOnly && !isAdmin) return null;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="group flex items-center px-4 py-3 text-base font-medium rounded-md hover:bg-white/10"
                  >
                    <item.icon className="mr-4 flex-shrink-0 h-6 w-6 text-[#9db0a4]" />
                    {item.name}
                  </Link>
                );
              })}
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="w-full group flex items-center px-4 py-3 text-base font-medium rounded-md hover:bg-white/10 text-red-400"
              >
                <LogOut className="mr-4 flex-shrink-0 h-6 w-6" />
                Sign Out
              </button>
            </nav>
          </div>
        )}

        <main className="flex-1">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
