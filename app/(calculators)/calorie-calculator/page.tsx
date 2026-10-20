import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { CM_PER_IN, KG_PER_LB } from "@/lib/calculators/bmi";
import {
  ACTIVITY_LEVELS,
  calculateCalories,
  roundCalories,
} from "@/lib/calculators/calorie";
import { buildMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/jsonLd";
import { formatNumber } from "@/lib/utils";
import { CalorieCalculator } from "./CalorieCalculator";

export const metadata = buildMetadata({
  title: "Calorie Calculator: Daily Calories (TDEE) to Maintain, Lose or Gain",
  description:
    "Free calorie calculator using the Mifflin-St Jeor equation. Estimate your resting calories (BMR) and daily needs (TDEE), plus targets for gradual weight loss or gain.",
  path: "/calorie-calculator",
});

// Worked example, computed with the same function as the calculator.
const exWeightKg = 150 * KG_PER_LB;
const exHeightCm = 65 * CM_PER_IN;
const ex = calculateCalories({
  sex: "female",
  age: 35,
  weightKg: exWeightKg,
  heightCm: exHeightCm,
  activity: "light",
  goal: "lose05",
});
const cal = (n: number) => formatNumber(roundCalories(n));

const faqs: FaqItem[] = [
  {
    question: "How many calories do I need a day?",
    answer:
      "It depends on your age, sex, height, weight and how active you are. This calculator estimates your resting needs with the Mifflin-St Jeor equation, then multiplies by an activity factor to estimate the calories that keep your weight stable.",
  },
  {
    question: "What is the difference between BMR and TDEE?",
    answer:
      "BMR (basal metabolic rate) is the energy your body uses at rest to keep you alive: breathing, circulation and keeping warm. TDEE (total daily energy expenditure) adds everything you do on top, from walking to exercise. TDEE is the number to compare your eating against.",
  },
  {
    question: "How many calories should I cut to lose weight?",
    answer:
      "A common starting point is 250 to 500 calories below maintenance, which works out to roughly half a pound to a pound a week. The CDC notes that people who lose weight gradually, about 1 to 2 pounds a week, are more likely to keep it off. Talk with a health professional before a larger cut.",
  },
  {
    question: "How accurate is the Mifflin-St Jeor equation?",
    answer:
      "It is one of the most widely used equations for estimating resting needs in healthy adults, but any formula is an estimate. Your actual needs can differ, so use the result as a starting point and adjust after a few weeks based on how your weight changes.",
  },
  {
    question: "Which activity level should I pick?",
    answer:
      "Most people overestimate. If you have a desk job and exercise a few times a week, start with lightly active. Choose higher levels only if you exercise hard most days or have a physically demanding job.",
  },
];

const sources = [
  {
    label:
      "National Cancer Institute: REE (Mifflin-St Jeor equation) — cites Mifflin et al., Am J Clin Nutr, 1990",
    href: "https://cancercontrol.cancer.gov/brp/research/group-evaluated-measures/adopt/ree-pal",
  },
  {
    label: "CDC: Steps for losing weight",
    href: "https://www.cdc.gov/healthy-weight-growth/losing-weight/index.html",
  },
];

export default function CalorieCalculatorPage() {
  return (
    <CalculatorShell
      slug="calorie-calculator"
      title="Calorie Calculator"
      intro={
        <p>
          Estimate how many calories you burn each day and how many to eat to
          maintain, lose or gain weight. Uses the Mifflin-St Jeor equation with
          standard activity levels.
        </p>
      }
      lastReviewed="2026-10-19"
      faqs={faqs}
      sources={sources}
      guide={
        <>
          <h2>How your daily calorie needs are estimated</h2>
          <p>
            The calculator works in two steps. First it estimates your{" "}
            <strong>basal metabolic rate (BMR)</strong>, the calories your body
            uses at complete rest. Then it multiplies that by an activity factor
            to get your <strong>total daily energy expenditure (TDEE)</strong>:
            roughly how many calories keep your weight steady.
          </p>
          <p>BMR comes from the Mifflin-St Jeor equation, published in 1990:</p>
          <ul>
            <li>Men: 10 × weight (kg) + 6.25 × height (cm) − 5 × age + 5</li>
            <li>
              Women: 10 × weight (kg) + 6.25 × height (cm) − 5 × age − 161
            </li>
          </ul>

          <h2>A worked example</h2>
          <p>
            A 35-year-old woman who is 5 ft 5 in (165 cm) and weighs 150 lb (68
            kg) has a BMR of about {cal(ex.bmr)} calories. If she is lightly
            active, her TDEE is {cal(ex.bmr)} × 1.375 ≈ {cal(ex.tdee)} calories
            a day. To lose about half a pound a week, she would aim for roughly{" "}
            {cal(ex.goals.find((g) => g.id === "lose05")!.calories)} calories a
            day.
          </p>

          <h2>Activity levels</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[360px] text-left text-sm tabular-nums">
              <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:text-slate-400">
                <tr>
                  <th scope="col" className="py-2 pr-4 font-medium">
                    Level
                  </th>
                  <th scope="col" className="py-2 pr-4 font-medium">
                    Typical week
                  </th>
                  <th scope="col" className="py-2 text-right font-medium">
                    Factor
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {ACTIVITY_LEVELS.map((a) => (
                  <tr key={a.id}>
                    <th scope="row" className="py-2 pr-4 font-normal">
                      {a.label}
                    </th>
                    <td className="py-2 pr-4">{a.description}</td>
                    <td className="py-2 text-right">× {a.factor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            If you are unsure between two levels, pick the lower one. It is easy
            to overestimate activity.
          </p>

          <h2>Setting a weight goal</h2>
          <p>
            A pound of body weight is often said to equal about 3,500 calories,
            so eating 500 fewer calories a day than maintenance works out to
            roughly a pound a week. It is a rough rule: weight change usually
            slows as your body adapts.
          </p>
          <p>
            Slow and steady tends to last. The CDC notes that people who lose
            weight at a gradual pace, about 1 to 2 pounds a week, are more
            likely to keep it off. The calculator flags any target that falls
            below your estimated resting needs, a sign the goal may be too
            aggressive.
          </p>

          <h2>Why your real needs may differ</h2>
          <ul>
            <li>
              Equations estimate the average for people like you; individuals
              vary.
            </li>
            <li>
              Muscle mass, medical conditions and some medications change how
              many calories you burn.
            </li>
            <li>
              Activity is hard to judge, and it changes from week to week.
            </li>
          </ul>
          <p>
            Use your result as a starting point, watch how your weight responds
            over a few weeks, and adjust. For medical conditions, pregnancy or
            major changes to how you eat, talk with a doctor or registered
            dietitian.
          </p>
        </>
      }
    >
      <CalorieCalculator />
    </CalculatorShell>
  );
}
