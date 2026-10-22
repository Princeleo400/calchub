import {
  calculateAffordability,
  type AffordabilityInputs,
  type AffordabilityResult,
} from "@/lib/calculators/affordability";
import { formatCurrency, formatPercent } from "@/lib/utils";

/** Fannie Mae's ceiling for manually underwritten loans with strong credit and reserves. */
export const STRETCH_DTI = 45;

const price = (amount: number) =>
  formatCurrency(Math.floor(amount / 1000) * 1000);

/** Plain-English explanation of an affordability result. */
export function affordabilityInsight(
  inputs: AffordabilityInputs,
  result: AffordabilityResult,
): string[] {
  if (inputs.annualIncome <= 0)
    return ["Enter your yearly income before tax to see what you can afford."];
  if (result.maxHomePrice <= 0) {
    return [
      `With ${formatCurrency(inputs.monthlyDebts)} a month going to other debts, there is no room left for housing within a ${inputs.totalDtiPct}% debt-to-income limit. Paying down those debts first would open up a budget.`,
    ];
  }

  const lines: string[] = [
    `On ${formatCurrency(inputs.annualIncome)} a year (${formatCurrency(result.monthlyIncome)} a month before tax), you can spend about ${formatCurrency(result.housingBudget)} a month on housing. With ${formatPercent(inputs.downPaymentPct, inputs.downPaymentPct % 1 ? 1 : 0)} down, that supports a home of about ${price(result.maxHomePrice)}.`,
  ];

  if (result.limitedBy === "total" && inputs.monthlyDebts > 0) {
    const noDebts = calculateAffordability({ ...inputs, monthlyDebts: 0 });
    lines.push(
      `Your other debts of ${formatCurrency(inputs.monthlyDebts)} a month are the limiting factor: with them, your total debt payments reach ${inputs.totalDtiPct}% of income first. Without them you could afford about ${price(noDebts.maxHomePrice)}.`,
    );
  } else {
    lines.push(
      `Here the ${inputs.housingRatioPct}% housing guideline sets the budget${inputs.monthlyDebts > 0 ? "; your other debts are low enough not to change it" : ""}.`,
    );
  }

  const stretch = calculateAffordability({
    ...inputs,
    housingRatioPct: STRETCH_DTI,
    totalDtiPct: STRETCH_DTI,
  });
  if (stretch.maxHomePrice > result.maxHomePrice * 1.02) {
    lines.push(
      `Lenders often approve more than this. At a ${STRETCH_DTI}% debt-to-income ratio, which Fannie Mae allows for borrowers with strong credit and savings, the ceiling is about ${price(stretch.maxHomePrice)}. That leaves much less room for saving and surprises.`,
    );
  }

  return lines;
}
