import { CalculatorCta } from "@/components/blog/CalculatorCta";
import { DataTable } from "@/components/blog/DataTable";
import {
  calculateAffordability,
  type AffordabilityInputs,
} from "@/lib/calculators/affordability";
import type { Post } from "@/lib/blog/types";
import { formatCurrency } from "@/lib/utils";

const base: AffordabilityInputs = {
  annualIncome: 70_000,
  monthlyDebts: 0,
  downPaymentPct: 20,
  rate: 7,
  termYears: 30,
  propertyTaxPct: 1.1,
  insurancePerYear: 1_800,
  hoaPerMonth: 0,
  pmiPct: 0.5,
  housingRatioPct: 28,
  totalDtiPct: 36,
};

const incomes = [50_000, 70_000, 100_000, 150_000];
const byIncome = incomes.map((annualIncome) => ({
  annualIncome,
  clear: calculateAffordability({ ...base, annualIncome }),
  withCar: calculateAffordability({ ...base, annualIncome, monthlyDebts: 600 }),
}));
const exampleResult = calculateAffordability(base);
const exDebt = calculateAffordability({ ...base, monthlyDebts: 600 });
const exRate6 = calculateAffordability({ ...base, rate: 6 });
const exRate8 = calculateAffordability({ ...base, rate: 8 });
const ex10Down = calculateAffordability({ ...base, downPaymentPct: 10 });

function Body() {
  return (
    <>
      <p>
        Lenders don&apos;t decide what you can afford by looking at house
        prices. They look at your monthly income and how much of it would go to
        debt. Once you know those limits, you can work backward from a monthly
        payment to a price range.
      </p>

      <h2>The short answer</h2>
      <p>
        With no other debts, a 20% down payment and a 7% rate, a{" "}
        {formatCurrency(base.annualIncome)} salary supports a home of about{" "}
        <strong>{formatCurrency(exampleResult.maxHomePrice)}</strong>. That
        keeps the full monthly payment, including property tax and insurance,
        near {formatCurrency(exampleResult.monthlyPayment)}, or 28% of gross
        monthly income.
      </p>

      <h2>The rules lenders use</h2>
      <p>
        Your <strong>debt-to-income ratio (DTI)</strong> is your total monthly
        debt payments, including the new mortgage, divided by your gross monthly
        income. A traditional guideline, often called the 28/36 rule, says:
      </p>
      <ul>
        <li>
          Housing costs should be no more than 28% of gross monthly income.
        </li>
        <li>
          All debts together, housing included, should be no more than 36%.
        </li>
      </ul>
      <p>
        These are guidelines, not hard limits. Fannie Mae&apos;s rules cap total
        DTI at 36% for manually underwritten loans, rising to 45% for borrowers
        with strong credit and savings, and allow up to 50% for loans approved
        through its automated system. A 2026 St. Louis Fed study of more than 30
        million mortgage applications found that denial rates stayed fairly flat
        up to a DTI of about 50%, then rose sharply.
      </p>
      <p>
        In other words, a lender may approve you for more than the 28/36 rule
        suggests. Whether you
        <em> should</em> borrow that much is a different question, covered
        below.
      </p>

      <h2>What you can afford by income</h2>
      <p>
        This table applies the 28/36 rule with a 20% down payment, a 30-year
        loan at 7%, property tax of 1.1% a year and $1,800 a year for insurance.
        The last column assumes a $600 monthly car or student loan payment.
      </p>
      <DataTable
        headers={[
          "Income",
          "Monthly budget",
          "Home price, no debts",
          "With $600/mo debts",
        ]}
        numeric={[1, 2, 3]}
        rows={byIncome.map(({ annualIncome, clear, withCar }) => [
          formatCurrency(annualIncome),
          formatCurrency(clear.housingBudget),
          formatCurrency(clear.maxHomePrice),
          formatCurrency(withCar.maxHomePrice),
        ])}
      />
      <p>
        Notice that the $600 debt barely matters at higher incomes. The 28%
        housing limit is the tighter one there. At{" "}
        {formatCurrency(base.annualIncome)}, the same debt payment pushes the
        total over 36%, cutting the budget to{" "}
        {formatCurrency(exDebt.housingBudget)} a month and the price to{" "}
        {formatCurrency(exDebt.maxHomePrice)}.
      </p>

      <CalculatorCta
        slug="mortgage-calculator"
        text="Check the payment on a specific home price."
      />

      <h2>What changes the answer</h2>
      <h3>Your interest rate</h3>
      <p>
        On a {formatCurrency(base.annualIncome)} salary, a 6% rate stretches the
        budget to about {formatCurrency(exRate6.maxHomePrice)}, while 8% shrinks
        it to {formatCurrency(exRate8.maxHomePrice)}. That swing of{" "}
        {formatCurrency(exRate6.maxHomePrice - exRate8.maxHomePrice)} comes from
        the rate alone, which is why shopping several lenders matters.
      </p>
      <h3>Your down payment</h3>
      <p>
        Putting 10% down instead of 20% lowers the price you can afford at the
        same income to about {formatCurrency(ex10Down.maxHomePrice)}, because
        more of the payment goes to a bigger loan and to private mortgage
        insurance (PMI). The upside is needing far less cash upfront:{" "}
        {formatCurrency(ex10Down.downPayment)} instead of{" "}
        {formatCurrency(exampleResult.downPayment)}.
      </p>
      <h3>Taxes, insurance and HOA dues</h3>
      <p>
        Property tax and insurance vary a lot from place to place, and HOA dues
        come straight out of the same monthly budget. Look up the real figures
        for the area you&apos;re considering; they can change the answer by tens
        of thousands of dollars.
      </p>

      <h2>Approved for vs comfortable with</h2>
      <p>
        A lender&apos;s maximum is the most it will lend, not a recommendation.
        The ratios ignore costs that don&apos;t show up on a credit report, such
        as childcare, saving for retirement and home repairs. Before you commit,
        check that:
      </p>
      <ul>
        <li>the full payment still leaves room to save every month;</li>
        <li>
          you&apos;ll have an emergency fund left after the down payment and
          closing costs;
        </li>
        <li>you could keep paying if your income dipped for a few months.</li>
      </ul>
      <p>
        A good test is to &ldquo;live on&rdquo; the new payment for a few months
        before buying: set aside the difference between your rent and the
        expected mortgage payment and see how it feels.
      </p>

      <CalculatorCta
        slug="debt-payoff-calculator"
        text="Paying down other debts first raises what you can afford."
      />
    </>
  );
}

export const post: Post = {
  slug: "how-much-house-can-i-afford",
  title: "How Much House Can I Afford? The 28/36 Rule Explained",
  description:
    "How lenders use your income and debts to set a home budget, what you can afford on $50k to $150k a year, and why the approved amount isn't always the right one.",
  published: "2026-10-21",
  updated: "2026-10-21",
  category: "finance",
  readingMinutes: 6,
  calculators: ["mortgage-calculator", "debt-payoff-calculator"],
  faqs: [
    {
      question: "How much house can I afford on $70,000 a year?",
      answer: `With no other debts, 20% down and a 7% rate, about ${formatCurrency(exampleResult.maxHomePrice)}, using the common guideline of spending no more than 28% of gross income on housing. Other debts, a smaller down payment or higher taxes lower that figure.`,
    },
    {
      question: "What is the 28/36 rule?",
      answer:
        "A guideline that housing costs should take no more than 28% of your gross monthly income, and all debts together no more than 36%. Many lenders approve higher ratios for borrowers with strong credit and savings.",
    },
    {
      question: "What debt-to-income ratio do I need for a mortgage?",
      answer:
        "It depends on the loan. Fannie Mae allows a total DTI of up to 36% on manually underwritten loans, up to 45% with strong credit and reserves, and up to 50% through its automated underwriting system.",
    },
  ],
  sources: [
    {
      label: "Fannie Mae Selling Guide: B3-6-02, Debt-to-Income Ratios",
      href: "https://selling-guide.fanniemae.com/sel/b3-6-02/debt-income-ratios",
    },
    {
      label:
        "Federal Reserve Bank of St. Louis: What 30 million applications reveal about mortgage denial thresholds (2026)",
      href: "https://www.stlouisfed.org/on-the-economy/2026/jun/what-30-million-applications-reveal-mortgage-denial-thresholds",
    },
  ],
  Body,
};
