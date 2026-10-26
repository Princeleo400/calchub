"use client";

import { CalculatorPanel } from "@/components/calculator/CalculatorPanel";
import { FormulaReveal } from "@/components/calculator/FormulaReveal";
import { InsightCard } from "@/components/calculator/InsightCard";
import { NumberField } from "@/components/calculator/NumberField";
import { ResultCard, ResultRow } from "@/components/calculator/ResultCard";
import { SegmentedControl } from "@/components/calculator/SegmentedControl";
import { ShareButton } from "@/components/calculator/ShareButton";
import { HistoryPanel } from "@/components/history/HistoryPanel";
import { CM_PER_IN, KG_PER_LB, toFeetInches } from "@/lib/calculators/bmi";
import {
  calculateIdealWeight,
  IDEAL_WEIGHT_FORMULAS,
  type IdealWeightSex,
} from "@/lib/calculators/idealWeight";
import { useRecordCalculation } from "@/lib/hooks/useCalculatorHistory";
import { useShareableUrl } from "@/lib/hooks/useShareableUrl";
import { formatWeight, idealWeightInsight } from "@/lib/insights/idealWeight";
import { formatNumber } from "@/lib/utils";

const DEFAULTS = {
  unit: "imperial",
  sex: "female",
  ft: 5,
  inch: 5,
  cm: 165,
};

type Unit = "imperial" | "metric";

const UNITS = [
  { value: "imperial", label: "US (ft, in)" },
  { value: "metric", label: "Metric (cm)" },
] as const;

const SEXES = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
] as const;

export function IdealWeightCalculator() {
  const { values, update, replace } = useShareableUrl(DEFAULTS);
  const unit: Unit = values.unit === "metric" ? "metric" : "imperial";
  const sex: IdealWeightSex = values.sex === "male" ? "male" : "female";
  const weightUnit = unit === "metric" ? "kg" : "lb";

  const heightCm =
    unit === "metric" ? values.cm : (values.ft * 12 + values.inch) * CM_PER_IN;
  const result = calculateIdealWeight({ sex, heightCm });
  const insight = idealWeightInsight(result, weightUnit);
  const show = (kg: number) => formatWeight(kg, weightUnit);
  const heightText =
    unit === "metric"
      ? `${formatNumber(values.cm, 0)} cm`
      : `${values.ft} ft ${formatNumber(values.inch, 1)} in`;

  useRecordCalculation({
    calculator: "ideal-weight-calculator",
    inputs: values,
    defaults: DEFAULTS,
    result: `${show(result.lowestKg)} to ${show(result.highestKg)}`,
    summary: `${sex === "male" ? "Male" : "Female"}, ${heightText}`,
    enabled: heightCm > 0,
  });

  function changeUnit(next: Unit) {
    if (next === unit) return;
    if (next === "metric") {
      update({ unit: next, cm: Math.round(heightCm) });
    } else {
      const { feet, inches } = toFeetInches(heightCm / CM_PER_IN);
      update({ unit: next, ft: feet, inch: Math.round(inches) });
    }
  }

  const inchesOverFiveFeet = heightCm / CM_PER_IN - 60;
  const formula = [
    `Height = ${formatNumber(heightCm / CM_PER_IN, 1)} in, so ${formatNumber(inchesOverFiveFeet, 1)} in ${inchesOverFiveFeet >= 0 ? "over" : "under"} 5 feet`,
    "",
    ...IDEAL_WEIGHT_FORMULAS.map((entry) => {
      const { baseKg, perInchKg } = entry[sex];
      const estimate = result.estimates.find(
        (candidate) => candidate.id === entry.id,
      )!;
      const weightText =
        entry.id === "hamwi"
          ? `${formatNumber(baseKg / KG_PER_LB, 0)} lb + ${formatNumber(perInchKg / KG_PER_LB, 0)} lb per inch`
          : `${formatNumber(baseKg, 1)} kg + ${formatNumber(perInchKg, 2)} kg per inch`;
      return `${entry.name.padEnd(9)}${weightText} = ${formatNumber(estimate.weightKg, 1)} kg`;
    }),
    "",
    `Healthy BMI range = 18.5 to 24.9 × height (m)² = ${formatNumber(result.healthyMinKg, 1)} to ${formatNumber(result.healthyMaxKg, 1)} kg`,
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
          <SegmentedControl
            label="Sex"
            value={sex}
            onChange={(next) => update({ sex: next })}
            options={SEXES}
          />
          {unit === "imperial" ? (
            <div className="grid grid-cols-2 gap-4">
              <NumberField
                label="Height"
                suffix="ft"
                decimals={0}
                min={4}
                max={7}
                value={values.ft}
                onChange={(ft) => update({ ft })}
              />
              <NumberField
                label="Inches"
                suffix="in"
                decimals={1}
                min={0}
                max={11.9}
                value={values.inch}
                onChange={(inch) => update({ inch })}
              />
            </div>
          ) : (
            <NumberField
              label="Height"
              suffix="cm"
              decimals={1}
              min={120}
              max={230}
              value={values.cm}
              onChange={(cm) => update({ cm })}
            />
          )}
          <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            For adults. Not for children, teens, or during pregnancy.
          </p>
        </>
      }
      results={
        <>
          <ResultCard
            label="Ideal weight by formula"
            value={`${show(result.lowestKg)} to ${show(result.highestKg)}`}
            caption={`Average of four formulas: ${show(result.averageKg)}`}
            actions={<ShareButton calculator="ideal-weight-calculator" />}
          >
            {result.estimates.map((estimate) => (
              <ResultRow
                key={estimate.id}
                label={`${estimate.name} (${estimate.year})`}
                value={show(estimate.weightKg)}
              />
            ))}
            <ResultRow
              label="Healthy BMI range"
              value={`${show(result.healthyMinKg)} to ${show(result.healthyMaxKg)}`}
              emphasis
            />
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
            note="Devine (1974), Robinson et al. (1983), Miller et al. (1983) and Hamwi (1964), as summarized by Pai and Paloucek (2000)."
          />
          <HistoryPanel
            calculator="ideal-weight-calculator"
            onRestore={(record) => replace(record.inputs)}
          />
        </>
      }
    />
  );
}
