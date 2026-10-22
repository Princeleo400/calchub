import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { calculateLoan, type LoanInputs } from "@/lib/calculators/loan";
import { formatDuration } from "@/lib/calculators/mortgage";
import { buildMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/jsonLd";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { LoanCalculator } from "./LoanCalculator";

export const metadata = buildMetadata({
  title: "Loan Calculator: Monthly Payment, Interest & APR",
  description:
    "Free loan calculator for car, personal and student loans. See your monthly payment, total interest, true APR with fees, and how extra payments save money.",
  path: "/loan-calculator",
});

// Worked examples are computed, so the text always matches the calculator.
const example: LoanInputs = {
  amount: 20_000,
  rate: 8.5,
  termMonths: 60,
  feePct: 0,
  extraPerMonth: 0,
};
const exampleResult = calculateLoan(example);
const terms = [36, 48, 60, 72, 84].map((termMonths) => ({
  termMonths,
  ...calculateLoan({ ...example, termMonths }),
}));
const exFee = calculateLoan({ ...example, feePct: 5 });
const exExtra = calculateLoan({ ...example, extraPerMonth: 100 });

const faqs: FaqItem[] = [
  {
    question: "How is a monthly loan payment calculated?",
    answer:
      "For a fixed-rate loan, the payment is set so the balance reaches zero on the last payment. Each month, interest is charged on the remaining balance and the rest of the payment reduces the balance. The formula is M = P × r(1 + r)^n / ((1 + r)^n − 1), where P is the amount, r the monthly rate and n the number of payments.",
  },
  {
    question: "What is the difference between the interest rate and the APR?",
    answer:
      "The interest rate is what the lender charges to borrow the money. The APR adds the lender's fees, such as an origination fee, so it reflects the fuller cost. Compare APRs with APRs when shopping for loans.",
  },
  {
    question: "Is a longer loan term worse?",
    answer: `A longer term lowers the monthly payment but raises the total interest. For ${formatCurrency(example.amount)} at ${example.rate}%, a 3-year loan costs ${formatCurrency(terms[0].totalInterest)} in interest while a 7-year loan costs ${formatCurrency(terms[4].totalInterest)}. Longer car loans can also leave you owing more than the car is worth.`,
  },
  {
    question: "Can I pay off a loan early?",
    answer:
      "Usually, and it saves interest because the balance shrinks faster. Some loans charge a prepayment penalty, so read the fine print or ask the lender before making large extra payments.",
  },
  {
    question: "Does this work for car, personal and student loans?",
    answer:
      "Yes, for any fixed-rate loan repaid in equal monthly payments. It does not model variable rates, deferment periods, income-driven repayment plans or loans where interest is added before repayment starts.",
  },
];

const sources = [
  {
    label:
      "CFPB: What is the difference between a loan interest rate and the APR?",
    href: "https://www.consumerfinance.gov/ask-cfpb/what-is-the-difference-between-a-loan-interest-rate-and-the-apr-en-733/",
  },
  {
    label: "CFPB: What is a prepayment penalty?",
    href: "https://www.consumerfinance.gov/ask-cfpb/what-is-a-prepayment-penalty-en-1957/",
  },
];

export default function LoanCalculatorPage() {
  return (
    <CalculatorShell
      slug="loan-calculator"
      title="Loan Calculator"
      intro={
        <p>
          Work out the monthly payment and total cost of a car, personal or
          student loan. Add an upfront fee to see the true APR, or an extra
          monthly payment to see how much interest you save.
        </p>
      }
      lastReviewed="2026-10-19"
      faqs={faqs}
      sources={sources}
      guide={
        <>
          <h2>How loan payments work</h2>
          <p>
            Most car and personal loans are <strong>amortizing</strong>: you pay
            the same amount every month, and each payment covers that
            month&apos;s interest first. Whatever is left reduces the balance.
            Because the balance shrinks, the interest part gets smaller each
            month and more of your payment goes to the loan itself.
          </p>

          <h2>A worked example</h2>
          <p>
            Borrowing {formatCurrency(example.amount)} at {example.rate}% for 5
            years gives a monthly payment of{" "}
            {formatCurrency(exampleResult.monthlyPayment)}. Over 60 payments you
            repay {formatCurrency(exampleResult.totalCost)}, of which{" "}
            {formatCurrency(exampleResult.totalInterest)} is interest.
          </p>

          <h2>How the term changes the cost</h2>
          <p>
            A longer term makes each payment smaller but keeps you paying
            interest for longer. Here is the same{" "}
            {formatCurrency(example.amount)} loan at {example.rate}% over
            different terms:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm tabular-nums">
              <thead className="border-b border-slate-200 text-xs tracking-wide text-slate-500 uppercase dark:border-slate-700 dark:text-slate-400">
                <tr>
                  <th scope="col" className="py-2 pr-4 font-medium">
                    Term
                  </th>
                  <th scope="col" className="py-2 pr-4 text-right font-medium">
                    Monthly payment
                  </th>
                  <th scope="col" className="py-2 pr-4 text-right font-medium">
                    Total interest
                  </th>
                  <th scope="col" className="py-2 text-right font-medium">
                    Total cost
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {terms.map((row) => (
                  <tr key={row.termMonths}>
                    <th scope="row" className="py-2 pr-4 font-normal">
                      {formatDuration(row.termMonths)}
                    </th>
                    <td className="py-2 pr-4 text-right">
                      {formatCurrency(row.monthlyPayment)}
                    </td>
                    <td className="py-2 pr-4 text-right">
                      {formatCurrency(row.totalInterest)}
                    </td>
                    <td className="py-2 text-right">
                      {formatCurrency(row.totalCost)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            Going from 3 to 7 years cuts the payment by{" "}
            {formatCurrency(terms[0].monthlyPayment - terms[4].monthlyPayment)}{" "}
            a month but adds{" "}
            {formatCurrency(terms[4].totalInterest - terms[0].totalInterest)} in
            interest. Longer loans also often come with higher rates, which
            widens the gap.
          </p>

          <h2>Interest rate vs APR</h2>
          <p>
            The interest rate is the price of borrowing the money. The{" "}
            <strong>APR</strong> (annual percentage rate) also counts the
            lender&apos;s fees, so it shows the fuller cost. Lenders must
            disclose it, which makes it the fairest number for comparing offers.
          </p>
          <p>
            Fees matter more than they look. A 5% origination fee on the example
            loan is {formatCurrency(exFee.fee)}, usually taken out of what you
            receive. You get {formatCurrency(example.amount - exFee.fee)} but
            repay the full {formatCurrency(example.amount)}, which turns an{" "}
            {example.rate}% rate into an APR of {formatPercent(exFee.apr, 2)}.
            Enter a fee in the calculator to see this for your loan.
          </p>

          <h2>Paying a loan off early</h2>
          <p>
            Extra payments go straight to the balance, so less interest builds
            up afterward. Adding $100 a month to the example loan clears it{" "}
            {formatDuration(exExtra.monthsSaved)} early and saves{" "}
            {formatCurrency(exExtra.interestSaved)}. Some loans charge a{" "}
            <strong>prepayment penalty</strong> for paying off early, so check
            your agreement first.
          </p>

          <h2>Tips for a cheaper loan</h2>
          <ul>
            <li>
              Compare offers from several lenders. They are not required to give
              you their best rate.
            </li>
            <li>
              Compare APRs, not just interest rates, so fees are included.
            </li>
            <li>
              Choose the shortest term whose payment fits comfortably in your
              budget.
            </li>
            <li>
              A higher credit score generally qualifies you for a lower rate.
            </li>
          </ul>
        </>
      }
    >
      <LoanCalculator />
    </CalculatorShell>
  );
}
