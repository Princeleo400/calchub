"use client";

import { useState } from "react";
import { History, X } from "lucide-react";
import { useCalculatorHistory } from "@/lib/hooks/useCalculatorHistory";
import type { CalculationRecord, CalculatorSlug } from "@/lib/types";
import { timeAgo } from "@/lib/utils";

interface HistoryPanelProps {
  calculator: CalculatorSlug;
  onRestore: (record: CalculationRecord) => void;
}

/** Past calculations saved in this browser. Nothing leaves the device. */
export function HistoryPanel({ calculator, onRestore }: HistoryPanelProps) {
  const { records, remove, clear } = useCalculatorHistory(calculator);
  const [confirming, setConfirming] = useState(false);

  return (
    <section
      aria-labelledby={`${calculator}-history`}
      className="rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
    >
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-700">
        <h2
          id={`${calculator}-history`}
          className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-50"
        >
          <History className="size-4 text-slate-400" aria-hidden />
          Your recent calculations
        </h2>
        {records.length > 0 &&
          (confirming ? (
            <span className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                Clear all?
              </span>
              <button
                type="button"
                onClick={() => {
                  clear();
                  setConfirming(false);
                }}
                className="font-medium text-red-600 hover:text-red-700 dark:text-red-400"
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50"
              >
                No
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="text-xs font-medium text-slate-500 transition-colors duration-150 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50"
            >
              Clear all
            </button>
          ))}
      </div>

      {records.length === 0 ? (
        <p className="px-4 py-5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          Change any input and your calculations are saved here automatically,
          in this browser only. No account needed.
        </p>
      ) : (
        <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">
          {records.map((record) => (
            <li key={record.id} className="group relative">
              <button
                type="button"
                onClick={() => onRestore(record)}
                className="block w-full px-4 py-3 pr-10 text-left transition-colors duration-150 hover:bg-slate-50 dark:hover:bg-slate-800/60"
              >
                <span className="block text-sm font-semibold text-slate-900 tabular-nums dark:text-slate-50">
                  {record.result}
                </span>
                <span className="mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400">
                  {record.summary}
                </span>
                <span className="mt-0.5 block text-[11px] text-slate-400 dark:text-slate-500">
                  {timeAgo(record.timestamp)}
                </span>
              </button>
              <button
                type="button"
                onClick={() => remove(record.id)}
                aria-label={`Delete ${record.result} from history`}
                className="absolute top-3 right-2 flex size-7 items-center justify-center rounded-md text-slate-400 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-700 focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100 dark:hover:bg-slate-700 dark:hover:text-slate-200"
              >
                <X className="size-3.5" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
