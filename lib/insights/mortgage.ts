import { calculateMortgage, formatDuration, type MortgageInputs, type MortgageResult } from "@/lib/calculators/mortgage";
import { formatCurrency, formatPercent } from "@/lib/utils";

/**
 * Plain-English explanation of a mortgage result: two or three sentences built
 * from the numbers. Free, instant and part of the page HTML (unlike AI text).
 */
export function mortgageInsight(inputs: MortgageInputs, r: MortgageResult): string[] {
  if (r.loanAmount <= 0) {
    return ["With a 100% down payment there is no loan to repay, so you would only pay property tax, insurance and any HOA dues."];
  }

  const lines: string[] = [];
  const extras = r.monthlyTax + r.monthlyInsurance + r.monthlyPmi + r.monthlyHoa;

  // 1. What the monthly number is made of.
  lines.push(
    extras > 0
      ? `About ${formatCurrency(r.monthlyPrincipalInterest)} of your ${formatCurrency(r.totalMonthly - inputs.extraPerMonth)} monthly payment repays the loan with interest. The other ${formatCurrency(extras)} covers ${costList(r)}.`
      : `Your monthly payment of ${formatCurrency(r.monthlyPrincipalInterest)} covers principal and interest only. Add property tax and insurance for a fuller picture of the cost.`,
  );

  // 2. The cost of borrowing.
  const firstYear = r.schedule[0];
  const interestShare = firstYear ? firstYear.interest / (firstYear.interest + firstYear.principal) : 0;
  lines.push(
    `Over ${formatDuration(r.payoffMonths)} you would pay ${formatCurrency(r.totalInterest)} in interest, ${formatPercent((r.totalInterest / r.loanAmount) * 100, 0)} of the amount borrowed. In the first year, ${formatPercent(interestShare * 100, 0)} of what you pay toward the loan goes to interest.`,
  );

  // 3. One useful next step.
  if (r.monthlyPmi > 0 && r.pmiEndsMonth) {
    lines.push(
      `Because you are putting down less than 20%, PMI adds about ${formatCurrency(r.monthlyPmi)} a month. On this schedule it ends automatically after ${formatDuration(r.pmiEndsMonth)}, ${
        r.pmiEndsMonth >= (inputs.termYears * 12) / 2 ? "the loan's halfway point" : "once you owe 78% of the home's original value"
      }, and you can ask to cancel it earlier once you owe 80%.`,
    );
  } else if (inputs.extraPerMonth > 0 && r.monthsSaved > 0) {
    lines.push(
      `Your extra ${formatCurrency(inputs.extraPerMonth)} a month pays the loan off ${formatDuration(r.monthsSaved)} sooner and saves ${formatCurrency(r.interestSaved)} in interest.`,
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

function costList(r: MortgageResult): string {
  const items: string[] = [];
  if (r.monthlyTax > 0) items.push("property tax");
  if (r.monthlyInsurance > 0) items.push("insurance");
  if (r.monthlyPmi > 0) items.push("PMI");
  if (r.monthlyHoa > 0) items.push("HOA dues");
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
}
