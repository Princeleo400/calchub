import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateMortgage, formatDuration, monthlyPayment, type MortgageInputs } from "./mortgage.ts";

const near = (actual: number, expected: number, tolerance = 0.01) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${expected}, got ${actual}`);

const base: MortgageInputs = {
  homePrice: 250_000,
  downPaymentPct: 20,
  rate: 6,
  termYears: 30,
  propertyTaxPct: 0,
  insurancePerYear: 0,
  hoaPerMonth: 0,
  pmiPct: 0.5,
  extraPerMonth: 0,
};

// Published reference values for the standard amortization formula.
test("monthly payment matches known examples", () => {
  near(monthlyPayment(200_000, 6, 30), 1199.1); // $200k, 6%, 30y
  near(monthlyPayment(300_000, 7, 30), 1995.91); // $300k, 7%, 30y
  near(monthlyPayment(100_000, 5, 15), 790.79); // $100k, 5%, 15y
});

test("zero interest divides principal evenly", () => {
  near(monthlyPayment(120_000, 0, 10), 1000);
});

test("total interest on $200k at 6% over 30 years", () => {
  const r = calculateMortgage(base);
  near(r.loanAmount, 200_000);
  near(r.totalInterest, 231_676.38, 0.5);
  assert.equal(r.payoffMonths, 360);
  assert.equal(r.schedule.length, 30);
  near(r.schedule.at(-1)!.balance, 0, 0.01);
});

test("schedule principal adds up to the loan", () => {
  const r = calculateMortgage({ ...base, rate: 7.25, termYears: 15 });
  const principal = r.schedule.reduce((sum, y) => sum + y.principal, 0);
  near(principal, r.loanAmount, 0.01);
});

test("no PMI at 20% down", () => {
  const r = calculateMortgage(base);
  assert.equal(r.monthlyPmi, 0);
  assert.equal(r.pmiEndsMonth, null);
});

test("PMI under 20% down, and it ends at 78% of the price", () => {
  const r = calculateMortgage({ ...base, downPaymentPct: 10 });
  near(r.monthlyPmi, (225_000 * 0.005) / 12);
  assert.ok(r.pmiEndsMonth !== null && r.pmiEndsMonth > 0 && r.pmiEndsMonth < 360);
  // The balance at the end month must be at or under 78% of $250k.
  const pi = r.monthlyPrincipalInterest;
  let balance = r.loanAmount;
  for (let m = 1; m <= r.pmiEndsMonth!; m++) balance -= pi - balance * (6 / 100 / 12);
  assert.ok(balance <= 250_000 * 0.78);
});

test("extra payments shorten the loan and save interest", () => {
  const plain = calculateMortgage(base);
  const extra = calculateMortgage({ ...base, extraPerMonth: 200 });
  assert.ok(extra.payoffMonths < plain.payoffMonths);
  assert.equal(extra.monthsSaved, plain.payoffMonths - extra.payoffMonths);
  near(extra.interestSaved, plain.totalInterest - extra.totalInterest, 0.01);
  assert.ok(extra.interestSaved > 0);
});

test("monthly total adds every component", () => {
  const r = calculateMortgage({
    ...base,
    downPaymentPct: 5,
    propertyTaxPct: 1.2,
    insurancePerYear: 1800,
    hoaPerMonth: 50,
    extraPerMonth: 100,
  });
  near(
    r.totalMonthly,
    r.monthlyPrincipalInterest + 100 + 250 + 150 + r.monthlyPmi + 50,
  );
});

test("100% down means no loan", () => {
  const r = calculateMortgage({ ...base, downPaymentPct: 100 });
  assert.equal(r.loanAmount, 0);
  assert.equal(r.monthlyPrincipalInterest, 0);
  assert.equal(r.payoffMonths, 0);
});

test("formatDuration", () => {
  assert.equal(formatDuration(360), "30 years");
  assert.equal(formatDuration(341), "28 years 5 months");
  assert.equal(formatDuration(1), "1 month");
});

test("extra payments don't move PMI's automatic end date", () => {
  const plain = calculateMortgage({ ...base, downPaymentPct: 10 });
  const extra = calculateMortgage({ ...base, downPaymentPct: 10, extraPerMonth: 500 });
  assert.equal(extra.pmiEndsMonth, plain.pmiEndsMonth);
});

test("PMI ends by the loan's midpoint at the latest", () => {
  // 3% down at 9%: the balance falls slowly, so the midpoint rule kicks in first.
  const r = calculateMortgage({ ...base, downPaymentPct: 3, rate: 9 });
  assert.ok(r.pmiEndsMonth !== null && r.pmiEndsMonth <= 180);
});
