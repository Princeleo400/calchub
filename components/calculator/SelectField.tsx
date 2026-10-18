"use client";

import { useId } from "react";

interface SelectFieldProps<T extends string> {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: ReadonlyArray<{ value: T; label: string }>;
  hint?: string;
}

export function SelectField<T extends string>({ label, value, onChange, options, hint }: SelectFieldProps<T>) {
  const id = useId();
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400"
      >
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className="mt-1.5 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition-colors duration-150 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-50"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-slate-400 dark:text-slate-500">
          {hint}
        </p>
      )}
    </div>
  );
}
