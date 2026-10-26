import Link from "next/link";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { CM_PER_IN } from "@/lib/calculators/bmi";
import { calculateIdealWeight } from "@/lib/calculators/idealWeight";
import { formatWeight } from "@/lib/insights/idealWeight";
import { buildMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/jsonLd";
import { IdealWeightCalculator } from "./IdealWeightCalculator";

export const metadata = buildMetadata({
  title: "Ideal Weight Calculator: 4 Formulas and a Chart by Height",
  description:
    "Free ideal weight calculator for men and women. Compare the Devine, Robinson, Miller and Hamwi formulas with the healthy BMI range for your height, plus a full chart by height.",
  path: "/ideal-weight-calculator",
  hasOwnSocialImage: true,
});

// The chart is computed from the same formulas as the calculator.
// 4′10″ to 6′6″ in 2-inch steps.
const CHART_HEIGHTS_IN = Array.from(
  { length: 11 },
  (_unused, index) => 58 + index * 2,
);

function heightLabel(totalInches: number) {
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return `${feet}′${inches}″`;
}

const chartRows = CHART_HEIGHTS_IN.map((inches) => {
  const heightCm = inches * CM_PER_IN;
  const women = calculateIdealWeight({ sex: "female", heightCm });
  const men = calculateIdealWeight({ sex: "male", heightCm });
  return {
    inches,
    heightCm,
    women: `${formatWeight(women.lowestKg, "lb").replace(" lb", "")}–${formatWeight(women.highestKg, "lb")}`,
    men: `${formatWeight(men.lowestKg, "lb").replace(" lb", "")}–${formatWeight(men.highestKg, "lb")}`,
    healthy: `${formatWeight(women.healthyMinKg, "lb").replace(" lb", "")}–${formatWeight(women.healthyMaxKg, "lb")}`,
  };
});

const exampleWoman = calculateIdealWeight({
  sex: "female",
  heightCm: 65 * CM_PER_IN,
});
const exampleMan = calculateIdealWeight({
  sex: "male",
  heightCm: 70 * CM_PER_IN,
});

const faqs: FaqItem[] = [
  {
    question: "What is the ideal weight for my height?",
    answer: `There is no single ideal weight. Formulas give a rough figure: for a woman who is 5′5″ the four used here range from ${formatWeight(exampleWoman.lowestKg, "lb")} to ${formatWeight(exampleWoman.highestKg, "lb")}. A healthy BMI covers a wider span, ${formatWeight(exampleWoman.healthyMinKg, "lb")} to ${formatWeight(exampleWoman.healthyMaxKg, "lb")} at that height.`,
  },
  {
    question: "Where do ideal weight formulas come from?",
    answer:
      "Most were created to help work out medicine doses. The Devine formula (1974) was proposed to estimate kidney function for dosing an antibiotic and was not based on a specific study of healthy weights. Robinson and Miller (1983) later revised it using height and weight data.",
  },
  {
    question: "Why do the formulas give different answers?",
    answer:
      "Each starts from a different weight at 5 feet and adds a different amount per inch, reflecting the data and the era each was built from. That spread is a useful reminder that these are estimates, not exact targets.",
  },
  {
    question: "Is the ideal weight the same for men and women?",
    answer:
      "No. Every formula gives men a higher figure at the same height, because men on average carry more muscle and bone. The healthy BMI range, by contrast, is the same for adult men and women.",
  },
  {
    question: "Does ideal weight account for muscle?",
    answer:
      "No. The formulas use only height and sex. People with a lot of muscle, a large frame, or who are older may be healthy above these figures. Waist size and other health measures add useful context.",
  },
];

const sources = [
  {
    label:
      "Pai and Paloucek: The origin of the “ideal” body weight equations, Annals of Pharmacotherapy (2000)",
    href: "https://pubmed.ncbi.nlm.nih.gov/10981254/",
  },
  {
    label: "CDC: Adult BMI categories",
    href: "https://www.cdc.gov/bmi/adult-calculator/bmi-categories.html",
  },
];

export default function IdealWeightCalculatorPage() {
  return (
    <CalculatorShell
      slug="ideal-weight-calculator"
      title="Ideal Weight Calculator"
      intro={
        <p>
          See what four published formulas give as an &ldquo;ideal&rdquo; body
          weight for your height and sex, next to the wider healthy weight range
          based on BMI.
        </p>
      }
      lastReviewed="2026-10-26"
      faqs={faqs}
      sources={sources}
      guide={
        <>
          <h2>What &ldquo;ideal weight&rdquo; means</h2>
          <p>
            Ideal body weight formulas turn your height and sex into a single
            weight. They are simple: each starts with a weight for someone 5
            feet tall and adds a fixed amount for every inch above that. They
            were designed mostly for doctors and pharmacists working out
            medicine doses, not as personal goals.
          </p>
          <p>
            A healthy weight is a range, not a point. Our{" "}
            <Link href="/bmi-calculator">BMI calculator</Link> shows the range
            that gives a healthy BMI of 18.5 to 24.9 for your height, which is
            the measure most health agencies use for adults.
          </p>

          <h2>The four formulas</h2>
          <ul>
            <li>
              <strong>Devine (1974):</strong> men 50 kg, women 45.5 kg, plus 2.3
              kg per inch over 5 feet. The most widely used in medicine.
            </li>
            <li>
              <strong>Robinson (1983):</strong> men 52 kg plus 1.9 kg per inch;
              women 49 kg plus 1.7 kg per inch.
            </li>
            <li>
              <strong>Miller (1983):</strong> men 56.2 kg plus 1.41 kg per inch;
              women 53.1 kg plus 1.36 kg per inch.
            </li>
            <li>
              <strong>Hamwi (1964):</strong> men 106 lb plus 6 lb per inch;
              women 100 lb plus 5 lb per inch.
            </li>
          </ul>

          <h2>A worked example</h2>
          <p>
            For a man who is 5′10″, the formulas give{" "}
            {formatWeight(exampleMan.lowestKg, "lb")} to{" "}
            {formatWeight(exampleMan.highestKg, "lb")}. For a woman who is 5′5″,
            they give {formatWeight(exampleWoman.lowestKg, "lb")} to{" "}
            {formatWeight(exampleWoman.highestKg, "lb")}. In both cases the
            healthy BMI range is wider:{" "}
            {formatWeight(exampleMan.healthyMinKg, "lb")} to{" "}
            {formatWeight(exampleMan.healthyMaxKg, "lb")} for the man and{" "}
            {formatWeight(exampleWoman.healthyMinKg, "lb")} to{" "}
            {formatWeight(exampleWoman.healthyMaxKg, "lb")} for the woman.
          </p>

          <h2>Ideal weight chart by height</h2>
          <p>
            The lowest and highest of the four formulas at each height, with the
            healthy BMI range for comparison. Heights under 5 feet extend the
            formulas below their starting point, so treat those rows as rougher
            estimates.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm tabular-nums">
              <thead className="border-b border-slate-200 text-xs tracking-wide text-slate-500 uppercase dark:border-slate-700 dark:text-slate-400">
                <tr>
                  <th scope="col" className="py-2 pr-4 font-medium">
                    Height
                  </th>
                  <th scope="col" className="py-2 pr-4 text-right font-medium">
                    Women
                  </th>
                  <th scope="col" className="py-2 pr-4 text-right font-medium">
                    Men
                  </th>
                  <th scope="col" className="py-2 text-right font-medium">
                    Healthy BMI range
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {chartRows.map((row) => (
                  <tr key={row.inches}>
                    <th scope="row" className="py-2 pr-4 font-normal">
                      {heightLabel(row.inches)}{" "}
                      <span className="text-slate-400 dark:text-slate-500">
                        ({Math.round(row.heightCm)} cm)
                      </span>
                    </th>
                    <td className="py-2 pr-4 text-right">{row.women}</td>
                    <td className="py-2 pr-4 text-right">{row.men}</td>
                    <td className="py-2 text-right">{row.healthy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>What the formulas leave out</h2>
          <ul>
            <li>
              <strong>Muscle and frame:</strong> two people of the same height
              can differ a lot in muscle and bone and both be healthy.
            </li>
            <li>
              <strong>Age:</strong> body composition changes with age, and the
              formulas do not adjust for it.
            </li>
            <li>
              <strong>Where weight is carried:</strong> waist size can say more
              about health risk than weight alone.
            </li>
          </ul>
          <p>
            If you are thinking about changing your weight, a doctor or
            registered dietitian can help you set a goal that fits your health,
            not just your height.
          </p>
        </>
      }
    >
      <IdealWeightCalculator />
    </CalculatorShell>
  );
}
