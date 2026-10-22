import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { calculateDebtPayoff, type Debt } from "@/lib/calculators/debtPayoff";
import { formatDuration } from "@/lib/calculators/mortgage";
import { buildMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/jsonLd";
import { formatCurrency } from "@/lib/utils";
import { DebtPayoffCalculator } from "./DebtPayoffCalculator";

export const metadata = buildMetadata({
  title: "Debt Payoff Calculator: Snowball vs Avalanche",
  description:
    "Free debt payoff calculator. Enter your debts to see your debt-free date, total interest, and whether the snowball or avalanche method saves you more.",
  path: "/debt-payoff-calculator",
});

// The same debts the calculator starts with, so the worked example matches it.
const exampleDebts: Debt[] = [
  { name: "Credit card", balance: 6_500, rate: 24.9, minPayment: 195 },
  { name: "Personal loan", balance: 3_200, rate: 11.5, minPayment: 105 },
  { name: "Store card", balance: 1_200, rate: 19.99, minPayment: 40 },
  { name: "Car loan", balance: 9_000, rate: 7.5, minPayment: 280 },
];
const exampleResult = calculateDebtPayoff(exampleDebts, 250);
const exNoExtra = calculateDebtPayoff(exampleDebts, 0);
const saving =
  exampleResult.snowball.totalInterest - exampleResult.avalanche.totalInterest;
const snowballFirst = exampleResult.snowball.order[0];
const avalancheFirst = exampleResult.avalanche.order[0];

const faqs: FaqItem[] = [
  {
    question:
      "What is the difference between the debt snowball and avalanche methods?",
    answer:
      "Both pay the minimum on every debt and put any extra money toward one target debt. The avalanche targets the highest interest rate first, which costs the least. The snowball targets the smallest balance first, so you pay off individual debts sooner.",
  },
  {
    question: "Which method is better?",
    answer: `The avalanche always costs the same or less in interest. In our example it saves ${formatCurrency(saving)}. The snowball can still be the better choice if quick wins help you stick with the plan. Research on real debtors found that people who paid off whole accounts were more likely to finish.`,
  },
  {
    question: "What does rolling over a payment mean?",
    answer:
      "When a debt is paid off, you keep paying the same total each month and move its minimum payment to the next debt on your list. This is what makes both methods speed up over time. This calculator assumes you do this.",
  },
  {
    question: "Why does paying only the minimum take so long?",
    answer:
      "On high-rate debt, much of each minimum payment covers that month's interest, so the balance falls slowly. If the minimum is less than the monthly interest, the balance never falls. Card statements must show how long minimum payments would take.",
  },
  {
    question:
      "Does this calculator account for credit card minimums going down?",
    answer:
      "No. It keeps each minimum payment fixed, as if you keep paying the same amount even as the required minimum falls. That is the recommended approach anyway, and it makes the plan easier to follow.",
  },
];

const sources = [
  {
    label:
      "Kellogg Insight: To beat debt, consider starting small (Gal & McShane, Journal of Marketing Research, 2012)",
    href: "https://insight.kellogg.northwestern.edu/article/to_beat_debt_consider_starting_small",
  },
  {
    label:
      "CFPB: What happens if I only make the minimum payment on my credit card?",
    href: "https://www.consumerfinance.gov/ask-cfpb/what-happens-if-i-only-make-the-minimum-payment-on-my-credit-card-en-36/",
  },
];

export default function DebtPayoffCalculatorPage() {
  return (
    <CalculatorShell
      slug="debt-payoff-calculator"
      title="Debt Payoff Calculator"
      intro={
        <p>
          List your debts to see when you will be debt-free and how much
          interest you will pay. Compare the snowball and avalanche methods side
          by side and pick the plan that suits you.
        </p>
      }
      lastReviewed="2026-10-19"
      faqs={faqs}
      sources={sources}
      guide={
        <>
          <h2>How a debt payoff plan works</h2>
          <p>
            Pick a fixed amount you can pay toward your debts every month. Pay
            the minimum on each one, then put everything left over toward a
            single <strong>target debt</strong>. When the target is paid off,
            its minimum payment rolls into the next one, so the amount attacking
            your debt keeps growing while your monthly outlay stays the same.
          </p>
          <p>
            The two popular methods differ only in which debt you target first.
          </p>
          <ul>
            <li>
              <strong>Avalanche:</strong> highest interest rate first.
              Mathematically the cheapest, because the most expensive balance
              shrinks fastest.
            </li>
            <li>
              <strong>Snowball:</strong> smallest balance first. You close
              accounts sooner, which many people find motivating.
            </li>
          </ul>

          <h2>A worked example</h2>
          <p>
            Say you owe {formatCurrency(exampleResult.totalBalance)} across four
            debts: a credit card, a personal loan, a store card and a car loan.
            Their minimums add up to{" "}
            {formatCurrency(exampleResult.totalMinimums)} a month, and you can
            find another $250, for a budget of{" "}
            {formatCurrency(exampleResult.monthlyBudget)}.
          </p>
          <ul>
            <li>
              <strong>Avalanche</strong> starts with the{" "}
              {avalancheFirst.name.toLowerCase()} at 24.9%. You are debt-free in{" "}
              {formatDuration(exampleResult.avalanche.months ?? 0)} and pay{" "}
              {formatCurrency(exampleResult.avalanche.totalInterest)} in
              interest.
            </li>
            <li>
              <strong>Snowball</strong> starts with the{" "}
              {snowballFirst.name.toLowerCase()}, the smallest balance, and
              clears it in {formatDuration(snowballFirst.paidOffMonth ?? 0)}.
              You are debt-free in{" "}
              {formatDuration(exampleResult.snowball.months ?? 0)} and pay{" "}
              {formatCurrency(exampleResult.snowball.totalInterest)}.
            </li>
            <li>
              <strong>Minimums only</strong>, with no extra and no rollover,
              takes {formatDuration(exampleResult.minimumsOnly.months ?? 0)} and
              costs {formatCurrency(exampleResult.minimumsOnly.totalInterest)}.
            </li>
          </ul>
          <p>
            Here the avalanche saves {formatCurrency(saving)}, while the
            snowball gives you a paid-off account in month{" "}
            {snowballFirst.paidOffMonth} instead of month{" "}
            {avalancheFirst.paidOffMonth}. Even without the extra $250, simply
            rolling each paid-off minimum into the next debt finishes in{" "}
            {formatDuration(exNoExtra.avalanche.months ?? 0)} instead of{" "}
            {formatDuration(exNoExtra.minimumsOnly.months ?? 0)}.
          </p>

          <h2>Snowball or avalanche: which should you choose?</h2>
          <p>
            If you are confident you will stick to the plan, the avalanche saves
            the most. The gap is largest when your biggest balance also has the
            highest rate. When your rates are close together, the difference is
            often small.
          </p>
          <p>
            The case for the snowball is behavioral. A study of nearly 6,000
            people in a debt settlement program, published in the{" "}
            <em>Journal of Marketing Research</em>, found that those who closed
            more accounts were more likely to eliminate their debt, even after
            accounting for how much they had paid. The researchers still note
            that paying the highest rates first is the financially rational
            choice.
          </p>

          <h2>Tips to get out of debt faster</h2>
          <ul>
            <li>
              Stop adding new charges to the debts you are paying off, or the
              plan will keep moving.
            </li>
            <li>
              Keep paying the same amount each month even when a card&apos;s
              required minimum drops.
            </li>
            <li>
              Put windfalls such as tax refunds or bonuses toward the target
              debt.
            </li>
            <li>
              Ask your card issuer for a lower rate, or look at a balance
              transfer or consolidation loan with a lower APR. Check fees first.
            </li>
          </ul>
        </>
      }
    >
      <DebtPayoffCalculator />
    </CalculatorShell>
  );
}
