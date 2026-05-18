"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/auth/logout-button";
import { MapPin, User, Home } from "lucide-react";

export default function CarrierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/carrier",
      label: "Dashboard",
      icon: Home,
      exact: true,
    },
    {
      href: "/carrier/map",
      label: "Map",
      icon: MapPin,
    },
    {
      href: "/carrier/profile",
      label: "Profile",
      icon: User,
    },
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CS</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">ColdStack</h1>
          </div>
          <LogoutButton />
        </div>
      </header>

      {/* Main content with mobile-optimized layout */}
      <div className="flex-1 overflow-hidden flex flex-col">{children}</div>

      {/* Bottom Navigation (Mobile) */}
      <nav className="border-t border-slate-200 bg-white md:hidden">
        <div className="flex">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 px-2 text-xs font-medium transition-colors ${
                  isActive
                    ? "text-blue-600 border-t-2 border-blue-600"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Top Navigation (Desktop) */}
      <nav className="hidden md:block border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-8">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-4 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
                  isActive
                    ? "text-blue-600 border-blue-600"
                    : "text-slate-600 border-transparent hover:text-slate-900"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
