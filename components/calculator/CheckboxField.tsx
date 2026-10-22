"use client";

import { useId } from "react";

interface CheckboxFieldProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  hint?: string;
}

export function CheckboxField({
  label,
  checked,
  onChange,
  hint,
}: CheckboxFieldProps) {
  const id = useId();
  return (
    <div className="flex items-start gap-2.5">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className="mt-0.5 size-4 shrink-0 rounded border-slate-300 accent-blue-600 dark:border-slate-600"
      />
      <div>
        <label
          htmlFor={id}
          className="text-sm text-slate-700 dark:text-slate-200"
        >
          {label}
        </label>
        {hint && (
          <p
            id={`${id}-hint`}
            className="mt-0.5 text-xs text-slate-400 dark:text-slate-500"
          >
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}
