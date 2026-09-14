"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/notifications", label: "Notifications" },
  { href: "/bilan", label: "Bilan" },
  { href: "/transactions", label: "Transactions" },
  { href: "/invoices", label: "Invoices" },
  { href: "/settings", label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  if (isLoading) {
    return (
      <aside className="hidden w-64 shrink-0 border-r border-gray-200 bg-white lg:block">
        <div className="flex h-16 items-center px-6">
          <div className="h-6 w-28 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="space-y-3 px-4">
          <div className="h-8 animate-pulse rounded bg-gray-200" />
          <div className="h-8 animate-pulse rounded bg-gray-200" />
          <div className="h-8 animate-pulse rounded bg-gray-200" />
        </div>
      </aside>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <aside
      className={`hidden shrink-0 border-r border-gray-200 bg-white lg:block transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex h-16 items-center justify-between px-6">
        {!collapsed && (
          <Link href="/dashboard" className="text-xl font-bold text-gray-900">
            Comptable
          </Link>
        )}
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          className="rounded-md p-2 text-gray-500 hover:bg-gray-100"
          aria-label={collapsed ? "Développer le menu" : "Replier le menu"}
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {collapsed ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            )}
          </svg>
        </button>
      </div>
      <nav className="px-3 py-4" aria-label="Sidebar">
        <ul className="space-y-1">
          {NAV_LINKS.map((link) => {
            const isActive =
              pathname === link.href ||
              pathname?.startsWith(link.href + "/");
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  title={collapsed ? link.label : undefined}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center text-gray-400">
                    {isActive ? (
                      <span className="h-2 w-2 rounded-full bg-blue-600" />
                    ) : (
                      <span className="h-2 w-2 rounded-full" />
                    )}
                  </span>
                  <span className={collapsed ? "sr-only" : ""}>
                    {link.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}