import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { relatedCalculators } from "@/lib/calculators/registry";
import type { CalculatorSlug } from "@/lib/types";

export function RelatedCalculators({ current }: { current: CalculatorSlug }) {
  const items = relatedCalculators(current);
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="related-heading" className="mt-12">
      <h2 id="related-heading" className="text-xl font-semibold text-slate-900 dark:text-slate-50">
        Related calculators
      </h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-3">
        {items.map((calc) => {
          const Icon = calc.icon;
          return (
            <li key={calc.slug}>
              <Link
                href={`/${calc.slug}`}
                className="group flex h-full flex-col rounded-lg border border-slate-200 p-4 transition-colors duration-150 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:border-slate-600 dark:hover:bg-slate-900"
              >
                <span className="flex size-8 items-center justify-center rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <Icon className="size-4" aria-hidden />
                </span>
                <span className="mt-3 text-sm font-semibold text-slate-900 dark:text-slate-50">{calc.name}</span>
                <span className="mt-1 flex-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  {calc.description}
                </span>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                  Open calculator
                  <ArrowRight className="size-3 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
