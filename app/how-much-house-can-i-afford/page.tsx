import Link from "next/link";
import { DataTable } from "@/components/blog/DataTable";
import { ContentPage } from "@/components/layout/ContentPage";
import {
  affordFor,
  roundPrice,
  SALARIES,
  salarySlug,
} from "@/lib/affordability/salaries";
import { buildMetadata } from "@/lib/seo/metadata";
import { formatCurrency } from "@/lib/utils";

export const metadata = buildMetadata({
  title: "How Much House Can I Afford? By Salary, $40k to $200k",
  description:
    "The home price you can afford at every salary from $40,000 to $200,000 a year, with the monthly budget behind each figure.",
  path: "/how-much-house-can-i-afford",
});

export default function AffordBySalaryPage() {
  return (
    <ContentPage
      title="How much house can I afford, by salary"
      intro={
        <p>
          Home prices you can afford at common salaries, using the 28/36
          guideline with 20% down, a 30-year loan at 7%, 1.1% property tax,
          $1,800 a year for insurance and no other debts.
        </p>
      }
      lastUpdated="2026-10-22"
    >
      <DataTable
        headers={["Salary", "Monthly housing budget", "Home price"]}
        numeric={[1, 2]}
        rows={SALARIES.map((s) => {
          const r = affordFor(s);
          return [
            <Link
              key={s}
              href={`/how-much-house-can-i-afford/${salarySlug(s)}`}
            >
              {formatCurrency(s)}
            </Link>,
            formatCurrency(r.housingBudget),
            formatCurrency(roundPrice(r.maxHomePrice)),
          ];
        })}
      />
      <p>
        Pick a salary for a detailed breakdown by down payment, rate and other
        debts, or use the{" "}
        <Link href="/home-affordability-calculator">
          home affordability calculator
        </Link>{" "}
        with your own numbers. For the reasoning behind the 28/36 rule and what
        lenders really allow, read{" "}
        <Link href="/blog/how-much-house-can-i-afford">
          how much house can I afford?
        </Link>
      </p>
    </ContentPage>
  );
}
