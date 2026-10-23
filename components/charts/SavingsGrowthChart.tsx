"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SavingsYearRow } from "@/lib/calculators/savings";
import { compactMoney, niceTicks } from "@/lib/chartTicks";
import { formatCurrency } from "@/lib/utils";

// Colors come from CSS variables defined on the wrapper (see SavingsChart),
// so light and dark mode each use their own validated step.
const DEPOSITS = "var(--series-1)";
const INTEREST = "var(--series-2)";

interface TooltipPayload {
  payload?: SavingsYearRow;
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
}) {
  const row = payload?.[0]?.payload;
  if (!active || !row) return null;
  return (
    <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900">
      <p className="font-semibold text-slate-900 dark:text-slate-50">
        Year {row.year}: {formatCurrency(row.balance)}
      </p>
      <p className="mt-1 flex items-center gap-2 text-slate-600 dark:text-slate-300">
        <span
          className="size-2 rounded-sm"
          style={{ background: DEPOSITS }}
          aria-hidden
        />
        Deposits {formatCurrency(row.totalDeposits)}
      </p>
      <p className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
        <span
          className="size-2 rounded-sm"
          style={{ background: INTEREST }}
          aria-hidden
        />
        Interest {formatCurrency(row.totalInterest)}
      </p>
    </div>
  );
}

/** Balance at the end of each year, split into money deposited and interest. */
export default function SavingsGrowthChart({
  schedule,
}: {
  schedule: SavingsYearRow[];
}) {
  const ticks = niceTicks(Math.max(...schedule.map((row) => row.balance)));
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart
        data={schedule}
        margin={{ top: 8, right: 4, bottom: 0, left: 0 }}
        barCategoryGap={1}
      >
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
          ticks={ticks}
          domain={[0, ticks.at(-1) ?? 0]}
          tickFormatter={compactMoney}
          tickLine={false}
          axisLine={false}
          width={48}
          tick={{ fill: "var(--axis-text)", fontSize: 11 }}
        />
        <Tooltip
          content={<ChartTooltip />}
          cursor={{ fill: "var(--cursor)" }}
        />
        <Bar
          dataKey="totalDeposits"
          stackId="balance"
          fill={DEPOSITS}
          maxBarSize={24}
          stroke="var(--surface)"
          strokeWidth={1}
          isAnimationActive={false}
        />
        <Bar
          dataKey="totalInterest"
          stackId="balance"
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
