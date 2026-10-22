import type { ReactNode } from "react";

interface FormulaRevealProps {
  /** One line per step, with the user's numbers substituted in. */
  lines: string[];
  /** Optional note under the math, e.g. the source of the formula. */
  note?: ReactNode;
  title?: string;
}

/** "Show calculation" disclosure. Works without JavaScript (<details>). */
export function FormulaReveal({
  lines,
  note,
  title = "Show the calculation",
}: FormulaRevealProps) {
  return (
    <details className="group rounded-lg border border-slate-200 dark:border-slate-700">
      <summary className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-slate-700 transition-colors duration-150 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/60">
        {title}
        <svg
          viewBox="0 0 12 12"
          className="size-3 text-slate-400 transition-transform group-open:rotate-180"
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
      <div className="border-t border-slate-200 px-4 py-3 dark:border-slate-700">
        <pre className="overflow-x-auto rounded-md border border-slate-200 bg-slate-50 p-3 font-mono text-xs leading-relaxed text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
          {lines.join("\n")}
        </pre>
        {note && (
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {note}
          </p>
        )}
      </div>
    </details>
  );
}
