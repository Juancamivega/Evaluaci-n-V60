"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Coffee, ClipboardList, Trophy, Settings } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Ficha de Evaluación", icon: ClipboardList },
    { href: "/resultados", label: "Resultados", icon: Trophy },
    { href: "/admin", label: "Administración", icon: Settings },
  ];

  return (
    <header className="bg-amber-950 text-white shadow-md border-b border-amber-900 sticky top-0 z-40 backdrop-blur-md bg-opacity-95">
      <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          <div className="bg-amber-800 p-2 rounded-xl shadow-inner">
            <Coffee className="h-6 w-6 text-amber-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-extrabold text-amber-300 bg-amber-900/60 px-2 py-0.5 rounded">
                SENA CIES
              </span>
              <span className="text-xs text-amber-200/80">Servicios de Barismo</span>
            </div>
            <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Evaluación de Taza
            </h1>
          </div>
        </Link>

        {/* Navigation links */}
        <nav className="flex items-center gap-1.5 bg-amber-900/50 p-1 rounded-xl border border-amber-800/60">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-amber-600 text-white shadow"
                    : "text-amber-200 hover:text-white hover:bg-amber-800/60"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
