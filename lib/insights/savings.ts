import {
  calculateSavings,
  type SavingsInputs,
  type SavingsResult,
} from "@/lib/calculators/savings";
import { formatCurrency } from "@/lib/utils";

/** Two or three plain-English sentences about a savings result. */
export function savingsInsight(
  inputs: SavingsInputs,
  result: SavingsResult,
): string[] {
  if (inputs.years <= 0) {
    return ["Enter how many years you plan to save to see your balance grow."];
  }
  if (result.finalBalance <= 0) {
    return ["Enter a starting balance or a monthly deposit to get started."];
  }

  const lines: string[] = [];
  const yearsLabel = `${inputs.years} year${inputs.years === 1 ? "" : "s"}`;

  lines.push(
    `After ${yearsLabel} you would have ${formatCurrency(result.finalBalance)}: ${formatCurrency(result.totalDeposits)} you put in, plus ${formatCurrency(result.totalInterest)} in interest.`,
  );

  if (result.crossoverYear !== null) {
    lines.push(
      `From year ${result.crossoverYear}, the interest you earn each year is more than you deposit. That is compounding at work: earlier interest starts earning interest of its own.`,
    );
  } else if (inputs.rate > 0 && result.totalInterest > 0) {
    const share = Math.round(
      (result.totalInterest / result.finalBalance) * 100,
    );
    lines.push(
      `Interest makes up ${share}% of your final balance. The longer the money stays put, the larger that share becomes.`,
    );
  }

  if (inputs.years >= 20 && inputs.monthlyDeposit > 0 && inputs.rate > 0) {
    const delayed = calculateSavings({ ...inputs, years: inputs.years - 5 });
    lines.push(
      `Saving for ${inputs.years - 5} years instead of ${inputs.years} would leave you with ${formatCurrency(result.finalBalance - delayed.finalBalance)} less, even though you would deposit only ${formatCurrency(result.totalDeposits - delayed.totalDeposits)} less. The last years are when interest grows fastest.`,
    );
  } else if (inputs.rate > 0) {
    const extra = calculateSavings({
      ...inputs,
      monthlyDeposit: inputs.monthlyDeposit + 100,
    });
    lines.push(
      `Saving $100 more each month would add ${formatCurrency(extra.finalBalance - result.finalBalance)} by the end, of which ${formatCurrency(extra.totalInterest - result.totalInterest)} is extra interest.`,
    );
  }

  return lines;
}
