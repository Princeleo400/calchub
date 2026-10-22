"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { CalculatorPanel } from "@/components/calculator/CalculatorPanel";
import { FormulaReveal } from "@/components/calculator/FormulaReveal";
import { InsightCard } from "@/components/calculator/InsightCard";
import { NumberField } from "@/components/calculator/NumberField";
import { ResultCard, ResultRow } from "@/components/calculator/ResultCard";
import { SelectField } from "@/components/calculator/SelectField";
import { ShareButton } from "@/components/calculator/ShareButton";
import { HistoryPanel } from "@/components/history/HistoryPanel";
import {
  calculateStressTest,
  CANADA_RULES,
  type StressTestInputs,
} from "@/lib/calculators/stressTest";
import { useRecordCalculation } from "@/lib/hooks/useCalculatorHistory";
import { useShareableUrl } from "@/lib/hooks/useShareableUrl";
import { stressTestInsight } from "@/lib/insights/stressTest";
import { formatCurrency, formatPercent } from "@/lib/utils";

const DEFAULTS = {
  price: 700_000,
  down: 140_000,
  rate: 4.5,
  amort: 25,
  income: 150_000,
  tax: 4_800,
  heat: 120,
  condo: 0,
  debts: 0,
};

const AMORTIZATIONS = [
  { value: "25", label: "25 years" },
  { value: "30", label: "30 years" },
] as const;

const cad = (amount: number, decimals = 0) =>
  formatCurrency(amount, "CAD", decimals);

export function StressTestCalculator() {
  const { values, update, replace } = useShareableUrl(DEFAULTS);
  const inputs: StressTestInputs = {
    price: values.price,
    downPayment: values.down,
    contractRate: values.rate,
    amortizationYears: values.amort,
    annualIncome: values.income,
    propertyTaxPerYear: values.tax,
    heatingPerMonth: values.heat,
    condoFeesPerMonth: values.condo,
    otherDebtsPerMonth: values.debts,
  };
  const result = calculateStressTest(inputs);
  const insight = stressTestInsight(inputs, result);
  const downPct = values.price > 0 ? (values.down / values.price) * 100 : 0;
  const status = result.problem
    ? "Check down payment"
    : result.passes
      ? "Pass"
      : "Fail";

  useRecordCalculation({
    calculator: "mortgage-stress-test-calculator",
    inputs: values,
    defaults: DEFAULTS,
    result: status,
    summary: `${cad(values.price)} home, ${cad(values.down)} down, ${values.rate}%, ${cad(values.income)} income`,
    enabled: values.price > 0 && values.income > 0,
  });

  const housing =
    values.tax / 12 + values.heat + values.condo * CANADA_RULES.condoFeeShare;
  const formula = [
    `Qualifying rate = max(${values.rate}% + ${CANADA_RULES.qualifyingBuffer}%, ${CANADA_RULES.qualifyingFloor}%) = ${formatPercent(result.qualifyingRate, 2)}`,
    `Monthly rate    = (1 + ${formatPercent(result.qualifyingRate, 2)} ÷ 2)^(1/6) − 1   (compounded semi-annually)`,
    `Payment         = ${cad(result.paymentAtQualifying, 2)} on a ${cad(result.mortgage)} mortgage over ${values.amort} years`,
    "",
    `Housing costs   = payment + tax ${cad(values.tax / 12, 2)} + heat ${cad(values.heat, 2)}${values.condo > 0 ? ` + 50% of condo fees ${cad(values.condo / 2, 2)}` : ""}`,
    `                = ${cad(result.paymentAtQualifying + housing, 2)} a month`,
    `GDS = housing ÷ monthly income = ${formatPercent(result.gds, 2)}   (max ${CANADA_RULES.maxGds}%)`,
    `TDS = (housing + other debts) ÷ monthly income = ${formatPercent(result.tds, 2)}   (max ${CANADA_RULES.maxTds}%)`,
  ];

  return (
    <CalculatorPanel
      inputs={
        <>
          <NumberField
            label="Home price"
            prefix="$"
            grouped
            decimals={0}
            min={0}
            max={50_000_000}
            value={values.price}
            onChange={(price) => update({ price })}
          />
          <NumberField
            label="Down payment"
            prefix="$"
            grouped
            decimals={0}
            min={0}
            max={50_000_000}
            value={values.down}
            onChange={(down) => update({ down })}
            hint={`${formatPercent(downPct, 1)} of the price. Minimum ${cad(result.minDown)}.`}
          />
          <div className="grid grid-cols-2 gap-4">
            <NumberField
              label="Mortgage rate"
              suffix="%"
              decimals={3}
              min={0}
              max={25}
              value={values.rate}
              onChange={(rate) => update({ rate })}
              hint="Your contract rate"
            />
            <SelectField
              label="Amortization"
              value={
                String(values.amort) as (typeof AMORTIZATIONS)[number]["value"]
              }
              onChange={(amort) => update({ amort: Number(amort) })}
              options={AMORTIZATIONS}
            />
          </div>
          <NumberField
            label="Household income (before tax)"
            prefix="$"
            suffix="/ yr"
            grouped
            decimals={0}
            min={0}
            max={10_000_000}
            value={values.income}
            onChange={(income) => update({ income })}
          />

          <fieldset className="space-y-4 border-t border-slate-200 pt-4 dark:border-slate-700">
            <legend className="sr-only">Housing costs and other debts</legend>
            <div className="grid grid-cols-2 gap-4">
              <NumberField
                label="Property tax"
                prefix="$"
                suffix="/ yr"
                grouped
                decimals={0}
                min={0}
                max={500_000}
                value={values.tax}
                onChange={(tax) => update({ tax })}
              />
              <NumberField
                label="Heating"
                prefix="$"
                suffix="/ mo"
                grouped
                decimals={0}
                min={0}
                max={10_000}
                value={values.heat}
                onChange={(heat) => update({ heat })}
              />
              <NumberField
                label="Condo fees"
                prefix="$"
                suffix="/ mo"
                grouped
                decimals={0}
                min={0}
                max={20_000}
                value={values.condo}
                onChange={(condo) => update({ condo })}
                hint="Half counts"
              />
              <NumberField
                label="Other debts"
                prefix="$"
                suffix="/ mo"
                grouped
                decimals={0}
                min={0}
                max={1_000_000}
                value={values.debts}
                onChange={(debts) => update({ debts })}
                hint="Car, loans, cards"
              />
            </div>
          </fieldset>
          <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Insured 30-year amortizations are only for first-time buyers and new
            builds. Lenders may count card and line-of-credit debt as 3% of the
            balance each month.
          </p>
        </>
      }
      results={
        <>
          <ResultCard
            label="Stress test"
            value={status}
            tone={
              result.problem ? "warning" : result.passes ? "success" : "danger"
            }
            caption={
              <span className="flex items-center gap-1.5">
                {!result.problem &&
                  (result.passes ? (
                    <CheckCircle2
                      className="size-4 text-green-600 dark:text-green-400"
                      aria-hidden
                    />
                  ) : (
                    <XCircle
                      className="size-4 text-red-600 dark:text-red-400"
                      aria-hidden
                    />
                  ))}
                Qualifying at {formatPercent(result.qualifyingRate, 2)}
              </span>
            }
            actions={
              <ShareButton calculator="mortgage-stress-test-calculator" />
            }
          >
            <ResultRow
              label="Payment at your rate"
              value={cad(result.paymentAtContract)}
            />
            <ResultRow
              label="Payment at qualifying rate"
              value={cad(result.paymentAtQualifying)}
            />
            <ResultRow
              label={`GDS (max ${CANADA_RULES.maxGds}%)`}
              value={formatPercent(result.gds, 1)}
              emphasis
            />
            <ResultRow
              label={`TDS (max ${CANADA_RULES.maxTds}%)`}
              value={formatPercent(result.tds, 1)}
              emphasis
            />
            {result.insured && (
              <ResultRow
                label={`CMHC premium (${formatPercent(result.premiumRatePct, 2)})`}
                value={cad(result.premium)}
              />
            )}
            <ResultRow label="Mortgage amount" value={cad(result.mortgage)} />
          </ResultCard>
          <section
            aria-label="Maximum you qualify for"
            className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
          >
            <p className="text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
              Most you qualify for with {cad(values.down)} down
            </p>
            <p className="mt-1.5 text-2xl font-semibold text-slate-900 tabular-nums dark:text-slate-50">
              {result.maxPrice > 0
                ? cad(Math.floor(result.maxPrice / 1000) * 1000)
                : "–"}
            </p>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Home price, allowing for CMHC premiums and minimum down payment
              rules
            </p>
          </section>
          <InsightCard>
            {insight.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </InsightCard>
        </>
      }
      footer={
        <>
          <FormulaReveal
            lines={formula}
            note="Qualifying rate from OSFI and the Department of Finance; GDS and TDS limits from CMHC for insured mortgages."
          />
          <HistoryPanel
            calculator="mortgage-stress-test-calculator"
            onRestore={(record) => replace(record.inputs)}
          />
        </>
      }
    />
  );
}
