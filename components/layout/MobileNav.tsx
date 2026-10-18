"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { calculatorsByCategory, categoryLabels } from "@/lib/calculators/registry";
import type { CalculatorCategory } from "@/lib/types";

const categories: CalculatorCategory[] = ["finance", "health"];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the menu after navigating.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        className="flex size-9 items-center justify-center rounded-md text-slate-600 transition-colors duration-150 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
      </button>

      {open && (
        <nav
          id="mobile-menu"
          aria-label="Calculators"
          className="absolute inset-x-0 top-14 z-40 max-h-[calc(100vh-3.5rem)] overflow-y-auto border-b border-slate-200 bg-white px-4 pb-6 pt-2 dark:border-slate-700 dark:bg-slate-950"
        >
          {categories.map((category) => (
            <div key={category} className="mt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {categoryLabels[category]}
              </p>
              <ul className="mt-2 space-y-1">
                {calculatorsByCategory(category).map((calc) => (
                  <li key={calc.slug}>
                    <Link
                      href={`/${calc.slug}`}
                      aria-current={pathname === `/${calc.slug}` ? "page" : undefined}
                      className="block rounded-md px-2 py-2 text-sm text-slate-700 transition-colors duration-150 hover:bg-slate-100 aria-[current=page]:bg-blue-50 aria-[current=page]:text-blue-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:aria-[current=page]:bg-blue-950 dark:aria-[current=page]:text-blue-300"
                    >
                      {calc.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      )}
    </div>
  );
}
