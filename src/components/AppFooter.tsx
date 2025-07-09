"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home", icon: "/icons/home.png" },
  { href: "/create", label: "Create", icon: "/icons/create.png" },
  { href: "/profile", label: "Profile", icon: "/icons/profile.png" },
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
            <Image
              src={item.icon}
              alt={item.label}
              width={24}
              height={24}
              className={`transition-opacity ${isActive ? "opacity-100" : "opacity-70 hover:opacity-100"}`}
            />
            <span className="text-xs mt-1 font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
} 