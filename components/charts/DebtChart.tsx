"use client";

import dynamic from "next/dynamic";
import { formatCurrency } from "@/lib/utils";
import type { DebtChartPoint } from "./DebtBalanceLines";

const DebtBalanceLines = dynamic(() => import("./DebtBalanceLines"), {
  ssr: false,
  loading: () => <div className="h-[240px]" aria-hidden />,
});

// Plan = categorical slot 1 (blue); the minimums-only line is a neutral
// dashed reference, so it reads as "the baseline" rather than a peer series.
const chartVars =
  "[--series-1:#2a78d6] [--baseline:#94a3b8] [--grid:#e2e8f0] [--axis-text:#64748b] [--surface:#ffffff] " +
  "dark:[--series-1:#3987e5] dark:[--baseline:#64748b] dark:[--grid:#334155] dark:[--axis-text:#94a3b8] dark:[--surface:#0f172a]";

/** Longest span drawn. Plans that never finish would otherwise flatten the chart. */
const CHART_MONTHS = 360;

interface DebtChartProps {
  plan: number[];
  minimums: number[];
}

export function DebtChart({ plan, minimums }: DebtChartProps) {
  if (plan.length < 2) return null;

  const length = Math.min(Math.max(plan.length, minimums.length), CHART_MONTHS + 1);
  const truncated = Math.max(plan.length, minimums.length) > CHART_MONTHS + 1;
  const data: DebtChartPoint[] = Array.from({ length }, (_, month) => ({
    month,
    plan: month < plan.length ? plan[month] : null,
    minimums: month < minimums.length ? minimums[month] : null,
  }));
  const yearly = data.filter((d) => d.month % 12 === 0 || d.month === length - 1);

  return (
    <section
      aria-labelledby="debt-chart-heading"
      className={`rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900 ${chartVars}`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <h2 id="debt-chart-heading" className="text-base font-semibold text-slate-900 dark:text-slate-50">
          Total balance over time
        </h2>
        <ul className="flex gap-4 text-xs text-slate-600 dark:text-slate-300" aria-label="Legend">
          <li className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded-full bg-[var(--series-1)]" aria-hidden />
            Your plan
          </li>
          <li className="flex items-center gap-1.5">
            <span className="h-0 w-4 border-t-2 border-dashed border-[var(--baseline)]" aria-hidden />
            Minimums only
          </li>
        </ul>
      </div>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        {truncated
          ? "Showing the first 30 years. Paying only the minimums runs longer than that."
          : "Rolling each paid-off minimum into the next debt speeds up every payoff after the first."}
      </p>

      <div className="mt-4" aria-hidden>
        <DebtBalanceLines data={data} />
      </div>

      <details className="group mt-4 border-t border-slate-200 pt-3 dark:border-slate-700">
        <summary className="cursor-pointer text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-slate-50">
          <span className="group-open:hidden">Show the balances as a table</span>
          <span className="hidden group-open:inline">Hide the table</span>
        </summary>
        <div className="mt-3 max-h-96 overflow-auto">
          <table className="w-full text-right text-xs tabular-nums">
            <caption className="sr-only">Total balance by month for your plan and for minimum payments only</caption>
            <thead className="sticky top-0 bg-white text-slate-500 dark:bg-slate-900 dark:text-slate-400">
              <tr>
                <th scope="col" className="py-2 pr-3 text-left font-medium">Month</th>
                <th scope="col" className="py-2 pr-3 font-medium">Your plan</th>
                <th scope="col" className="py-2 font-medium">Minimums only</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 dark:divide-slate-800 dark:text-slate-200">
              {yearly.map((row) => (
                <tr key={row.month}>
                  <th scope="row" className="py-1.5 pr-3 text-left font-normal">
                    {row.month === 0 ? "Today" : row.month}
                  </th>
                  <td className="py-1.5 pr-3">{row.plan === null ? "Paid off" : formatCurrency(row.plan)}</td>
                  <td className="py-1.5">{row.minimums === null ? "Paid off" : formatCurrency(row.minimums)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}
