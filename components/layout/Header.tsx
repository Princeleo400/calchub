import Link from "next/link";
import {
  calculatorsByCategory,
  calculatorPath,
} from "@/lib/calculators/registry";
import { site } from "@/lib/site";
import { MobileNav } from "./MobileNav";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const finance = calculatorsByCategory("finance");
  const health = calculatorsByCategory("health");

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="relative mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-base font-semibold tracking-tight text-slate-900 dark:text-slate-50"
        >
          <span
            aria-hidden
            className="flex size-7 items-center justify-center rounded-md bg-blue-600 text-xs font-bold text-white"
          >
            C
          </span>
          {site.name}
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          <NavGroup label="Finance" items={finance} />
          <NavGroup label="Health" items={health} />
          <Link
            href="/nigeria"
            className="rounded-md px-3 py-2 text-sm text-slate-600 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50"
          >
            Nigeria
          </Link>
          <Link
            href="/blog"
            className="rounded-md px-3 py-2 text-sm text-slate-600 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50"
          >
            Guides
          </Link>
        </nav>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}

/** Desktop dropdown built on <details> so it works without JavaScript. */
function NavGroup({
  label,
  items,
}: {
  label: string;
  items: ReturnType<typeof calculatorsByCategory>;
}) {
  return (
    <details className="group relative">
      <summary className="flex cursor-pointer items-center gap-1 rounded-md px-3 py-2 text-sm text-slate-600 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50">
        {label}
        <svg
          viewBox="0 0 12 12"
          className="size-3 transition-transform group-open:rotate-180"
          aria-hidden
        >
          <path
            d="M3 4.5 6 7.5 9 4.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      </summary>
      <ul className="absolute top-full left-0 z-50 mt-1 w-64 rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
        {items.map((calc) => {
          const Icon = calc.icon;
          return (
            <li key={calc.slug}>
              <Link
                href={calculatorPath(calc)}
                className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-slate-700 transition-colors duration-150 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Icon className="size-4 text-slate-400" aria-hidden />
                {calc.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </details>
  );
}
