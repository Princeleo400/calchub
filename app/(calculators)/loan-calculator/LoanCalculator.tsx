"use client";

import { CalculatorPanel } from "@/components/calculator/CalculatorPanel";
import { FormulaReveal } from "@/components/calculator/FormulaReveal";
import { InsightCard } from "@/components/calculator/InsightCard";
import { NumberField } from "@/components/calculator/NumberField";
import { ResultCard, ResultRow } from "@/components/calculator/ResultCard";
import { SegmentedControl } from "@/components/calculator/SegmentedControl";
import { ShareButton } from "@/components/calculator/ShareButton";
import { MortgageChart } from "@/components/charts/MortgageChart";
import { HistoryPanel } from "@/components/history/HistoryPanel";
import { calculateLoan, type LoanInputs } from "@/lib/calculators/loan";
import { formatDuration } from "@/lib/calculators/mortgage";
import { useRecordCalculation } from "@/lib/hooks/useCalculatorHistory";
import { useShareableUrl } from "@/lib/hooks/useShareableUrl";
import { loanInsight } from "@/lib/insights/loan";
import { formatCurrency, formatPercent } from "@/lib/utils";

const DEFAULTS = {
  amount: 20_000,
  rate: 8.5,
  term: 5,
  unit: "years",
  fee: 0,
  extra: 0,
};

type TermUnit = "years" | "months";

const UNITS = [
  { value: "years", label: "Years" },
  { value: "months", label: "Months" },
] as const;

function toInputs(values: typeof DEFAULTS): LoanInputs {
  return {
    amount: values.amount,
    rate: values.rate,
    termMonths: values.unit === "months" ? values.term : values.term * 12,
    feePct: values.fee,
    extraPerMonth: values.extra,
  };
}

export function LoanCalculator() {
  const { values, update, replace } = useShareableUrl(DEFAULTS);
  const unit: TermUnit = values.unit === "months" ? "months" : "years";
  const inputs = toInputs(values);
  const result = calculateLoan(inputs);
  const insight = loanInsight(inputs, result);
  const headline = formatCurrency(result.monthlyPayment);

  useRecordCalculation({
    calculator: "loan-calculator",
    inputs: values,
    defaults: DEFAULTS,
    result: `${headline}/mo`,
    summary: `${formatCurrency(values.amount)} at ${values.rate}% for ${formatDuration(inputs.termMonths)}`,
    enabled: inputs.termMonths > 0,
  });

  function changeUnit(next: TermUnit) {
    if (next === unit) return;
    // Keep the same length of loan when switching units.
    const term =
      next === "months"
        ? values.term * 12
        : Math.max(1, Math.round(values.term / 12));
    update({ unit: next, term });
  }

  const monthlyRate = values.rate / 100 / 12;
  const formula = [
    "M = P × r(1 + r)^n / ((1 + r)^n − 1)",
    "",
    `P = ${formatCurrency(values.amount)}`,
    `r = ${values.rate}% ÷ 12 = ${monthlyRate.toFixed(6)}`,
    `n = ${inputs.termMonths} monthly payments`,
    "",
    `M = ${formatCurrency(result.monthlyPayment, "USD", 2)} a month`,
    `Total interest = M × n − P = ${formatCurrency(result.monthlyPayment * inputs.termMonths - values.amount, "USD", 2)}`,
    ...(result.fee > 0
      ? [
          "",
          `Fee = ${values.fee}% × P = ${formatCurrency(result.fee, "USD", 2)}`,
          `APR = rate at which ${formatCurrency(values.amount - result.fee)} is repaid by M over n months`,
          `    = ${formatPercent(result.apr, 2)}`,
        ]
      : []),
  ];

  return (
    <CalculatorPanel
      inputs={
        <>
          <NumberField
            label="Loan amount"
            prefix="$"
            grouped
            decimals={0}
            min={0}
            max={10_000_000}
            value={values.amount}
            onChange={(amount) => update({ amount })}
          />
          <NumberField
            label="Interest rate"
            suffix="%"
            decimals={3}
            min={0}
            max={100}
            value={values.rate}
            onChange={(rate) => update({ rate })}
          />
          <div className="grid grid-cols-2 gap-4">
            <NumberField
              label="Loan term"
              suffix={unit}
              decimals={0}
              min={1}
              max={unit === "months" ? 600 : 50}
              value={values.term}
              onChange={(term) => update({ term })}
            />
            <div className="self-end">
              <SegmentedControl
                label="Term unit"
                hideLabel
                value={unit}
                onChange={changeUnit}
                options={UNITS}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-4 dark:border-slate-700">
            <NumberField
              label="Upfront fee"
              suffix="%"
              decimals={2}
              min={0}
              max={20}
              value={values.fee}
              onChange={(fee) => update({ fee })}
              hint={
                result.fee > 0
                  ? formatCurrency(result.fee)
                  : "Origination fee, if any"
              }
            />
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
            />
          </div>
        </>
      }
      results={
        <>
          <ResultCard
            label="Monthly payment"
            value={headline}
            caption={`For ${formatDuration(inputs.termMonths)}${values.extra > 0 ? `, plus ${formatCurrency(values.extra)} extra` : ""}`}
            actions={<ShareButton calculator="loan-calculator" />}
          >
            <ResultRow
              label="Amount borrowed"
              value={formatCurrency(values.amount)}
            />
            <ResultRow
              label="Total interest"
              value={formatCurrency(result.totalInterest)}
            />
            {result.fee > 0 && (
              <ResultRow
                label="Upfront fee"
                value={formatCurrency(result.fee)}
              />
            )}
            <ResultRow
              label="Total cost"
              value={formatCurrency(result.totalCost)}
              emphasis
            />
            <ResultRow label="APR" value={formatPercent(result.apr, 2)} />
            {result.monthsSaved > 0 && (
              <ResultRow
                label="Paid off"
                value={`${formatDuration(result.payoffMonths)} (${formatDuration(result.monthsSaved)} early)`}
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
          <MortgageChart
            schedule={result.schedule}
            title="Principal and interest by year"
            note="Each year a little more of your payment goes to the balance."
          />
          <FormulaReveal
            lines={formula}
            note="Standard fixed-rate amortization formula, paid monthly."
          />
          <HistoryPanel
            calculator="loan-calculator"
            onRestore={(record) => replace(record.inputs)}
          />
        </>
      }
    />
  );
}
