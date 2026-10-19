import {
  calculateLoan,
  type LoanInputs,
  type LoanResult,
} from "@/lib/calculators/loan";
import { formatDuration } from "@/lib/calculators/mortgage";
import { formatCurrency, formatPercent } from "@/lib/utils";

/** Two or three plain-English sentences about a loan result. */
export function loanInsight(inputs: LoanInputs, r: LoanResult): string[] {
  if (inputs.amount <= 0 || inputs.termMonths <= 0) {
    return ["Enter a loan amount and term to see your payment."];
  }

  const lines: string[] = [];
  const perDollar = r.totalInterest / inputs.amount;

  lines.push(
    `You would repay ${formatCurrency(r.totalCost)} in total: the ${formatCurrency(inputs.amount)} you borrow plus ${formatCurrency(r.totalInterest)} in interest${r.fee > 0 ? ` and a ${formatCurrency(r.fee)} fee` : ""}. That is about ${Math.round(perDollar * 100)} cents of interest for every dollar borrowed.`,
  );

  if (r.fee > 0) {
    lines.push(
      `The fee comes out of the money you receive, so you get ${formatCurrency(inputs.amount - r.fee)} in hand. That makes the true cost, the APR, ${formatPercent(r.apr, 2)} rather than ${formatPercent(inputs.rate, 2)}. Compare APRs when you shop, not interest rates.`,
    );
  }

  if (inputs.extraPerMonth > 0 && r.monthsSaved > 0) {
    lines.push(
      `Your extra ${formatCurrency(inputs.extraPerMonth)} a month clears the loan ${formatDuration(r.monthsSaved)} early and saves ${formatCurrency(r.interestSaved)} in interest.`,
    );
  } else if (inputs.termMonths > 24) {
    const shorter = calculateLoan({
      ...inputs,
      termMonths: inputs.termMonths - 12,
      extraPerMonth: 0,
    });
    lines.push(
      `A term one year shorter would raise the payment by ${formatCurrency(shorter.monthlyPayment - r.monthlyPayment)} a month but save ${formatCurrency(r.totalInterest - shorter.totalInterest)} in interest.`,
    );
  }

  return lines;
}
