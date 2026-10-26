import {
  MINIMUM_WAGE_MONTHLY,
  NIGERIA_TAX_ACT_2025,
  type PayeInputs,
  type PayeResult,
} from "@/lib/calculators/nigeriaPaye";
import { formatCurrency, formatPercent } from "@/lib/utils";

const naira = (value: number) => formatCurrency(value, "NGN");

/** Plain-English reading of a PAYE result. */
export function payeInsight(inputs: PayeInputs, result: PayeResult): string[] {
  if (result.annualGross <= 0) {
    return ["Enter your monthly gross pay to see your PAYE and take-home pay."];
  }
  if (result.minimumWageExempt) {
    return [
      `Pay of ${naira(MINIMUM_WAGE_MONTHLY)} a month or less is the national minimum wage, and the Nigeria Tax Act 2025 excludes it from income tax. You should have no PAYE deducted.`,
    ];
  }

  const lines: string[] = [];
  if (result.annualTax === 0) {
    lines.push(
      `Your chargeable income of ${naira(result.chargeableIncome)} a year is within the first ${naira(NIGERIA_TAX_ACT_2025.bands[0].width)}, which is taxed at 0%. You should pay no PAYE.`,
    );
  } else {
    lines.push(
      `You would pay about ${naira(result.monthlyTax)} a month in PAYE, ${naira(result.annualTax)} a year. That is ${formatPercent(result.effectiveRate, 1)} of your gross pay, even though your top band is ${result.marginalRate}%, because the first ${naira(NIGERIA_TAX_ACT_2025.bands[0].width)} is tax-free and each band only taxes the income inside it.`,
    );
  }

  if (inputs.annualRent <= 0) {
    lines.push(
      `If you pay rent, declaring it to your employer could cut your tax: you can deduct 20% of your annual rent, up to ${naira(NIGERIA_TAX_ACT_2025.rentReliefCap)}.`,
    );
  } else if (result.rentRelief >= NIGERIA_TAX_ACT_2025.rentReliefCap) {
    lines.push(
      `Your rent relief is at the ${naira(NIGERIA_TAX_ACT_2025.rentReliefCap)} maximum, which saves about ${naira((result.rentRelief * result.marginalRate) / 100)} a year at your top rate.`,
    );
  }

  if (result.oldRulesAnnualTax !== null) {
    const difference = result.oldRulesAnnualTax - result.annualTax;
    if (Math.abs(difference) < 1) {
      lines.push("Your tax is about the same as under the old 2025 rules.");
    } else if (difference > 0) {
      lines.push(
        `Under the old 2025 rules you would have paid about ${naira(difference)} more a year, ${naira(difference / 12)} a month.`,
      );
    } else {
      lines.push(
        `Under the old 2025 rules you would have paid about ${naira(-difference)} less a year. The new top bands are higher for large incomes.`,
      );
    }
  }

  return lines;
}
