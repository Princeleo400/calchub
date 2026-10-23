import { DataTable } from "@/components/blog/DataTable";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import {
  calculateStressTest,
  canadianPayment,
  CANADA_RULES,
  minimumDownPayment,
  qualifyingRate,
  type StressTestInputs,
} from "@/lib/calculators/stressTest";
import { monthlyPayment } from "@/lib/calculators/mortgage";
import { buildMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/jsonLd";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { StressTestCalculator } from "./StressTestCalculator";

export const metadata = buildMetadata({
  title: "Canada Mortgage Stress Test Calculator (2026)",
  description:
    "Check whether you pass Canada's mortgage stress test. See your qualifying rate, GDS and TDS ratios, CMHC insurance premium and the most you can borrow.",
  path: "/mortgage-stress-test-calculator",
  hasOwnSocialImage: true,
});

const cad = (amount: number) => formatCurrency(amount, "CAD");

const example: StressTestInputs = {
  price: 700_000,
  downPayment: 140_000,
  contractRate: 4.5,
  amortizationYears: 25,
  annualIncome: 150_000,
  propertyTaxPerYear: 4_800,
  heatingPerMonth: 120,
  condoFeesPerMonth: 0,
  otherDebtsPerMonth: 0,
};
const exampleResult = calculateStressTest(example);
const exLowIncome = calculateStressTest({ ...example, annualIncome: 120_000 });

// The same rate compounded semi-annually (Canada) vs monthly (US-style).
const caPay = canadianPayment(500_000, 5, 25);
const usPay = monthlyPayment(500_000, 5, 25);

const RATES = [3, 3.5, 4, 4.5, 5, 6];

const faqs: FaqItem[] = [
  {
    question: "What is the mortgage stress test in Canada?",
    answer: `A rule that lenders must check you could still afford your mortgage at a higher "qualifying rate": the greater of your contract rate plus ${CANADA_RULES.qualifyingBuffer}% or ${CANADA_RULES.qualifyingFloor}%. It applies to insured mortgages and, for federally regulated lenders, to uninsured ones too.`,
  },
  {
    question: "What GDS and TDS do I need to pass?",
    answer: `For an insured mortgage, CMHC allows a gross debt service (GDS) ratio of up to ${CANADA_RULES.maxGds}% and a total debt service (TDS) ratio of up to ${CANADA_RULES.maxTds}% of gross income, calculated at the qualifying rate.`,
  },
  {
    question: "Does the stress test apply when I renew?",
    answer:
      "Not if you renew with your current lender, or switch an uninsured mortgage to another federally regulated lender without increasing the amount or the amortization. OSFI exempts these straight switches.",
  },
  {
    question: "What is the minimum down payment in Canada?",
    answer: `5% of the first $500,000 and 10% of the portion above that, for homes under ${cad(CANADA_RULES.insuredPriceCap)}. At ${cad(CANADA_RULES.insuredPriceCap)} or more the mortgage can't be insured and you need 20% down. A ${cad(900_000)} home needs at least ${cad(minimumDownPayment(900_000))}.`,
  },
];

const sources = [
  {
    label: "OSFI: Minimum qualifying rate for uninsured mortgages",
    href: "https://www.osfi-bsif.gc.ca/en/supervision/financial-institutions/banks/minimum-qualifying-rate-uninsured-mortgages",
  },
  {
    label: "CMHC: Calculating GDS and TDS",
    href: "https://cmhc-schl.gc.ca/professionals/project-funding-and-mortgage-financing/mortgage-loan-insurance/calculating-gds-tds",
  },
  {
    label: "Interest Act (R.S.C., 1985, c. I-15), section 6",
    href: "https://laws-lois.justice.gc.ca/eng/acts/I-15/FullText.html",
  },
  {
    label:
      "WealthNorth: CMHC mortgage rules in Canada (premiums, down payments, amortization)",
    href: "https://wealthnorth.ca/mortgages/rules-and-regulations/cmhc-mortgage-rules-canada/",
  },
];

export default function StressTestPage() {
  return (
    <CalculatorShell
      slug="mortgage-stress-test-calculator"
      title="Canada Mortgage Stress Test Calculator"
      intro={
        <p>
          Find out whether you would pass the mortgage stress test, what your
          payment looks like at the qualifying rate, and the most you can
          borrow. Includes CMHC insurance for down payments under 20%.
        </p>
      }
      lastReviewed={CANADA_RULES.lastChecked}
      faqs={faqs}
      sources={sources}
      guide={
        <>
          <h2>How the stress test works</h2>
          <p>
            To approve a mortgage, Canadian lenders don&apos;t just check that
            you can afford today&apos;s payment. They check that you could
            afford it at a higher <strong>qualifying rate</strong>, so a rise in
            rates at renewal wouldn&apos;t push you into trouble. The qualifying
            rate is the greater of:
          </p>
          <ul>
            <li>
              your contract rate plus {CANADA_RULES.qualifyingBuffer} percentage
              points, or
            </li>
            <li>{CANADA_RULES.qualifyingFloor}%.</li>
          </ul>
          <p>
            At that rate, the lender works out two ratios. <strong>GDS</strong>{" "}
            (gross debt service) is your mortgage payment, property tax, heating
            and half of any condo fees, as a share of gross monthly income.{" "}
            <strong>TDS</strong> (total debt service) adds your other debt
            payments. For insured mortgages, CMHC caps GDS at{" "}
            {CANADA_RULES.maxGds}% and TDS at {CANADA_RULES.maxTds}%.
          </p>

          <h2>A worked example</h2>
          <p>
            A household earning {cad(example.annualIncome)} buys a{" "}
            {cad(example.price)} home with {cad(example.downPayment)} down at a{" "}
            {example.contractRate}% rate, over 25 years. The mortgage is{" "}
            {cad(exampleResult.mortgage)}.
          </p>
          <ul>
            <li>
              Payment at {example.contractRate}%:{" "}
              {cad(exampleResult.paymentAtContract)} a month
            </li>
            <li>
              Payment at the qualifying rate of{" "}
              {formatPercent(exampleResult.qualifyingRate, 2)}:{" "}
              {cad(exampleResult.paymentAtQualifying)} a month
            </li>
            <li>
              GDS {formatPercent(exampleResult.gds, 1)} and TDS{" "}
              {formatPercent(exampleResult.tds, 1)}:{" "}
              <strong>
                {exampleResult.passes ? "passes" : "doesn't pass"}
              </strong>
            </li>
          </ul>
          <p>
            With an income of {cad(120_000)} instead, GDS rises to{" "}
            {formatPercent(exLowIncome.gds, 1)} and the household{" "}
            {exLowIncome.passes ? "still passes" : "no longer passes"}. The most
            it could then buy with the same down payment is about{" "}
            {cad(Math.floor(exLowIncome.maxPrice / 1000) * 1000)}.
          </p>

          <h2>Qualifying rates at a glance</h2>
          <DataTable
            headers={["Your contract rate", "You qualify at"]}
            numeric={[1]}
            rows={RATES.map((rate) => [
              formatPercent(rate, 2),
              formatPercent(qualifyingRate(rate), 2),
            ])}
          />
          <p>
            Below{" "}
            {formatPercent(
              CANADA_RULES.qualifyingFloor - CANADA_RULES.qualifyingBuffer,
              2,
            )}
            , the {CANADA_RULES.qualifyingFloor}% floor applies, so lower rates
            don&apos;t make the test any easier.
          </p>

          <h2>Down payments and CMHC insurance</h2>
          <p>
            With less than 20% down, your mortgage must be insured, and the
            premium is added to the mortgage. The minimum down payment is 5% of
            the first $500,000 and 10% of the rest, for homes under{" "}
            {cad(CANADA_RULES.insuredPriceCap)}. CMHC premiums depend on how
            much you put down:
          </p>
          <DataTable
            headers={["Down payment", "Premium (share of the mortgage)"]}
            numeric={[1]}
            rows={[
              ["5% to 9.99%", "4.00%"],
              ["10% to 14.99%", "3.10%"],
              ["15% to 19.99%", "2.80%"],
              ["20% or more", "No insurance needed"],
            ]}
          />
          <p>
            First-time buyers and buyers of new builds can choose a 30-year
            amortization on an insured mortgage, with premiums{" "}
            {CANADA_RULES.thirtyYearSurcharge} percentage points higher.
            Otherwise insured mortgages are limited to 25 years. In Ontario,
            Quebec and Saskatchewan, provincial sales tax on the premium is paid
            in cash at closing and is not included here.
          </p>

          <h2>Why Canadian payments differ from US calculators</h2>
          <p>
            Under the Interest Act, fixed mortgage rates in Canada are stated
            with interest compounded twice a year, not monthly. That makes the
            payment slightly lower than a US-style calculation at the same rate:
            on {cad(500_000)} at 5% over 25 years it is {cad(caPay)} a month,
            compared with {cad(usPay)} if interest compounded monthly. This
            calculator uses the Canadian method.
          </p>

          <h2>Rules can change</h2>
          <p>
            OSFI reviews the qualifying rate at least once a year, and the
            federal government sets the rules for insured mortgages. The figures
            on this page were last checked on 22 October 2026. Your lender or
            mortgage broker will confirm what you qualify for, including credit
            score and other requirements not covered here.
          </p>
        </>
      }
    >
      <StressTestCalculator />
    </CalculatorShell>
  );
}
