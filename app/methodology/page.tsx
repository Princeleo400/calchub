import Link from "next/link";
import { ContentPage } from "@/components/layout/ContentPage";
import { ACTIVITY_LEVELS } from "@/lib/calculators/calorie";
import { buildMetadata } from "@/lib/seo/metadata";
import { site } from "@/lib/site";

export const metadata = buildMetadata({
  title: "How We Calculate: Methodology",
  description: `The formulas, assumptions and sources behind every ${site.name} calculator, and how the math is tested.`,
  path: "/methodology",
});

function Formula({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-md border border-slate-200 bg-slate-50 p-3 font-mono text-xs leading-relaxed text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
      {children}
    </pre>
  );
}

export default function MethodologyPage() {
  return (
    <ContentPage
      title="How we calculate"
      intro={
        <p>
          Every {site.name} calculator uses a published, standard method. This
          page lists the formulas, the assumptions each one makes, and where
          they come from, so you can check any result yourself.
        </p>
      }
      lastUpdated="2026-10-20"
    >
      <h2>General principles</h2>
      <ul>
        <li>
          All math runs in your browser with full precision. Results are rounded
          only for display.
        </li>
        <li>
          Money is shown to the nearest dollar unless cents matter, such as in
          the formula breakdowns.
        </li>
        <li>
          Calorie estimates are rounded to the nearest 10, because more
          precision would be misleading.
        </li>
        <li>
          Every calculator has automated tests that check it against known
          reference values. For example, a $200,000 loan at 6% over 30 years
          must give a payment of $1,199.10.
        </li>
        <li>
          Results are estimates for planning. They are not financial, tax or
          medical advice.
        </li>
      </ul>

      <h2>Mortgage calculator</h2>
      <p>
        Principal and interest use the standard fixed-rate amortization formula,
        where P is the loan amount, r is the annual rate divided by 12, and n is
        the number of monthly payments:
      </p>
      <Formula>{"M = P × r(1 + r)^n / ((1 + r)^n − 1)"}</Formula>
      <ul>
        <li>
          Property tax is the annual rate times the home price, divided by 12.
        </li>
        <li>Insurance and HOA dues are taken as entered.</li>
        <li>
          PMI is charged only when the down payment is below 20%. It is
          calculated as the annual PMI rate times the original loan amount,
          divided by 12. It stops when the balance on your original payment
          schedule reaches 78% of the home price, or at the loan&apos;s halfway
          point if that comes first, matching when federal rules require most
          conventional PMI to end automatically. Extra payments don&apos;t move
          that date, but they let you ask your lender to cancel sooner, once you
          owe 80%.
        </li>
        <li>
          Extra payments go entirely to principal in the month they are made.
        </li>
        <li>
          Taxes, insurance and PMI are held constant, although in reality they
          change over time.
        </li>
      </ul>
      <p>
        Source:{" "}
        <a href="https://www.consumerfinance.gov/ask-cfpb/when-can-i-remove-private-mortgage-insurance-pmi-from-my-loan-en-202/">
          CFPB on removing PMI
        </a>
        .
      </p>

      <h2>Home affordability calculator</h2>
      <p>
        The affordability calculator runs the mortgage calculator in reverse. It
        sets a monthly housing budget as the lower of two limits, then finds the
        home price whose full payment fits that budget:
      </p>
      <Formula>
        {
          "Budget = min(housing % × monthly income, total % × monthly income − other debts)\nPrice  = (budget − insurance − HOA) ÷ (loan share × payment factor + tax rate ÷ 12 + PMI)"
        }
      </Formula>
      <p>
        The default limits are the traditional 28% for housing and 36% for all
        debts; both can be changed. Prices are rounded down to the nearest
        $1,000. Automated tests check that the price it gives produces exactly
        the budgeted payment in the mortgage calculator.
      </p>
      <p>
        Source:{" "}
        <a href="https://selling-guide.fanniemae.com/sel/b3-6-02/debt-income-ratios">
          Fannie Mae Selling Guide on debt-to-income ratios
        </a>
        .
      </p>

      <h2>UK Stamp Duty calculator</h2>
      <p>
        Stamp Duty Land Tax for residential property in England and Northern
        Ireland is charged in slices: each part of the price is taxed at its
        band&apos;s rate and the slices are added together. First-time buyers
        use their own bands up to £500,000 and pay standard rates above it. The
        additional-property and non-UK resident surcharges add percentage points
        to every band on purchases of £40,000 or more. The total is rounded down
        to the whole pound. Rates are held in one place in the code with the
        date they took effect and the date they were last checked, and are
        rechecked after each UK Budget.
      </p>
      <p>
        Source:{" "}
        <a href="https://www.gov.uk/government/publications/rates-and-allowances-stamp-duty-land-tax/stamp-duty-land-tax-rates-31-october-2024-to-31-march-2025">
          GOV.UK Stamp Duty Land Tax rates
        </a>
        .
      </p>

      <h2>Canada mortgage stress test</h2>
      <p>
        The qualifying rate is the greater of the contract rate plus 2
        percentage points and 5.25%. Payments use the Canadian convention for
        fixed-rate mortgages, interest compounded semi-annually, so the monthly
        rate is:
      </p>
      <Formula>{"monthly rate = (1 + annual rate ÷ 2)^(1/6) − 1"}</Formula>
      <p>
        At the qualifying rate, GDS is the mortgage payment plus property tax,
        heating and 50% of condo fees, divided by gross monthly income; TDS adds
        other debt payments. They are compared with CMHC&apos;s limits of 39%
        and 44%. With under 20% down, the CMHC premium (2.80% to 4.00% of the
        mortgage, plus 0.20 points for a 30-year amortization) is added to the
        mortgage. The maximum price is found numerically, allowing for premium
        tiers and the minimum down payment of 5% on the first $500,000 and 10%
        above it.
      </p>
      <p>
        Sources:{" "}
        <a href="https://www.osfi-bsif.gc.ca/en/supervision/financial-institutions/banks/minimum-qualifying-rate-uninsured-mortgages">
          OSFI minimum qualifying rate
        </a>
        ;{" "}
        <a href="https://cmhc-schl.gc.ca/professionals/project-funding-and-mortgage-financing/mortgage-loan-insurance/calculating-gds-tds">
          CMHC on calculating GDS and TDS
        </a>
        ;{" "}
        <a href="https://laws-lois.justice.gc.ca/eng/acts/I-15/FullText.html">
          Interest Act, section 6
        </a>
        .
      </p>

      <h2>Loan calculator</h2>
      <p>
        Uses the same amortization formula as the mortgage calculator. The APR
        includes an upfront fee by solving for the rate at which the amount you
        actually receive (the loan minus the fee) is repaid by the same monthly
        payment over the same term. It is found numerically to within 0.0001%.
      </p>
      <p>
        Source:{" "}
        <a href="https://www.consumerfinance.gov/ask-cfpb/what-is-the-difference-between-a-loan-interest-rate-and-the-apr-en-733/">
          CFPB on interest rate vs APR
        </a>
        .
      </p>

      <h2>Savings calculator</h2>
      <p>
        The balance is simulated month by month. Each month, interest is added
        to the balance and then that month&apos;s deposit is made, so deposits
        count from the end of the month they are made in. The starting balance
        earns interest from the first month.
      </p>
      <ul>
        <li>
          Monthly compounding uses the rate ÷ 12 each month. Daily, quarterly
          and yearly compounding use the monthly rate that produces the same
          yearly yield: (1 + rate ÷ n)^(n ÷ 12) − 1, where n is the number of
          compounding periods a year.
        </li>
        <li>
          The annual percentage yield (APY) is (1 + rate ÷ n)^n − 1, which
          matches the Truth in Savings definition for an account held for a full
          year.
        </li>
        <li>
          A yearly increase raises the monthly deposit at the start of each new
          year.
        </li>
        <li>
          The deposit needed for a goal is solved directly from the future-value
          formula and assumes a fixed deposit with no yearly increase.
        </li>
      </ul>
      <p>
        Tax and inflation are not included. Source:{" "}
        <a href="https://www.consumerfinance.gov/rules-policy/regulations/1030/a/">
          CFPB, Regulation DD Appendix A
        </a>
        .
      </p>

      <h2>Debt payoff calculator</h2>
      <p>The plan is simulated month by month:</p>
      <ol>
        <li>Interest is added to each balance: balance × APR ÷ 12.</li>
        <li>The minimum payment is made on every open debt.</li>
        <li>
          The rest of the monthly budget goes to the target debt: the highest
          APR first for the avalanche method, or the smallest balance first for
          the snowball method. Ties are broken by the other measure.
        </li>
        <li>
          When a debt is paid off, its minimum rolls into the next target, so
          the monthly total stays fixed.
        </li>
      </ol>
      <p>
        Minimum payments are held fixed and no new charges are assumed. Real
        credit card minimums usually fall as the balance falls. The
        &ldquo;minimums only&rdquo; comparison pays each debt&apos;s minimum
        with no extra payment and no rollover. Plans longer than 50 years are
        reported as never paying off.
      </p>

      <h2>BMI calculator</h2>
      <Formula>
        {
          "BMI = weight (kg) ÷ height (m)²\nBMI = 703 × weight (lb) ÷ height (in)²   (US units)"
        }
      </Formula>
      <p>
        US units are converted exactly (1 lb = 0.45359237 kg, 1 in = 2.54 cm)
        before calculating. The category is based on the BMI rounded to one
        decimal, so the label always matches the number shown. Categories follow
        the CDC adult ranges for ages 20 and over: underweight below 18.5,
        healthy weight 18.5 to under 25, overweight 25 to under 30, and obesity
        30 or higher in three classes. The healthy weight range uses a BMI of
        18.5 to 24.9.
      </p>
      <p>
        Source:{" "}
        <a href="https://www.cdc.gov/bmi/adult-calculator/bmi-categories.html">
          CDC adult BMI categories
        </a>
        .
      </p>

      <h2>Calorie calculator</h2>
      <p>
        Resting needs (BMR) use the Mifflin-St Jeor equation (Mifflin et al.,
        1990):
      </p>
      <Formula>
        {
          "Men:   BMR = 10 × weight (kg) + 6.25 × height (cm) − 5 × age + 5\nWomen: BMR = 10 × weight (kg) + 6.25 × height (cm) − 5 × age − 161"
        }
      </Formula>
      <p>Daily needs (TDEE) are BMR times an activity factor:</p>
      <ul>
        {ACTIVITY_LEVELS.map((level) => (
          <li key={level.id}>
            {level.label} ({level.description.toLowerCase()}): × {level.factor}
          </li>
        ))}
      </ul>
      <p>
        Weight goals add or subtract 250 or 500 calories a day, based on the
        rough rule that a pound of body weight is about 3,500 calories. Any
        target below the estimated BMR is flagged.
      </p>
      <p>
        Sources:{" "}
        <a href="https://cancercontrol.cancer.gov/brp/research/group-evaluated-measures/adopt/ree-pal">
          National Cancer Institute on the Mifflin-St Jeor equation
        </a>
        ;{" "}
        <a href="https://www.cdc.gov/healthy-weight-growth/losing-weight/index.html">
          CDC on gradual weight loss
        </a>
        .
      </p>

      <h2>Macro calculator</h2>
      <p>
        Grams come from the calorie target and the share of calories chosen for
        each macro, using the standard Atwater factors: 4 calories per gram of
        protein and carbohydrate, and 9 per gram of fat. Estimated calories use
        the same Mifflin-St Jeor method as the calorie calculator.
      </p>
      <ul>
        <li>
          Each split is checked against the adult Acceptable Macronutrient
          Distribution Ranges: carbohydrate 45 to 65%, fat 20 to 35% and protein
          10 to 35% of calories.
        </li>
        <li>
          Protein per kilogram is compared with the adult RDA of 0.8 g/kg and
          the 1.4 to 2.0 g/kg range the International Society of Sports
          Nutrition finds sufficient for most people who exercise.
        </li>
        <li>
          Targets under 1,200 calories a day, or below estimated resting needs,
          show a caution.
        </li>
      </ul>
      <p>
        Sources:{" "}
        <a href="https://doi.org/10.17226/10490">
          Institute of Medicine Dietary Reference Intakes (2005)
        </a>{" "}
        and{" "}
        <a href="https://pubmed.ncbi.nlm.nih.gov/28642676/">
          ISSN position stand on protein and exercise (2017)
        </a>
        .
      </p>

      <h2>Ideal weight calculator</h2>
      <p>
        Four published formulas each start from a weight at 5 feet and add a
        fixed amount for every inch above it:
      </p>
      <ul>
        <li>Devine (1974): men 50 kg, women 45.5 kg, plus 2.3 kg per inch.</li>
        <li>
          Robinson (1983): men 52 kg plus 1.9 kg per inch; women 49 kg plus 1.7
          kg per inch.
        </li>
        <li>
          Miller (1983): men 56.2 kg plus 1.41 kg per inch; women 53.1 kg plus
          1.36 kg per inch.
        </li>
        <li>
          Hamwi (1964): men 106 lb plus 6 lb per inch; women 100 lb plus 5 lb
          per inch.
        </li>
      </ul>
      <p>
        Below 5 feet, the amount per inch is subtracted, as Robinson et al.
        suggested. The healthy range is the weight that gives a BMI of 18.5 to
        24.9 at the same height. Source:{" "}
        <a href="https://pubmed.ncbi.nlm.nih.gov/10981254/">
          Pai and Paloucek, Annals of Pharmacotherapy (2000)
        </a>
        .
      </p>

      <h2>Nigeria PAYE calculator</h2>
      <p>
        Follows the Nigeria Tax Act 2025, in force from 1 January 2026.
        Chargeable income is yearly gross pay less the deductions allowed by
        section 30: pension contributions, National Housing Fund contributions,
        health insurance contributions, life insurance premiums, mortgage
        interest on an owner-occupied home, and rent relief of 20% of rent paid
        up to ₦500,000.
      </p>
      <ul>
        <li>
          Bands from the Fourth Schedule: first ₦800,000 at 0%, next ₦2.2
          million at 15%, next ₦9 million at 18%, next ₦13 million at 21%, next
          ₦25 million at 23%, and above ₦50 million at 25%.
        </li>
        <li>
          Employee pension is 8% of basic, housing and transport (Pension Reform
          Act 2014, section 4). NHF is 2.5% of basic salary (National Housing
          Fund Act, section 4).
        </li>
        <li>
          Pay at or below the national minimum wage of ₦70,000 a month is
          excluded from tax (section 58).
        </li>
        <li>
          The comparison uses the old Personal Income Tax Act: pension, NHF and
          health insurance first, then a consolidated relief allowance of the
          higher of ₦200,000 or 1% of gross, plus 20% of gross, and bands of 7%
          to 24%. The old minimum tax rule is not modelled, and the comparison
          is hidden when life insurance or mortgage interest is claimed.
        </li>
      </ul>
      <p>
        Sources:{" "}
        <a href="https://africacheck.org/sites/default/files/media/documents/2025-07/NIGERIA-TAX-ACT-2025.pdf">
          Nigeria Tax Act 2025
        </a>{" "}
        and{" "}
        <a href="https://taxsummaries.pwc.com/nigeria/individual">
          PwC Worldwide Tax Summaries
        </a>
        .
      </p>

      <h2>Found a problem?</h2>
      <p>
        If a result looks wrong, please <Link href="/contact">tell us</Link> the
        inputs you used and what you expected. Confirmed errors are fixed and
        the page&apos;s review date is updated.
      </p>
    </ContentPage>
  );
}
