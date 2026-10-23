import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import {
  calculateMortgage,
  formatDuration,
  type MortgageInputs,
} from "@/lib/calculators/mortgage";
import { buildMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/jsonLd";
import { formatCurrency } from "@/lib/utils";
import { MortgageCalculator } from "./MortgageCalculator";

export const metadata = buildMetadata({
  title: "Mortgage Calculator: Monthly Payment with Taxes, PMI & HOA",
  description:
    "Free mortgage calculator. See your full monthly payment with property tax, insurance, PMI and HOA, a yearly amortization schedule, and how extra payments cut interest.",
  path: "/mortgage-calculator",
  hasOwnSocialImage: true,
});

// Worked examples are computed, so the text always matches the calculator.
const example: MortgageInputs = {
  homePrice: 400_000,
  downPaymentPct: 20,
  rate: 7,
  termYears: 30,
  propertyTaxPct: 1.1,
  insurancePerYear: 1_800,
  hoaPerMonth: 0,
  pmiPct: 0.5,
  extraPerMonth: 0,
};
const exampleResult = calculateMortgage(example);
const ex15 = calculateMortgage({ ...example, termYears: 15 });
const exLowDown = calculateMortgage({ ...example, downPaymentPct: 10 });
const exExtra = calculateMortgage({ ...example, extraPerMonth: 200 });
const exRateDown = calculateMortgage({ ...example, rate: 6 });

const faqs: FaqItem[] = [
  {
    question: "What is included in a monthly mortgage payment?",
    answer:
      "Most payments have four parts, often called PITI: principal (repaying the loan), interest, property taxes and homeowners insurance. Many lenders collect the taxes and insurance into an escrow account and pay those bills for you. PMI and HOA dues can add to the total.",
  },
  {
    question: "How much does PMI cost and when does it go away?",
    answer:
      "PMI is usually charged when you put down less than 20%. For most conventional loans you can ask your servicer to cancel it once you owe 80% of the home's original value, and it must end automatically at 78% if you are current on payments. FHA and VA loans follow different rules.",
  },
  {
    question: "Is a 15-year or 30-year mortgage better?",
    answer: `A 15-year loan has a higher monthly payment but costs far less interest. In our example ${formatCurrency(exampleResult.loanAmount)} loan at 7%, the 15-year payment is ${formatCurrency(ex15.monthlyPrincipalInterest)} for principal and interest against ${formatCurrency(exampleResult.monthlyPrincipalInterest)} for 30 years, and total interest falls from ${formatCurrency(exampleResult.totalInterest)} to ${formatCurrency(ex15.totalInterest)}. A 30-year loan gives you more room in your monthly budget.`,
  },
  {
    question: "Do extra payments really make a difference?",
    answer: `Yes, because every extra dollar reduces the balance that interest is charged on. In our example, an extra $200 a month pays the loan off ${formatDuration(exExtra.monthsSaved)} early and saves ${formatCurrency(exExtra.interestSaved)} in interest. Check that your lender applies extra payments to principal and has no prepayment penalty.`,
  },
  {
    question: "Why might my real payment differ from this estimate?",
    answer:
      "Property taxes and insurance premiums change from year to year, so the escrow part of your payment can rise or fall. Your rate also depends on your credit, the loan type and points paid. Use this calculator to compare scenarios, then confirm figures with your lender's Loan Estimate.",
  },
];

const sources = [
  {
    label:
      "CFPB: When can I remove private mortgage insurance (PMI) from my loan?",
    href: "https://www.consumerfinance.gov/ask-cfpb/when-can-i-remove-private-mortgage-insurance-pmi-from-my-loan-en-202/",
  },
  {
    label: "CFPB: What is an escrow or impound account?",
    href: "https://www.consumerfinance.gov/ask-cfpb/what-is-an-escrow-or-impound-account-en-140/",
  },
];

export default function MortgageCalculatorPage() {
  return (
    <CalculatorShell
      slug="mortgage-calculator"
      title="Mortgage Calculator"
      intro={
        <p>
          Estimate your full monthly mortgage payment, including property tax,
          insurance, PMI and HOA dues. See how much goes to interest each year
          and how extra payments shorten your loan.
        </p>
      }
      lastReviewed="2026-10-18"
      faqs={faqs}
      sources={sources}
      guide={
        <>
          <h2>How your mortgage payment is calculated</h2>
          <p>
            A fixed-rate mortgage has the same principal and interest payment
            every month. It is set so the loan reaches zero on the last payment.
            Early on most of each payment covers interest; later most of it
            repays the balance. That pattern is called amortization, and the
            chart above shows it year by year.
          </p>
          <p>
            On top of principal and interest, most homeowners pay{" "}
            <strong>property tax</strong> and{" "}
            <strong>homeowners insurance</strong>. Lenders often collect these
            monthly into an escrow account and pay the bills when they are due.
            If you put down less than 20%, you will usually also pay{" "}
            <strong>private mortgage insurance (PMI)</strong>. Condos and some
            neighborhoods add <strong>HOA dues</strong>.
          </p>

          <h2>A worked example</h2>
          <p>
            Say you buy a {formatCurrency(example.homePrice)} home with 20% down
            ({formatCurrency(exampleResult.downPayment)}), borrowing{" "}
            {formatCurrency(exampleResult.loanAmount)} at 7% for 30 years.
          </p>
          <ul>
            <li>
              Principal and interest:{" "}
              {formatCurrency(exampleResult.monthlyPrincipalInterest)} a month
            </li>
            <li>
              Property tax at 1.1% a year:{" "}
              {formatCurrency(exampleResult.monthlyTax)} a month
            </li>
            <li>
              Insurance at $1,800 a year:{" "}
              {formatCurrency(exampleResult.monthlyInsurance)} a month
            </li>
            <li>
              <strong>
                Total: {formatCurrency(exampleResult.totalMonthly)} a month
              </strong>
            </li>
          </ul>
          <p>
            Over 30 years you would pay{" "}
            {formatCurrency(exampleResult.totalInterest)} in interest on top of
            the {formatCurrency(exampleResult.loanAmount)} you borrowed. Tax and
            insurance rates vary widely by location, so replace them with
            figures for the home you are considering.
          </p>

          <h2>What changes your payment the most</h2>
          <h3>Interest rate</h3>
          <p>
            Small rate changes move the payment a lot. In the example, a 6% rate
            instead of 7% lowers principal and interest to{" "}
            {formatCurrency(exRateDown.monthlyPrincipalInterest)} and cuts total
            interest by{" "}
            {formatCurrency(
              exampleResult.totalInterest - exRateDown.totalInterest,
            )}
            . Comparing offers from several lenders is one of the most valuable
            things you can do.
          </p>
          <h3>Loan term</h3>
          <p>
            A 15-year term raises principal and interest to{" "}
            {formatCurrency(ex15.monthlyPrincipalInterest)} but saves{" "}
            {formatCurrency(exampleResult.totalInterest - ex15.totalInterest)}{" "}
            in interest at the same rate. Fifteen-year loans also tend to come
            with lower rates, which saves more.
          </p>
          <h3>Down payment</h3>
          <p>
            Putting down 10% instead of 20% means borrowing{" "}
            {formatCurrency(exLowDown.loanAmount)}, which raises the total
            payment to {formatCurrency(exLowDown.totalMonthly)} once PMI of
            about {formatCurrency(exLowDown.monthlyPmi)} a month is added.
          </p>

          <h2>How PMI works and how to remove it</h2>
          <p>
            Lenders usually require PMI when your loan is more than 80% of the
            home&apos;s value. It protects the lender, not you. Under federal
            rules for most conventional loans on a primary home, you can ask
            your servicer in writing to cancel PMI once the balance is scheduled
            to reach 80% of the home&apos;s original value, if your payments are
            current and the home hasn&apos;t lost value. It must end
            automatically when the balance reaches 78%.
          </p>
          {exLowDown.pmiEndsMonth && (
            <p>
              With 10% down in the example, the balance reaches 78% after about{" "}
              {formatDuration(exLowDown.pmiEndsMonth)} of regular payments.
              Extra payments don&apos;t change that automatic date, but they get
              you to 80% sooner, when you can ask to cancel. FHA and VA loans
              have their own mortgage insurance rules.
            </p>
          )}

          <h2>Paying extra toward principal</h2>
          <p>
            Any amount above your scheduled payment goes straight to the
            balance, so less interest builds up afterward. In the example,
            paying $200 extra a month finishes the loan in{" "}
            {formatDuration(exExtra.payoffMonths)} instead of 30 years and saves{" "}
            {formatCurrency(exExtra.interestSaved)}. Enter an amount in the
            Extra payment field to see your own numbers.
          </p>
        </>
      }
    >
      <MortgageCalculator />
    </CalculatorShell>
  );
}
