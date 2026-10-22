"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CalculatorPanel } from "@/components/calculator/CalculatorPanel";
import { FormulaReveal } from "@/components/calculator/FormulaReveal";
import { InsightCard } from "@/components/calculator/InsightCard";
import { NumberField } from "@/components/calculator/NumberField";
import { ResultCard, ResultRow } from "@/components/calculator/ResultCard";
import { SelectField } from "@/components/calculator/SelectField";
import { ShareButton } from "@/components/calculator/ShareButton";
import { HistoryPanel } from "@/components/history/HistoryPanel";
import {
  calculateAffordability,
  type AffordabilityInputs,
} from "@/lib/calculators/affordability";
import { calculateMortgage } from "@/lib/calculators/mortgage";
import { useRecordCalculation } from "@/lib/hooks/useCalculatorHistory";
import { useShareableUrl } from "@/lib/hooks/useShareableUrl";
import { affordabilityInsight } from "@/lib/insights/affordability";
import { formatCurrency, formatPercent } from "@/lib/utils";

const TERMS = [
  { value: "30", label: "30 years" },
  { value: "20", label: "20 years" },
  { value: "15", label: "15 years" },
] as const;

function makeDefaults(income: number) {
  return {
    income,
    debts: 0,
    down: 20,
    rate: 7,
    term: 30,
    tax: 1.1,
    ins: 1_800,
    hoa: 0,
    pmi: 0.5,
    front: 28,
    back: 36,
  };
}

type Values = ReturnType<typeof makeDefaults>;

function toInputs(values: Values): AffordabilityInputs {
  return {
    annualIncome: values.income,
    monthlyDebts: values.debts,
    downPaymentPct: values.down,
    rate: values.rate,
    termYears: values.term,
    propertyTaxPct: values.tax,
    insurancePerYear: values.ins,
    hoaPerMonth: values.hoa,
    pmiPct: values.pmi,
    housingRatioPct: values.front,
    totalDtiPct: values.back,
  };
}

/** Rounds a price down to the nearest $1,000 so the headline never overstates. */
function floorThousand(amount: number): number {
  return Math.floor(amount / 1000) * 1000;
}

export function AffordabilityCalculator({
  initialIncome = 75_000,
}: {
  initialIncome?: number;
}) {
  const defaults = makeDefaults(initialIncome);
  const { values, update, replace } = useShareableUrl(defaults);
  const inputs = toInputs(values);
  const result = calculateAffordability(inputs);
  const price = floorThousand(result.maxHomePrice);
  const breakdown = calculateMortgage({
    homePrice: price,
    downPaymentPct: values.down,
    rate: values.rate,
    termYears: values.term,
    propertyTaxPct: values.tax,
    insurancePerYear: values.ins,
    hoaPerMonth: values.hoa,
    pmiPct: values.pmi,
    extraPerMonth: 0,
  });
  const insight = affordabilityInsight(inputs, result);
  const totalDti =
    result.monthlyIncome > 0
      ? ((breakdown.totalMonthly + values.debts) / result.monthlyIncome) * 100
      : 0;
  const rateRows = [values.rate - 1, values.rate, values.rate + 1]
    .filter((rate) => rate > 0)
    .map((rate) => ({
      rate,
      price: floorThousand(
        calculateAffordability({ ...inputs, rate }).maxHomePrice,
      ),
    }));

  useRecordCalculation({
    calculator: "home-affordability-calculator",
    inputs: values,
    defaults,
    result: formatCurrency(price),
    summary: `${formatCurrency(values.income)} income, ${formatCurrency(values.debts)}/mo debts, ${values.down}% down, ${values.rate}%`,
    enabled: values.income > 0,
  });

  const mortgageLink = `/mortgage-calculator?price=${price}&down=${values.down}&rate=${values.rate}&term=${values.term}&tax=${values.tax}&ins=${values.ins}&hoa=${values.hoa}&pmi=${values.pmi}`;

  const formula = [
    `Monthly income = ${formatCurrency(values.income)} ÷ 12 = ${formatCurrency(result.monthlyIncome, "USD", 2)}`,
    "",
    `Housing limit = ${values.front}% × income = ${formatCurrency((result.monthlyIncome * values.front) / 100, "USD", 2)}`,
    `Total limit   = ${values.back}% × income − ${formatCurrency(values.debts)} debts = ${formatCurrency((result.monthlyIncome * values.back) / 100 - values.debts, "USD", 2)}`,
    `Budget        = the lower of the two = ${formatCurrency(result.housingBudget, "USD", 2)} a month`,
    "",
    "Max price = (budget − insurance − HOA) ÷ monthly cost per dollar of price",
    "  where cost per dollar = loan share × payment factor + tax rate ÷ 12 (+ PMI)",
    `          = ${formatCurrency(result.maxHomePrice)} (shown rounded down)`,
  ];

  return (
    <CalculatorPanel
      inputs={
        <>
          <NumberField
            label="Yearly income (before tax)"
            prefix="$"
            grouped
            decimals={0}
            min={0}
            max={10_000_000}
            value={values.income}
            onChange={(income) => update({ income })}
            hint="Combined, if you are buying with someone"
          />
          <NumberField
            label="Other monthly debts"
            prefix="$"
            suffix="/ mo"
            grouped
            decimals={0}
            min={0}
            max={1_000_000}
            value={values.debts}
            onChange={(debts) => update({ debts })}
            hint="Car, student loan and card minimum payments"
          />
          <div className="grid grid-cols-2 gap-4">
            <NumberField
              label="Down payment"
              suffix="%"
              decimals={1}
              min={0}
              max={99}
              value={values.down}
              onChange={(down) => update({ down })}
            />
            <NumberField
              label="Interest rate"
              suffix="%"
              decimals={3}
              min={0.1}
              max={30}
              value={values.rate}
              onChange={(rate) => update({ rate })}
            />
          </div>
          <SelectField
            label="Loan term"
            value={String(values.term) as (typeof TERMS)[number]["value"]}
            onChange={(term) => update({ term: Number(term) })}
            options={TERMS}
          />

          <fieldset className="space-y-4 border-t border-slate-200 pt-4 dark:border-slate-700">
            <legend className="sr-only">Taxes, insurance and fees</legend>
            <div className="grid grid-cols-2 gap-4">
              <NumberField
                label="Property tax"
                suffix="% / yr"
                decimals={2}
                min={0}
                max={10}
                value={values.tax}
                onChange={(tax) => update({ tax })}
              />
              <NumberField
                label="Home insurance"
                prefix="$"
                suffix="/ yr"
                grouped
                decimals={0}
                min={0}
                max={100_000}
                value={values.ins}
                onChange={(ins) => update({ ins })}
              />
              <NumberField
                label="HOA dues"
                prefix="$"
                suffix="/ mo"
                grouped
                decimals={0}
                min={0}
                max={20_000}
                value={values.hoa}
                onChange={(hoa) => update({ hoa })}
              />
              <NumberField
                label="PMI rate"
                suffix="% / yr"
                decimals={2}
                min={0}
                max={5}
                value={values.pmi}
                onChange={(pmi) => update({ pmi })}
                hint="Under 20% down"
              />
            </div>
          </fieldset>

          <fieldset className="space-y-3 border-t border-slate-200 pt-4 dark:border-slate-700">
            <legend className="sr-only">Debt-to-income limits</legend>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Debt-to-income limits. 28% and 36% is the traditional guideline.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <NumberField
                label="Housing limit"
                suffix="% of income"
                decimals={0}
                min={10}
                max={60}
                value={values.front}
                onChange={(front) => update({ front })}
              />
              <NumberField
                label="Total debt limit"
                suffix="% of income"
                decimals={0}
                min={10}
                max={60}
                value={values.back}
                onChange={(back) => update({ back })}
              />
            </div>
          </fieldset>
        </>
      }
      results={
        <>
          <ResultCard
            label="You can afford about"
            value={formatCurrency(price)}
            caption={
              price > 0
                ? `${formatCurrency(breakdown.totalMonthly)} a month, with ${formatCurrency(breakdown.downPayment)} down`
                : "No room in the budget for housing"
            }
            actions={<ShareButton calculator="home-affordability-calculator" />}
          >
            <ResultRow
              label="Down payment"
              value={formatCurrency(breakdown.downPayment)}
            />
            <ResultRow
              label="Loan amount"
              value={formatCurrency(breakdown.loanAmount)}
            />
            <ResultRow
              label="Principal & interest"
              value={formatCurrency(breakdown.monthlyPrincipalInterest)}
            />
            <ResultRow
              label="Tax, insurance, PMI & HOA"
              value={formatCurrency(
                breakdown.totalMonthly - breakdown.monthlyPrincipalInterest,
              )}
            />
            <ResultRow
              label="Total debt-to-income"
              value={formatPercent(totalDti, 1)}
              emphasis
            />
          </ResultCard>
          {price > 0 && (
            <Link
              href={mortgageLink}
              className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition-colors duration-150 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              See this home in the mortgage calculator
              <ArrowRight
                className="size-4 text-blue-600 dark:text-blue-400"
                aria-hidden
              />
            </Link>
          )}
          <InsightCard>
            {insight.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </InsightCard>
        </>
      }
      footer={
        <>
          <section
            aria-labelledby="rate-table-heading"
            className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
          >
            <h2
              id="rate-table-heading"
              className="text-base font-semibold text-slate-900 dark:text-slate-50"
            >
              How the rate changes your budget
            </h2>
            <table className="mt-3 w-full text-sm tabular-nums">
              <caption className="sr-only">
                Affordable home price at different interest rates
              </caption>
              <thead className="text-xs tracking-wide text-slate-500 uppercase dark:text-slate-400">
                <tr>
                  <th scope="col" className="py-2 text-left font-medium">
                    Rate
                  </th>
                  <th scope="col" className="py-2 text-right font-medium">
                    Home price
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {rateRows.map((row) => (
                  <tr
                    key={row.rate}
                    className={
                      row.rate === values.rate
                        ? "font-semibold text-slate-900 dark:text-slate-50"
                        : "text-slate-700 dark:text-slate-200"
                    }
                  >
                    <th scope="row" className="py-2 text-left font-[inherit]">
                      {formatPercent(row.rate, 2)}
                      {row.rate === values.rate && (
                        <span className="ml-2 text-xs font-normal text-slate-500">
                          your rate
                        </span>
                      )}
                    </th>
                    <td className="py-2 text-right">
                      {formatCurrency(row.price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          <FormulaReveal
            lines={formula}
            note="Taxes, insurance and PMI are estimates. Lenders also look at your credit score, savings and job history."
          />
          <HistoryPanel
            calculator="home-affordability-calculator"
            onRestore={(record) => replace(record.inputs)}
          />
        </>
      }
    />
  );
}
