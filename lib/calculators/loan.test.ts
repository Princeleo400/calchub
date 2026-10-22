import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateLoan, solveApr, type LoanInputs } from "./loan.ts";
import { monthlyPayment } from "./mortgage.ts";

const near = (actual: number, expected: number, tolerance = 0.01) =>
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `expected ${expected}, got ${actual}`,
  );

const base: LoanInputs = {
  amount: 25_000,
  rate: 7,
  termMonths: 60,
  feePct: 0,
  extraPerMonth: 0,
};

test("payments match known examples", () => {
  near(calculateLoan(base).monthlyPayment, 495.03); // $25k, 7%, 60 months
  near(
    calculateLoan({ ...base, amount: 10_000, rate: 5, termMonths: 36 })
      .monthlyPayment,
    299.71,
  );
});

test("total interest and cost", () => {
  const result = calculateLoan(base);
  near(result.totalInterest, 495.0301 * 60 - 25_000, 0.5);
  near(result.totalCost, 25_000 + result.totalInterest);
  assert.equal(result.payoffMonths, 60);
  assert.equal(result.schedule.length, 5);
});

test("short loans still get a schedule row", () => {
  const result = calculateLoan({ ...base, termMonths: 9 });
  assert.equal(result.schedule.length, 1);
  near(result.schedule[0].balance, 0);
});

test("APR equals the rate with no fee", () => {
  assert.equal(calculateLoan(base).apr, 7);
});

test("a fee raises the APR above the rate", () => {
  const result = calculateLoan({
    ...base,
    amount: 10_000,
    rate: 10,
    termMonths: 36,
    feePct: 5,
  });
  near(result.fee, 500);
  assert.ok(result.apr > 10);
  // At the APR, the money actually received is repaid by the same payment.
  near(monthlyPayment(9_500, result.apr, 3), result.monthlyPayment, 0.001);
});

test("solveApr handles a zero-interest, zero-fee case", () => {
  assert.equal(solveApr(1_000, 100, 10), 0);
});

test("extra payments save interest and months", () => {
  const plain = calculateLoan(base);
  const extra = calculateLoan({ ...base, extraPerMonth: 100 });
  assert.ok(extra.payoffMonths < plain.payoffMonths);
  assert.equal(extra.monthsSaved, plain.payoffMonths - extra.payoffMonths);
  assert.ok(extra.interestSaved > 0);
});
