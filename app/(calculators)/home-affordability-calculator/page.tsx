import Link from "next/link";
import { AffordabilityCalculator } from "@/components/calculator/AffordabilityCalculator";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import {
  affordFor,
  roundPrice,
  SALARIES,
  salarySlug,
} from "@/lib/affordability/salaries";
import { buildMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/jsonLd";
import { formatCurrency } from "@/lib/utils";

export const metadata = buildMetadata({
  title: "Home Affordability Calculator: How Much House Can I Afford?",
  description:
    "Free home affordability calculator. Enter your income and debts to see the home price you can afford, the monthly payment, and how lenders' debt-to-income limits apply.",
  path: "/home-affordability-calculator",
  hasOwnSocialImage: true,
});

const exampleResult = affordFor(75_000);
const exDebt = affordFor(75_000, { monthlyDebts: 500 });

const faqs: FaqItem[] = [
  {
    question: "How do lenders decide how much house I can afford?",
    answer:
      "Mainly by your debt-to-income ratio: your monthly debt payments, including the new mortgage, divided by your gross monthly income. A traditional guideline is no more than 28% for housing and 36% for all debts. Lenders also look at your credit score, savings and job history.",
  },
  {
    question: "What is the maximum debt-to-income ratio for a mortgage?",
    answer:
      "It depends on the loan. Fannie Mae allows a total ratio of up to 36% on manually underwritten loans, up to 45% with strong credit and reserves, and up to 50% through its automated underwriting system.",
  },
  {
    question: "Should I borrow the maximum I am approved for?",
    answer:
      "Not necessarily. The ratios don't account for childcare, retirement saving, repairs or other goals. Make sure the payment leaves room to save and an emergency fund after your down payment and closing costs.",
  },
  {
    question: "Does my down payment change how much I can afford?",
    answer:
      "Yes. A bigger down payment means a smaller loan and, at 20% or more, no PMI, so the same monthly budget supports a higher price. A smaller down payment needs less cash upfront but buys a little less house.",
  },
];

const sources = [
  {
    label: "Fannie Mae Selling Guide: B3-6-02, Debt-to-Income Ratios",
    href: "https://selling-guide.fanniemae.com/sel/b3-6-02/debt-income-ratios",
  },
  {
    label:
      "Federal Reserve Bank of St. Louis: What 30 million applications reveal about mortgage denial thresholds",
    href: "https://www.stlouisfed.org/on-the-economy/2026/jun/what-30-million-applications-reveal-mortgage-denial-thresholds",
  },
];

export default function HomeAffordabilityPage() {
  return (
    <CalculatorShell
      slug="home-affordability-calculator"
      title="Home Affordability Calculator"
      intro={
        <p>
          Find out how much house you can afford based on your income, debts and
          down payment. See the monthly payment that comes with it and how
          lenders&apos; debt-to-income limits shape the answer.
        </p>
      }
      lastReviewed="2026-10-22"
      faqs={faqs}
      sources={sources}
      guide={
        <>
          <h2>How this calculator works</h2>
          <p>
            It starts from your income, not from house prices. It works out the
            most you can spend on housing each month under two limits, then
            finds the home price whose full payment, including property tax,
            insurance, PMI and HOA dues, fits that budget.
          </p>
          <ul>
            <li>
              <strong>Housing limit:</strong> housing costs of no more than 28%
              of your gross monthly income.
            </li>
            <li>
              <strong>Total debt limit:</strong> housing plus all your other
              debt payments of no more than 36%.
            </li>
          </ul>
          <p>
            The lower of the two sets your budget. You can change both limits
            under the inputs if your lender uses different ones.
          </p>

          <h2>A worked example</h2>
          <p>
            On {formatCurrency(75_000)} a year with no other debts, 20% down and
            a 7% rate, the 28% limit allows{" "}
            {formatCurrency(exampleResult.housingBudget)} a month, which
            supports a home of about{" "}
            {formatCurrency(roundPrice(exampleResult.maxHomePrice))}. Add a $500
            car payment and the 36% total limit takes over, cutting the budget
            to {formatCurrency(exDebt.housingBudget)} and the price to about{" "}
            {formatCurrency(roundPrice(exDebt.maxHomePrice))}.
          </p>

          <h2>What lenders actually allow</h2>
          <p>
            The 28/36 rule is conservative. Fannie Mae caps total debt-to-income
            at 36% for manually underwritten loans, rising to 45% for borrowers
            with strong credit and savings, and allows up to 50% through its
            automated system. A 2026 St. Louis Fed study of more than 30 million
            applications found denial rates stayed fairly flat up to a ratio of
            about 50% before rising sharply.
          </p>
          <p>
            So you may be approved for more than this calculator suggests at the
            default settings. The default is a comfortable budget, not the most
            a bank will lend. For a full explanation, read{" "}
            <Link href="/blog/how-much-house-can-i-afford">
              how much house can I afford?
            </Link>
          </p>

          <h2>By salary</h2>
          <p>Quick answers at 20% down and a 7% rate, with no other debts:</p>
          <ul>
            {SALARIES.map((salary) => (
              <li key={salary}>
                <Link
                  href={`/how-much-house-can-i-afford/${salarySlug(salary)}`}
                >
                  How much house can I afford on {formatCurrency(salary)}?
                </Link>{" "}
                About{" "}
                {formatCurrency(roundPrice(affordFor(salary).maxHomePrice))}
              </li>
            ))}
          </ul>
        </>
      }
    >
      <AffordabilityCalculator initialIncome={75_000} />
    </CalculatorShell>
  );
}
