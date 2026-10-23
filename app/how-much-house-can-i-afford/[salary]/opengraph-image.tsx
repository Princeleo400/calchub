import { notFound } from "next/navigation";
import {
  affordFor,
  parseSalarySlug,
  roundPrice,
  SALARIES,
  SALARY_BASE,
  salarySlug,
} from "@/lib/affordability/salaries";
import { renderSocialCard, socialImageSize } from "@/lib/og/socialCard";
import { formatCurrency } from "@/lib/utils";

export const alt = "How much house you can afford on this salary";
export const size = socialImageSize;
export const contentType = "image/png";

export function generateStaticParams() {
  return SALARIES.map((income) => ({ salary: salarySlug(income) }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ salary: string }>;
}) {
  const { salary } = await params;
  const income = parseSalarySlug(salary);
  if (!income) notFound();

  const price = roundPrice(affordFor(income).maxHomePrice);
  return renderSocialCard({
    eyebrow: "Home affordability",
    title: `How much house can I afford on ${formatCurrency(income)} a year?`,
    description: `About ${formatCurrency(price)}, with ${SALARY_BASE.downPaymentPct}% down at a ${SALARY_BASE.rate}% rate and no other debts.`,
  });
}
