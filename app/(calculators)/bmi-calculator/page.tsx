import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import {
  bmiFromImperial,
  BMI_CATEGORIES,
  CM_PER_IN,
  healthyWeightRangeKg,
  KG_PER_LB,
} from "@/lib/calculators/bmi";
import { buildMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/jsonLd";
import { formatNumber } from "@/lib/utils";
import { BmiCalculator } from "./BmiCalculator";

export const metadata = buildMetadata({
  title: "BMI Calculator for Adults: Metric & US Units",
  description:
    "Free BMI calculator. Find your body mass index in pounds and feet or kilograms and centimeters, see your CDC weight category, and the healthy weight range for your height.",
  path: "/bmi-calculator",
});

// Healthy weight ranges by height, computed from the same formula as the calculator.
const heightsIn = Array.from({ length: 19 }, (_value, index) => 58 + index); // 4 ft 10 in to 6 ft 4 in
const table = heightsIn.map((inches) => {
  const range = healthyWeightRangeKg(inches * CM_PER_IN);
  return {
    label: `${Math.floor(inches / 12)} ft ${inches % 12} in`,
    cm: inches * CM_PER_IN,
    minLb: range.min / KG_PER_LB,
    maxLb: range.max / KG_PER_LB,
    minKg: range.min,
    maxKg: range.max,
  };
});
const exampleBmi = bmiFromImperial(160, 69);

const faqs: FaqItem[] = [
  {
    question: "What is a healthy BMI for adults?",
    answer:
      "For adults aged 20 and over, the CDC classes a BMI of 18.5 to less than 25 as a healthy weight. Below 18.5 is underweight, 25 to less than 30 is overweight, and 30 or higher is obesity, which is split into classes 1, 2 and 3.",
  },
  {
    question: "How do you calculate BMI?",
    answer:
      "Divide your weight in kilograms by your height in meters squared. In US units, multiply your weight in pounds by 703 and divide by your height in inches squared. For example, 160 lb at 5 ft 9 in (69 inches) gives 703 × 160 ÷ 69² = 23.6.",
  },
  {
    question: "Is BMI accurate?",
    answer:
      "BMI is a quick screening measure, not a diagnosis. It does not tell muscle apart from fat or show where fat is carried, so a very muscular person can have a high BMI without excess fat. Health care providers use it alongside other measures and your medical history.",
  },
  {
    question: "Are the BMI categories different for men and women?",
    answer:
      "No. For adults 20 and older, the CDC uses the same BMI categories regardless of age or sex. Body composition does differ between people, which is one reason BMI is used as a starting point rather than a final answer.",
  },
  {
    question: "Can I use this BMI calculator for children?",
    answer:
      "No. For ages 2 to 19, BMI is compared with other children of the same age and sex and reported as a percentile. Use the CDC's Child and Teen BMI Calculator, or ask your child's doctor.",
  },
];

const sources = [
  {
    label: "CDC: Adult BMI categories",
    href: "https://www.cdc.gov/bmi/adult-calculator/bmi-categories.html",
  },
  {
    label: "CDC: About body mass index (BMI)",
    href: "https://www.cdc.gov/bmi/about/index.html",
  },
];

export default function BmiCalculatorPage() {
  return (
    <CalculatorShell
      slug="bmi-calculator"
      title="BMI Calculator"
      intro={
        <p>
          Calculate your body mass index in US or metric units. See your weight
          category for adults and the healthy weight range for your height,
          based on CDC guidelines.
        </p>
      }
      lastReviewed="2026-10-19"
      faqs={faqs}
      sources={sources}
      guide={
        <>
          <h2>What BMI measures</h2>
          <p>
            Body mass index compares your weight with your height. It is quick,
            free and the same for everyone, which is why doctors and public
            health agencies use it to screen for underweight, overweight and
            obesity. It is a starting point for a conversation about health, not
            a diagnosis.
          </p>

          <h2>How BMI is calculated</h2>
          <p>
            In metric units, BMI is your weight in kilograms divided by your
            height in meters squared. In US units, multiply your weight in
            pounds by 703, then divide by your height in inches squared.
          </p>
          <p>
            For example, someone who is 5 ft 9 in (69 inches) and weighs 160 lb
            has a BMI of 703 × 160 ÷ 69² = {formatNumber(exampleBmi, 1)}, which
            is in the healthy weight range.
          </p>

          <h2>Adult BMI categories</h2>
          <p>
            The CDC uses these categories for adults aged 20 and older,
            regardless of age or sex:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm tabular-nums">
              <thead className="border-b border-slate-200 text-xs tracking-wide text-slate-500 uppercase dark:border-slate-700 dark:text-slate-400">
                <tr>
                  <th scope="col" className="py-2 pr-4 font-medium">
                    BMI
                  </th>
                  <th scope="col" className="py-2 font-medium">
                    Category
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {BMI_CATEGORIES.map((category) => (
                  <tr key={category.id}>
                    <td className="py-2 pr-4">
                      {category.min === 0
                        ? "Below 18.5"
                        : category.max === Infinity
                          ? `${category.min} or higher`
                          : `${category.min} to ${formatNumber(category.max - 0.1, 1)}`}
                    </td>
                    <td className="py-2">{category.label}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>Healthy weight range by height</h2>
          <p>
            These weights give a BMI of 18.5 to 24.9 at each height. Use them as
            a rough guide; a healthy weight for you depends on more than BMI.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm tabular-nums">
              <thead className="border-b border-slate-200 text-xs tracking-wide text-slate-500 uppercase dark:border-slate-700 dark:text-slate-400">
                <tr>
                  <th scope="col" className="py-2 pr-4 font-medium">
                    Height
                  </th>
                  <th scope="col" className="py-2 pr-4 text-right font-medium">
                    Weight (lb)
                  </th>
                  <th scope="col" className="py-2 text-right font-medium">
                    Weight (kg)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {table.map((row) => (
                  <tr key={row.label}>
                    <th scope="row" className="py-1.5 pr-4 font-normal">
                      {row.label}{" "}
                      <span className="text-slate-400 dark:text-slate-500">
                        ({formatNumber(row.cm, 0)} cm)
                      </span>
                    </th>
                    <td className="py-1.5 pr-4 text-right">
                      {formatNumber(row.minLb, 0)} to{" "}
                      {formatNumber(row.maxLb, 0)}
                    </td>
                    <td className="py-1.5 text-right">
                      {formatNumber(row.minKg, 1)} to{" "}
                      {formatNumber(row.maxKg, 1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>The limits of BMI</h2>
          <ul>
            <li>
              <strong>It can&apos;t tell muscle from fat.</strong> Athletes and
              people with a lot of muscle can have a high BMI without excess
              body fat.
            </li>
            <li>
              <strong>It doesn&apos;t show where fat is carried</strong> or what
              type it is, which also matters for health.
            </li>
            <li>
              <strong>It is one measure among many.</strong> A health care
              provider looks at it together with things like blood pressure,
              cholesterol, a physical exam and your medical history.
            </li>
          </ul>
          <p>
            If your result surprises or worries you, talk with a doctor or other
            health care provider before making changes. They can tell you what a
            healthy weight looks like for you.
          </p>
        </>
      }
    >
      <BmiCalculator />
    </CalculatorShell>
  );
}
