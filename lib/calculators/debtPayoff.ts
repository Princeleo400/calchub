// Pure debt payoff math: month-by-month simulation of the snowball and
// avalanche methods with "rollover" (a paid-off debt's minimum moves to the next).

export type PayoffMethod = "avalanche" | "snowball";

export interface Debt {
  name: string;
  balance: number;
  /** APR as a percent, e.g. 22.9. */
  rate: number;
  /** Fixed minimum monthly payment. */
  minPayment: number;
}

export interface DebtPayoffInfo {
  name: string;
  /** Month this debt reaches zero, or null if it never does within the cap. */
  paidOffMonth: number | null;
  interestPaid: number;
}

export interface PayoffPlan {
  method: PayoffMethod | "minimums";
  /** Months until every debt is paid, or null if the plan never finishes. */
  months: number | null;
  totalInterest: number;
  totalPaid: number;
  /** Debts in the order the plan targets them. */
  order: DebtPayoffInfo[];
  /** Total balance after each month, starting with month 0 (today). */
  balances: number[];
}

export interface DebtPayoffResult {
  totalBalance: number;
  totalMinimums: number;
  monthlyBudget: number;
  avalanche: PayoffPlan;
  snowball: PayoffPlan;
  /** Minimum payments only, no extra and no rollover. */
  minimumsOnly: PayoffPlan;
}

/** 50 years. Plans that run longer are treated as never paying off. */
export const MAX_MONTHS = 600;

function targetOrder(debts: Debt[], method: PayoffMethod): number[] {
  const idx = debts.map((_debt, index) => index);
  return idx.sort((firstIndex, secondIndex) => {
    const firstDebt = debts[firstIndex];
    const secondDebt = debts[secondIndex];
    if (method === "avalanche")
      return (
        secondDebt.rate - firstDebt.rate ||
        firstDebt.balance - secondDebt.balance ||
        firstIndex - secondIndex
      );
    return (
      firstDebt.balance - secondDebt.balance ||
      secondDebt.rate - firstDebt.rate ||
      firstIndex - secondIndex
    );
  });
}

function simulate(
  debts: Debt[],
  extra: number,
  method: PayoffMethod | "minimums",
): PayoffPlan {
  const balances = debts.map((debt) => Math.max(0, debt.balance));
  const interestPaid = debts.map(() => 0);
  const paidOffMonth: Array<number | null> = debts.map((debt) =>
    debt.balance > 0 ? null : 0,
  );
  const order =
    method === "minimums"
      ? debts.map((_debt, index) => index)
      : targetOrder(debts, method);
  // With rollover, the total paid each month stays fixed at minimums + extra.
  const budget =
    debts.reduce((sum, debt) => sum + Math.max(0, debt.minPayment), 0) +
    Math.max(0, extra);

  const totals: number[] = [
    balances.reduce((total, balance) => total + balance, 0),
  ];
  let totalInterest = 0;
  let totalPaid = 0;
  let month = 0;

  while (totals[totals.length - 1] > 0.005 && month < MAX_MONTHS) {
    month += 1;

    // 1. Interest accrues on every open balance.
    for (let index = 0; index < debts.length; index++) {
      if (balances[index] <= 0) continue;
      const interest =
        balances[index] * (Math.max(0, debts[index].rate) / 100 / 12);
      balances[index] += interest;
      interestPaid[index] += interest;
      totalInterest += interest;
    }

    // 2. Minimum payment on each open debt.
    let available = method === "minimums" ? Infinity : budget;
    for (let index = 0; index < debts.length; index++) {
      if (balances[index] <= 0) continue;
      const pay = Math.min(
        balances[index],
        Math.max(0, debts[index].minPayment),
        available,
      );
      balances[index] -= pay;
      available -= pay;
      totalPaid += pay;
    }

    // 3. Whatever is left goes to the target debts in order.
    if (method !== "minimums") {
      for (const index of order) {
        if (available <= 0.000001) break;
        if (balances[index] <= 0) continue;
        const pay = Math.min(balances[index], available);
        balances[index] -= pay;
        available -= pay;
        totalPaid += pay;
      }
    }

    for (let index = 0; index < debts.length; index++) {
      if (balances[index] <= 0.005) balances[index] = 0;
      if (balances[index] === 0 && paidOffMonth[index] === null)
        paidOffMonth[index] = month;
    }
    totals.push(balances.reduce((total, balance) => total + balance, 0));
  }

  const finished = totals[totals.length - 1] <= 0.005;
  return {
    method,
    months: finished ? month : null,
    totalInterest,
    totalPaid,
    order: order.map((index) => ({
      name: debts[index].name,
      paidOffMonth: paidOffMonth[index],
      interestPaid: interestPaid[index],
    })),
    balances: totals,
  };
}

export function calculateDebtPayoff(
  debts: Debt[],
  extraPerMonth: number,
): DebtPayoffResult {
  const active = debts.filter((debt) => debt.balance > 0);
  const extra = Math.max(0, extraPerMonth);
  const totalMinimums = active.reduce(
    (sum, debt) => sum + Math.max(0, debt.minPayment),
    0,
  );
  return {
    totalBalance: active.reduce((sum, debt) => sum + debt.balance, 0),
    totalMinimums,
    monthlyBudget: totalMinimums + extra,
    avalanche: simulate(active, extra, "avalanche"),
    snowball: simulate(active, extra, "snowball"),
    minimumsOnly: simulate(active, 0, "minimums"),
  };
}

// --- URL encoding ----------------------------------------------------------
// Debts travel in one query value: "name,balance,rate,min;name,balance,rate,min".
// Names are percent-encoded so commas and semicolons inside them are safe.

export function encodeDebts(debts: Debt[]): string {
  return debts
    .map((debt) =>
      [
        encodeURIComponent(debt.name),
        debt.balance,
        debt.rate,
        debt.minPayment,
      ].join(","),
    )
    .join(";");
}

export function decodeDebts(value: string, max = 10): Debt[] {
  const out: Debt[] = [];
  for (const part of value.split(";")) {
    const [rawName, balance, rate, min] = part.split(",");
    const nums = [balance, rate, min].map(Number);
    if (nums.some((value) => !Number.isFinite(value) || value < 0)) continue;
    let name = "";
    try {
      name = decodeURIComponent(rawName ?? "").slice(0, 40);
    } catch {
      name = "";
    }
    out.push({
      name,
      balance: nums[0],
      rate: Math.min(nums[1], 100),
      minPayment: nums[2],
    });
    if (out.length >= max) break;
  }
  return out;
}
