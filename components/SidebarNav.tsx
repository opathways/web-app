"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard",       label: "Dashboard" },
  { href: "/company-profile", label: "Company Profile" },
  { href: "/jobs",            label: "Jobs" }
];

export default function SidebarNav({ className = "" }: { className?: string }) {
  const pathname = usePathname();

  return (
    <aside className={className}>
      <nav className="px-4 py-6">
        <ul className="space-y-1">
          {links.map(l => {
            const active = pathname === l.href;
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={[
                    "block rounded-md px-3 py-2 text-sm font-medium transition",
                    active
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  ].join(" ")}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
