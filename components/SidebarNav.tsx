"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard",       href: "/dashboard" },
  { label: "Company Profile", href: "/company-profile" },
  { label: "Jobs",            href: "/jobs" }
];

export default function SidebarNav({
  items = navItems,
  className = ""
}: {
  items?: NavItem[];
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <aside className={`bg-gray-50 border-r border-gray-200 ${className}`}>
      <nav className="px-3 py-6">
        <ul className="space-y-1">
          {items.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={[
                    "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200",
                    active
                      ? "bg-primary/10 text-primary-700 border-l-2 border-primary"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                  ].join(" ")}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
