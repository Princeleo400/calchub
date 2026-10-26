import Link from "next/link";
import { CalculatorCta } from "@/components/blog/CalculatorCta";
import { DataTable } from "@/components/blog/DataTable";
import type { Post } from "@/lib/blog/types";
import {
  CM_PER_IN,
  HEALTHY_MAX,
  HEALTHY_MIN,
  healthyWeightRangeKg,
  KG_PER_LB,
} from "@/lib/calculators/bmi";
import { formatNumber } from "@/lib/utils";

// 4′10″ to 6′4″ in 2-inch steps.
const HEIGHTS_IN = Array.from(
  { length: 10 },
  (_unused, index) => 58 + index * 2,
);

const pounds = (kg: number) => Math.round(kg / KG_PER_LB);
const heightLabel = (inches: number) =>
  `${Math.floor(inches / 12)}′${inches % 12}″`;

const exampleRange = healthyWeightRangeKg(65 * CM_PER_IN);

function Body() {
  return (
    <>
      <p>
        Search for your &ldquo;ideal weight&rdquo; and you will find a single
        number. Health agencies take a different view: for adults, a healthy
        weight is a <strong>range</strong>, and it is wider than most people
        expect.
      </p>

      <h2>How the healthy range is worked out</h2>
      <p>
        The range comes from body mass index (BMI): weight in kilograms divided
        by height in meters squared. The CDC counts a BMI of 18.5 to under 25 as
        a healthy weight for adults. Turning that around gives the weights that
        fall inside it for any height. For someone who is 5′5″, that is{" "}
        {pounds(exampleRange.min)} to {pounds(exampleRange.max)} lb, a span of{" "}
        {pounds(exampleRange.max) - pounds(exampleRange.min)} lb.
      </p>
      <p>
        The same range applies to adult men and women. It does not change with
        age for adults, although body composition does.
      </p>

      <h2>Healthy weight range by height</h2>
      <DataTable
        caption={`Weights that give a BMI of ${HEALTHY_MIN} to ${HEALTHY_MAX}, for adults.`}
        headers={["Height", "Pounds", "Kilograms"]}
        numeric={[1, 2]}
        fitsPhone
        rows={HEIGHTS_IN.map((inches) => {
          const range = healthyWeightRangeKg(inches * CM_PER_IN);
          return [
            `${heightLabel(inches)} / ${Math.round(inches * CM_PER_IN)} cm`,
            `${pounds(range.min)}–${pounds(range.max)} lb`,
            `${formatNumber(Math.round(range.min))}–${formatNumber(Math.round(range.max))} kg`,
          ];
        })}
      />

      <CalculatorCta
        slug="bmi-calculator"
        text="Find your BMI and the healthy range for your exact height."
      />

      <h2>What about &ldquo;ideal weight&rdquo; formulas?</h2>
      <p>
        Formulas such as Devine, Robinson, Miller and Hamwi give one number for
        your height and sex. They were developed mainly to help work out
        medicine doses, and they do not account for muscle or frame size. They
        usually land inside the healthy range, which is a useful sanity check,
        but they are not a target. Our{" "}
        <Link href="/ideal-weight-calculator">ideal weight calculator</Link>{" "}
        shows all four side by side with the healthy range.
      </p>

      <h2>Your waist adds useful context</h2>
      <p>
        Weight alone does not show where fat is carried, and fat around the
        middle is linked to higher risk of conditions such as type 2 diabetes
        and heart disease. The US National Heart, Lung, and Blood Institute uses
        a waist of more than <strong>40 inches (102 cm) for men</strong> or{" "}
        <strong>35 inches (89 cm) for women</strong> as a sign of higher risk.
        The World Health Organization suggests lower cut-offs for adults of
        Asian descent.
      </p>
      <p>
        To measure, stand up straight and wrap a tape measure around your bare
        waist just above the hip bones, then breathe out normally before reading
        it.
      </p>

      <h2>Where BMI falls short</h2>
      <ul>
        <li>
          It cannot tell muscle from fat, so very muscular people can read high.
        </li>
        <li>
          It is a screening tool. Doctors combine it with other measures, such
          as blood pressure and blood tests, before drawing conclusions.
        </li>
        <li>
          It is designed for adults. Children and teens are assessed with
          age-based percentiles instead.
        </li>
      </ul>

      <h2>The takeaway</h2>
      <p>
        If your weight is anywhere in the healthy range for your height, BMI
        counts it as healthy; there is no single best point inside it. If you
        are outside the range, or your waist measurement is high, it is worth a
        conversation with a doctor, who can look at the whole picture.
      </p>
    </>
  );
}

export const post: Post = {
  slug: "healthy-weight-for-height",
  title: "Healthy Weight for Your Height: Why It's a Range, Not One Number",
  description:
    "The healthy weight range for adults at every height from 4′10″ to 6′4″, in pounds and kilograms, how it is worked out, and why your waist size adds useful context.",
  published: "2026-10-26",
  updated: "2026-10-26",
  category: "health",
  readingMinutes: 4,
  calculators: ["bmi-calculator", "ideal-weight-calculator"],
  faqs: [
    {
      question: "What is a healthy weight for my height?",
      answer: `For adults, any weight that gives a BMI of ${HEALTHY_MIN} to ${HEALTHY_MAX}. At 5′5″ that is ${pounds(exampleRange.min)} to ${pounds(exampleRange.max)} lb. The range is the same for men and women.`,
    },
    {
      question: "What waist size is a health risk?",
      answer:
        "The US National Heart, Lung, and Blood Institute treats a waist of more than 40 inches (102 cm) for men or 35 inches (89 cm) for women as a sign of higher risk. Lower cut-offs are suggested for adults of Asian descent.",
    },
  ],
  sources: [
    {
      label: "CDC: Adult BMI categories",
      href: "https://www.cdc.gov/bmi/adult-calculator/bmi-categories.html",
    },
    {
      label: "CDC: About body mass index (BMI)",
      href: "https://www.cdc.gov/bmi/about/index.html",
    },
    {
      label:
        "Wisconsin Department of Health Services: Waist circumference (citing NHLBI)",
      href: "https://www.dhs.wisconsin.gov/publications/p49356-waistcirc.pdf",
    },
  ],
  Body,
};
