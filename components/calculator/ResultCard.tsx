import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "success" | "warning" | "danger";

const toneClasses: Record<Tone, string> = {
  neutral: "text-slate-900 dark:text-slate-50",
  success: "text-green-600 dark:text-green-400",
  warning: "text-amber-600 dark:text-amber-400",
  danger: "text-red-600 dark:text-red-400",
};

interface ResultCardProps {
  /** Small label above the main number, e.g. "Monthly payment". */
  label: string;
  /** The headline result, already formatted. */
  value: string;
  /** Short line under the number, e.g. "Principal & interest $1,896". */
  caption?: ReactNode;
  tone?: Tone;
  /** Breakdown rows (ResultRow) shown below a divider. */
  children?: ReactNode;
  /** Actions such as the share button, shown at the top right. */
  actions?: ReactNode;
}

export function ResultCard({ label, value, caption, tone = "neutral", children, actions }: ResultCardProps) {
  return (
    <section
      aria-label="Result"
      className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
        {actions}
      </div>
      {/* aria-live announces new results to screen readers as inputs change. */}
      <div aria-live="polite" aria-atomic="true">
        <p className={cn("mt-2 text-4xl font-bold tracking-tight tabular-nums", toneClasses[tone])}>{value}</p>
        {caption && <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{caption}</p>}
      </div>
      {children && (
        <dl className="mt-5 divide-y divide-slate-100 border-t border-slate-200 dark:divide-slate-800 dark:border-slate-700">
          {children}
        </dl>
      )}
    </section>
  );
}

interface ResultRowProps {
  label: ReactNode;
  value: ReactNode;
  /** Bold the row, e.g. for a total. */
  emphasis?: boolean;
  /** Optional small coloured marker, matching a chart series. */
  swatch?: string;
}

export function ResultRow({ label, value, emphasis, swatch }: ResultRowProps) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <dt className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
        {swatch && <span aria-hidden className="size-2.5 shrink-0 rounded-sm" style={{ backgroundColor: swatch }} />}
        {label}
      </dt>
      <dd
        className={cn(
          "text-right text-sm tabular-nums",
          emphasis ? "font-semibold text-slate-900 dark:text-slate-50" : "text-slate-900 dark:text-slate-100",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
