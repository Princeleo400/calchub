"use client";

import { CalculatorPanel } from "@/components/calculator/CalculatorPanel";
import { FormulaReveal } from "@/components/calculator/FormulaReveal";
import { InsightCard } from "@/components/calculator/InsightCard";
import { NumberField } from "@/components/calculator/NumberField";
import { ResultCard, ResultRow } from "@/components/calculator/ResultCard";
import { SegmentedControl } from "@/components/calculator/SegmentedControl";
import { ShareButton } from "@/components/calculator/ShareButton";
import { DebtChart } from "@/components/charts/DebtChart";
import { HistoryPanel } from "@/components/history/HistoryPanel";
import {
  calculateDebtPayoff,
  decodeDebts,
  encodeDebts,
  type Debt,
  type PayoffMethod,
  type PayoffPlan,
} from "@/lib/calculators/debtPayoff";
import { formatDuration } from "@/lib/calculators/mortgage";
import { useRecordCalculation } from "@/lib/hooks/useCalculatorHistory";
import { useShareableUrl } from "@/lib/hooks/useShareableUrl";
import { debtPayoffInsight } from "@/lib/insights/debtPayoff";
import { cn, formatCurrency } from "@/lib/utils";
import { DebtList } from "./DebtList";

const DEFAULT_DEBTS: Debt[] = [
  { name: "Credit card", balance: 6_500, rate: 24.9, minPayment: 195 },
  { name: "Personal loan", balance: 3_200, rate: 11.5, minPayment: 105 },
  { name: "Store card", balance: 1_200, rate: 19.99, minPayment: 40 },
  { name: "Car loan", balance: 9_000, rate: 7.5, minPayment: 280 },
];

const DEFAULTS = {
  debts: encodeDebts(DEFAULT_DEBTS),
  extra: 250,
  method: "avalanche",
};

const METHODS = [
  { value: "avalanche", label: "Avalanche" },
  { value: "snowball", label: "Snowball" },
] as const;

export function DebtPayoffCalculator() {
  const { values, update, replace } = useShareableUrl(DEFAULTS);
  const debts = decodeDebts(values.debts);
  const method: PayoffMethod = values.method === "snowball" ? "snowball" : "avalanche";
  const result = calculateDebtPayoff(debts, values.extra);
  const plan = method === "avalanche" ? result.avalanche : result.snowball;
  const insight = debtPayoffInsight(result, method, values.extra);
  const headline = plan.months === null ? "Never" : formatDuration(plan.months);

  useRecordCalculation({
    calculator: "debt-payoff-calculator",
    inputs: values,
    defaults: DEFAULTS,
    result: plan.months === null ? "Not paid off" : `Debt-free in ${headline}`,
    summary: `${debts.length} debt${debts.length === 1 ? "" : "s"}, ${formatCurrency(result.totalBalance)}, ${method}, +${formatCurrency(values.extra)}/mo`,
    enabled: result.totalBalance > 0,
  });

  const formula = [
    "Each month, for every debt:",
    "  interest = balance × APR ÷ 12",
    "  pay the minimum",
    "",
    `Then the rest of your ${formatCurrency(result.monthlyBudget)} budget goes to the target debt:`,
    method === "avalanche" ? "  avalanche → highest APR first" : "  snowball  → smallest balance first",
    "",
    "When a debt is paid off, its minimum rolls into the next target,",
    "so the total you pay each month stays the same.",
    "",
    `Budget = ${formatCurrency(result.totalMinimums)} minimums + ${formatCurrency(values.extra)} extra = ${formatCurrency(result.monthlyBudget)} a month`,
  ];

  return (
    <CalculatorPanel
      inputs={
        <>
          <DebtList debts={debts} onChange={(next) => update({ debts: encodeDebts(next) })} />
          <div className="space-y-4 border-t border-slate-200 pt-4 dark:border-slate-700">
            <NumberField
              label="Extra payment"
              prefix="$"
              suffix="/ mo"
              grouped
              decimals={0}
              min={0}
              max={1_000_000}
              value={values.extra}
              onChange={(extra) => update({ extra })}
              hint="On top of your minimums, every month"
            />
            <SegmentedControl
              label="Payoff method"
              value={method}
              onChange={(next) => update({ method: next })}
              options={METHODS}
            />
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              {method === "avalanche"
                ? "Avalanche pays the highest interest rate first. It costs the least."
                : "Snowball pays the smallest balance first. You clear debts sooner, which can help you stay motivated."}
            </p>
          </div>
        </>
      }
      results={
        <>
          <ResultCard
            label="Debt-free in"
            value={headline}
            tone={plan.months === null ? "danger" : "neutral"}
            caption={
              plan.months === null
                ? "Payments don't cover the interest. Increase your extra payment."
                : `Paying ${formatCurrency(result.monthlyBudget)} a month with the ${method} method`
            }
            actions={<ShareButton calculator="debt-payoff-calculator" />}
          >
            <ResultRow label="Total owed today" value={formatCurrency(result.totalBalance)} />
            <ResultRow label="Total interest" value={formatCurrency(plan.totalInterest)} emphasis />
            <ResultRow label="Total paid" value={formatCurrency(plan.totalPaid)} />
          </ResultCard>

          <MethodComparison avalanche={result.avalanche} snowball={result.snowball} selected={method} />

          <InsightCard>
            {insight.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </InsightCard>
        </>
      }
      footer={
        <>
          <PayoffOrder plan={plan} method={method} />
          <DebtChart plan={plan.balances} minimums={result.minimumsOnly.balances} />
          <FormulaReveal
            title="Show how the plan is calculated"
            lines={formula}
            note="Assumes fixed minimum payments, fixed rates and no new charges. Real credit card minimums usually fall as the balance falls."
          />
          <HistoryPanel calculator="debt-payoff-calculator" onRestore={(record) => replace(record.inputs)} />
        </>
      }
    />
  );
}

function MethodComparison({
  avalanche,
  snowball,
  selected,
}: {
  avalanche: PayoffPlan;
  snowball: PayoffPlan;
  selected: PayoffMethod;
}) {
  const cheaper =
    avalanche.totalInterest + 0.5 < snowball.totalInterest
      ? "avalanche"
      : snowball.totalInterest + 0.5 < avalanche.totalInterest
        ? "snowball"
        : null;
  const plans: Array<{ key: PayoffMethod; label: string; plan: PayoffPlan }> = [
    { key: "avalanche", label: "Avalanche", plan: avalanche },
    { key: "snowball", label: "Snowball", plan: snowball },
  ];

  return (
    <section aria-label="Method comparison" className="grid grid-cols-2 gap-3">
      {plans.map(({ key, label, plan }) => (
        <div
          key={key}
          className={cn(
            "rounded-lg border p-4",
            key === selected
              ? "border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-950"
              : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900",
          )}
        >
          <p className="flex items-center justify-between gap-2 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {label}
            {cheaper === key && (
              <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold normal-case tracking-normal text-green-700 dark:bg-green-950 dark:text-green-400">
                Lowest cost
              </span>
            )}
          </p>
          <p className="mt-2 text-lg font-semibold tabular-nums text-slate-900 dark:text-slate-50">
            {plan.months === null ? "Never" : formatDuration(plan.months)}
          </p>
          <p className="mt-0.5 text-xs tabular-nums text-slate-500 dark:text-slate-400">
            {formatCurrency(plan.totalInterest)} interest
          </p>
        </div>
      ))}
    </section>
  );
}

function PayoffOrder({ plan, method }: { plan: PayoffPlan; method: PayoffMethod }) {
  if (plan.order.length === 0) return null;
  return (
    <section
      aria-labelledby="payoff-order-heading"
      className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
    >
      <h2 id="payoff-order-heading" className="text-base font-semibold text-slate-900 dark:text-slate-50">
        Your payoff order
      </h2>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        {method === "avalanche" ? "Highest interest rate first." : "Smallest balance first."} Extra money goes to the
        top debt that is still open.
      </p>
      <ol className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
        {plan.order.map((debt, i) => (
          <li key={`${debt.name}-${i}`} className="flex items-center justify-between gap-4 py-2.5 text-sm">
            <span className="flex min-w-0 items-center gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {i + 1}
              </span>
              <span className="truncate text-slate-900 dark:text-slate-50">{debt.name || `Debt ${i + 1}`}</span>
            </span>
            <span className="shrink-0 text-right tabular-nums text-slate-600 dark:text-slate-300">
              {debt.paidOffMonth === null ? "Not paid off" : `Paid off in ${formatDuration(debt.paidOffMonth)}`}
              <span className="block text-xs text-slate-400 dark:text-slate-500">
                {formatCurrency(debt.interestPaid)} interest
              </span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
