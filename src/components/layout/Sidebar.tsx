"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDentalStore } from "@/store/useDentalStore";
import { LayoutDashboard, FolderKanban, Settings, LogOut, Bell, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Cases", href: "/cases", icon: FolderKanban },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, isLoading } = useDentalStore();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0 shadow-sm z-40">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-md shadow-primary-200">
            <span className="text-white font-bold text-lg">D</span>
          </div>
          <span className="font-bold text-xl tracking-tight text-gray-900">DentalLab</span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 mt-4">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group",
                isActive
                  ? "bg-primary-50 text-primary-700 shadow-sm shadow-primary-100/50"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-primary-600" : "text-gray-400 group-hover:text-gray-600")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100 space-y-1.5">
        <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors group">
          <HelpCircle className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
          Help & Support
        </button>
        <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors group">
          <Settings className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
          Settings
        </button>
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoading}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors disabled:cursor-not-allowed disabled:text-red-300"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
};

