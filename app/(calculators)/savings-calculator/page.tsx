import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import {
  annualYield,
  calculateSavings,
  type SavingsInputs,
} from "@/lib/calculators/savings";
import { buildMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/jsonLd";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { SavingsCalculator } from "./SavingsCalculator";

export const metadata = buildMetadata({
  title: "Savings Calculator: Compound Interest with Monthly Deposits",
  description:
    "Free savings calculator. See how a starting balance and monthly deposits grow with compound interest, how much is interest, and what you need to save to reach a goal.",
  path: "/savings-calculator",
  hasOwnSocialImage: true,
});

// Worked examples are computed, so the text always matches the calculator.
const example: SavingsInputs = {
  initialDeposit: 5_000,
  monthlyDeposit: 200,
  rate: 4,
  compounding: "monthly",
  years: 10,
  annualIncreasePct: 0,
};
const exampleResult = calculateSavings(example);
const longRun = calculateSavings({ ...example, years: 30 });
const lateStart = calculateSavings({ ...example, years: 20 });
const compoundingRows = (
  ["annually", "quarterly", "monthly", "daily"] as const
).map((compounding) => ({
  compounding,
  apy: annualYield(example.rate, compounding),
  balance: calculateSavings({ ...example, compounding }).finalBalance,
}));
const doublingYears = Math.log(2) / Math.log(1 + example.rate / 100);

const faqs: FaqItem[] = [
  {
    question: "How does compound interest work?",
    answer:
      "Compound interest is interest paid on your balance including the interest you have already earned. Each time interest is added, the next interest payment is worked out on a slightly larger amount, so growth speeds up over time.",
  },
  {
    question: "What is the difference between APY and the interest rate?",
    answer: `The interest rate is the yearly rate before compounding. The APY (annual percentage yield) is what you actually earn in a year once compounding is included. A ${example.rate}% rate compounded monthly gives an APY of ${formatPercent(annualYield(example.rate, "monthly"), 2)}. US banks must show the APY on savings accounts, so it is the number to compare.`,
  },
  {
    question: "Does daily compounding make much difference?",
    answer: `Very little. On the example here, daily compounding ends ${formatCurrency(compoundingRows[3].balance - compoundingRows[0].balance)} ahead of yearly compounding after 10 years. The rate itself and how long you save matter far more.`,
  },
  {
    question: "How long does it take to double my money?",
    answer: `A quick estimate is the rule of 72: divide 72 by the yearly rate. At ${example.rate}%, that is about ${Math.round(72 / example.rate)} years. The exact figure is ${doublingYears.toFixed(1)} years.`,
  },
  {
    question: "Is this calculator right for investments?",
    answer:
      "It works for anything with a steady rate, such as a savings account or a certificate of deposit. Investments like stocks do not grow at a fixed rate; their value goes up and down. You can enter an expected average return, but treat the result as an estimate, not a promise.",
  },
  {
    question: "Does it include tax or inflation?",
    answer:
      "No. Interest on savings is usually taxable, and inflation reduces what the money will buy. For a rough picture in today's money, subtract the expected inflation rate from the interest rate.",
  },
];

const sources = [
  {
    label:
      "CFPB: Regulation DD, Appendix A, Annual Percentage Yield Calculation",
    href: "https://www.consumerfinance.gov/rules-policy/regulations/1030/a/",
  },
  {
    label: "Investor.gov (SEC): Compound Interest Calculator",
    href: "https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator",
  },
  {
    label: "FDIC: Understanding Deposit Insurance",
    href: "https://www.fdic.gov/resources/deposit-insurance/understanding-deposit-insurance",
  },
];

export default function SavingsCalculatorPage() {
  return (
    <CalculatorShell
      slug="savings-calculator"
      title="Savings Calculator"
      intro={
        <p>
          See how a starting balance and regular monthly deposits grow with
          compound interest. Add a savings goal to find the monthly deposit you
          need, or a yearly increase if you plan to save more as you earn more.
        </p>
      }
      lastReviewed="2026-10-23"
      faqs={faqs}
      sources={sources}
      guide={
        <>
          <h2>How your savings grow</h2>
          <p>
            Your balance grows in two ways: the money you put in, and the
            interest it earns. With <strong>compound interest</strong>, interest
            is added to your balance and then earns interest itself. Early on
            most of the growth is your own deposits. Over time the interest part
            takes over.
          </p>

          <h2>A worked example</h2>
          <p>
            Start with {formatCurrency(example.initialDeposit)}, add{" "}
            {formatCurrency(example.monthlyDeposit)} a month, and earn{" "}
            {example.rate}% compounded monthly. After 10 years you would have{" "}
            {formatCurrency(exampleResult.finalBalance)}: you deposited{" "}
            {formatCurrency(exampleResult.totalDeposits)} and earned{" "}
            {formatCurrency(exampleResult.totalInterest)} in interest.
          </p>
          <p>
            Keep going for 30 years and the balance reaches{" "}
            {formatCurrency(longRun.finalBalance)}. Interest is then{" "}
            {formatCurrency(longRun.totalInterest)}, which is{" "}
            {longRun.totalInterest > longRun.totalDeposits
              ? "more than"
              : "almost as much as"}{" "}
            the {formatCurrency(longRun.totalDeposits)} you put in.
          </p>

          <h2>Why starting early matters</h2>
          <p>
            Time does more of the work than the size of your deposits. Saving
            the same amounts for 20 years instead of 30 leaves you with{" "}
            {formatCurrency(lateStart.finalBalance)}, which is{" "}
            {formatCurrency(longRun.finalBalance - lateStart.finalBalance)}{" "}
            less, even though you deposited only{" "}
            {formatCurrency(longRun.totalDeposits - lateStart.totalDeposits)}{" "}
            less. The missing years are the ones where interest grows fastest.
          </p>

          <h2>Does the compounding frequency matter?</h2>
          <p>
            Interest can be added daily, monthly, quarterly or once a year. More
            frequent compounding earns slightly more, but the difference is
            small. Here is the {example.rate}% example over 10 years:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[360px] text-left text-sm tabular-nums">
              <thead className="border-b border-slate-200 text-xs tracking-wide text-slate-500 uppercase dark:border-slate-700 dark:text-slate-400">
                <tr>
                  <th scope="col" className="py-2 pr-4 font-medium">
                    Compounding
                  </th>
                  <th scope="col" className="py-2 pr-4 text-right font-medium">
                    APY
                  </th>
                  <th scope="col" className="py-2 text-right font-medium">
                    Balance after 10 years
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {compoundingRows.map((row) => (
                  <tr key={row.compounding}>
                    <th
                      scope="row"
                      className="py-2 pr-4 font-normal capitalize"
                    >
                      {row.compounding}
                    </th>
                    <td className="py-2 pr-4 text-right">
                      {formatPercent(row.apy, 3)}
                    </td>
                    <td className="py-2 text-right">
                      {formatCurrency(row.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>Interest rate vs APY</h2>
          <p>
            Banks show two numbers. The <strong>interest rate</strong> is the
            yearly rate before compounding. The <strong>APY</strong> (annual
            percentage yield) is what you actually earn in a year with
            compounding included. In the US, banks must disclose the APY under
            the Truth in Savings rules, which makes it the fairest number for
            comparing accounts. If a bank quotes only an APY, enter it here with
            yearly compounding.
          </p>

          <h2>The rule of 72</h2>
          <p>
            To estimate how long it takes to double your money, divide 72 by the
            yearly rate. At {example.rate}% that is about{" "}
            {Math.round(72 / example.rate)} years; the exact answer is{" "}
            {doublingYears.toFixed(1)} years. It is a handy check when comparing
            accounts in your head.
          </p>

          <h2>Tips for growing your savings</h2>
          <ul>
            <li>
              Compare APYs. Online banks and high-yield savings accounts often
              pay several times more than a standard account.
            </li>
            <li>
              Automate a monthly transfer on payday so saving happens before
              spending.
            </li>
            <li>
              Raise your deposit when your income rises. Try the yearly increase
              field to see the effect.
            </li>
            <li>
              In the US, check that the bank is FDIC-insured. Deposits are
              protected up to $250,000 per depositor, per bank, for each
              ownership category.
            </li>
          </ul>
        </>
      }
    >
      <SavingsCalculator />
    </CalculatorShell>
  );
}
