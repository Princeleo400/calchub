// Pure loan math for car, personal and student loans. Builds on the same
// amortization formula as the mortgage calculator.
import { monthlyPayment, type YearRow } from "./mortgage.ts";

export interface LoanInputs {
  amount: number;
  /** Annual interest rate as a percent. */
  rate: number;
  termMonths: number;
  /** Upfront fee as a percent of the amount, deducted from what you receive. */
  feePct: number;
  /** Extra principal paid every month. */
  extraPerMonth: number;
}

export interface LoanResult {
  monthlyPayment: number;
  totalInterest: number;
  fee: number;
  /** Everything paid back: principal + interest + fee. */
  totalCost: number;
  /** Annual percentage rate including the fee. Equals the rate when there is no fee. */
  apr: number;
  payoffMonths: number;
  interestSaved: number;
  monthsSaved: number;
  schedule: YearRow[];
}

function amortize(
  principal: number,
  ratePct: number,
  payment: number,
  extra: number,
  maxMonths: number,
) {
  const monthlyRate = ratePct / 100 / 12;
  let balance = principal;
  let month = 0;
  let totalInterest = 0;
  let yearPrincipal = 0;
  let yearInterest = 0;
  const schedule: YearRow[] = [];

  while (balance > 0.005 && month < maxMonths + 1) {
    month += 1;
    const interest = balance * monthlyRate;
    const principalPaid = Math.min(balance, payment + extra - interest);
    if (principalPaid <= 0) break;
    balance -= principalPaid;
    totalInterest += interest;
    yearPrincipal += principalPaid;
    yearInterest += interest;
    if (month % 12 === 0 || balance <= 0.005) {
      schedule.push({
        year: Math.ceil(month / 12),
        principal: yearPrincipal,
        interest: yearInterest,
        balance: Math.max(0, balance),
      });
      yearPrincipal = 0;
      yearInterest = 0;
    }
  }
  return { months: month, totalInterest, schedule };
}

/**
 * APR: the rate at which the money you actually receive (amount − fee) is
 * repaid by the scheduled payment. Solved by bisection; payment rises with rate.
 */
export function solveApr(
  netReceived: number,
  payment: number,
  termMonths: number,
): number {
  if (netReceived <= 0 || payment <= 0 || termMonths <= 0) return 0;
  if (payment * termMonths <= netReceived) return 0;
  let low = 0;
  let high = 200;
  for (let step = 0; step < 100; step++) {
    const mid = (low + high) / 2;
    if (monthlyPayment(netReceived, mid, termMonths / 12) > payment) high = mid;
    else low = mid;
  }
  return (low + high) / 2;
}

export function calculateLoan(input: LoanInputs): LoanResult {
  const amount = Math.max(0, input.amount);
  const termMonths = Math.max(0, Math.round(input.termMonths));
  const extra = Math.max(0, input.extraPerMonth);
  const fee = (amount * Math.max(0, input.feePct)) / 100;

  const payment = monthlyPayment(amount, input.rate, termMonths / 12);
  const withExtra = amortize(amount, input.rate, payment, extra, termMonths);
  const baseline =
    extra > 0
      ? amortize(amount, input.rate, payment, 0, termMonths)
      : withExtra;

  return {
    monthlyPayment: payment,
    totalInterest: withExtra.totalInterest,
    fee,
    totalCost: amount + withExtra.totalInterest + fee,
    apr:
      fee > 0
        ? solveApr(amount - fee, payment, termMonths)
        : Math.max(0, input.rate),
    payoffMonths: amount > 0 ? withExtra.months : 0,
    interestSaved: Math.max(
      0,
      baseline.totalInterest - withExtra.totalInterest,
    ),
    monthsSaved: Math.max(0, baseline.months - withExtra.months),
    schedule: withExtra.schedule,
  };
}
