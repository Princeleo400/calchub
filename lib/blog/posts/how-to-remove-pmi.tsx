import { CalculatorCta } from "@/components/blog/CalculatorCta";
import {
  calculateMortgage,
  formatDuration,
  monthlyPayment,
  type MortgageInputs,
} from "@/lib/calculators/mortgage";
import type { Post } from "@/lib/blog/types";
import { formatCurrency } from "@/lib/utils";

const base: MortgageInputs = {
  homePrice: 400_000,
  downPaymentPct: 10,
  rate: 7,
  termYears: 30,
  propertyTaxPct: 1.1,
  insurancePerYear: 1_800,
  hoaPerMonth: 0,
  pmiPct: 0.5,
  extraPerMonth: 0,
};
const plain = calculateMortgage(base);
const extra = calculateMortgage({ ...base, extraPerMonth: 300 });

/** First month the scheduled balance is at or below `share` of the home price. */
function monthReaching(share: number, extraPerMonth: number): number {
  const loan = base.homePrice * (1 - base.downPaymentPct / 100);
  const pay = monthlyPayment(loan, base.rate, base.termYears);
  const monthlyRate = base.rate / 100 / 12;
  let balance = loan;
  for (let month = 1; month <= base.termYears * 12; month++) {
    balance -= pay + extraPerMonth - balance * monthlyRate;
    if (balance <= base.homePrice * share) return month;
  }
  return base.termYears * 12;
}
const request80 = monthReaching(0.8, 0);
const request80Extra = monthReaching(0.8, 300);

function Body() {
  return (
    <>
      <p>
        If you bought a home with less than 20% down, you are probably paying
        private mortgage insurance (PMI) every month. It protects the lender,
        not you, so getting rid of it is one of the easiest ways to lower your
        housing costs. Here is when it ends on its own and how to remove it
        sooner.
      </p>

      <h2>What PMI costs</h2>
      <p>
        PMI is usually charged as a yearly percentage of the loan, split into
        monthly payments. On a {formatCurrency(base.homePrice)} home with 10%
        down, a PMI rate of 0.5% a year adds about{" "}
        {formatCurrency(plain.monthlyPmi)} to each payment. Left alone, it would
        cost about {formatCurrency(plain.totalPmi)} before it stops.
      </p>

      <h2>The rules for removing PMI</h2>
      <p>
        For most conventional loans on a single-family primary home that closed
        on or after July 29, 1999, federal rules set out when PMI ends.
        According to the Consumer Financial Protection Bureau:
      </p>
      <ul>
        <li>
          <strong>You can ask to cancel it at 80%.</strong> Once your balance is
          scheduled to fall to 80% of the home&apos;s original value, or reaches
          it sooner through extra payments, you can request cancellation in
          writing. You need a good payment history, no second mortgage, and
          evidence (usually an appraisal) that the home hasn&apos;t lost value.
        </li>
        <li>
          <strong>It ends automatically at 78%.</strong> When the scheduled
          balance reaches 78% of the original value, the lender must cancel PMI
          as long as you are current on payments.
        </li>
        <li>
          <strong>It ends by the halfway point.</strong> PMI must stop the month
          after you reach the midpoint of the loan term, such as year 15 of a
          30-year loan, even if the balance hasn&apos;t reached 78%.
        </li>
      </ul>
      <p>
        &ldquo;Original value&rdquo; generally means the lower of the purchase
        price and the appraisal when you bought. FHA and VA loans follow
        different rules, so ask your servicer.
      </p>

      <h2>When that happens in practice</h2>
      <p>
        In the example above, borrowing {formatCurrency(plain.loanAmount)} at 7%
        for 30 years:
      </p>
      <ul>
        <li>
          You could <strong>request</strong> cancellation after about{" "}
          {formatDuration(request80)}, when the balance reaches 80%.
        </li>
        <li>
          PMI would end <strong>automatically</strong> after about{" "}
          {formatDuration(plain.pmiEndsMonth ?? 0)}, at 78%.
        </li>
      </ul>
      <p>
        That is a long time, because early payments go mostly to interest. You
        can speed it up.
      </p>

      <CalculatorCta
        slug="mortgage-calculator"
        text="See exactly when PMI ends on your loan."
      />

      <h2>Four ways to remove PMI sooner</h2>
      <h3>1. Pay extra toward principal</h3>
      <p>
        Extra payments don&apos;t change the automatic 78% date, which follows
        your original payment schedule. They do bring forward the 80% point at
        which you can <em>ask</em> to cancel. Adding $300 a month to the example
        loan gets you there after about {formatDuration(request80Extra)} instead
        of {formatDuration(request80)}. Cancelling then would mean paying about{" "}
        {formatCurrency(plain.monthlyPmi * request80Extra)} in PMI instead of{" "}
        {formatCurrency(plain.totalPmi)}, and the extra payments also save{" "}
        {formatCurrency(extra.interestSaved)} in interest over the life of the
        loan.
      </p>
      <h3>2. Ask for cancellation as soon as you qualify</h3>
      <p>
        Automatic removal at 78% is the backstop, but you can ask at 80%. Put a
        reminder in your calendar and send a written request to your servicer
        when you reach it.
      </p>
      <h3>3. Use a rise in your home&apos;s value</h3>
      <p>
        Some lenders and loan investors will remove PMI based on a new appraisal
        if your home has gained value. The federal rules are a minimum; Fannie
        Mae and Freddie Mac have their own policies that can allow earlier
        removal. Ask your servicer what it requires, and what the appraisal
        costs, before paying for one.
      </p>
      <h3>4. Refinance</h3>
      <p>
        If you now have at least 20% equity, refinancing can drop PMI. It only
        makes sense if the new rate and closing costs leave you better off, so
        compare the total cost first.
      </p>

      <h2>Keep an eye on the dates</h2>
      <p>
        Work out when your loan reaches 80% and 78% of the original value, using
        your amortization schedule or the calculator above. If you pass either
        point and are still paying PMI, contact your servicer.
      </p>
    </>
  );
}

export const post: Post = {
  slug: "how-to-remove-pmi",
  title: "How to Get Rid of PMI: When It Ends and How to Remove It Sooner",
  description:
    "When private mortgage insurance ends automatically, how to request cancellation at 80%, and four ways to stop paying PMI sooner, with a worked example.",
  published: "2026-10-21",
  updated: "2026-10-21",
  category: "finance",
  readingMinutes: 5,
  calculators: ["mortgage-calculator"],
  faqs: [
    {
      question: "When does PMI go away automatically?",
      answer:
        "For most conventional loans, when your scheduled balance reaches 78% of the home's original value, as long as you are current on payments. It must also end the month after the loan's halfway point.",
    },
    {
      question: "Can I remove PMI before it ends automatically?",
      answer:
        "Yes. You can ask your servicer in writing to cancel PMI once your balance reaches 80% of the original value, if you have a good payment history, no second mortgage and the home hasn't lost value.",
    },
  ],
  sources: [
    {
      label:
        "CFPB: When can I remove private mortgage insurance (PMI) from my loan?",
      href: "https://www.consumerfinance.gov/ask-cfpb/when-can-i-remove-private-mortgage-insurance-pmi-from-my-loan-en-202/",
    },
  ],
  Body,
};
