"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  /** Shown inside the field on the left, e.g. "$". */
  prefix?: string;
  /** Shown inside the field on the right, e.g. "%", "years", "kg". */
  suffix?: string;
  min?: number;
  max?: number;
  /** Decimal places allowed. 0 for whole numbers. */
  decimals?: number;
  /** Group thousands with commas when not editing (for money). */
  grouped?: boolean;
  hint?: string;
  id?: string;
}

function display(value: number, decimals: number, grouped: boolean): string {
  if (!Number.isFinite(value)) return "";
  const rounded = Number(value.toFixed(decimals));
  return grouped
    ? rounded.toLocaleString("en-US", { maximumFractionDigits: decimals })
    : String(rounded);
}

/**
 * Text input that edits a number. Keeps what the user typed while focused
 * (so "6." or an empty field don't fight them), reports valid numbers on
 * every keystroke, and tidies the display on blur.
 */
export function NumberField({
  label,
  value,
  onChange,
  prefix,
  suffix,
  min,
  max,
  decimals = 2,
  grouped = false,
  hint,
  id,
}: NumberFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;

  const [draft, setDraft] = useState<string | null>(null);
  const text = draft ?? display(value, decimals, grouped);

  const parsed = draft === null ? value : parse(draft);
  const error =
    draft === null
      ? null
      : draft.trim() === ""
        ? "Enter a number"
        : parsed === null
          ? "Enter a valid number"
          : min !== undefined && parsed < min
            ? `Minimum is ${display(min, decimals, grouped)}`
            : max !== undefined && parsed > max
              ? `Maximum is ${display(max, decimals, grouped)}`
              : null;

  function parse(raw: string): number | null {
    const cleaned = raw.replace(/[,\s]/g, "");
    if (cleaned === "" || cleaned === "-" || cleaned === ".") return null;
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : null;
  }

  function handleChange(raw: string) {
    // Allow digits, one dot (if decimals), commas and spaces while typing.
    const pattern = decimals > 0 ? /^-?[\d,\s]*\.?\d*$/ : /^-?[\d,\s]*$/;
    if (!pattern.test(raw)) return;
    setDraft(raw);
    const n = parse(raw);
    if (n === null) return;
    if ((min !== undefined && n < min) || (max !== undefined && n > max)) return;
    onChange(n);
  }

  return (
    <div>
      <label
        htmlFor={inputId}
        className="block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400"
      >
        {label}
      </label>
      <div
        className={cn(
          "mt-1.5 flex items-center rounded-md border bg-white transition-colors duration-150 focus-within:ring-2 dark:bg-slate-900",
          error
            ? "border-red-300 focus-within:ring-red-500 dark:border-red-800"
            : "border-slate-300 focus-within:border-blue-500 focus-within:ring-blue-500/30 dark:border-slate-600",
        )}
      >
        {prefix && <span className="pl-3 text-sm text-slate-400 dark:text-slate-500">{prefix}</span>}
        <input
          id={inputId}
          type="text"
          inputMode={decimals > 0 ? "decimal" : "numeric"}
          autoComplete="off"
          value={text}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setDraft(display(value, decimals, false))}
          onBlur={() => setDraft(null)}
          aria-invalid={error ? true : undefined}
          aria-describedby={cn(hint && hintId, error && errorId) || undefined}
          className={cn(
            "h-10 w-full min-w-0 bg-transparent text-sm text-slate-900 tabular-nums outline-none placeholder:text-slate-400 dark:text-slate-50",
            prefix ? "pl-1.5" : "pl-3",
            suffix ? "pr-1.5" : "pr-3",
          )}
        />
        {suffix && (
          <span className="whitespace-nowrap pr-3 text-sm text-slate-400 dark:text-slate-500">{suffix}</span>
        )}
      </div>
      {error ? (
        <p id={errorId} className="mt-1 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="mt-1 text-xs text-slate-400 dark:text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
