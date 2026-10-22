import { CalculatorCta } from "@/components/blog/CalculatorCta";
import { DataTable } from "@/components/blog/DataTable";
import { calculateDebtPayoff, type Debt } from "@/lib/calculators/debtPayoff";
import { formatDuration } from "@/lib/calculators/mortgage";
import type { Post } from "@/lib/blog/types";
import { formatCurrency } from "@/lib/utils";

const debts: Debt[] = [
  { name: "Credit card", balance: 6_500, rate: 24.9, minPayment: 195 },
  { name: "Personal loan", balance: 3_200, rate: 11.5, minPayment: 105 },
  { name: "Store card", balance: 1_200, rate: 19.99, minPayment: 40 },
  { name: "Car loan", balance: 9_000, rate: 7.5, minPayment: 280 },
];
const result = calculateDebtPayoff(debts, 250);
const saving = result.snowball.totalInterest - result.avalanche.totalInterest;
const firstSnowball = result.snowball.order[0];
const firstAvalanche = result.avalanche.order[0];

// When rates are close together, the methods barely differ.
const closeRates: Debt[] = [
  { name: "Card A", balance: 4_000, rate: 21.9, minPayment: 120 },
  { name: "Card B", balance: 1_500, rate: 19.9, minPayment: 45 },
  { name: "Card C", balance: 2_500, rate: 20.9, minPayment: 75 },
];
const close = calculateDebtPayoff(closeRates, 150);
const closeSaving =
  close.snowball.totalInterest - close.avalanche.totalInterest;

function payoffMonth(plan: typeof result.avalanche, name: string) {
  const month = plan.order.find((debt) => debt.name === name)?.paidOffMonth;
  return month == null ? "—" : `Month ${month}`;
}

function Body() {
  return (
    <>
      <p>
        If you have more than one debt, the order you pay them off in changes
        how much interest you pay and how soon you see progress. The two
        best-known strategies are the <strong>avalanche</strong> and the{" "}
        <strong>snowball</strong>. Here is how each works, what the numbers say,
        and how to choose.
      </p>

      <h2>How both methods work</h2>
      <p>Both start the same way:</p>
      <ol>
        <li>Decide on a fixed amount you can put toward debt every month.</li>
        <li>Pay the minimum on every debt.</li>
        <li>Put everything left over toward one target debt.</li>
        <li>
          When the target is paid off, roll its minimum payment into the next
          target. Your monthly total stays the same, but more of it attacks the
          remaining debts.
        </li>
      </ol>
      <p>The only difference is which debt is the target.</p>
      <ul>
        <li>
          <strong>Avalanche:</strong> the highest interest rate first.
        </li>
        <li>
          <strong>Snowball:</strong> the smallest balance first.
        </li>
      </ul>

      <h2>A worked example</h2>
      <p>
        Take four debts totaling {formatCurrency(result.totalBalance)}, with
        minimums of {formatCurrency(result.totalMinimums)} a month, and an extra
        $250 on top for a budget of {formatCurrency(result.monthlyBudget)}.
      </p>
      <DataTable
        headers={[
          "Debt",
          "Balance",
          "APR",
          "Avalanche pays off",
          "Snowball pays off",
        ]}
        numeric={[1, 2]}
        rows={debts.map((debt) => [
          debt.name,
          formatCurrency(debt.balance),
          `${debt.rate}%`,
          payoffMonth(result.avalanche, debt.name),
          payoffMonth(result.snowball, debt.name),
        ])}
      />
      <p>
        Both plans finish in {formatDuration(result.avalanche.months ?? 0)}, but
        they get there differently:
      </p>
      <ul>
        <li>
          The <strong>avalanche</strong> attacks the{" "}
          {firstAvalanche.name.toLowerCase()} first and pays{" "}
          {formatCurrency(result.avalanche.totalInterest)} in interest in total.
        </li>
        <li>
          The <strong>snowball</strong> clears the{" "}
          {firstSnowball.name.toLowerCase()} in just{" "}
          {firstSnowball.paidOffMonth} months, then the personal loan, and pays{" "}
          {formatCurrency(result.snowball.totalInterest)}.
        </li>
      </ul>
      <p>
        So the avalanche saves {formatCurrency(saving)}, while the snowball
        gives you your first paid-off account in month{" "}
        {firstSnowball.paidOffMonth} instead of month{" "}
        {firstAvalanche.paidOffMonth}. Paying only the minimums, by comparison,
        would take {formatDuration(result.minimumsOnly.months ?? 0)} and cost{" "}
        {formatCurrency(result.minimumsOnly.totalInterest)}.
      </p>

      <CalculatorCta
        slug="debt-payoff-calculator"
        text="Enter your own debts and compare both methods."
      />

      <h2>The case for the avalanche</h2>
      <p>
        Mathematically, the avalanche always costs the same or less. Every extra
        dollar goes to the most expensive debt, so less interest builds up
        overall. The saving is biggest when your highest-rate debt also has a
        large balance, as with the credit card above.
      </p>

      <h2>The case for the snowball</h2>
      <p>
        The snowball&apos;s advantage is psychological. Clearing an account
        entirely is a visible win, and fewer open accounts means fewer bills to
        track.
      </p>
      <p>
        There is research behind this. A study by David Gal and Blakeley McShane
        of Northwestern&apos;s Kellogg School, published in the{" "}
        <em>Journal of Marketing Research</em> in 2012, looked at nearly 6,000
        people in a debt settlement program. Those who closed more of their
        accounts early were more likely to get out of debt entirely, even after
        accounting for how much they had paid. The authors are clear that paying
        the highest rates first is still the financially rational choice; their
        point is that motivation matters too.
      </p>

      <h2>When the difference is small</h2>
      <p>
        If your rates are close together, the choice matters less. Three credit
        cards at 19.9% to 21.9%, with $150 a month extra, cost just{" "}
        {formatCurrency(closeSaving)} more with the snowball, so pick whichever
        you are more likely to stick with.
      </p>

      <h2>How to choose</h2>
      <ul>
        <li>
          <strong>Choose the avalanche</strong> if you are confident you&apos;ll
          stay on track and your rates are far apart.
        </li>
        <li>
          <strong>Choose the snowball</strong> if you have struggled to stick
          with a plan before, or you have a small balance you could clear within
          a few months.
        </li>
        <li>
          <strong>Try a hybrid:</strong> knock out one very small debt first for
          a quick win, then switch to the avalanche.
        </li>
      </ul>
      <p>
        Whichever you choose, the biggest gains come from the parts both methods
        share: a fixed monthly budget, paying more than the minimums, rolling
        payments over, and not adding new charges.
      </p>
    </>
  );
}

export const post: Post = {
  slug: "debt-snowball-vs-avalanche",
  title: "Debt Snowball vs Avalanche: Which Pays Off Debt Faster?",
  description:
    "How the debt snowball and avalanche methods work, a worked example with real numbers, what the research says about motivation, and how to pick the right one.",
  published: "2026-10-21",
  updated: "2026-10-21",
  category: "finance",
  readingMinutes: 6,
  calculators: ["debt-payoff-calculator", "loan-calculator"],
  faqs: [
    {
      question: "Is the debt avalanche or snowball better?",
      answer: `The avalanche always costs the same or less in interest; in our example it saves ${formatCurrency(saving)}. The snowball pays off individual accounts sooner, which research suggests helps some people stick with their plan.`,
    },
    {
      question: "Does the snowball method take longer?",
      answer:
        "Often not by much. With the same monthly budget, both methods frequently finish within a month or two of each other. The difference is mainly in total interest and in when each individual debt is cleared.",
    },
  ],
  sources: [
    {
      label: "Kellogg Insight: To beat debt, consider starting small",
      href: "https://insight.kellogg.northwestern.edu/article/to_beat_debt_consider_starting_small",
    },
    {
      label:
        "CFPB: What happens if I only make the minimum payment on my credit card?",
      href: "https://www.consumerfinance.gov/ask-cfpb/what-happens-if-i-only-make-the-minimum-payment-on-my-credit-card-en-36/",
    },
  ],
  Body,
};
