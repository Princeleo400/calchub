import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCalculator } from "@/lib/calculators/registry";
import type { CalculatorSlug } from "@/lib/types";

/** Inline call-to-action that sends readers from an article to a calculator. */
export function CalculatorCta({ slug, text }: { slug: CalculatorSlug; text?: string }) {
  const calc = getCalculator(slug);
  const Icon = calc.icon;
  return (
    <Link
      href={`/${calc.slug}`}
      className="group my-6 flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 no-underline! transition-colors duration-150 hover:border-blue-300 dark:border-blue-900 dark:bg-blue-950 dark:hover:border-blue-800"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-white text-blue-600 dark:bg-slate-900 dark:text-blue-400">
        <Icon className="size-4" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-slate-900 dark:text-slate-50">{calc.name}</span>
        <span className="block text-sm text-slate-600 dark:text-slate-300">{text ?? calc.description}</span>
      </span>
      <ArrowRight
        className="size-4 shrink-0 text-blue-600 transition-transform duration-150 group-hover:translate-x-0.5 dark:text-blue-400"
        aria-hidden
      />
    </Link>
  );
}
