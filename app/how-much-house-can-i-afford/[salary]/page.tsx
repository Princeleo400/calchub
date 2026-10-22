import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AffordabilityCalculator } from "@/components/calculator/AffordabilityCalculator";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { DataTable } from "@/components/blog/DataTable";
import {
  affordFor,
  parseSalarySlug,
  roundPrice,
  SALARIES,
  salarySlug,
} from "@/lib/affordability/salaries";
import { buildMetadata } from "@/lib/seo/metadata";
import type { FaqItem } from "@/lib/seo/jsonLd";
import { formatCurrency } from "@/lib/utils";

export function generateStaticParams() {
  return SALARIES.map((salaryAmount) => ({ salary: salarySlug(salaryAmount) }));
}

const short = (income: number) => `$${income / 1000}k`;

export async function generateMetadata({
  params,
}: PageProps<"/how-much-house-can-i-afford/[salary]">): Promise<Metadata> {
  const { salary } = await params;
  const income = parseSalarySlug(salary);
  if (!income) return {};
  const price = roundPrice(affordFor(income).maxHomePrice);
  return buildMetadata({
    title: `How Much House Can I Afford on ${formatCurrency(income)} a Year?`,
    description: `On a ${short(income)} salary you can afford a home of about ${formatCurrency(price)} with 20% down at 7%. See prices by down payment, rate and debts, and run your own numbers.`,
    path: `/how-much-house-can-i-afford/${salary}`,
  });
}

const DOWN = [3.5, 10, 20];
const RATES = [6, 7, 8];
const DEBTS = [0, 300, 600, 900];

export default async function SalaryPage({
  params,
}: PageProps<"/how-much-house-can-i-afford/[salary]">) {
  const { salary } = await params;
  const income = parseSalarySlug(salary);
  if (!income) notFound();

  const main = affordFor(income);
  const price = roundPrice(main.maxHomePrice);
  const monthly = income / 12;
  const index = SALARIES.indexOf(income);
  const neighbors = [SALARIES[index - 1], SALARIES[index + 1]].filter(
    (value): value is number => value !== undefined,
  );
  const lowDown = affordFor(income, { downPaymentPct: 3.5 });
  const debtRows = DEBTS.map((debtAmount) => ({
    debts: debtAmount,
    result: affordFor(income, { monthlyDebts: debtAmount }),
  }));
  const firstBinding = debtRows.find((row) => row.result.limitedBy === "total");

  const faqs: FaqItem[] = [
    {
      question: `How much house can I afford on ${formatCurrency(income)} a year?`,
      answer: `About ${formatCurrency(price)}, assuming 20% down, a 30-year loan at 7%, no other debts, and spending no more than 28% of your gross income (${formatCurrency(main.housingBudget)} a month) on housing including tax and insurance.`,
    },
    {
      question: `What mortgage payment can I afford on ${short(income)}?`,
      answer: `Under the 28% guideline, about ${formatCurrency(main.housingBudget)} a month for your full housing payment, including property tax, insurance and any PMI or HOA dues. If you have other debts, keep the total of all debt payments under 36% of income, about ${formatCurrency((monthly * 36) / 100)} a month.`,
    },
    {
      question: `Can I buy a house on ${short(income)} with a small down payment?`,
      answer: `Yes. With 3.5% down, the same budget supports a home of about ${formatCurrency(roundPrice(lowDown.maxHomePrice))}. You would need about ${formatCurrency(roundPrice(lowDown.downPayment))} for the down payment, plus closing costs, and would pay PMI until you build enough equity.`,
    },
  ];

  return (
    <CalculatorShell
      slug="home-affordability-calculator"
      title={`How Much House Can I Afford on ${formatCurrency(income)} a Year?`}
      page={{
        path: `/how-much-house-can-i-afford/${salary}`,
        label: `${short(income)} salary`,
        parent: {
          label: "Home Affordability Calculator",
          path: "/home-affordability-calculator",
        },
      }}
      intro={
        <p>
          On a {formatCurrency(income)} salary you can afford a home of about{" "}
          <strong>{formatCurrency(price)}</strong>, with 20% down, a 7% rate and
          no other debts. Change any number below to see your own answer.
        </p>
      }
      lastReviewed="2026-10-22"
      faqs={faqs}
      sources={[
        {
          label: "Fannie Mae Selling Guide: B3-6-02, Debt-to-Income Ratios",
          href: "https://selling-guide.fanniemae.com/sel/b3-6-02/debt-income-ratios",
        },
      ]}
      guide={
        <>
          <h2>Your monthly budget on {short(income)}</h2>
          <p>
            {formatCurrency(income)} a year is {formatCurrency(monthly)} a month
            before tax. Under the traditional 28/36 guideline:
          </p>
          <ul>
            <li>
              Housing, including property tax and insurance: up to{" "}
              <strong>{formatCurrency(main.housingBudget)}</strong> a month
              (28%).
            </li>
            <li>
              All debts together, housing included: up to{" "}
              <strong>{formatCurrency((monthly * 36) / 100)}</strong> a month
              (36%).
            </li>
          </ul>

          <h2>Home price by down payment and rate</h2>
          <p>
            With no other debts, a 30-year loan, 1.1% property tax and $1,800 a
            year for insurance:
          </p>
          <DataTable
            headers={["Down payment", ...RATES.map((rate) => `At ${rate}%`)]}
            numeric={[1, 2, 3]}
            rows={DOWN.map((downPct) => [
              `${downPct}%`,
              ...RATES.map((rate) =>
                formatCurrency(
                  roundPrice(
                    affordFor(income, { downPaymentPct: downPct, rate })
                      .maxHomePrice,
                  ),
                ),
              ),
            ])}
          />
          <p>
            Each percentage point on the rate moves the price by tens of
            thousands of dollars, so comparing lenders pays off. A smaller down
            payment buys slightly less house because of the bigger loan and PMI,
            but needs far less cash:{" "}
            {formatCurrency(roundPrice(lowDown.downPayment))} at 3.5% down
            versus {formatCurrency(roundPrice(main.downPayment))} at 20%.
          </p>

          <h2>If you have other debts</h2>
          <p>
            Car loans, student loans and card minimums count against the 36%
            total limit:
          </p>
          <DataTable
            headers={["Other debts", "Housing budget", "Home price"]}
            numeric={[1, 2]}
            rows={debtRows.map(({ debts, result }) => [
              debts === 0 ? "None" : `${formatCurrency(debts)} a month`,
              formatCurrency(result.housingBudget),
              formatCurrency(roundPrice(result.maxHomePrice)),
            ])}
          />
          <p>
            {firstBinding
              ? `Up to ${formatCurrency(Math.floor((monthly * 0.08) / 10) * 10)} a month of other debts makes no difference, because the 28% housing limit is tighter. From ${formatCurrency(firstBinding.debts)} a month in this table, the 36% total limit takes over and the budget shrinks.`
              : "At this income, even $900 a month of other debts doesn't change the budget, because the 28% housing limit is the tighter one."}
          </p>

          <h2>Approved for vs comfortable with</h2>
          <p>
            Lenders often approve more than the 28/36 rule. Fannie Mae allows
            total debt-to-income of up to 45% for borrowers with strong credit
            and savings, and up to 50% through automated underwriting. Before
            borrowing more, make sure the payment still leaves room to save and
            an emergency fund after closing.
          </p>

          <h2>Other salaries</h2>
          <ul>
            {neighbors.map((neighbor) => (
              <li key={neighbor}>
                <Link
                  href={`/how-much-house-can-i-afford/${salarySlug(neighbor)}`}
                >
                  How much house can I afford on {formatCurrency(neighbor)}?
                </Link>
              </li>
            ))}
            <li>
              <Link href="/how-much-house-can-i-afford">
                All salaries from $40k to $200k
              </Link>
            </li>
          </ul>
        </>
      }
    >
      <AffordabilityCalculator initialIncome={income} />
    </CalculatorShell>
  );
}
