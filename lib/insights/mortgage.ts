import {
  calculateMortgage,
  formatDuration,
  type MortgageInputs,
  type MortgageResult,
} from "@/lib/calculators/mortgage";
import { formatCurrency, formatPercent } from "@/lib/utils";

/**
 * Plain-English explanation of a mortgage result: two or three sentences built
 * from the numbers. Free, instant and part of the page HTML (unlike AI text).
 */
export function mortgageInsight(
  inputs: MortgageInputs,
  result: MortgageResult,
): string[] {
  if (result.loanAmount <= 0) {
    return [
      "With a 100% down payment there is no loan to repay, so you would only pay property tax, insurance and any HOA dues.",
    ];
  }

  const lines: string[] = [];
  const extras =
    result.monthlyTax +
    result.monthlyInsurance +
    result.monthlyPmi +
    result.monthlyHoa;

  // 1. What the monthly number is made of.
  lines.push(
    extras > 0
      ? `About ${formatCurrency(result.monthlyPrincipalInterest)} of your ${formatCurrency(result.totalMonthly - inputs.extraPerMonth)} monthly payment repays the loan with interest. The other ${formatCurrency(extras)} covers ${costList(result)}.`
      : `Your monthly payment of ${formatCurrency(result.monthlyPrincipalInterest)} covers principal and interest only. Add property tax and insurance for a fuller picture of the cost.`,
  );

  // 2. The cost of borrowing.
  const firstYear = result.schedule[0];
  const interestShare = firstYear
    ? firstYear.interest / (firstYear.interest + firstYear.principal)
    : 0;
  lines.push(
    `Over ${formatDuration(result.payoffMonths)} you would pay ${formatCurrency(result.totalInterest)} in interest, ${formatPercent((result.totalInterest / result.loanAmount) * 100, 0)} of the amount borrowed. In the first year, ${formatPercent(interestShare * 100, 0)} of what you pay toward the loan goes to interest.`,
  );

  // 3. One useful next step.
  if (result.monthlyPmi > 0 && result.pmiEndsMonth) {
    lines.push(
      `Because you are putting down less than 20%, PMI adds about ${formatCurrency(result.monthlyPmi)} a month. On this schedule it ends automatically after ${formatDuration(result.pmiEndsMonth)}, ${
        result.pmiEndsMonth >= (inputs.termYears * 12) / 2
          ? "the loan's halfway point"
          : "once you owe 78% of the home's original value"
      }, and you can ask to cancel it earlier once you owe 80%.`,
    );
  } else if (inputs.extraPerMonth > 0 && result.monthsSaved > 0) {
    lines.push(
      `Your extra ${formatCurrency(inputs.extraPerMonth)} a month pays the loan off ${formatDuration(result.monthsSaved)} sooner and saves ${formatCurrency(result.interestSaved)} in interest.`,
    );
  } else {
    const tip = calculateMortgage({ ...inputs, extraPerMonth: 100 });
    if (tip.monthsSaved > 0) {
      lines.push(
        `Paying an extra $100 a month toward principal would save about ${formatCurrency(tip.interestSaved)} in interest and finish ${formatDuration(tip.monthsSaved)} early.`,
      );
    }
  }

  return lines;
}

function costList(result: MortgageResult): string {
  const items: string[] = [];
  if (result.monthlyTax > 0) items.push("property tax");
  if (result.monthlyInsurance > 0) items.push("insurance");
  if (result.monthlyPmi > 0) items.push("PMI");
  if (result.monthlyHoa > 0) items.push("HOA dues");
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
}
