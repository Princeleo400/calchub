"use client";

import { CalculatorPanel } from "@/components/calculator/CalculatorPanel";
import { CheckboxField } from "@/components/calculator/CheckboxField";
import { FormulaReveal } from "@/components/calculator/FormulaReveal";
import { InsightCard } from "@/components/calculator/InsightCard";
import { NumberField } from "@/components/calculator/NumberField";
import { ResultCard, ResultRow } from "@/components/calculator/ResultCard";
import { SelectField } from "@/components/calculator/SelectField";
import { ShareButton } from "@/components/calculator/ShareButton";
import { HistoryPanel } from "@/components/history/HistoryPanel";
import {
  calculateStampDuty,
  type BuyerType,
} from "@/lib/calculators/stampDuty";
import { useRecordCalculation } from "@/lib/hooks/useCalculatorHistory";
import { useShareableUrl } from "@/lib/hooks/useShareableUrl";
import { stampDutyInsight } from "@/lib/insights/stampDuty";
import { formatCurrency, formatPercent } from "@/lib/utils";

const DEFAULTS = { price: 350_000, buyer: "mover", nr: false };

const BUYERS = [
  { value: "mover", label: "Moving home (or buying your only home)" },
  { value: "firstTime", label: "First-time buyer" },
  {
    value: "additional",
    label: "Additional property (second home, buy-to-let)",
  },
] as const;

const BUYER_LABEL: Record<BuyerType, string> = {
  mover: "home mover",
  firstTime: "first-time buyer",
  additional: "additional property",
};

const gbp = (n: number, decimals = 0) => formatCurrency(n, "GBP", decimals);

function bandLabel(from: number, to: number): string {
  if (from === 0) return `Up to ${gbp(to)}`;
  return `${gbp(from + 1)} to ${gbp(to)}`;
}

export function StampDutyCalculator() {
  const { values, update, replace } = useShareableUrl(DEFAULTS);
  const buyer: BuyerType =
    values.buyer === "firstTime" || values.buyer === "additional"
      ? values.buyer
      : "mover";
  const input = { price: values.price, buyer, nonResident: values.nr };
  const result = calculateStampDuty(input);
  const insight = stampDutyInsight(input, result);

  useRecordCalculation({
    calculator: "stamp-duty-calculator",
    inputs: values,
    defaults: DEFAULTS,
    result: gbp(result.tax),
    summary: `${gbp(values.price)}, ${BUYER_LABEL[buyer]}${values.nr ? ", non-UK resident" : ""}`,
    enabled: values.price > 0,
  });

  const formula = [
    ...result.slices.map(
      (s) =>
        `${bandLabel(s.from, s.to).padEnd(30)} ${gbp(s.taxable).padStart(11)} × ${String(s.rate).padStart(2)}% = ${gbp(s.tax, 2)}`,
    ),
    "",
    `Total = ${gbp(result.tax)} (rounded down to the pound)`,
  ];

  return (
    <CalculatorPanel
      inputs={
        <>
          <NumberField
            label="Purchase price"
            prefix="£"
            grouped
            decimals={0}
            min={0}
            max={100_000_000}
            value={values.price}
            onChange={(price) => update({ price })}
          />
          <SelectField
            label="I am buying as"
            value={buyer}
            onChange={(next) => update({ buyer: next })}
            options={BUYERS}
          />
          {buyer === "firstTime" && (
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Everyone buying must be a first-time buyer who has never owned a
              home anywhere, and you must plan to live in it.
            </p>
          )}
          <CheckboxField
            label="A buyer is not resident in the UK"
            checked={values.nr}
            onChange={(nr) => update({ nr })}
            hint="Adds a 2% surcharge. Residence is based on days spent in the UK."
          />
          <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            For residential property in England and Northern Ireland. Scotland
            and Wales have their own taxes.
          </p>
        </>
      }
      results={
        <>
          <ResultCard
            label="Stamp Duty to pay"
            value={gbp(result.tax)}
            caption={
              values.price > 0
                ? `Effective rate ${formatPercent(result.effectiveRate, 2)} of the price`
                : undefined
            }
            actions={<ShareButton calculator="stamp-duty-calculator" />}
          >
            {result.slices.map((s) => (
              <ResultRow
                key={s.from}
                label={`${bandLabel(s.from, s.to)} at ${s.rate}%`}
                value={gbp(s.tax)}
              />
            ))}
            <ResultRow label="Total" value={gbp(result.tax)} emphasis />
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
          <FormulaReveal
            lines={formula}
            note="Each slice of the price is taxed at its own rate, like income tax bands. Surcharges add percentage points to every band."
          />
          <HistoryPanel
            calculator="stamp-duty-calculator"
            onRestore={(record) => replace(record.inputs)}
          />
        </>
      }
    />
  );
}
