import type { ReactNode } from "react";
import Link from "next/link";
import { AdSlot } from "@/components/ads/AdSlot";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCalculator, categoryLabels } from "@/lib/calculators/registry";
import {
  breadcrumbJsonLd,
  faqJsonLd,
  webApplicationJsonLd,
  type FaqItem,
} from "@/lib/seo/jsonLd";
import type { CalculatorSlug } from "@/lib/types";
import { RelatedCalculators } from "./RelatedCalculators";

interface CalculatorShellProps {
  slug: CalculatorSlug;
  /** H1. Should contain the main keyword, e.g. "Mortgage Calculator". */
  title: string;
  /** One or two sentences under the H1 saying what the tool answers. */
  intro: ReactNode;
  /** The interactive calculator (a client component). */
  children: ReactNode;
  /** The written guide below the calculator: H2 sections, examples. */
  guide?: ReactNode;
  faqs?: FaqItem[];
  /** Sources the guide relies on, shown and linked at the end. */
  sources?: Array<{ label: string; href: string }>;
  /** ISO date the page content was last checked, e.g. "2026-10-18". */
  lastReviewed: string;
  /**
   * For pages built on a calculator but living at their own address, such as
   * /how-much-house-can-i-afford/70k. Defaults to the calculator's own page.
   */
  page?: {
    path: string;
    /** Breadcrumb label for this page. */
    label: string;
    /** Optional parent crumb between the category and this page. */
    parent?: { label: string; path: string };
  };
}

/**
 * Page frame every calculator uses: breadcrumb, H1, ads, guide, FAQ,
 * sources, review date, related calculators and structured data.
 */
export function CalculatorShell({
  slug,
  title,
  intro,
  children,
  guide,
  faqs,
  sources,
  lastReviewed,
  page,
}: CalculatorShellProps) {
  const meta = getCalculator(slug);
  const path = page?.path ?? `/${slug}`;
  const currentLabel = page?.label ?? meta.name;
  const parent = page?.parent;
  const reviewed = new Date(`${lastReviewed}T00:00:00Z`).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    },
  );

  const structuredData: object[] = [
    webApplicationJsonLd({
      name: title,
      description: meta.description,
      path,
      category: meta.category,
    }),
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      ...(parent ? [{ name: parent.label, path: parent.path }] : []),
      { name: title, path },
    ]),
  ];
  if (faqs?.length) structuredData.push(faqJsonLd(faqs));

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <JsonLd data={structuredData} />

      <nav
        aria-label="Breadcrumb"
        className="text-xs text-slate-500 dark:text-slate-400"
      >
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link
              href="/"
              className="hover:text-slate-900 dark:hover:text-slate-50"
            >
              Home
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link
              href={`/#${meta.category}`}
              className="hover:text-slate-900 dark:hover:text-slate-50"
            >
              {categoryLabels[meta.category]}
            </Link>
          </li>
          {parent && (
            <>
              <li aria-hidden>/</li>
              <li>
                <Link
                  href={parent.path}
                  className="hover:text-slate-900 dark:hover:text-slate-50"
                >
                  {parent.label}
                </Link>
              </li>
            </>
          )}
          <li aria-hidden>/</li>
          <li
            aria-current="page"
            className="text-slate-700 dark:text-slate-200"
          >
            {currentLabel}
          </li>
        </ol>
      </nav>

      <header className="mt-4 max-w-3xl">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
          {title}
        </h1>
        <div className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {intro}
        </div>
      </header>

      <AdSlot position="header" className="mt-6" />

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">
          {children}

          <AdSlot position="in-content" className="my-8" />

          {guide && (
            <div className="max-w-3xl space-y-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300 [&_a]:text-blue-600 [&_a]:underline [&_a]:underline-offset-2 dark:[&_a]:text-blue-400 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-slate-900 dark:[&_h2]:text-slate-50 [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-slate-900 dark:[&_h3]:text-slate-50 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5 [&_strong]:text-slate-900 dark:[&_strong]:text-slate-50 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
              {guide}
            </div>
          )}

          {faqs && faqs.length > 0 && (
            <section aria-labelledby="faq-heading" className="mt-10 max-w-3xl">
              <h2
                id="faq-heading"
                className="text-xl font-semibold text-slate-900 dark:text-slate-50"
              >
                Frequently asked questions
              </h2>
              <dl className="mt-4 divide-y divide-slate-200 border-y border-slate-200 dark:divide-slate-800 dark:border-slate-800">
                {faqs.map((faq) => (
                  <div key={faq.question} className="py-4">
                    <dt className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                      {faq.question}
                    </dt>
                    <dd className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {faq.answer}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {sources && sources.length > 0 && (
            <section
              aria-labelledby="sources-heading"
              className="mt-10 max-w-3xl"
            >
              <h2
                id="sources-heading"
                className="text-base font-semibold text-slate-900 dark:text-slate-50"
              >
                Sources
              </h2>
              <ul className="mt-2 space-y-1 text-sm">
                {sources.map((source) => (
                  <li key={source.href}>
                    <a
                      href={source.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline underline-offset-2 hover:text-blue-700 dark:text-blue-400"
                    >
                      {source.label}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <p className="mt-8 max-w-3xl text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Last reviewed <time dateTime={lastReviewed}>{reviewed}</time>.
            Results are estimates for general information and are not financial
            or medical advice.{" "}
            <Link
              href="/methodology"
              className="underline underline-offset-2 hover:text-slate-900 dark:hover:text-slate-50"
            >
              How we calculate
            </Link>
            .
          </p>
        </div>

        <aside className="hidden lg:block" aria-label="Advertisement">
          <div className="sticky top-20">
            <AdSlot position="sidebar" />
          </div>
        </aside>
      </div>

      <RelatedCalculators current={slug} />
    </div>
  );
}
