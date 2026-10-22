import {
  calculateLoan,
  type LoanInputs,
  type LoanResult,
} from "@/lib/calculators/loan";
import { formatDuration } from "@/lib/calculators/mortgage";
import { formatCurrency, formatPercent } from "@/lib/utils";

/** Two or three plain-English sentences about a loan result. */
export function loanInsight(inputs: LoanInputs, result: LoanResult): string[] {
  if (inputs.amount <= 0 || inputs.termMonths <= 0) {
    return ["Enter a loan amount and term to see your payment."];
  }

  const lines: string[] = [];
  const perDollar = result.totalInterest / inputs.amount;

  lines.push(
    `You would repay ${formatCurrency(result.totalCost)} in total: the ${formatCurrency(inputs.amount)} you borrow plus ${formatCurrency(result.totalInterest)} in interest${result.fee > 0 ? ` and a ${formatCurrency(result.fee)} fee` : ""}. That is about ${Math.round(perDollar * 100)} cents of interest for every dollar borrowed.`,
  );

  if (result.fee > 0) {
    lines.push(
      `The fee comes out of the money you receive, so you get ${formatCurrency(inputs.amount - result.fee)} in hand. That makes the true cost, the APR, ${formatPercent(result.apr, 2)} rather than ${formatPercent(inputs.rate, 2)}. Compare APRs when you shop, not interest rates.`,
    );
  }

  if (inputs.extraPerMonth > 0 && result.monthsSaved > 0) {
    lines.push(
      `Your extra ${formatCurrency(inputs.extraPerMonth)} a month clears the loan ${formatDuration(result.monthsSaved)} early and saves ${formatCurrency(result.interestSaved)} in interest.`,
    );
  } else if (inputs.termMonths > 24) {
    const shorter = calculateLoan({
      ...inputs,
      termMonths: inputs.termMonths - 12,
      extraPerMonth: 0,
    });
    lines.push(
      `A term one year shorter would raise the payment by ${formatCurrency(shorter.monthlyPayment - result.monthlyPayment)} a month but save ${formatCurrency(result.totalInterest - shorter.totalInterest)} in interest.`,
    );
  }

  return lines;
}
