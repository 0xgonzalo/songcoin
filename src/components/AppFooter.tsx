"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home", icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M4 10v10a1 1 0 001 1h3m10-11v10a1 1 0 01-1 1h-3m-4 0h4" /></svg>
  ) },
  { href: "/create", label: "Create", icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
  ) },
  { href: "/profile", label: "Profile", icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A9 9 0 1112 21a9 9 0 01-6.879-3.196z" /></svg>
  ) },
];

export function AppFooter() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 border-t border-gray-800 flex justify-around items-center h-16 px-2 md:hidden">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href === "/" && pathname === "/home");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${isActive ? "text-purple-500" : "text-gray-400 hover:text-white"}`}
            aria-label={item.label}
          >
            {item.icon}
            <span className="text-xs mt-1 font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
} 