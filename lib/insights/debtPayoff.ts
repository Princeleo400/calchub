import type { DebtPayoffResult, PayoffMethod, PayoffPlan } from "@/lib/calculators/debtPayoff";
import { formatDuration } from "@/lib/calculators/mortgage";
import { formatCurrency } from "@/lib/utils";

function firstWin(plan: PayoffPlan): { name: string; month: number } | null {
  let best: { name: string; month: number } | null = null;
  for (const d of plan.order) {
    if (d.paidOffMonth !== null && d.paidOffMonth > 0 && (!best || d.paidOffMonth < best.month)) {
      best = { name: d.name || "your first debt", month: d.paidOffMonth };
    }
  }
  return best;
}

/** Plain-English summary of a debt payoff plan and how the methods compare. */
export function debtPayoffInsight(r: DebtPayoffResult, method: PayoffMethod, extra: number): string[] {
  if (r.totalBalance <= 0) return ["Add at least one debt with a balance to see your payoff plan."];

  const plan = method === "avalanche" ? r.avalanche : r.snowball;
  const lines: string[] = [];

  // 1. The plan itself.
  if (plan.months === null) {
    lines.push(
      `At ${formatCurrency(r.monthlyBudget)} a month your balances never reach zero, because the payments don't cover the interest being added. Raise the extra payment or the minimums to make progress.`,
    );
    return lines;
  }
  lines.push(
    `Paying ${formatCurrency(r.monthlyBudget)} a month (${formatCurrency(r.totalMinimums)} in minimums${extra > 0 ? ` plus ${formatCurrency(extra)} extra` : ""}), you would be debt-free in ${formatDuration(plan.months)} and pay ${formatCurrency(plan.totalInterest)} in interest.`,
  );

  // 2. Avalanche vs snowball.
  const sameOrder = r.avalanche.order.map((d) => d.name).join("|") === r.snowball.order.map((d) => d.name).join("|");
  const saving = r.snowball.totalInterest - r.avalanche.totalInterest;
  if (sameOrder || Math.abs(saving) < 1) {
    lines.push(
      "Here the avalanche and snowball methods give the same result, because they pay your debts off in the same order.",
    );
  } else {
    const winS = firstWin(r.snowball);
    const winA = firstWin(r.avalanche);
    const sooner =
      r.avalanche.months !== null && r.snowball.months !== null && r.snowball.months > r.avalanche.months
        ? `, and finishes ${formatDuration(r.snowball.months - r.avalanche.months)} sooner`
        : "";
    let line = `The avalanche method saves ${formatCurrency(saving)} in interest compared with the snowball${sooner}.`;
    if (winS && winA && winS.month < winA.month) {
      line += ` The snowball clears its first debt, ${winS.name}, in ${formatDuration(winS.month)} instead of ${formatDuration(winA.month)}, which some people find keeps them going.`;
    }
    lines.push(line);
  }

  // 3. Compared with paying only the minimums.
  if (r.minimumsOnly.months === null) {
    lines.push(
      "Paying only the minimums, without moving freed-up payments to other debts, would never clear these balances.",
    );
  } else if (r.minimumsOnly.months > plan.months) {
    lines.push(
      `Paying only the minimums, without rolling freed-up payments into the next debt, would take ${formatDuration(r.minimumsOnly.months)} and cost ${formatCurrency(r.minimumsOnly.totalInterest - plan.totalInterest)} more in interest.`,
    );
  }

  return lines;
}
