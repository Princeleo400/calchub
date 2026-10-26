import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import {
  calculatePaye,
  EMPLOYEE_PENSION_PCT,
  MINIMUM_WAGE_MONTHLY,
  NHF_PCT,
  NIGERIA_TAX_ACT_2025,
  taxByBands,
  type PayeInputs,
} from "@/lib/calculators/nigeriaPaye";
import { buildMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/jsonLd";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { PayeCalculator } from "./PayeCalculator";

export const metadata = buildMetadata({
  title:
    "Nigeria PAYE Tax Calculator 2026: Take-Home Pay Under the New Tax Act",
  description:
    "Free Nigeria PAYE calculator for 2026. Work out monthly income tax and take-home pay under the Nigeria Tax Act 2025, with rent relief, pension and NHF, and compare with the old rules.",
  path: "/nigeria/paye-calculator",
  hasOwnSocialImage: true,
});

const naira = (value: number) => formatCurrency(value, "NGN");

// Example salaries assume basic, housing and transport make up 50%, 25% and
// 15% of gross, with the standard pension and no other claims.
function exampleFor(monthlyGross: number): PayeInputs {
  return {
    monthlyGross,
    monthlyBasic: monthlyGross * 0.5,
    monthlyHousing: monthlyGross * 0.25,
    monthlyTransport: monthlyGross * 0.15,
    contributesPension: true,
    contributesNhf: false,
    annualHealthInsurance: 0,
    annualRent: 0,
    annualLifeInsurance: 0,
    annualMortgageInterest: 0,
  };
}

const EXAMPLE_SALARIES = [
  100_000, 250_000, 500_000, 1_000_000, 2_000_000, 5_000_000,
];
const salaryRows = EXAMPLE_SALARIES.map((monthlyGross) => ({
  monthlyGross,
  ...calculatePaye(exampleFor(monthlyGross)),
}));

const worked = calculatePaye(exampleFor(500_000));
const workedWithRent = calculatePaye({
  ...exampleFor(500_000),
  annualRent: 1_500_000,
});
const [zeroBand] = NIGERIA_TAX_ACT_2025.bands;

// The salary (on the example assumptions, in ₦10,000 steps) from which the
// new rules cost more than the old ones.
const crossoverMonthly = (() => {
  for (
    let monthlyGross = 100_000;
    monthlyGross <= 10_000_000;
    monthlyGross += 10_000
  ) {
    const result = calculatePaye(exampleFor(monthlyGross));
    if (result.annualTax > (result.oldRulesAnnualTax ?? Infinity)) {
      return monthlyGross;
    }
  }
  return null;
})();

// "First ₦800,000", "Next ₦2,200,000 (to ₦3,000,000)", ..., "Above ₦50,000,000"
const BAND_ROWS = taxByBands(Infinity, NIGERIA_TAX_ACT_2025.bands).map(
  (row) => ({
    rate: row.rate,
    label:
      row.to === Infinity
        ? `Above ${naira(row.from)}`
        : row.from === 0
          ? `First ${naira(row.to)}`
          : `Next ${naira(row.to - row.from)} (to ${naira(row.to)})`,
  }),
);

const faqs: FaqItem[] = [
  {
    question: "How is PAYE calculated in Nigeria in 2026?",
    answer: `Start with your yearly gross pay, take away allowed deductions (pension, NHF, health insurance, life insurance, mortgage interest and rent relief) to get chargeable income, then apply the bands: the first ${naira(zeroBand.width)} at 0%, the next ₦2.2 million at 15%, the next ₦9 million at 18%, the next ₦13 million at 21%, the next ₦25 million at 23% and anything above ₦50 million at 25%. Divide by 12 for the monthly PAYE.`,
  },
  {
    question: "Is the consolidated relief allowance (CRA) still allowed?",
    answer:
      "No. The Nigeria Tax Act 2025 removed the consolidated relief allowance from 1 January 2026. In its place, the first ₦800,000 of chargeable income is taxed at 0%, and people who pay rent can claim rent relief.",
  },
  {
    question: "How does rent relief work?",
    answer: `You can deduct 20% of the rent you pay in a year, up to ${naira(NIGERIA_TAX_ACT_2025.rentReliefCap)}. You must declare the actual rent you pay, and your employer or the tax authority may ask for proof. Homeowners who pay no rent cannot claim it.`,
  },
  {
    question: "Do minimum wage earners pay tax?",
    answer: `No. The Act excludes people earning the national minimum wage, currently ${naira(MINIMUM_WAGE_MONTHLY)} a month, from income tax.`,
  },
  {
    question: "Will I pay more or less tax than before?",
    answer: `Most employees pay less, mainly thanks to the new 0% band: on a ${naira(500_000)} monthly salary in the example below, PAYE falls from about ${naira((worked.oldRulesAnnualTax ?? 0) / 12)} to ${naira(worked.monthlyTax)} a month. Higher earners can pay more, because the consolidated relief allowance is gone and the higher bands are taxed at higher rates.${crossoverMonthly ? ` On the assumptions below, that starts at about ${naira(crossoverMonthly)} a month.` : ""}`,
  },
  {
    question: "Is NHF compulsory?",
    answer: `Contributions of ${NHF_PCT}% of basic salary remain compulsory in the public sector. Private-sector workers can choose whether to contribute. Either way, contributions are deductible.`,
  },
];

const sources = [
  {
    label: "Nigeria Tax Act 2025 (full text, sections 30 and 58)",
    href: "https://africacheck.org/sites/default/files/media/documents/2025-07/NIGERIA-TAX-ACT-2025.pdf",
  },
  {
    label:
      "KPMG: Nigeria Tax Act 2025, changes for individuals (September 2025)",
    href: "https://assets.kpmg.com/content/dam/kpmgsites/xx/pdf/2025/09/fa25-168.pdf.coredownload.inline.pdf",
  },
  {
    label: "PwC Worldwide Tax Summaries: Nigeria, individual taxes",
    href: "https://taxsummaries.pwc.com/nigeria/individual",
  },
  {
    label: "National Housing Fund Act (Federal Mortgage Bank of Nigeria)",
    href: "https://fmbn.gov.ng/documents/National_Housing_Fund_Act.pdf",
  },
];

export default function PayeCalculatorPage() {
  return (
    <CalculatorShell
      slug="nigeria-paye-calculator"
      title="Nigeria PAYE Tax Calculator"
      intro={
        <p>
          Work out your monthly PAYE and take-home pay under the Nigeria Tax Act
          2025, which took effect on 1 January 2026. Add your rent, pension and
          other deductions, and see how it compares with the old rules.
        </p>
      }
      lastReviewed="2026-10-26"
      faqs={faqs}
      sources={sources}
      guide={
        <>
          <h2>How PAYE works under the new law</h2>
          <p>
            PAYE (pay as you earn) is income tax your employer takes from your
            salary each month and pays to the tax authority. From 1 January 2026
            it follows the <strong>Nigeria Tax Act 2025</strong>, which replaced
            the Personal Income Tax Act.
          </p>
          <ol>
            <li>Add up your gross pay for the year.</li>
            <li>
              Take away allowed deductions: pension, NHF, health insurance, life
              insurance, mortgage interest and rent relief.
            </li>
            <li>
              Tax what is left, your <strong>chargeable income</strong>, band by
              band.
            </li>
            <li>Divide the yearly tax by 12 for your monthly PAYE.</li>
          </ol>

          <h2>The 2026 tax bands</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[360px] text-left text-sm tabular-nums">
              <thead className="border-b border-slate-200 text-xs tracking-wide text-slate-500 uppercase dark:border-slate-700 dark:text-slate-400">
                <tr>
                  <th scope="col" className="py-2 pr-4 font-medium">
                    Chargeable income a year
                  </th>
                  <th scope="col" className="py-2 text-right font-medium">
                    Rate
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {BAND_ROWS.map((row) => (
                  <tr key={row.rate}>
                    <th scope="row" className="py-2 pr-4 font-normal">
                      {row.label}
                    </th>
                    <td className="py-2 text-right">{row.rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>What changed from 2025</h2>
          <ul>
            <li>
              <strong>The consolidated relief allowance is gone.</strong> It
              used to remove ₦200,000 (or 1% of gross, if higher) plus 20% of
              gross from tax.
            </li>
            <li>
              <strong>The first {naira(zeroBand.width)} is tax-free.</strong>{" "}
              Under the old rules, tax started at 7% from the first naira.
            </li>
            <li>
              <strong>Rent relief is new:</strong> 20% of rent paid, up to{" "}
              {naira(NIGERIA_TAX_ACT_2025.rentReliefCap)}.
            </li>
            <li>
              <strong>The top rate is now 25%</strong>, on chargeable income
              above ₦50 million, up from 24%.
            </li>
          </ul>

          <h2>A worked example</h2>
          <p>
            Take a monthly salary of {naira(500_000)}: {naira(250_000)} basic,{" "}
            {naira(125_000)} housing and {naira(75_000)} transport, with other
            allowances making up the rest. The {EMPLOYEE_PENSION_PCT}% pension
            on basic, housing and transport is {naira(worked.pension)} a year,
            leaving chargeable income of {naira(worked.chargeableIncome)}.
          </p>
          <p>
            Tax is {naira(worked.annualTax)} a year, or{" "}
            <strong>{naira(worked.monthlyTax)} a month</strong>, which is{" "}
            {formatPercent(worked.effectiveRate, 1)} of gross pay. Take-home pay
            is {naira(worked.monthlyTakeHome)} a month. If the same person pays{" "}
            {naira(1_500_000)} a year in rent and declares it, rent relief of{" "}
            {naira(workedWithRent.rentRelief)} cuts PAYE to{" "}
            {naira(workedWithRent.monthlyTax)} a month.
          </p>

          <h2>PAYE at common salaries</h2>
          <p>
            Assuming basic, housing and transport are 50%, 25% and 15% of gross,
            the standard pension, and no rent or other claims:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm tabular-nums">
              <thead className="border-b border-slate-200 text-xs tracking-wide text-slate-500 uppercase dark:border-slate-700 dark:text-slate-400">
                <tr>
                  <th scope="col" className="py-2 pr-4 font-medium">
                    Monthly gross
                  </th>
                  <th scope="col" className="py-2 pr-4 text-right font-medium">
                    PAYE 2026
                  </th>
                  <th scope="col" className="py-2 pr-4 text-right font-medium">
                    Old rules
                  </th>
                  <th scope="col" className="py-2 text-right font-medium">
                    Take-home
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {salaryRows.map((row) => (
                  <tr key={row.monthlyGross}>
                    <th scope="row" className="py-2 pr-4 font-normal">
                      {naira(row.monthlyGross)}
                    </th>
                    <td className="py-2 pr-4 text-right">
                      {naira(row.monthlyTax)}
                    </td>
                    <td className="py-2 pr-4 text-right">
                      {naira((row.oldRulesAnnualTax ?? 0) / 12)}
                    </td>
                    <td className="py-2 text-right">
                      {naira(row.monthlyTakeHome)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            All figures are monthly. &ldquo;Old rules&rdquo; is the Personal
            Income Tax Act as it stood in 2025, without its minimum tax rule.
            {crossoverMonthly
              ? ` Lower and middle earners pay less than before; from about ${naira(crossoverMonthly)} a month, PAYE is higher than under the old rules.`
              : ""}
          </p>

          <h2>Deductions you can claim</h2>
          <ul>
            <li>
              <strong>Pension:</strong> your {EMPLOYEE_PENSION_PCT}% employee
              contribution under the Pension Reform Act, worked out on basic,
              housing and transport.
            </li>
            <li>
              <strong>National Housing Fund:</strong> {NHF_PCT}% of basic
              salary, if you contribute.
            </li>
            <li>
              <strong>Health insurance:</strong> your contributions to the
              national health insurance scheme.
            </li>
            <li>
              <strong>Life insurance:</strong> premiums on your own or your
              spouse&apos;s life, or a deferred annuity, paid in the previous
              year.
            </li>
            <li>
              <strong>Mortgage interest:</strong> interest on a loan to build or
              buy a home you live in.
            </li>
            <li>
              <strong>Rent relief:</strong> 20% of rent paid, up to{" "}
              {naira(NIGERIA_TAX_ACT_2025.rentReliefCap)}, if you declare your
              actual rent.
            </li>
          </ul>

          <h2>Tips</h2>
          <ul>
            <li>
              If you pay rent, tell your employer and keep your tenancy
              agreement and receipts. Without a declaration, payroll cannot
              apply the relief.
            </li>
            <li>
              Check your payslip against this calculator. If the PAYE is very
              different, ask your payroll team which deductions they used.
            </li>
            <li>
              This calculator is for employees on salary. Self-employed income,
              investment income and capital gains follow other rules.
            </li>
          </ul>
        </>
      }
    >
      <PayeCalculator />
    </CalculatorShell>
  );
}
