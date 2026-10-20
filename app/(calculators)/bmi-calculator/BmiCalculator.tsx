"use client";

import { CalculatorPanel } from "@/components/calculator/CalculatorPanel";
import { FormulaReveal } from "@/components/calculator/FormulaReveal";
import { InsightCard } from "@/components/calculator/InsightCard";
import { NumberField } from "@/components/calculator/NumberField";
import { ResultCard, ResultRow } from "@/components/calculator/ResultCard";
import { SegmentedControl } from "@/components/calculator/SegmentedControl";
import { ShareButton } from "@/components/calculator/ShareButton";
import { BmiScale } from "@/components/charts/BmiScale";
import { HistoryPanel } from "@/components/history/HistoryPanel";
import {
  calculateBmi,
  CM_PER_IN,
  KG_PER_LB,
  toFeetInches,
} from "@/lib/calculators/bmi";
import { useRecordCalculation } from "@/lib/hooks/useCalculatorHistory";
import { useShareableUrl } from "@/lib/hooks/useShareableUrl";
import { bmiInsight } from "@/lib/insights/bmi";
import { formatNumber } from "@/lib/utils";

// Each unit system keeps its own values, so switching never introduces
// rounding drift. Switching converts the current values across.
const DEFAULTS = {
  unit: "imperial",
  ft: 5,
  inch: 9,
  lb: 160,
  cm: 175,
  kg: 72.5,
};

type Unit = "imperial" | "metric";

const UNITS = [
  { value: "imperial", label: "US (ft, lb)" },
  { value: "metric", label: "Metric (cm, kg)" },
] as const;

export function BmiCalculator() {
  const { values, update, replace } = useShareableUrl(DEFAULTS);
  const unit: Unit = values.unit === "metric" ? "metric" : "imperial";

  const heightCm =
    unit === "metric" ? values.cm : (values.ft * 12 + values.inch) * CM_PER_IN;
  const weightKg = unit === "metric" ? values.kg : values.lb * KG_PER_LB;
  const result = calculateBmi(weightKg, heightCm);
  const insight = bmiInsight(result, unit === "metric" ? "kg" : "lb");
  const shown = result.bmi > 0 ? formatNumber(result.bmi, 1) : "–";

  const heightText =
    unit === "metric"
      ? `${formatNumber(values.cm, 0)} cm`
      : `${values.ft} ft ${formatNumber(values.inch, 1)} in`;
  const weightText =
    unit === "metric"
      ? `${formatNumber(values.kg, 1)} kg`
      : `${formatNumber(values.lb, 0)} lb`;

  useRecordCalculation({
    calculator: "bmi-calculator",
    inputs: values,
    defaults: DEFAULTS,
    result: `BMI ${shown}`,
    summary: `${heightText}, ${weightText}, ${result.category.label}`,
    enabled: result.bmi > 0,
  });

  function changeUnit(next: Unit) {
    if (next === unit) return;
    if (next === "metric") {
      update({
        unit: next,
        cm: Math.round(heightCm),
        kg: Math.round(weightKg * 10) / 10,
      });
    } else {
      const { feet, inches } = toFeetInches(heightCm / CM_PER_IN);
      update({
        unit: next,
        ft: feet,
        inch: Math.round(inches),
        lb: Math.round(weightKg / KG_PER_LB),
      });
    }
  }

  const rangeText =
    unit === "metric"
      ? `${formatNumber(result.healthyMinKg, 1)} to ${formatNumber(result.healthyMaxKg, 1)} kg`
      : `${formatNumber(result.healthyMinKg / KG_PER_LB, 0)} to ${formatNumber(result.healthyMaxKg / KG_PER_LB, 0)} lb`;

  const m = heightCm / 100;
  const formula =
    unit === "metric"
      ? [
          "BMI = weight (kg) ÷ height (m)²",
          "",
          `height = ${formatNumber(values.cm, 0)} cm = ${m.toFixed(2)} m`,
          `BMI = ${formatNumber(values.kg, 1)} ÷ ${m.toFixed(2)}² = ${formatNumber(values.kg, 1)} ÷ ${(m * m).toFixed(4)}`,
          `    = ${formatNumber(result.bmi, 1)}`,
        ]
      : [
          "BMI = 703 × weight (lb) ÷ height (in)²",
          "",
          `height = ${values.ft} ft × 12 + ${formatNumber(values.inch, 1)} in = ${formatNumber(values.ft * 12 + values.inch, 1)} in`,
          `BMI = 703 × ${formatNumber(values.lb, 0)} ÷ ${formatNumber(values.ft * 12 + values.inch, 1)}²`,
          `    = ${formatNumber(result.bmi, 1)}`,
        ];

  return (
    <CalculatorPanel
      inputs={
        <>
          <SegmentedControl
            label="Units"
            value={unit}
            onChange={changeUnit}
            options={UNITS}
          />
          {unit === "imperial" ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <NumberField
                  label="Height (feet)"
                  suffix="ft"
                  decimals={0}
                  min={1}
                  max={8}
                  value={values.ft}
                  onChange={(ft) => update({ ft })}
                />
                <NumberField
                  label="Height (inches)"
                  suffix="in"
                  decimals={1}
                  min={0}
                  max={11.9}
                  value={values.inch}
                  onChange={(inch) => update({ inch })}
                />
              </div>
              <NumberField
                label="Weight"
                suffix="lb"
                decimals={1}
                min={20}
                max={1000}
                value={values.lb}
                onChange={(lb) => update({ lb })}
              />
            </>
          ) : (
            <>
              <NumberField
                label="Height"
                suffix="cm"
                decimals={1}
                min={50}
                max={250}
                value={values.cm}
                onChange={(cm) => update({ cm })}
              />
              <NumberField
                label="Weight"
                suffix="kg"
                decimals={1}
                min={10}
                max={450}
                value={values.kg}
                onChange={(kg) => update({ kg })}
              />
            </>
          )}
          <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            For adults aged 20 and over. Children and teens need an age- and
            sex-specific BMI percentile instead.
          </p>
        </>
      }
      results={
        <>
          <ResultCard
            label="Your BMI"
            value={shown}
            caption={result.category.label}
            actions={<ShareButton calculator="bmi-calculator" />}
          >
            <ResultRow
              label="Category"
              value={result.category.label}
              emphasis
            />
            <ResultRow label="Healthy BMI range" value="18.5 to 24.9" />
            <ResultRow
              label="Healthy weight for your height"
              value={rangeText}
            />
          </ResultCard>
          <BmiScale bmi={result.bmi} category={result.category.id} />
        </>
      }
      footer={
        <>
          <InsightCard>
            {insight.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </InsightCard>
          <FormulaReveal
            lines={formula}
            note="Formula and categories from the CDC, for adults 20 and older."
          />
          <HistoryPanel
            calculator="bmi-calculator"
            onRestore={(record) => replace(record.inputs)}
          />
        </>
      }
    />
  );
}
