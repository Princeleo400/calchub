"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

interface SegmentedControlProps<T extends string> {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: ReadonlyArray<{ value: T; label: string }>;
  /** Hide the visible label (it stays available to screen readers). */
  hideLabel?: boolean;
}

/** Small set of mutually exclusive choices: units, sex, payoff method. */
export function SegmentedControl<T extends string>({
  label,
  value,
  onChange,
  options,
  hideLabel,
}: SegmentedControlProps<T>) {
  const labelId = useId();
  return (
    <div>
      <p
        id={labelId}
        className={cn(
          "text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400",
          hideLabel ? "sr-only" : "mb-1.5",
        )}
      >
        {label}
      </p>
      <div
        role="radiogroup"
        aria-labelledby={labelId}
        className="inline-flex w-full rounded-md border border-slate-300 bg-slate-50 p-0.5 dark:border-slate-600 dark:bg-slate-800"
      >
        {options.map((o) => {
          const active = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(o.value)}
              className={cn(
                "h-9 flex-1 rounded px-3 text-sm transition-colors duration-150",
                active
                  ? "border border-slate-200 bg-white font-medium text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-50"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50",
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
