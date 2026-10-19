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
  const idx = debts.map((_, i) => i);
  return idx.sort((a, b) => {
    const da = debts[a];
    const db = debts[b];
    if (method === "avalanche") return db.rate - da.rate || da.balance - db.balance || a - b;
    return da.balance - db.balance || db.rate - da.rate || a - b;
  });
}

function simulate(debts: Debt[], extra: number, method: PayoffMethod | "minimums"): PayoffPlan {
  const balances = debts.map((d) => Math.max(0, d.balance));
  const interestPaid = debts.map(() => 0);
  const paidOffMonth: Array<number | null> = debts.map((d) => (d.balance > 0 ? null : 0));
  const order = method === "minimums" ? debts.map((_, i) => i) : targetOrder(debts, method);
  // With rollover, the total paid each month stays fixed at minimums + extra.
  const budget = debts.reduce((sum, d) => sum + Math.max(0, d.minPayment), 0) + Math.max(0, extra);

  const totals: number[] = [balances.reduce((a, b) => a + b, 0)];
  let totalInterest = 0;
  let totalPaid = 0;
  let month = 0;

  while (totals[totals.length - 1] > 0.005 && month < MAX_MONTHS) {
    month += 1;

    // 1. Interest accrues on every open balance.
    for (let i = 0; i < debts.length; i++) {
      if (balances[i] <= 0) continue;
      const interest = balances[i] * (Math.max(0, debts[i].rate) / 100 / 12);
      balances[i] += interest;
      interestPaid[i] += interest;
      totalInterest += interest;
    }

    // 2. Minimum payment on each open debt.
    let available = method === "minimums" ? Infinity : budget;
    for (let i = 0; i < debts.length; i++) {
      if (balances[i] <= 0) continue;
      const pay = Math.min(balances[i], Math.max(0, debts[i].minPayment), available);
      balances[i] -= pay;
      available -= pay;
      totalPaid += pay;
    }

    // 3. Whatever is left goes to the target debts in order.
    if (method !== "minimums") {
      for (const i of order) {
        if (available <= 0.000001) break;
        if (balances[i] <= 0) continue;
        const pay = Math.min(balances[i], available);
        balances[i] -= pay;
        available -= pay;
        totalPaid += pay;
      }
    }

    for (let i = 0; i < debts.length; i++) {
      if (balances[i] <= 0.005) balances[i] = 0;
      if (balances[i] === 0 && paidOffMonth[i] === null) paidOffMonth[i] = month;
    }
    totals.push(balances.reduce((a, b) => a + b, 0));
  }

  const finished = totals[totals.length - 1] <= 0.005;
  return {
    method,
    months: finished ? month : null,
    totalInterest,
    totalPaid,
    order: order.map((i) => ({ name: debts[i].name, paidOffMonth: paidOffMonth[i], interestPaid: interestPaid[i] })),
    balances: totals,
  };
}

export function calculateDebtPayoff(debts: Debt[], extraPerMonth: number): DebtPayoffResult {
  const active = debts.filter((d) => d.balance > 0);
  const extra = Math.max(0, extraPerMonth);
  const totalMinimums = active.reduce((sum, d) => sum + Math.max(0, d.minPayment), 0);
  return {
    totalBalance: active.reduce((sum, d) => sum + d.balance, 0),
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
    .map((d) => [encodeURIComponent(d.name), d.balance, d.rate, d.minPayment].join(","))
    .join(";");
}

export function decodeDebts(value: string, max = 10): Debt[] {
  const out: Debt[] = [];
  for (const part of value.split(";")) {
    const [rawName, balance, rate, min] = part.split(",");
    const nums = [balance, rate, min].map(Number);
    if (nums.some((n) => !Number.isFinite(n) || n < 0)) continue;
    let name = "";
    try {
      name = decodeURIComponent(rawName ?? "").slice(0, 40);
    } catch {
      name = "";
    }
    out.push({ name, balance: nums[0], rate: Math.min(nums[1], 100), minPayment: nums[2] });
    if (out.length >= max) break;
  }
  return out;
}
