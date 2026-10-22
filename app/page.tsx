import Link from "next/link";
import { ArrowRight, BookOpen, Calculator, ShieldCheck } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  calculatorsByCategory,
  categoryLabels,
} from "@/lib/calculators/registry";
import type { CalculatorCategory } from "@/lib/types";
import { site } from "@/lib/site";

const sections: Array<{ category: CalculatorCategory; intro: string }> = [
  {
    category: "finance",
    intro: "Mortgages, loans and debt, with every payment broken down.",
  },
  {
    category: "health",
    intro:
      "Body mass index and daily calorie needs, based on CDC and published formulas.",
  },
];

const principles = [
  {
    icon: Calculator,
    title: "The math, shown",
    body: "Every result comes with the formula and your numbers plugged in, so you can check it.",
    href: "/methodology",
    link: "How we calculate",
  },
  {
    icon: ShieldCheck,
    title: "Private by design",
    body: "Calculations run in your browser. No sign-up, and your history stays on your device.",
    href: "/privacy",
    link: "Privacy policy",
  },
  {
    icon: BookOpen,
    title: "Sources you can trust",
    body: "Guides cite official sources such as the CFPB and the CDC, and every page shows when it was reviewed.",
    href: "/about",
    link: "About CalcHub",
  },
];

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: site.name,
  url: site.url,
  description: site.description,
};

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <JsonLd data={websiteJsonLd} />

      <section className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl dark:text-slate-50">
          {site.tagline}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">
          Work out a mortgage payment, plan your way out of debt or check your
          BMI in seconds. Clear answers, the formulas behind them, and no
          sign-up.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/mortgage-calculator"
            className="inline-flex h-10 items-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-700"
          >
            Mortgage calculator
            <ArrowRight className="size-4" aria-hidden />
          </Link>
          <Link
            href="/bmi-calculator"
            className="inline-flex h-10 items-center rounded-md border border-slate-300 px-4 text-sm font-medium text-slate-700 transition-colors duration-150 hover:border-slate-400 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-900"
          >
            BMI calculator
          </Link>
        </div>
      </section>

      {sections.map(({ category, intro }) => (
        <section
          key={category}
          id={category}
          aria-labelledby={`${category}-heading`}
          className="mt-14 scroll-mt-20"
        >
          <h2
            id={`${category}-heading`}
            className="text-xl font-semibold text-slate-900 dark:text-slate-50"
          >
            {categoryLabels[category]} calculators
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {intro}
          </p>
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

      <section
        aria-labelledby="how-heading"
        className="mt-16 border-t border-slate-200 pt-10 dark:border-slate-800"
      >
        <h2
          id="how-heading"
          className="text-xl font-semibold text-slate-900 dark:text-slate-50"
        >
          How {site.name} works
        </h2>
        <ul className="mt-6 grid gap-6 sm:grid-cols-3">
          {principles.map(({ icon: Icon, title, body, href, link }) => (
            <li key={title}>
              <span className="flex size-9 items-center justify-center rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <Icon className="size-4" aria-hidden />
              </span>
              <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-slate-50">
                {title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {body}
              </p>
              <Link
                href={href}
                className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                {link}
                <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
