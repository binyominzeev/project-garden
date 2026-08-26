"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/motivation", label: "🚀 Lelkesítő" },
  { href: "/ideas", label: "Ideas" },
  { href: "/suggestions", label: "Suggestions" },
  { href: "/experiments", label: "Experiments" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-white/60 bg-[#f7f4ec]/90 backdrop-blur">
      <div className="shell flex flex-col gap-4 pb-4 pt-4 sm:flex-row sm:items-center sm:justify-between sm:pb-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-700 text-xl text-white shadow-sm">🌿</span>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-800">Project Garden</p>
            <p className="text-sm text-slate-500">Tend your software life</p>
          </div>
        </Link>
        <nav className="flex flex-wrap gap-2">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? "button-primary" : "button-ghost"}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
