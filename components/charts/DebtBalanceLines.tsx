"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency } from "@/lib/utils";

export interface DebtChartPoint {
  month: number;
  plan: number | null;
  minimums: number | null;
}

const PLAN = "var(--series-1)";
const MINIMUMS = "var(--baseline)";

function compact(value: number): string {
  if (value >= 1000) return `$${Math.round(value / 1000)}k`;
  return `$${Math.round(value)}`;
}

function monthLabel(m: number): string {
  if (m === 0) return "Today";
  return m % 12 === 0 ? `Yr ${m / 12}` : `Mo ${m}`;
}

interface TooltipEntry {
  payload?: DebtChartPoint;
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: TooltipEntry[] }) {
  const p = payload?.[0]?.payload;
  if (!active || !p) return null;
  return (
    <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900">
      <p className="font-semibold text-slate-900 dark:text-slate-50">{p.month === 0 ? "Today" : `Month ${p.month}`}</p>
      {p.plan !== null && (
        <p className="mt-1 flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <span className="h-0.5 w-3 rounded-full" style={{ background: PLAN }} aria-hidden />
          Your plan {formatCurrency(p.plan)}
        </p>
      )}
      {p.minimums !== null && (
        <p className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <span className="h-0.5 w-3 rounded-full" style={{ background: MINIMUMS }} aria-hidden />
          Minimums only {formatCurrency(p.minimums)}
        </p>
      )}
    </div>
  );
}

/** Total balance over time: the chosen plan vs paying minimums only. */
export default function DebtBalanceLines({ data }: { data: DebtChartPoint[] }) {
  const last = data.at(-1)?.month ?? 0;
  const ticks = data.filter((d) => d.month % 12 === 0).map((d) => d.month);
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--grid)" />
        <XAxis
          dataKey="month"
          type="number"
          domain={[0, last]}
          ticks={ticks.length > 1 ? ticks : undefined}
          tickFormatter={monthLabel}
          tickLine={false}
          axisLine={{ stroke: "var(--grid)" }}
          tick={{ fill: "var(--axis-text)", fontSize: 11 }}
          minTickGap={20}
        />
        <YAxis
          tickFormatter={compact}
          tickLine={false}
          axisLine={false}
          width={44}
          tick={{ fill: "var(--axis-text)", fontSize: 11 }}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--axis-text)", strokeWidth: 1, strokeDasharray: "3 3" }} />
        <Line
          dataKey="minimums"
          stroke={MINIMUMS}
          strokeWidth={2}
          strokeDasharray="5 4"
          dot={false}
          activeDot={{ r: 4, stroke: "var(--surface)", strokeWidth: 2 }}
          connectNulls={false}
          isAnimationActive={false}
        />
        <Line
          dataKey="plan"
          stroke={PLAN}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, stroke: "var(--surface)", strokeWidth: 2 }}
          connectNulls={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
