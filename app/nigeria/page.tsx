import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ContentPage } from "@/components/layout/ContentPage";
import {
  calculatorPath,
  regionalCalculators,
} from "@/lib/calculators/registry";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Nigeria Tax and Pay Calculators",
  description:
    "Free calculators for Nigeria in naira: PAYE income tax and take-home pay under the Nigeria Tax Act 2025.",
  path: "/nigeria",
});

export default function NigeriaPage() {
  const tools = regionalCalculators("nigeria");
  return (
    <ContentPage
      title="Nigeria tax and pay calculators"
      intro={
        <p>
          Tools for Nigeria, in naira, built on the Nigeria Tax Act 2025 that
          took effect on 1 January 2026. Each one shows how its numbers are
          worked out and links to the law behind them.
        </p>
      }
    >
      <div className="mt-2 grid gap-3">
        {tools.map((calc) => {
          const Icon = calc.icon;
          return (
            <div key={calc.slug}>
              <Link
                href={calculatorPath(calc)}
                className="group flex gap-3 rounded-lg border border-slate-200 p-4 no-underline! transition-colors duration-150 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:border-slate-600 dark:hover:bg-slate-900"
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
            </div>
          );
        })}
      </div>
      <p>
        Estimates are for general information only and are not tax advice. For
        your own situation, check with your employer&apos;s payroll team or a
        tax professional.
      </p>
    </ContentPage>
  );
}
