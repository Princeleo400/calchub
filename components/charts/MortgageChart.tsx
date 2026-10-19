"use client";

import dynamic from "next/dynamic";
import type { YearRow } from "@/lib/calculators/mortgage";
import { formatCurrency } from "@/lib/utils";

// Recharts needs the browser DOM, so it loads on the client only. The table
// below always renders, so the numbers are in the page HTML either way.
const AmortizationChart = dynamic(() => import("./AmortizationChart"), {
  ssr: false,
  loading: () => <div className="h-[240px]" aria-hidden />,
});

// Validated categorical slots 1 and 2 (blue, orange), stepped per theme.
const chartVars =
  "[--series-1:#2a78d6] [--series-2:#eb6834] [--grid:#e2e8f0] [--axis-text:#64748b] [--cursor:rgba(148,163,184,0.15)] [--surface:#ffffff] " +
  "dark:[--series-1:#3987e5] dark:[--series-2:#d95926] dark:[--grid:#334155] dark:[--axis-text:#94a3b8] dark:[--surface:#0f172a]";

export function MortgageChart({ schedule }: { schedule: YearRow[] }) {
  if (schedule.length === 0) return null;

  return (
    <section
      aria-labelledby="amortization-heading"
      className={`rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900 ${chartVars}`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <h2 id="amortization-heading" className="text-base font-semibold text-slate-900 dark:text-slate-50">
          Where each year&apos;s payments go
        </h2>
        <ul className="flex gap-4 text-xs text-slate-600 dark:text-slate-300" aria-label="Legend">
          <li className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-[var(--series-1)]" aria-hidden />
            Principal
          </li>
          <li className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-[var(--series-2)]" aria-hidden />
            Interest
          </li>
        </ul>
      </div>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Early payments are mostly interest. The balance falls faster each year.
      </p>

      <div className="mt-4" aria-hidden>
        <AmortizationChart schedule={schedule} />
      </div>

      <details className="group mt-4 border-t border-slate-200 pt-3 dark:border-slate-700">
        <summary className="cursor-pointer text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-slate-50">
          <span className="group-open:hidden">Show the yearly amortization table</span>
          <span className="hidden group-open:inline">Hide the table</span>
        </summary>
        <div className="mt-3 max-h-96 overflow-auto">
          <table className="w-full text-right text-xs tabular-nums">
            <caption className="sr-only">Principal, interest and balance by year</caption>
            <thead className="sticky top-0 bg-white text-slate-500 dark:bg-slate-900 dark:text-slate-400">
              <tr>
                <th scope="col" className="py-2 pr-3 text-left font-medium">Year</th>
                <th scope="col" className="py-2 pr-3 font-medium">Principal</th>
                <th scope="col" className="py-2 pr-3 font-medium">Interest</th>
                <th scope="col" className="py-2 font-medium">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 dark:divide-slate-800 dark:text-slate-200">
              {schedule.map((row) => (
                <tr key={row.year}>
                  <th scope="row" className="py-1.5 pr-3 text-left font-normal">{row.year}</th>
                  <td className="py-1.5 pr-3">{formatCurrency(row.principal)}</td>
                  <td className="py-1.5 pr-3">{formatCurrency(row.interest)}</td>
                  <td className="py-1.5">{formatCurrency(row.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}
