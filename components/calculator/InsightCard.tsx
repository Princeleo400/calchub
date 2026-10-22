import type { ReactNode } from "react";

/**
 * Plain-English explanation of the result, built from templates in
 * lib/insights. Rendered in the page HTML, so search engines can read it.
 */
export function InsightCard({
  title = "What this means",
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
      <h2 className="text-sm font-semibold text-blue-900 dark:text-blue-200">
        {title}
      </h2>
      <div className="mt-1.5 space-y-2 text-sm leading-relaxed text-blue-900/90 dark:text-blue-100/90">
        {children}
      </div>
    </section>
  );
}
