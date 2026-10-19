"use client";

import { CalculatorPanel } from "@/components/calculator/CalculatorPanel";
import { FormulaReveal } from "@/components/calculator/FormulaReveal";
import { InsightCard } from "@/components/calculator/InsightCard";
import { NumberField } from "@/components/calculator/NumberField";
import { ResultCard, ResultRow } from "@/components/calculator/ResultCard";
import { SelectField } from "@/components/calculator/SelectField";
import { ShareButton } from "@/components/calculator/ShareButton";
import { MortgageChart } from "@/components/charts/MortgageChart";
import { HistoryPanel } from "@/components/history/HistoryPanel";
import { calculateMortgage, formatDuration, type MortgageInputs } from "@/lib/calculators/mortgage";
import { useRecordCalculation } from "@/lib/hooks/useCalculatorHistory";
import { useShareableUrl } from "@/lib/hooks/useShareableUrl";
import { mortgageInsight } from "@/lib/insights/mortgage";
import { formatCurrency, formatNumber } from "@/lib/utils";

// Short URL keys keep shared links readable: ?price=400000&down=10&rate=6.75
const DEFAULTS = {
  price: 400_000,
  down: 20,
  rate: 7,
  term: 30,
  tax: 1.1,
  ins: 1_800,
  hoa: 0,
  pmi: 0.5,
  extra: 0,
};

const TERMS = [
  { value: "30", label: "30 years" },
  { value: "20", label: "20 years" },
  { value: "15", label: "15 years" },
  { value: "10", label: "10 years" },
] as const;

function toInputs(v: typeof DEFAULTS): MortgageInputs {
  return {
    homePrice: v.price,
    downPaymentPct: v.down,
    rate: v.rate,
    termYears: v.term,
    propertyTaxPct: v.tax,
    insurancePerYear: v.ins,
    hoaPerMonth: v.hoa,
    pmiPct: v.pmi,
    extraPerMonth: v.extra,
  };
}

export function MortgageCalculator() {
  const { values, update, replace } = useShareableUrl(DEFAULTS);
  const inputs = toInputs(values);
  // A few hundred loop steps: cheap enough to recompute on every render.
  const result = calculateMortgage(inputs);
  const insight = mortgageInsight(inputs, result);

  const downAmount = result.downPayment;
  const headline = formatCurrency(result.totalMonthly);

  useRecordCalculation({
    calculator: "mortgage-calculator",
    inputs: values,
    defaults: DEFAULTS,
    result: `${headline}/mo`,
    summary: `${formatCurrency(values.price)} home, ${formatNumber(values.down, 1)}% down, ${values.rate}% for ${values.term} years`,
  });

  const r = values.rate / 100 / 12;
  const n = values.term * 12;
  const formula = [
    "M = P × r(1 + r)^n / ((1 + r)^n − 1)",
    "",
    `P = ${formatCurrency(result.loanAmount)}   (price − down payment)`,
    `r = ${values.rate}% ÷ 12 = ${r.toFixed(6)}`,
    `n = ${values.term} × 12 = ${n} payments`,
    "",
    `M = ${formatCurrency(result.monthlyPrincipalInterest, "USD", 2)} principal and interest`,
    `  + ${formatCurrency(result.monthlyTax, "USD", 2)} property tax (${values.tax}% × price ÷ 12)`,
    `  + ${formatCurrency(result.monthlyInsurance, "USD", 2)} insurance (${formatCurrency(values.ins)} ÷ 12)`,
    ...(result.monthlyPmi > 0
      ? [`  + ${formatCurrency(result.monthlyPmi, "USD", 2)} PMI (${values.pmi}% × loan ÷ 12)`]
      : []),
    ...(result.monthlyHoa > 0 ? [`  + ${formatCurrency(result.monthlyHoa, "USD", 2)} HOA`] : []),
    ...(values.extra > 0 ? [`  + ${formatCurrency(values.extra, "USD", 2)} extra principal`] : []),
    `  = ${formatCurrency(result.totalMonthly, "USD", 2)} a month`,
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
            max={100_000_000}
            value={values.price}
            onChange={(price) => update({ price })}
          />
          <div className="grid grid-cols-2 gap-4">
            <NumberField
              label="Down payment"
              suffix="%"
              decimals={1}
              min={0}
              max={100}
              value={values.down}
              onChange={(down) => update({ down })}
              hint={formatCurrency(downAmount)}
            />
            <NumberField
              label="Interest rate"
              suffix="%"
              decimals={3}
              min={0}
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
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Taxes, insurance and fees. Use figures from your lender or county for accuracy.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <NumberField
                label="Property tax"
                suffix="% / yr"
                decimals={2}
                min={0}
                max={10}
                value={values.tax}
                onChange={(tax) => update({ tax })}
                hint={`${formatCurrency(result.monthlyTax)} a month`}
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
                hint={values.down >= 20 ? "Not charged at 20% down" : `${formatCurrency(result.monthlyPmi)} a month`}
              />
            </div>
          </fieldset>

          <div className="border-t border-slate-200 pt-4 dark:border-slate-700">
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
              hint="Extra principal paid each month"
            />
          </div>
        </>
      }
      results={
        <>
          <ResultCard
            label="Monthly payment"
            value={headline}
            caption={`Loan of ${formatCurrency(result.loanAmount)}, paid off in ${formatDuration(result.payoffMonths)}`}
            actions={<ShareButton calculator="mortgage-calculator" />}
          >
            <ResultRow label="Principal & interest" value={formatCurrency(result.monthlyPrincipalInterest)} />
            <ResultRow label="Property tax" value={formatCurrency(result.monthlyTax)} />
            <ResultRow label="Home insurance" value={formatCurrency(result.monthlyInsurance)} />
            {result.monthlyPmi > 0 && <ResultRow label="PMI" value={formatCurrency(result.monthlyPmi)} />}
            {result.monthlyHoa > 0 && <ResultRow label="HOA dues" value={formatCurrency(result.monthlyHoa)} />}
            {values.extra > 0 && <ResultRow label="Extra principal" value={formatCurrency(values.extra)} />}
            <ResultRow label="Total interest" value={formatCurrency(result.totalInterest)} emphasis />
            {result.interestSaved > 0 && (
              <ResultRow label="Interest saved by extra payments" value={formatCurrency(result.interestSaved)} />
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
          <MortgageChart schedule={result.schedule} />
          <FormulaReveal
            lines={formula}
            note="Standard fixed-rate amortization formula. Taxes, insurance and PMI are estimates and change over time."
          />
          <HistoryPanel calculator="mortgage-calculator" onRestore={(record) => replace(record.inputs)} />
        </>
      }
    />
  );
}
