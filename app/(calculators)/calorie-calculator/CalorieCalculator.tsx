"use client";

import { AlertTriangle } from "lucide-react";
import { CalculatorPanel } from "@/components/calculator/CalculatorPanel";
import { FormulaReveal } from "@/components/calculator/FormulaReveal";
import { InsightCard } from "@/components/calculator/InsightCard";
import { NumberField } from "@/components/calculator/NumberField";
import { ResultCard, ResultRow } from "@/components/calculator/ResultCard";
import { SegmentedControl } from "@/components/calculator/SegmentedControl";
import { SelectField } from "@/components/calculator/SelectField";
import { ShareButton } from "@/components/calculator/ShareButton";
import { HistoryPanel } from "@/components/history/HistoryPanel";
import { CM_PER_IN, KG_PER_LB, toFeetInches } from "@/lib/calculators/bmi";
import {
  ACTIVITY_LEVELS,
  calculateCalories,
  GOALS,
  roundCalories,
  type ActivityId,
  type GoalId,
  type Sex,
} from "@/lib/calculators/calorie";
import { useRecordCalculation } from "@/lib/hooks/useCalculatorHistory";
import { useShareableUrl } from "@/lib/hooks/useShareableUrl";
import { calorieInsight } from "@/lib/insights/calorie";
import { cn, formatNumber } from "@/lib/utils";

const DEFAULTS = {
  unit: "imperial",
  sex: "female",
  age: 35,
  ft: 5,
  inch: 5,
  lb: 150,
  cm: 165,
  kg: 68,
  act: "light",
  goal: "maintain",
};

type Unit = "imperial" | "metric";

const UNITS = [
  { value: "imperial", label: "US (ft, lb)" },
  { value: "metric", label: "Metric (cm, kg)" },
] as const;

const SEXES = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
] as const;

const ACTIVITY_OPTIONS = ACTIVITY_LEVELS.map((level) => ({
  value: level.id,
  label: `${level.label}: ${level.description}`,
}));
const GOAL_OPTIONS = GOALS.map((goal) => ({
  value: goal.id,
  label: goal.label,
}));

const kcal = (calories: number) => formatNumber(roundCalories(calories));

export function CalorieCalculator() {
  const { values, update, replace } = useShareableUrl(DEFAULTS);
  const unit: Unit = values.unit === "metric" ? "metric" : "imperial";
  const sex: Sex = values.sex === "male" ? "male" : "female";
  const activity = (
    ACTIVITY_LEVELS.some((level) => level.id === values.act)
      ? values.act
      : "light"
  ) as ActivityId;
  const goal = (
    GOALS.some((option) => option.id === values.goal) ? values.goal : "maintain"
  ) as GoalId;

  const heightCm =
    unit === "metric" ? values.cm : (values.ft * 12 + values.inch) * CM_PER_IN;
  const weightKg = unit === "metric" ? values.kg : values.lb * KG_PER_LB;
  const result = calculateCalories({
    sex,
    age: values.age,
    weightKg,
    heightCm,
    activity,
    goal,
  });
  const insight = calorieInsight(result);
  const headline = kcal(result.goal.calories);

  useRecordCalculation({
    calculator: "calorie-calculator",
    inputs: values,
    defaults: DEFAULTS,
    result: `${headline} cal/day`,
    summary: `${sex === "male" ? "Male" : "Female"}, ${values.age}, ${result.activity.label.toLowerCase()}, ${result.goal.label.toLowerCase()}`,
    enabled: result.bmr > 0,
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

  const formula = [
    `BMR = 10 × weight (kg) + 6.25 × height (cm) − 5 × age ${sex === "male" ? "+ 5" : "− 161"}`,
    `    = 10 × ${formatNumber(weightKg, 1)} + 6.25 × ${formatNumber(heightCm, 1)} − 5 × ${values.age} ${sex === "male" ? "+ 5" : "− 161"}`,
    `    = ${formatNumber(result.bmr, 0)} calories a day at rest`,
    "",
    `TDEE = BMR × ${result.activity.factor} (${result.activity.label.toLowerCase()})`,
    `     = ${formatNumber(result.tdee, 0)} calories a day`,
    ...(result.goal.adjustment !== 0
      ? [
          "",
          `Goal = TDEE ${result.goal.adjustment > 0 ? "+" : "−"} ${Math.abs(result.goal.adjustment)} = ${formatNumber(result.goal.calories, 0)}`,
        ]
      : []),
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
          <div className="grid grid-cols-2 gap-4">
            <SegmentedControl
              label="Sex"
              value={sex}
              onChange={(next) => update({ sex: next })}
              options={SEXES}
            />
            <NumberField
              label="Age"
              suffix="years"
              decimals={0}
              min={18}
              max={100}
              value={values.age}
              onChange={(age) => update({ age })}
            />
          </div>
          {unit === "imperial" ? (
            <div className="grid grid-cols-3 gap-3">
              <NumberField
                label="Height"
                suffix="ft"
                decimals={0}
                min={1}
                max={8}
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
              <NumberField
                label="Weight"
                suffix="lb"
                decimals={1}
                min={50}
                max={1000}
                value={values.lb}
                onChange={(lb) => update({ lb })}
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <NumberField
                label="Height"
                suffix="cm"
                decimals={1}
                min={100}
                max={250}
                value={values.cm}
                onChange={(cm) => update({ cm })}
              />
              <NumberField
                label="Weight"
                suffix="kg"
                decimals={1}
                min={25}
                max={450}
                value={values.kg}
                onChange={(kg) => update({ kg })}
              />
            </div>
          )}
          <SelectField
            label="Activity level"
            value={activity}
            onChange={(act) => update({ act })}
            options={ACTIVITY_OPTIONS}
          />
          <SelectField
            label="Goal"
            value={goal}
            onChange={(next) => update({ goal: next })}
            options={GOAL_OPTIONS}
          />
          <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            For adults. Not suitable during pregnancy or breastfeeding, or for
            children and teens.
          </p>
        </>
      }
      results={
        <>
          <ResultCard
            label="Calories per day"
            value={headline}
            caption={result.goal.label}
            tone={result.goal.belowBmr ? "warning" : "neutral"}
            actions={<ShareButton calculator="calorie-calculator" />}
          >
            <ResultRow
              label="Resting needs (BMR)"
              value={`${kcal(result.bmr)} cal`}
            />
            <ResultRow
              label="Maintenance (TDEE)"
              value={`${kcal(result.tdee)} cal`}
              emphasis
            />
            <ResultRow
              label="Activity factor"
              value={`× ${result.activity.factor}`}
            />
          </ResultCard>
          {result.goal.belowBmr && (
            <p className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>
                <strong className="font-semibold">Caution:</strong> this target
                is below your estimated resting needs. Choose a slower goal or
                check with a health professional.
              </span>
            </p>
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
          <GoalTable goals={result.goals} selected={goal} />
          <FormulaReveal
            lines={formula}
            note="Mifflin-St Jeor equation (Mifflin et al., American Journal of Clinical Nutrition, 1990) with standard activity factors."
          />
          <HistoryPanel
            calculator="calorie-calculator"
            onRestore={(record) => replace(record.inputs)}
          />
        </>
      }
    />
  );
}

function GoalTable({
  goals,
  selected,
}: {
  goals: ReturnType<typeof calculateCalories>["goals"];
  selected: GoalId;
}) {
  return (
    <section
      aria-labelledby="goal-table-heading"
      className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
    >
      <h2
        id="goal-table-heading"
        className="text-base font-semibold text-slate-900 dark:text-slate-50"
      >
        Daily calories for each goal
      </h2>
      <table className="mt-3 w-full text-sm tabular-nums">
        <caption className="sr-only">Estimated daily calories by goal</caption>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {goals.map((row) => (
            <tr
              key={row.id}
              className={cn(
                row.id === selected && "bg-blue-50 dark:bg-blue-950",
              )}
            >
              <th
                scope="row"
                className="py-2.5 pr-4 pl-2 text-left font-normal text-slate-700 dark:text-slate-200"
              >
                {row.label}
                {row.belowBmr && (
                  <span className="ml-2 text-xs text-amber-700 dark:text-amber-400">
                    Below resting needs
                  </span>
                )}
              </th>
              <td
                className={cn(
                  "py-2.5 pr-2 text-right",
                  row.id === selected
                    ? "font-semibold text-slate-900 dark:text-slate-50"
                    : "text-slate-700 dark:text-slate-200",
                )}
              >
                {formatNumber(roundCalories(row.calories))} cal
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        Weekly changes use the rough rule of about 3,500 calories per pound of
        body weight. Actual change usually slows over time.
      </p>
    </section>
  );
}
