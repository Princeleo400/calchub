import { CalculatorCta } from "@/components/blog/CalculatorCta";
import { DataTable } from "@/components/blog/DataTable";
import {
  calculateMortgage,
  formatDuration,
  type MortgageInputs,
} from "@/lib/calculators/mortgage";
import type { Post } from "@/lib/blog/types";
import { formatCurrency } from "@/lib/utils";

// Freddie Mac PMMS averages for the week of October 15, 2026.
const RATE_30 = 7.4;
const RATE_15 = 6.71;

const base: MortgageInputs = {
  homePrice: 400_000,
  downPaymentPct: 20,
  rate: RATE_30,
  termYears: 30,
  propertyTaxPct: 0,
  insurancePerYear: 0,
  hoaPerMonth: 0,
  pmiPct: 0,
  extraPerMonth: 0,
};
const thirty = calculateMortgage(base);
const fifteen = calculateMortgage({ ...base, termYears: 15, rate: RATE_15 });
const fifteenSameRate = calculateMortgage({ ...base, termYears: 15 });
// A 30-year loan where you voluntarily pay the 15-year payment amount.
const hybrid = calculateMortgage({
  ...base,
  extraPerMonth:
    fifteen.monthlyPrincipalInterest - thirty.monthlyPrincipalInterest,
});
const paymentGap =
  fifteen.monthlyPrincipalInterest - thirty.monthlyPrincipalInterest;

function Body() {
  return (
    <>
      <p>
        The two most common fixed-rate mortgages last 30 years and 15 years. The
        shorter loan costs far less in interest, but each monthly payment is
        much bigger. Here is what the trade-off looks like in real numbers.
      </p>

      <h2>Side by side</h2>
      <p>
        Take a {formatCurrency(base.homePrice)} home with 20% down, so a{" "}
        {formatCurrency(thirty.loanAmount)} loan. Using Freddie Mac&apos;s
        national averages for mid-October 2026, {RATE_30}% for 30 years and{" "}
        {RATE_15}% for 15 years:
      </p>
      <DataTable
        headers={["", "30-year", "15-year"]}
        numeric={[1, 2]}
        rows={[
          ["Interest rate", `${RATE_30}%`, `${RATE_15}%`],
          [
            "Monthly payment (principal & interest)",
            formatCurrency(thirty.monthlyPrincipalInterest),
            formatCurrency(fifteen.monthlyPrincipalInterest),
          ],
          [
            "Total interest",
            formatCurrency(thirty.totalInterest),
            formatCurrency(fifteen.totalInterest),
          ],
          [
            "Total repaid",
            formatCurrency(thirty.loanAmount + thirty.totalInterest),
            formatCurrency(fifteen.loanAmount + fifteen.totalInterest),
          ],
        ]}
      />
      <p>
        The 15-year loan costs {formatCurrency(paymentGap)} more each month but
        saves{" "}
        <strong>
          {formatCurrency(thirty.totalInterest - fifteen.totalInterest)}
        </strong>{" "}
        in interest. Property tax and insurance are left out here because they
        are the same for both loans.
      </p>

      <h2>Why the 15-year saves so much</h2>
      <p>Two things work in its favor:</p>
      <ul>
        <li>
          <strong>Half the time.</strong> You pay interest for 15 years instead
          of 30, and the balance falls much faster from the start.
        </li>
        <li>
          <strong>A lower rate.</strong> Lenders usually charge less for shorter
          loans. Even at the same {RATE_30}% rate, the 15-year loan would cost{" "}
          {formatCurrency(fifteenSameRate.totalInterest)} in interest; the lower
          rate saves another{" "}
          {formatCurrency(
            fifteenSameRate.totalInterest - fifteen.totalInterest,
          )}
          .
        </li>
      </ul>

      <CalculatorCta
        slug="mortgage-calculator"
        text="Compare terms with your own price, rate and taxes."
      />

      <h2>The middle path: a 30-year loan paid like a 15-year</h2>
      <p>
        Some buyers take a 30-year loan for its lower required payment, then pay
        extra whenever they can. If you paid the 15-year amount,{" "}
        {formatCurrency(fifteen.monthlyPrincipalInterest)} a month, on the
        30-year loan at {RATE_30}%, you would finish in about{" "}
        {formatDuration(hybrid.payoffMonths)} and pay{" "}
        {formatCurrency(hybrid.totalInterest)} in interest.
      </p>
      <p>
        That is {formatCurrency(hybrid.totalInterest - fifteen.totalInterest)}{" "}
        more than the true 15-year loan, because the 30-year rate is higher. In
        exchange you get flexibility: in a tight month, you can drop back to the
        lower required payment of{" "}
        {formatCurrency(thirty.monthlyPrincipalInterest)}. Check that your loan
        has no prepayment penalty first.
      </p>

      <h2>Which should you choose?</h2>
      <h3>A 15-year mortgage suits you if</h3>
      <ul>
        <li>
          the higher payment fits comfortably, with room left to save and to
          cover emergencies;
        </li>
        <li>
          you want to own your home outright sooner, for example before
          retirement;
        </li>
        <li>you value the guaranteed saving over keeping cash flexible.</li>
      </ul>
      <h3>A 30-year mortgage suits you if</h3>
      <ul>
        <li>the lower payment is what makes the home affordable;</li>
        <li>
          your income is irregular and you want a smaller required payment;
        </li>
        <li>
          you would otherwise put little into retirement savings or an emergency
          fund.
        </li>
      </ul>
      <p>
        A larger payment you can&apos;t sustain is riskier than a smaller one
        with less interest saved. If in doubt, the 30-year loan with voluntary
        extra payments keeps your options open.
      </p>
    </>
  );
}

export const post: Post = {
  slug: "15-vs-30-year-mortgage",
  title: "15-Year vs 30-Year Mortgage: How Much Do You Really Save?",
  description:
    "A side-by-side comparison of 15-year and 30-year mortgages using current average rates: monthly payments, total interest, and when each one makes sense.",
  published: "2026-10-21",
  updated: "2026-10-21",
  category: "finance",
  readingMinutes: 5,
  calculators: ["mortgage-calculator", "loan-calculator"],
  faqs: [
    {
      question: "How much more is a 15-year mortgage payment?",
      answer: `On a ${formatCurrency(thirty.loanAmount)} loan at mid-October 2026 average rates, about ${formatCurrency(paymentGap)} more a month: ${formatCurrency(fifteen.monthlyPrincipalInterest)} versus ${formatCurrency(thirty.monthlyPrincipalInterest)}.`,
    },
    {
      question: "Are 15-year mortgage rates lower?",
      answer: `Usually. Freddie Mac's national averages for the week of October 15, 2026 were ${RATE_15}% for 15-year loans and ${RATE_30}% for 30-year loans.`,
    },
  ],
  sources: [
    {
      label:
        "Trading Economics: US 30-year mortgage rate, citing Freddie Mac's Primary Mortgage Market Survey (October 2026)",
      href: "https://tradingeconomics.com/united-states/30-year-mortgage-rate/news/588887",
    },
    {
      label: "CFPB: What is a prepayment penalty?",
      href: "https://www.consumerfinance.gov/ask-cfpb/what-is-a-prepayment-penalty-en-1957/",
    },
  ],
  Body,
};
