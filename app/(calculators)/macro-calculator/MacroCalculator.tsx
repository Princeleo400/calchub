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
import { MACRO_LABELS, MacroSplitBar } from "@/components/charts/MacroSplitBar";
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
import {
  calculateMacros,
  DIET_STYLES,
  getDietStyle,
  isWithinAdultRanges,
  type DietStyleId,
  type Macro,
} from "@/lib/calculators/macro";
import { useRecordCalculation } from "@/lib/hooks/useCalculatorHistory";
import { useShareableUrl } from "@/lib/hooks/useShareableUrl";
import { macroInsight } from "@/lib/insights/macro";
import { cn, formatNumber } from "@/lib/utils";

const DEFAULTS = {
  source: "estimate",
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
  cal: 2000,
  style: "balanced",
  protein: 30,
  carbs: 40,
  fat: 30,
  meals: 3,
};

type Unit = "imperial" | "metric";
type CalorieSource = "estimate" | "custom";

const SOURCES = [
  { value: "estimate", label: "Estimate for me" },
  { value: "custom", label: "Enter my own" },
] as const;

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
const STYLE_OPTIONS = [
  ...DIET_STYLES.map((style) => ({
    value: style.id,
    label: `${style.label} (${style.split.protein}/${style.split.carbs}/${style.split.fat})`,
  })),
  { value: "custom" as const, label: "Custom percentages" },
];

const MACROS: Macro[] = ["protein", "carbs", "fat"];

const grams = (value: number) => `${formatNumber(Math.round(value))} g`;

const STYLES_OUTSIDE_RANGES = DIET_STYLES.filter(
  (style) => !isWithinAdultRanges(style.split),
).map((style) => style.label.toLowerCase());

export function MacroCalculator() {
  const { values, update, replace } = useShareableUrl(DEFAULTS);
  const source: CalorieSource =
    values.source === "custom" ? "custom" : "estimate";
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
  const styleId = (
    values.style === "custom" ||
    DIET_STYLES.some((style) => style.id === values.style)
      ? values.style
      : "balanced"
  ) as DietStyleId;
  const preset = getDietStyle(styleId);

  const heightCm =
    unit === "metric" ? values.cm : (values.ft * 12 + values.inch) * CM_PER_IN;
  const weightKg = unit === "metric" ? values.kg : values.lb * KG_PER_LB;
  const calorieEstimate = calculateCalories({
    sex,
    age: values.age,
    weightKg,
    heightCm,
    activity,
    goal,
  });
  const calories =
    source === "custom"
      ? values.cal
      : roundCalories(calorieEstimate.goal.calories);
  const split = preset
    ? preset.split
    : { protein: values.protein, carbs: values.carbs, fat: values.fat };

  const result = calculateMacros({
    calories,
    split,
    weightKg,
    mealsPerDay: values.meals,
  });
  const insight = macroInsight(result, calories, values.meals);
  const { protein, carbs, fat } = result.amounts;
  const belowRestingNeeds =
    source === "estimate" && calorieEstimate.goal.belowBmr;

  useRecordCalculation({
    calculator: "macro-calculator",
    inputs: values,
    defaults: DEFAULTS,
    result: `P ${Math.round(protein.grams)} / C ${Math.round(carbs.grams)} / F ${Math.round(fat.grams)} g`,
    summary: `${formatNumber(calories)} cal, ${preset ? preset.label.toLowerCase() : "custom split"}`,
    enabled: calories > 0 && result.valid,
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

  function changeStyle(next: DietStyleId) {
    // Start a custom split from the preset that was showing.
    if (next === "custom" && preset) {
      update({ style: next, ...preset.split });
    } else {
      update({ style: next });
    }
  }

  const formula = [
    "Protein and carbs: 4 calories per gram. Fat: 9 calories per gram.",
    "",
    `Protein = ${formatNumber(calories)} × ${formatNumber(protein.percent)}% ÷ 4 = ${grams(protein.grams)}`,
    `Carbs   = ${formatNumber(calories)} × ${formatNumber(carbs.percent)}% ÷ 4 = ${grams(carbs.grams)}`,
    `Fat     = ${formatNumber(calories)} × ${formatNumber(fat.percent)}% ÷ 9 = ${grams(fat.grams)}`,
    ...(source === "estimate"
      ? [
          "",
          `Calories come from the Mifflin-St Jeor equation × ${calorieEstimate.activity.factor} for activity`,
          `${calorieEstimate.goal.adjustment === 0 ? "" : `${calorieEstimate.goal.adjustment > 0 ? "+" : "−"} ${Math.abs(calorieEstimate.goal.adjustment)} for your goal `}= ${formatNumber(calories)} a day.`,
        ]
      : []),
  ];

  return (
    <CalculatorPanel
      inputs={
        <>
          <SegmentedControl
            label="Calorie target"
            value={source}
            onChange={(next) => update({ source: next })}
            options={SOURCES}
          />
          <SegmentedControl
            label="Units"
            value={unit}
            onChange={changeUnit}
            options={UNITS}
          />

          {source === "estimate" ? (
            <>
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
                  <WeightField unit={unit} values={values} onChange={update} />
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
                  <WeightField unit={unit} values={values} onChange={update} />
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
            </>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <NumberField
                label="Calories per day"
                suffix="cal"
                grouped
                decimals={0}
                min={0}
                max={10_000}
                value={values.cal}
                onChange={(cal) => update({ cal })}
              />
              <WeightField
                unit={unit}
                values={values}
                onChange={update}
                hint="For protein per kg"
              />
            </div>
          )}

          <div className="space-y-4 border-t border-slate-200 pt-4 dark:border-slate-700">
            <SelectField
              label="Diet style (protein/carbs/fat %)"
              value={styleId}
              onChange={changeStyle}
              options={STYLE_OPTIONS}
              hint={preset?.description}
            />
            {!preset && (
              <div className="grid grid-cols-3 gap-3">
                {MACROS.map((macro) => (
                  <NumberField
                    key={macro}
                    label={MACRO_LABELS[macro]}
                    suffix="%"
                    decimals={1}
                    min={0}
                    max={100}
                    value={values[macro]}
                    onChange={(percent) => update({ [macro]: percent })}
                  />
                ))}
              </div>
            )}
            <NumberField
              label="Meals per day"
              suffix="meals"
              decimals={0}
              min={1}
              max={8}
              value={values.meals}
              onChange={(meals) => update({ meals })}
            />
          </div>
          <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            For healthy adults. Not suitable during pregnancy or breastfeeding,
            for children and teens, or in place of a diet from your doctor or
            dietitian.
          </p>
        </>
      }
      results={
        <>
          <ResultCard
            label="Daily macros"
            value={
              result.valid
                ? `${grams(protein.grams)} · ${grams(carbs.grams)} · ${grams(fat.grams)}`
                : "Check your percentages"
            }
            caption={`Protein · carbs · fat for ${formatNumber(calories)} calories a day`}
            tone={
              !result.valid || result.lowCalories || belowRestingNeeds
                ? "warning"
                : "neutral"
            }
            actions={<ShareButton calculator="macro-calculator" />}
          >
            {result.valid && (
              <>
                <div className="py-3">
                  <MacroSplitBar amounts={result.amounts} />
                </div>
                {MACROS.map((macro) => (
                  <ResultRow
                    key={macro}
                    label={MACRO_LABELS[macro]}
                    value={`${grams(result.amounts[macro].grams)} (${formatNumber(Math.round(result.amounts[macro].calories))} cal)`}
                  />
                ))}
                {result.proteinPerKg !== null && (
                  <ResultRow
                    label="Protein per kg of body weight"
                    value={`${formatNumber(result.proteinPerKg, 1)} g/kg`}
                    emphasis
                  />
                )}
              </>
            )}
          </ResultCard>
          {(result.lowCalories || belowRestingNeeds) && (
            <p className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>
                <strong className="font-semibold">Caution:</strong> this calorie
                target is very low
                {belowRestingNeeds
                  ? ", below your estimated resting needs"
                  : ""}
                .{" "}
                {source === "estimate"
                  ? "Choose a slower goal or check with a health professional."
                  : "Check with a doctor or registered dietitian before eating this little."}
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
          {result.valid && calories > 0 && (
            <StyleTable calories={calories} selected={styleId} />
          )}
          <FormulaReveal
            lines={formula}
            note="Atwater factors: 4 calories per gram of protein or carbohydrate, 9 per gram of fat."
          />
          <HistoryPanel
            calculator="macro-calculator"
            onRestore={(record) => replace(record.inputs)}
          />
        </>
      }
    />
  );
}

function WeightField({
  unit,
  values,
  onChange,
  hint,
}: {
  unit: Unit;
  values: typeof DEFAULTS;
  onChange: (next: Partial<typeof DEFAULTS>) => void;
  hint?: string;
}) {
  return unit === "imperial" ? (
    <NumberField
      label="Weight"
      suffix="lb"
      decimals={1}
      min={50}
      max={1000}
      value={values.lb}
      onChange={(lb) => onChange({ lb })}
      hint={hint}
    />
  ) : (
    <NumberField
      label="Weight"
      suffix="kg"
      decimals={1}
      min={25}
      max={450}
      value={values.kg}
      onChange={(kg) => onChange({ kg })}
      hint={hint}
    />
  );
}

/** Grams of each macro for every preset, at the same calorie target. */
function StyleTable({
  calories,
  selected,
}: {
  calories: number;
  selected: DietStyleId;
}) {
  return (
    <section
      aria-labelledby="style-table-heading"
      className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
    >
      <h2
        id="style-table-heading"
        className="text-base font-semibold text-slate-900 dark:text-slate-50"
      >
        Daily grams by diet style at {formatNumber(calories)} calories
      </h2>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[420px] text-sm tabular-nums">
          <caption className="sr-only">
            Protein, carbs and fat in grams for each diet style
          </caption>
          <thead className="border-b border-slate-200 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
            <tr>
              <th scope="col" className="py-2 pr-4 pl-2 text-left font-medium">
                Style
              </th>
              {MACROS.map((macro) => (
                <th
                  key={macro}
                  scope="col"
                  className="py-2 pr-2 text-right font-medium"
                >
                  {MACRO_LABELS[macro]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {DIET_STYLES.map((style) => {
              const styleResult = calculateMacros({
                calories,
                split: style.split,
                weightKg: 0,
                mealsPerDay: 1,
              });
              return (
                <tr
                  key={style.id}
                  className={cn(
                    style.id === selected && "bg-blue-50 dark:bg-blue-950",
                  )}
                >
                  <th
                    scope="row"
                    className="py-2.5 pr-4 pl-2 text-left font-normal text-slate-700 dark:text-slate-200"
                  >
                    {style.label}
                  </th>
                  {MACROS.map((macro) => (
                    <td
                      key={macro}
                      className="py-2.5 pr-2 text-right text-slate-700 dark:text-slate-200"
                    >
                      {grams(styleResult.amounts[macro].grams)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        Official adult ranges: protein 10 to 35%, carbs 45 to 65% and fat 20 to
        35% of calories. The {STYLES_OUTSIDE_RANGES.join(" and ")} styles fall
        outside them.
      </p>
    </section>
  );
}
