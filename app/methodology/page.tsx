import Link from "next/link";
import { ContentPage } from "@/components/layout/ContentPage";
import { ACTIVITY_LEVELS } from "@/lib/calculators/calorie";
import { buildMetadata } from "@/lib/seo/metadata";
import { site } from "@/lib/site";

export const metadata = buildMetadata({
  title: "How We Calculate: Methodology",
  description: `The formulas, assumptions and sources behind every ${site.name} calculator, and how the math is tested.`,
  path: "/methodology",
});

function Formula({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-md border border-slate-200 bg-slate-50 p-3 font-mono text-xs leading-relaxed text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
      {children}
    </pre>
  );
}

export default function MethodologyPage() {
  return (
    <ContentPage
      title="How we calculate"
      intro={
        <p>
          Every {site.name} calculator uses a published, standard method. This page lists the formulas, the
          assumptions each one makes, and where they come from, so you can check any result yourself.
        </p>
      }
      lastUpdated="2026-10-20"
    >
      <h2>General principles</h2>
      <ul>
        <li>All math runs in your browser with full precision. Results are rounded only for display.</li>
        <li>Money is shown to the nearest dollar unless cents matter, such as in the formula breakdowns.</li>
        <li>Calorie estimates are rounded to the nearest 10, because more precision would be misleading.</li>
        <li>
          Every calculator has automated tests that check it against known reference values. For example, a
          $200,000 loan at 6% over 30 years must give a payment of $1,199.10.
        </li>
        <li>Results are estimates for planning. They are not financial, tax or medical advice.</li>
      </ul>

      <h2>Mortgage calculator</h2>
      <p>
        Principal and interest use the standard fixed-rate amortization formula, where P is the loan amount, r
        is the annual rate divided by 12, and n is the number of monthly payments:
      </p>
      <Formula>{"M = P × r(1 + r)^n / ((1 + r)^n − 1)"}</Formula>
      <ul>
        <li>Property tax is the annual rate times the home price, divided by 12.</li>
        <li>Insurance and HOA dues are taken as entered.</li>
        <li>
          PMI is charged only when the down payment is below 20%. It is calculated as the annual PMI rate times the
          original loan amount, divided by 12. It stops when the balance on your original payment schedule reaches
          78% of the home price, or at the loan&apos;s halfway point if that comes first, matching when federal rules
          require most conventional PMI to end automatically. Extra payments don&apos;t move that date, but they let
          you ask your lender to cancel sooner, once you owe 80%.
        </li>
        <li>Extra payments go entirely to principal in the month they are made.</li>
        <li>Taxes, insurance and PMI are held constant, although in reality they change over time.</li>
      </ul>
      <p>
        Source:{" "}
        <a href="https://www.consumerfinance.gov/ask-cfpb/when-can-i-remove-private-mortgage-insurance-pmi-from-my-loan-en-202/">
          CFPB on removing PMI
        </a>
        .
      </p>

      <h2>Loan calculator</h2>
      <p>
        Uses the same amortization formula as the mortgage calculator. The APR includes an upfront fee by solving
        for the rate at which the amount you actually receive (the loan minus the fee) is repaid by the same
        monthly payment over the same term. It is found numerically to within 0.0001%.
      </p>
      <p>
        Source:{" "}
        <a href="https://www.consumerfinance.gov/ask-cfpb/what-is-the-difference-between-a-loan-interest-rate-and-the-apr-en-733/">
          CFPB on interest rate vs APR
        </a>
        .
      </p>

      <h2>Debt payoff calculator</h2>
      <p>The plan is simulated month by month:</p>
      <ol>
        <li>Interest is added to each balance: balance × APR ÷ 12.</li>
        <li>The minimum payment is made on every open debt.</li>
        <li>
          The rest of the monthly budget goes to the target debt: the highest APR first for the avalanche method,
          or the smallest balance first for the snowball method. Ties are broken by the other measure.
        </li>
        <li>When a debt is paid off, its minimum rolls into the next target, so the monthly total stays fixed.</li>
      </ol>
      <p>
        Minimum payments are held fixed and no new charges are assumed. Real credit card minimums usually fall as
        the balance falls. The &ldquo;minimums only&rdquo; comparison pays each debt&apos;s minimum with no extra
        payment and no rollover. Plans longer than 50 years are reported as never paying off.
      </p>

      <h2>BMI calculator</h2>
      <Formula>{"BMI = weight (kg) ÷ height (m)²\nBMI = 703 × weight (lb) ÷ height (in)²   (US units)"}</Formula>
      <p>
        US units are converted exactly (1 lb = 0.45359237 kg, 1 in = 2.54 cm) before calculating. The category is
        based on the BMI rounded to one decimal, so the label always matches the number shown. Categories follow
        the CDC adult ranges for ages 20 and over: underweight below 18.5, healthy weight 18.5 to under 25,
        overweight 25 to under 30, and obesity 30 or higher in three classes. The healthy weight range uses a BMI
        of 18.5 to 24.9.
      </p>
      <p>
        Source: <a href="https://www.cdc.gov/bmi/adult-calculator/bmi-categories.html">CDC adult BMI categories</a>.
      </p>

      <h2>Calorie calculator</h2>
      <p>Resting needs (BMR) use the Mifflin-St Jeor equation (Mifflin et al., 1990):</p>
      <Formula>
        {"Men:   BMR = 10 × weight (kg) + 6.25 × height (cm) − 5 × age + 5\nWomen: BMR = 10 × weight (kg) + 6.25 × height (cm) − 5 × age − 161"}
      </Formula>
      <p>Daily needs (TDEE) are BMR times an activity factor:</p>
      <ul>
        {ACTIVITY_LEVELS.map((a) => (
          <li key={a.id}>
            {a.label} ({a.description.toLowerCase()}): × {a.factor}
          </li>
        ))}
      </ul>
      <p>
        Weight goals add or subtract 250 or 500 calories a day, based on the rough rule that a pound of body
        weight is about 3,500 calories. Any target below the estimated BMR is flagged.
      </p>
      <p>
        Sources:{" "}
        <a href="https://cancercontrol.cancer.gov/brp/research/group-evaluated-measures/adopt/ree-pal">
          National Cancer Institute on the Mifflin-St Jeor equation
        </a>
        ; <a href="https://www.cdc.gov/healthy-weight-growth/losing-weight/index.html">CDC on gradual weight loss</a>.
      </p>

      <h2>Found a problem?</h2>
      <p>
        If a result looks wrong, please <Link href="/contact">tell us</Link> the inputs you used and what you
        expected. Confirmed errors are fixed and the page&apos;s review date is updated.
      </p>
    </ContentPage>
  );
}
