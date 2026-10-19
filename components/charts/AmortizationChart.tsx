"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { YearRow } from "@/lib/calculators/mortgage";
import { formatCurrency } from "@/lib/utils";

// Colors come from CSS variables defined on the wrapper (see MortgageChart),
// so light and dark mode each use their own validated step.
const PRINCIPAL = "var(--series-1)";
const INTEREST = "var(--series-2)";

function compact(value: number): string {
  if (value >= 1000) return `$${Math.round(value / 1000)}k`;
  return `$${Math.round(value)}`;
}

interface TooltipPayload {
  payload?: YearRow;
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  const row = payload?.[0]?.payload;
  if (!active || !row) return null;
  return (
    <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900">
      <p className="font-semibold text-slate-900 dark:text-slate-50">Year {row.year}</p>
      <p className="mt-1 flex items-center gap-2 text-slate-600 dark:text-slate-300">
        <span className="size-2 rounded-sm" style={{ background: PRINCIPAL }} aria-hidden />
        Principal {formatCurrency(row.principal)}
      </p>
      <p className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
        <span className="size-2 rounded-sm" style={{ background: INTEREST }} aria-hidden />
        Interest {formatCurrency(row.interest)}
      </p>
      <p className="mt-1 text-slate-500 dark:text-slate-400">Balance left {formatCurrency(row.balance)}</p>
    </div>
  );
}

/** Each year's loan payments split into principal and interest. */
export default function AmortizationChart({ schedule }: { schedule: YearRow[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={schedule} margin={{ top: 8, right: 4, bottom: 0, left: 0 }} barCategoryGap={1}>
        <CartesianGrid vertical={false} stroke="var(--grid)" />
        <XAxis
          dataKey="year"
          tickLine={false}
          axisLine={{ stroke: "var(--grid)" }}
          tick={{ fill: "var(--axis-text)", fontSize: 11 }}
          interval="preserveStartEnd"
          minTickGap={16}
        />
        <YAxis
          tickFormatter={compact}
          tickLine={false}
          axisLine={false}
          width={44}
          tick={{ fill: "var(--axis-text)", fontSize: 11 }}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--cursor)" }} />
        <Bar dataKey="principal" stackId="y" fill={PRINCIPAL} maxBarSize={24} stroke="var(--surface)" strokeWidth={1} isAnimationActive={false} />
        <Bar
          dataKey="interest"
          stackId="y"
          fill={INTEREST}
          maxBarSize={24}
          radius={[4, 4, 0, 0]}
          stroke="var(--surface)"
          strokeWidth={1}
          isAnimationActive={false}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
