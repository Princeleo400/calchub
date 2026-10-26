"use client";

import { CalculatorPanel } from "@/components/calculator/CalculatorPanel";
import { CheckboxField } from "@/components/calculator/CheckboxField";
import { FormulaReveal } from "@/components/calculator/FormulaReveal";
import { InsightCard } from "@/components/calculator/InsightCard";
import { NumberField } from "@/components/calculator/NumberField";
import { ResultCard, ResultRow } from "@/components/calculator/ResultCard";
import { ShareButton } from "@/components/calculator/ShareButton";
import { HistoryPanel } from "@/components/history/HistoryPanel";
import {
  calculatePaye,
  EMPLOYEE_PENSION_PCT,
  NHF_PCT,
  type BandRow,
  type PayeInputs,
} from "@/lib/calculators/nigeriaPaye";
import { useRecordCalculation } from "@/lib/hooks/useCalculatorHistory";
import { useShareableUrl } from "@/lib/hooks/useShareableUrl";
import { payeInsight } from "@/lib/insights/nigeriaPaye";
import { cn, formatCurrency, formatPercent } from "@/lib/utils";

const DEFAULTS = {
  gross: 500_000,
  basic: 250_000,
  housing: 125_000,
  transport: 75_000,
  pension: true,
  nhf: false,
  health: 0,
  rent: 0,
  life: 0,
  mortgage: 0,
};

const naira = (value: number) => formatCurrency(value, "NGN");

function toInputs(values: typeof DEFAULTS): PayeInputs {
  return {
    monthlyGross: values.gross,
    monthlyBasic: values.basic,
    monthlyHousing: values.housing,
    monthlyTransport: values.transport,
    contributesPension: values.pension,
    contributesNhf: values.nhf,
    annualHealthInsurance: values.health,
    annualRent: values.rent,
    annualLifeInsurance: values.life,
    annualMortgageInterest: values.mortgage,
  };
}

export function PayeCalculator() {
  const { values, update, replace } = useShareableUrl(DEFAULTS);
  const inputs = toInputs(values);
  const result = calculatePaye(inputs);
  const insight = payeInsight(inputs, result);
  const headline = naira(result.monthlyTax);

  useRecordCalculation({
    calculator: "nigeria-paye-calculator",
    inputs: values,
    defaults: DEFAULTS,
    result: `${headline}/mo PAYE`,
    summary: `${naira(values.gross)} gross a month`,
    enabled: values.gross > 0,
  });

  const formula = [
    `Gross pay            = ${naira(values.gross)} × 12 = ${naira(result.annualGross)}`,
    ...(result.pension > 0
      ? [
          `Pension (${EMPLOYEE_PENSION_PCT}%)          = ${EMPLOYEE_PENSION_PCT}% × (basic + housing + transport) × 12 = ${naira(result.pension)}`,
        ]
      : []),
    ...(result.nhf > 0
      ? [
          `NHF (${NHF_PCT}%)            = ${NHF_PCT}% × basic × 12 = ${naira(result.nhf)}`,
        ]
      : []),
    ...(result.healthInsurance > 0
      ? [`Health insurance     = ${naira(result.healthInsurance)}`]
      : []),
    ...(result.rentRelief > 0
      ? [
          `Rent relief          = lower of 20% × ${naira(values.rent)} and ₦500,000 = ${naira(result.rentRelief)}`,
        ]
      : []),
    ...(result.lifeInsurance > 0
      ? [`Life insurance       = ${naira(result.lifeInsurance)}`]
      : []),
    ...(result.mortgageInterest > 0
      ? [`Mortgage interest    = ${naira(result.mortgageInterest)}`]
      : []),
    "",
    `Chargeable income    = ${naira(result.annualGross)} − ${naira(result.totalDeductions)} = ${naira(result.chargeableIncome)}`,
    "",
    ...result.bands
      .filter((row) => row.taxable > 0)
      .map(
        (row) =>
          `${naira(row.taxable).padStart(14)} × ${String(row.rate).padStart(2)}% = ${naira(row.tax)}`,
      ),
    "",
    result.minimumWageExempt
      ? "Minimum wage earner: excluded from tax (Nigeria Tax Act 2025, s. 58)"
      : `Annual PAYE = ${naira(result.annualTax)}, monthly = ${naira(result.monthlyTax)}`,
  ];

  return (
    <CalculatorPanel
      inputs={
        <>
          <NumberField
            label="Monthly gross pay"
            prefix="₦"
            grouped
            decimals={0}
            min={0}
            max={1_000_000_000}
            value={values.gross}
            onChange={(gross) => update({ gross })}
            hint="Everything you earn before deductions, including allowances"
          />
          <div className="grid gap-3 sm:grid-cols-3">
            <NumberField
              label="Basic"
              prefix="₦"
              grouped
              decimals={0}
              min={0}
              max={1_000_000_000}
              value={values.basic}
              onChange={(basic) => update({ basic })}
            />
            <NumberField
              label="Housing"
              prefix="₦"
              grouped
              decimals={0}
              min={0}
              max={1_000_000_000}
              value={values.housing}
              onChange={(housing) => update({ housing })}
            />
            <NumberField
              label="Transport"
              prefix="₦"
              grouped
              decimals={0}
              min={0}
              max={1_000_000_000}
              value={values.transport}
              onChange={(transport) => update({ transport })}
            />
          </div>
          <p className="-mt-2 text-xs text-slate-500 dark:text-slate-400">
            Monthly amounts from your payslip. Pension is worked out on these
            three.
          </p>
          {result.componentsExceedGross && (
            <p className="rounded-md border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
              Basic, housing and transport add up to more than your gross pay.
              Check the amounts; deductions are capped at your gross pay.
            </p>
          )}

          <div className="space-y-3 border-t border-slate-200 pt-4 dark:border-slate-700">
            <CheckboxField
              label={`I contribute to a pension (${EMPLOYEE_PENSION_PCT}%)`}
              checked={values.pension}
              onChange={(pension) => update({ pension })}
              hint="Required for most employers with 3 or more staff"
            />
            <CheckboxField
              label={`I contribute to the NHF (${NHF_PCT}% of basic)`}
              checked={values.nhf}
              onChange={(nhf) => update({ nhf })}
              hint="Compulsory in the public sector, optional in the private sector"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-4 dark:border-slate-700">
            <NumberField
              label="Annual rent paid"
              prefix="₦"
              grouped
              decimals={0}
              min={0}
              max={1_000_000_000}
              value={values.rent}
              onChange={(rent) => update({ rent })}
              hint="20% is relief, up to ₦500,000"
            />
            <NumberField
              label="Health insurance"
              prefix="₦"
              suffix="/ yr"
              grouped
              decimals={0}
              min={0}
              max={1_000_000_000}
              value={values.health}
              onChange={(health) => update({ health })}
              hint="Your NHIA contributions"
            />
            <NumberField
              label="Life insurance"
              prefix="₦"
              suffix="/ yr"
              grouped
              decimals={0}
              min={0}
              max={1_000_000_000}
              value={values.life}
              onChange={(life) => update({ life })}
              hint="Premiums for you or your spouse"
            />
            <NumberField
              label="Mortgage interest"
              prefix="₦"
              suffix="/ yr"
              grouped
              decimals={0}
              min={0}
              max={1_000_000_000}
              value={values.mortgage}
              onChange={(mortgage) => update({ mortgage })}
              hint="On a home you live in"
            />
          </div>
        </>
      }
      results={
        <>
          <ResultCard
            label="Monthly PAYE tax"
            value={headline}
            caption={`${naira(result.annualTax)} a year · ${formatPercent(result.effectiveRate, 1)} of gross pay`}
            actions={<ShareButton calculator="nigeria-paye-calculator" />}
          >
            <ResultRow label="Gross pay" value={`${naira(values.gross)}/mo`} />
            {result.pension > 0 && (
              <ResultRow
                label="Pension"
                value={`−${naira(result.pension / 12)}`}
              />
            )}
            {result.nhf > 0 && (
              <ResultRow label="NHF" value={`−${naira(result.nhf / 12)}`} />
            )}
            {result.healthInsurance > 0 && (
              <ResultRow
                label="Health insurance"
                value={`−${naira(result.healthInsurance / 12)}`}
              />
            )}
            <ResultRow
              label="PAYE tax"
              value={`−${naira(result.monthlyTax)}`}
            />
            <ResultRow
              label="Take-home pay"
              value={`${naira(result.monthlyTakeHome)}/mo`}
              emphasis
            />
            {result.oldRulesAnnualTax !== null && !result.minimumWageExempt && (
              <ResultRow
                label="Old 2025 rules"
                value={`${naira(result.oldRulesAnnualTax / 12)}/mo PAYE`}
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
          <BandTable
            bands={result.bands}
            chargeable={result.chargeableIncome}
            exempt={result.minimumWageExempt}
          />
          <FormulaReveal
            lines={formula}
            note="Nigeria Tax Act 2025: deductions under section 30, rates in the Fourth Schedule. Figures are estimates; your employer's payroll is the final word."
          />
          <HistoryPanel
            calculator="nigeria-paye-calculator"
            onRestore={(record) => replace(record.inputs)}
          />
        </>
      }
    />
  );
}

/** How much of the chargeable income falls in each band, and the tax on it. */
function BandTable({
  bands,
  chargeable,
  exempt,
}: {
  bands: BandRow[];
  chargeable: number;
  exempt: boolean;
}) {
  const label = (row: BandRow) =>
    row.to === Infinity
      ? `Above ${naira(row.from)}`
      : row.from === 0
        ? `First ${naira(row.to)}`
        : `${naira(row.from + 1)} to ${naira(row.to)}`;
  return (
    <section
      aria-labelledby="band-table-heading"
      className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
    >
      <h2
        id="band-table-heading"
        className="text-base font-semibold text-slate-900 dark:text-slate-50"
      >
        Your tax, band by band
      </h2>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Chargeable income of {naira(chargeable)} a year
        {exempt ? ", excluded as a minimum wage earner" : ""}.
      </p>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[440px] text-sm tabular-nums">
          <caption className="sr-only">Annual tax in each band</caption>
          <thead className="border-b border-slate-200 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
            <tr>
              <th scope="col" className="py-2 pr-4 pl-2 text-left font-medium">
                Yearly band
              </th>
              <th scope="col" className="py-2 pr-4 text-right font-medium">
                Rate
              </th>
              <th scope="col" className="py-2 pr-4 text-right font-medium">
                Your income in it
              </th>
              <th scope="col" className="py-2 pr-2 text-right font-medium">
                Tax
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {bands.map((row) => (
              <tr
                key={row.rate}
                className={cn(
                  row.taxable === 0 && "text-slate-400 dark:text-slate-500",
                )}
              >
                <th
                  scope="row"
                  className="py-2.5 pr-4 pl-2 text-left font-normal"
                >
                  {label(row)}
                </th>
                <td className="py-2.5 pr-4 text-right">{row.rate}%</td>
                <td className="py-2.5 pr-4 text-right">{naira(row.taxable)}</td>
                <td className="py-2.5 pr-2 text-right">
                  {naira(exempt ? 0 : row.tax)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
