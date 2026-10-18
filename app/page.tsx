import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { calculatorsByCategory, categoryLabels } from "@/lib/calculators/registry";
import type { CalculatorCategory } from "@/lib/types";
import { site } from "@/lib/site";

// Temporary homepage. Phase 2 replaces it with the full version.
const sections: Array<{ category: CalculatorCategory; intro: string }> = [
  { category: "finance", intro: "Mortgages, loans and debt, with the math shown." },
  { category: "health", intro: "Body mass index and daily calorie needs." },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
        {site.tagline}
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
        {site.description}
      </p>

      {sections.map(({ category, intro }) => (
        <section key={category} id={category} className="mt-12 scroll-mt-20">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
            {categoryLabels[category]} calculators
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{intro}</p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {calculatorsByCategory(category).map((calc) => {
              const Icon = calc.icon;
              return (
                <li key={calc.slug}>
                  <Link
                    href={`/${calc.slug}`}
                    className="group flex h-full gap-3 rounded-lg border border-slate-200 p-4 transition-colors duration-150 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:border-slate-600 dark:hover:bg-slate-900"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-1 text-sm font-semibold text-slate-900 dark:text-slate-50">
                        {calc.name}
                        <ArrowRight
                          className="size-3.5 text-slate-400 transition-colors duration-150 group-hover:text-blue-600"
                          aria-hidden
                        />
                      </span>
                      <span className="mt-1 block text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                        {calc.description}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
