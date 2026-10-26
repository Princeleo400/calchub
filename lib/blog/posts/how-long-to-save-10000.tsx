import { CalculatorCta } from "@/components/blog/CalculatorCta";
import { DataTable } from "@/components/blog/DataTable";
import type { Post } from "@/lib/blog/types";
import { formatDuration } from "@/lib/calculators/mortgage";
import { monthsToReachGoal } from "@/lib/calculators/savings";
import { formatCurrency } from "@/lib/utils";

// An illustrative savings rate, not a current market rate.
const RATE = 4;
const GOALS = [10_000, 25_000, 50_000, 100_000];
const DEPOSITS = [200, 500, 1_000];

const months = (goal: number, deposit: number, rate = RATE) =>
  monthsToReachGoal(
    {
      initialDeposit: 0,
      monthlyDeposit: deposit,
      rate,
      compounding: "monthly",
    },
    goal,
  ) ?? 0;

const tenKAt500 = months(10_000, 500);
const bigGoalNoInterest = months(100_000, 500, 0);
const bigGoalWithInterest = months(100_000, 500);
const smallGoalNoInterest = months(10_000, 500, 0);

function Body() {
  return (
    <>
      <p>
        How long it takes to save a sum depends on two things: how much you put
        away each month, and how much interest the money earns while it sits
        there. For short goals the first one does nearly all the work. For big,
        long goals, interest starts to pull its weight.
      </p>

      <h2>The quick answer</h2>
      <p>
        Saving {formatCurrency(500)} a month in an account paying {RATE}%, you
        would reach {formatCurrency(10_000)} in about{" "}
        <strong>{formatDuration(tenKAt500)}</strong>.{" "}
        {tenKAt500 === smallGoalNoInterest
          ? "That is the same as with no interest at all: on a goal this size, interest adds only a little money and does not save a single month."
          : `Without any interest it would take ${formatDuration(smallGoalNoInterest)}, so on a goal this size interest makes little difference.`}{" "}
        Your monthly amount is what matters.
      </p>

      <h2>How long common goals take</h2>
      <p>
        Starting from nothing, with deposits at the end of each month and {RATE}
        % interest compounded monthly:
      </p>
      <DataTable
        headers={[
          "Goal",
          ...DEPOSITS.map((deposit) => `${formatCurrency(deposit)} a month`),
        ]}
        numeric={[1, 2, 3]}
        rows={GOALS.map((goal) => [
          formatCurrency(goal),
          ...DEPOSITS.map((deposit) => formatDuration(months(goal, deposit))),
        ])}
      />
      <p>
        The {RATE}% rate is an example, not a quote. Savings rates change, so
        check what your bank actually pays and enter it in the calculator.
      </p>

      <CalculatorCta
        slug="savings-calculator"
        text="Enter your own balance, deposit and rate to see your timeline."
      />

      <h2>When interest really helps</h2>
      <p>
        Interest is paid on your balance, so it grows as the balance grows. That
        is why it barely moves a small goal but shortens a big one. Saving{" "}
        {formatCurrency(500)} a month toward {formatCurrency(100_000)} takes{" "}
        {formatDuration(bigGoalNoInterest)} with no interest, but{" "}
        <strong>{formatDuration(bigGoalWithInterest)}</strong> at {RATE}%. That
        is {formatDuration(bigGoalNoInterest - bigGoalWithInterest)} sooner,
        with no extra effort.
      </p>

      <h2>Ways to get there faster</h2>
      <ul>
        <li>
          <strong>Raise the monthly amount first.</strong> For goals under a few
          years away, it is by far the biggest lever.
        </li>
        <li>
          <strong>Automate it.</strong> A transfer set for payday means the
          money is saved before it can be spent.
        </li>
        <li>
          <strong>Shop for a better rate.</strong> Online banks and high-yield
          savings accounts often pay several times more than a standard account,
          which matters more the longer you save.
        </li>
        <li>
          <strong>Add windfalls.</strong> A tax refund or bonus put straight
          into savings can cut months off the timeline.
        </li>
      </ul>

      <h2>Where to keep the money</h2>
      <p>
        For money you will need within a few years, safety matters more than
        returns. In the US, look for a bank insured by the FDIC (or a credit
        union insured by the NCUA). Deposits are protected up to{" "}
        {formatCurrency(250_000)} per depositor, per insured bank, for each
        ownership category. Investments such as stocks can earn more over long
        periods, but their value can fall, which makes them a poor fit for a
        short-term goal.
      </p>
    </>
  );
}

export const post: Post = {
  slug: "how-long-to-save-10000",
  title: "How Long Does It Take to Save $10,000? A Timeline for Every Budget",
  description:
    "How many months it takes to save $10,000, $25,000, $50,000 or $100,000 at $200, $500 or $1,000 a month, and how much interest actually speeds things up.",
  published: "2026-10-26",
  updated: "2026-10-26",
  category: "finance",
  readingMinutes: 4,
  calculators: ["savings-calculator", "debt-payoff-calculator"],
  faqs: [
    {
      question: "How long does it take to save $10,000?",
      answer: `At $500 a month in an account paying ${RATE}%, about ${formatDuration(tenKAt500)}. At $200 a month it takes about ${formatDuration(months(10_000, 200))}, and at $1,000 a month about ${formatDuration(months(10_000, 1_000))}.`,
    },
    {
      question: "Does interest make a big difference to a savings goal?",
      answer: `For small goals, not much: $10,000 at $500 a month takes ${formatDuration(tenKAt500)} at ${RATE}% versus ${formatDuration(smallGoalNoInterest)} with no interest. For large goals it matters more: $100,000 at $500 a month arrives ${formatDuration(bigGoalNoInterest - bigGoalWithInterest)} sooner at ${RATE}%.`,
    },
  ],
  sources: [
    {
      label: "FDIC: Understanding Deposit Insurance",
      href: "https://www.fdic.gov/resources/deposit-insurance/understanding-deposit-insurance",
    },
    {
      label: "Investor.gov (SEC): Compound Interest Calculator",
      href: "https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator",
    },
  ],
  Body,
};
