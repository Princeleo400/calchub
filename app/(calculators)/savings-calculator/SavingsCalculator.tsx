"use client";

import { CalculatorPanel } from "@/components/calculator/CalculatorPanel";
import { FormulaReveal } from "@/components/calculator/FormulaReveal";
import { InsightCard } from "@/components/calculator/InsightCard";
import { NumberField } from "@/components/calculator/NumberField";
import { ResultCard, ResultRow } from "@/components/calculator/ResultCard";
import { SelectField } from "@/components/calculator/SelectField";
import { ShareButton } from "@/components/calculator/ShareButton";
import { SavingsChart } from "@/components/charts/SavingsChart";
import { HistoryPanel } from "@/components/history/HistoryPanel";
import {
  calculateSavings,
  COMPOUNDS_PER_YEAR,
  monthlyDepositForGoal,
  type Compounding,
  type SavingsInputs,
} from "@/lib/calculators/savings";
import { useRecordCalculation } from "@/lib/hooks/useCalculatorHistory";
import { useShareableUrl } from "@/lib/hooks/useShareableUrl";
import { savingsInsight } from "@/lib/insights/savings";
import { formatCurrency, formatPercent } from "@/lib/utils";

const DEFAULTS = {
  start: 5_000,
  monthly: 200,
  rate: 4,
  compounding: "monthly",
  years: 10,
  increase: 0,
  goal: 0,
};

const COMPOUNDING_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "annually", label: "Annually" },
] as const;

function toCompounding(value: unknown): Compounding {
  return typeof value === "string" && value in COMPOUNDS_PER_YEAR
    ? (value as Compounding)
    : "monthly";
}

function toInputs(values: typeof DEFAULTS): SavingsInputs {
  return {
    initialDeposit: values.start,
    monthlyDeposit: values.monthly,
    rate: values.rate,
    compounding: toCompounding(values.compounding),
    years: values.years,
    annualIncreasePct: values.increase,
  };
}

export function SavingsCalculator() {
  const { values, update, replace } = useShareableUrl(DEFAULTS);
  const inputs = toInputs(values);
  const result = calculateSavings(inputs);
  const insight = savingsInsight(inputs, result);
  const headline = formatCurrency(result.finalBalance);
  const goalDeposit =
    values.goal > 0 ? monthlyDepositForGoal(inputs, values.goal) : null;
  const yearsLabel = `${values.years} year${values.years === 1 ? "" : "s"}`;

  useRecordCalculation({
    calculator: "savings-calculator",
    inputs: values,
    defaults: DEFAULTS,
    result: headline,
    summary: `${formatCurrency(values.start)} + ${formatCurrency(values.monthly)}/mo at ${values.rate}% for ${yearsLabel}`,
    enabled: values.years > 0,
  });

  const periods = COMPOUNDS_PER_YEAR[inputs.compounding];
  const monthlyRate = (1 + values.rate / 100 / periods) ** (periods / 12) - 1;
  const months = values.years * 12;
  const formula = [
    "Balance = P(1 + i)^m + D × ((1 + i)^m − 1) / i",
    "",
    `P = ${formatCurrency(values.start)} starting balance`,
    `D = ${formatCurrency(values.monthly)} deposited at the end of each month`,
    `i = monthly growth rate = (1 + ${values.rate}% ÷ ${periods})^(${periods} ÷ 12) − 1`,
    `  = ${(monthlyRate * 100).toFixed(5)}%`,
    `m = ${months} months`,
    "",
    `Balance = ${formatCurrency(result.finalBalance, "USD", 2)}`,
    ...(values.increase > 0
      ? [
          "",
          `With a ${values.increase}% yearly increase, D grows each year, so`,
          "the balance is added up month by month instead.",
        ]
      : []),
  ];

  return (
    <CalculatorPanel
      inputs={
        <>
          <NumberField
            label="Starting balance"
            prefix="$"
            grouped
            decimals={0}
            min={0}
            max={100_000_000}
            value={values.start}
            onChange={(start) => update({ start })}
          />
          <NumberField
            label="Monthly deposit"
            prefix="$"
            suffix="/ mo"
            grouped
            decimals={0}
            min={0}
            max={10_000_000}
            value={values.monthly}
            onChange={(monthly) => update({ monthly })}
          />
          <div className="grid grid-cols-2 gap-4">
            <NumberField
              label="Interest rate"
              suffix="%"
              decimals={3}
              min={0}
              max={50}
              value={values.rate}
              onChange={(rate) => update({ rate })}
            />
            <SelectField
              label="Compounding"
              value={inputs.compounding}
              onChange={(compounding) => update({ compounding })}
              options={COMPOUNDING_OPTIONS}
            />
          </div>
          <NumberField
            label="Years"
            suffix="years"
            decimals={0}
            min={1}
            max={80}
            value={values.years}
            onChange={(years) => update({ years })}
          />

          <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-4 dark:border-slate-700">
            <NumberField
              label="Yearly increase"
              suffix="%"
              decimals={1}
              min={0}
              max={50}
              value={values.increase}
              onChange={(increase) => update({ increase })}
              hint="Raise deposits each year"
            />
            <NumberField
              label="Savings goal"
              prefix="$"
              grouped
              decimals={0}
              min={0}
              max={100_000_000}
              value={values.goal}
              onChange={(goal) => update({ goal })}
              hint="Optional"
            />
          </div>
        </>
      }
      results={
        <>
          <ResultCard
            label={`Balance after ${yearsLabel}`}
            value={headline}
            caption={`${formatCurrency(values.monthly)} a month at ${formatPercent(values.rate, 2)}, compounded ${inputs.compounding}`}
            actions={<ShareButton calculator="savings-calculator" />}
          >
            <ResultRow
              label="Total deposits"
              value={formatCurrency(result.totalDeposits)}
            />
            <ResultRow
              label="Interest earned"
              value={formatCurrency(result.totalInterest)}
              emphasis
            />
            <ResultRow
              label="Annual yield (APY)"
              value={formatPercent(result.apy, 2)}
            />
            {goalDeposit !== null && (
              <ResultRow
                label={`Fixed monthly deposit for ${formatCurrency(values.goal)}`}
                value={
                  goalDeposit === 0
                    ? "Already on track"
                    : `${formatCurrency(Math.ceil(goalDeposit))}/mo`
                }
              />
            )}
          </ResultCard>
          <InsightCard>
            {insight.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </InsightCard>
        </>
      }
      footer={
        <>
          <SavingsChart schedule={result.schedule} />
          <FormulaReveal
            lines={formula}
            note="Compound interest with monthly deposits made at the end of each month."
          />
          <HistoryPanel
            calculator="savings-calculator"
            onRestore={(record) => replace(record.inputs)}
          />
        </>
      }
    />
  );
}
