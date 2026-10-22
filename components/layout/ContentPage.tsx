import type { ReactNode } from "react";
import Link from "next/link";

interface ContentPageProps {
  title: string;
  intro?: ReactNode;
  /** ISO date, e.g. "2026-10-20". */
  lastUpdated?: string;
  children: ReactNode;
}

/** Shared layout for text pages: About, Methodology, Privacy, Terms, Contact. */
export function ContentPage({
  title,
  intro,
  lastUpdated,
  children,
}: ContentPageProps) {
  const updated = lastUpdated
    ? new Date(`${lastUpdated}T00:00:00Z`).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
      })
    : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <nav
        aria-label="Breadcrumb"
        className="text-xs text-slate-500 dark:text-slate-400"
      >
        <ol className="flex items-center gap-1.5">
          <li>
            <Link
              href="/"
              className="hover:text-slate-900 dark:hover:text-slate-50"
            >
              Home
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li
            aria-current="page"
            className="text-slate-700 dark:text-slate-200"
          >
            {title}
          </li>
        </ol>
      </nav>

      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
        {title}
      </h1>
      {intro && (
        <div className="mt-3 text-base leading-relaxed text-slate-600 dark:text-slate-300">
          {intro}
        </div>
      )}
      {updated && (
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Last updated <time dateTime={lastUpdated}>{updated}</time>
        </p>
      )}

      <div className="mt-8 space-y-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300 [&_a]:text-blue-600 [&_a]:underline [&_a]:underline-offset-2 dark:[&_a]:text-blue-400 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-slate-900 dark:[&_h2]:text-slate-50 [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-slate-900 dark:[&_h3]:text-slate-50 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5 [&_strong]:text-slate-900 dark:[&_strong]:text-slate-50 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
        {children}
      </div>
    </div>
  );
}
