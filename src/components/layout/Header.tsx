"use client";

import { Bell, Search, User, Check, Info, AlertTriangle } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useDentalStore } from "@/store/useDentalStore";
import { cn } from "@/lib/utils";
import Link from "next/link";

export const Header = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const { notifications, markNotificationRead, user } = useDentalStore();
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <Check className="w-4 h-4 text-emerald-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      default: return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const getBg = (type: string) => {
    switch (type) {
      case 'success': return 'bg-emerald-100';
      case 'warning': return 'bg-amber-100';
      default: return 'bg-blue-100';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-100 px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
          <input
            type="text"
            placeholder="Search cases, patients, or files..."
            className="w-full bg-gray-50 border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary-500 transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center transition-colors relative",
              showNotifications ? "bg-primary-50 text-primary-600" : "hover:bg-gray-50 text-gray-600"
            )}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                <span className="font-semibold text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-xs text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full font-medium">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.map((n) => (
                  <div 
                    key={n.id} 
                    className={cn(
                      "p-4 border-b border-gray-50 last:border-0 transition-colors flex gap-3",
                      !n.read ? "bg-primary-50/30" : "hover:bg-gray-50"
                    )}
                  >
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", getBg(n.type))}>
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm", !n.read ? "font-semibold text-gray-900" : "text-gray-600")}>
                        {n.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {n.createdAt
                          ? n.createdAt instanceof Date
                            ? n.createdAt.toLocaleString()
                            : typeof (n.createdAt as any)?.toDate === 'function'
                            ? (n.createdAt as any).toDate().toLocaleString()
                            : 'Just now'
                          : 'Just now'}
                      </p>
                    </div>
                    {!n.read && (
                      <button 
                        onClick={() => markNotificationRead(n.id)}
                        className="w-2 h-2 bg-primary-600 rounded-full shrink-0 mt-1.5"
                        title="Mark as read"
                      />
                    )}
                  </div>
                ))}
              </div>
              <Link href="/notifications" className="block w-full p-3 text-center text-sm text-primary-600 font-medium hover:bg-primary-50 transition-colors">
                View all notifications
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">{user?.name ?? 'Guest User'}</p>
            <p className="text-xs text-gray-500">{user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Member'}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
            {user?.name ? user.name.split(' ').map((part) => part[0]).join('').slice(0,2).toUpperCase() : 'GU'}
          </div>
        </div>
      </div>
    </header>
  );
};

