import Link from "next/link";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import {
  ACTIVE_PROTEIN_G_PER_KG,
  ADULT_RANGES,
  calculateMacros,
  DIET_STYLES,
  getDietStyle,
  PROTEIN_RDA_G_PER_KG,
} from "@/lib/calculators/macro";
import { buildMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/jsonLd";
import { formatNumber } from "@/lib/utils";
import { MacroCalculator } from "./MacroCalculator";

export const metadata = buildMetadata({
  title: "Macro Calculator: Daily Protein, Carbs and Fat",
  description:
    "Free macro calculator. Turn your calorie target into daily grams of protein, carbs and fat for a balanced, higher-protein, lower-carb or keto diet, with per-meal amounts.",
  path: "/macro-calculator",
  hasOwnSocialImage: true,
});

// Worked examples are computed, so the text always matches the calculator.
const EXAMPLE_CALORIES = 2000;
const EXAMPLE_WEIGHT_KG = 68;
const balanced = calculateMacros({
  calories: EXAMPLE_CALORIES,
  split: getDietStyle("balanced")!.split,
  weightKg: EXAMPLE_WEIGHT_KG,
  mealsPerDay: 3,
});
const grams = (value: number) => `${formatNumber(Math.round(value))} g`;
const rdaGrams = PROTEIN_RDA_G_PER_KG * EXAMPLE_WEIGHT_KG;
const activeGrams = {
  min: ACTIVE_PROTEIN_G_PER_KG.min * EXAMPLE_WEIGHT_KG,
  max: ACTIVE_PROTEIN_G_PER_KG.max * EXAMPLE_WEIGHT_KG,
};

const faqs: FaqItem[] = [
  {
    question: "What are macros?",
    answer:
      "Macronutrients, or macros, are the three nutrients that provide calories: protein, carbohydrates and fat. Protein and carbohydrates have about 4 calories per gram, and fat about 9. Alcohol also has calories (about 7 per gram) but is not counted as a macro here.",
  },
  {
    question: "How are my macros calculated?",
    answer:
      "Start with a daily calorie target, then multiply it by the share of calories you want from each macro. Divide by 4 for protein and carbs, or 9 for fat, to get grams. For 2,000 calories with 20% protein: 2,000 × 0.20 ÷ 4 = 100 g of protein.",
  },
  {
    question: "What is a healthy macro ratio?",
    answer: `For adults, health authorities set ranges rather than one ideal ratio: ${ADULT_RANGES.carbs.min} to ${ADULT_RANGES.carbs.max}% of calories from carbohydrates, ${ADULT_RANGES.fat.min} to ${ADULT_RANGES.fat.max}% from fat and ${ADULT_RANGES.protein.min} to ${ADULT_RANGES.protein.max}% from protein. Many different splits within those ranges can be healthy. The quality of the food matters as much as the numbers.`,
  },
  {
    question: "How much protein do I need?",
    answer: `The recommended daily amount for adults is ${PROTEIN_RDA_G_PER_KG} g per kilogram of body weight, about ${Math.round(rdaGrams)} g for a ${EXAMPLE_WEIGHT_KG} kg (150 lb) adult. The International Society of Sports Nutrition finds ${ACTIVE_PROTEIN_G_PER_KG.min} to ${ACTIVE_PROTEIN_G_PER_KG.max} g/kg enough for most people who exercise regularly.`,
  },
  {
    question: "Is keto safe?",
    answer:
      "A ketogenic diet gets most of its calories from fat and very few from carbohydrates, well outside the usual adult ranges. Some people use it under medical supervision, but it is not right for everyone, including people with some health conditions or who take certain medicines. Talk with a doctor before starting.",
  },
  {
    question: "Do I need to track macros to lose weight?",
    answer:
      "No. Weight change depends mainly on calories eaten versus calories used. Tracking macros can help you feel full for longer or support training, for example by eating enough protein, but it is a tool, not a requirement.",
  },
];

const sources = [
  {
    label:
      "Institute of Medicine: Dietary Reference Intakes for Energy, Carbohydrate, Fiber, Fat, Fatty Acids, Cholesterol, Protein, and Amino Acids (2005)",
    href: "https://doi.org/10.17226/10490",
  },
  {
    label:
      "Jäger et al.: International Society of Sports Nutrition position stand, protein and exercise (2017)",
    href: "https://pubmed.ncbi.nlm.nih.gov/28642676/",
  },
];

export default function MacroCalculatorPage() {
  return (
    <CalculatorShell
      slug="macro-calculator"
      title="Macro Calculator"
      intro={
        <p>
          Turn a daily calorie target into grams of protein, carbohydrates and
          fat. Estimate your calories from your height, weight and activity, or
          enter your own, then choose a diet style or set custom percentages.
        </p>
      }
      lastReviewed="2026-10-25"
      faqs={faqs}
      sources={sources}
      guide={
        <>
          <h2>How macros work</h2>
          <p>
            Everything you eat that has calories gets them from three
            macronutrients. <strong>Protein</strong> and{" "}
            <strong>carbohydrates</strong> provide about 4 calories per gram,
            and <strong>fat</strong> about 9. So once you know how many calories
            you need and how you want to split them, the grams follow.
          </p>
          <p>
            If you do not know your calorie needs, the calculator estimates them
            the same way as our{" "}
            <Link href="/calorie-calculator">calorie calculator</Link>, using
            the Mifflin-St Jeor equation and your activity level.
          </p>

          <h2>A worked example</h2>
          <p>
            On {formatNumber(EXAMPLE_CALORIES)} calories a day with a balanced
            split (20% protein, 50% carbs, 30% fat), you would aim for about{" "}
            {grams(balanced.amounts.protein.grams)} of protein,{" "}
            {grams(balanced.amounts.carbs.grams)} of carbohydrates and{" "}
            {grams(balanced.amounts.fat.grams)} of fat. Across three meals that
            is roughly {grams(balanced.amounts.protein.gramsPerMeal)} of protein
            per meal.
          </p>

          <h2>The official ranges for adults</h2>
          <p>
            The US and Canadian Dietary Reference Intakes set{" "}
            <strong>Acceptable Macronutrient Distribution Ranges</strong>: the
            share of calories from each macro linked to lower risk of chronic
            disease while still meeting nutrient needs.
          </p>
          <ul>
            <li>
              Carbohydrates: {ADULT_RANGES.carbs.min} to{" "}
              {ADULT_RANGES.carbs.max}% of calories
            </li>
            <li>
              Fat: {ADULT_RANGES.fat.min} to {ADULT_RANGES.fat.max}% of calories
            </li>
            <li>
              Protein: {ADULT_RANGES.protein.min} to {ADULT_RANGES.protein.max}%
              of calories
            </li>
          </ul>
          <p>
            The calculator tells you when a split falls outside these ranges.
            That is not automatically wrong, but it is worth discussing with a
            doctor or registered dietitian.
          </p>

          <h2>How much protein is enough?</h2>
          <p>
            Percentages are only half the story for protein, because need scales
            with body size. Adults are advised to get at least{" "}
            {PROTEIN_RDA_G_PER_KG} g per kilogram of body weight a day, about{" "}
            {Math.round(rdaGrams)} g for someone weighing {EXAMPLE_WEIGHT_KG} kg
            (150 lb). For people who exercise regularly, sports nutrition
            research finds {ACTIVE_PROTEIN_G_PER_KG.min} to{" "}
            {ACTIVE_PROTEIN_G_PER_KG.max} g/kg enough for most, or{" "}
            {Math.round(activeGrams.min)} to {Math.round(activeGrams.max)} g a
            day at that weight. The calculator shows your protein per kilogram
            so you can check.
          </p>

          <h2>Diet styles compared</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm tabular-nums">
              <thead className="border-b border-slate-200 text-xs tracking-wide text-slate-500 uppercase dark:border-slate-700 dark:text-slate-400">
                <tr>
                  <th scope="col" className="py-2 pr-4 font-medium">
                    Style
                  </th>
                  <th scope="col" className="py-2 pr-4 text-right font-medium">
                    Protein
                  </th>
                  <th scope="col" className="py-2 pr-4 text-right font-medium">
                    Carbs
                  </th>
                  <th scope="col" className="py-2 text-right font-medium">
                    Fat
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {DIET_STYLES.map((style) => (
                  <tr key={style.id}>
                    <th scope="row" className="py-2 pr-4 font-normal">
                      {style.label}
                    </th>
                    <td className="py-2 pr-4 text-right">
                      {style.split.protein}%
                    </td>
                    <td className="py-2 pr-4 text-right">
                      {style.split.carbs}%
                    </td>
                    <td className="py-2 text-right">{style.split.fat}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            These presets are common starting points, not prescriptions. The
            best split is one you can keep up that fits your health, your
            training and the foods you enjoy.
          </p>

          <h2>Tips for hitting your macros</h2>
          <ul>
            <li>
              Spread protein across meals rather than eating most of it at
              dinner.
            </li>
            <li>
              Choose mostly whole grains, fruit, vegetables and beans for
              carbohydrates, which also bring fiber.
            </li>
            <li>
              Favor unsaturated fats such as olive oil, nuts and fish over
              saturated fats.
            </li>
            <li>
              Treat the numbers as a guide. Being close most days matters more
              than hitting them exactly.
            </li>
          </ul>
        </>
      }
    >
      <MacroCalculator />
    </CalculatorShell>
  );
}
