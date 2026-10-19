import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateDebtPayoff, decodeDebts, encodeDebts, MAX_MONTHS, type Debt } from "./debtPayoff.ts";
import { monthlyPayment } from "./mortgage.ts";

const near = (actual: number, expected: number, tolerance = 0.01) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${expected}, got ${actual}`);

const debts: Debt[] = [
  { name: "Credit card", balance: 6_500, rate: 22.9, minPayment: 165 },
  { name: "Car loan", balance: 12_000, rate: 7.5, minPayment: 300 },
  { name: "Store card", balance: 1_200, rate: 26.99, minPayment: 40 },
];

test("one debt paid at its amortized payment matches the loan formula", () => {
  const pay = monthlyPayment(10_000, 12, 5);
  const r = calculateDebtPayoff([{ name: "Loan", balance: 10_000, rate: 12, minPayment: pay }], 0);
  assert.equal(r.avalanche.months, 60);
  near(r.avalanche.totalInterest, pay * 60 - 10_000, 0.05);
  near(r.avalanche.totalPaid, pay * 60, 0.05);
});

test("zero-interest debts take balance ÷ payment months", () => {
  const r = calculateDebtPayoff([{ name: "A", balance: 1_000, rate: 0, minPayment: 100 }], 0);
  assert.equal(r.snowball.months, 10);
  assert.equal(r.snowball.totalInterest, 0);
});

test("avalanche targets the highest rate, snowball the smallest balance", () => {
  const r = calculateDebtPayoff(debts, 200);
  assert.deepEqual(r.avalanche.order.map((d) => d.name), ["Store card", "Credit card", "Car loan"]);
  assert.deepEqual(r.snowball.order.map((d) => d.name), ["Store card", "Credit card", "Car loan"]);
  // A case where they differ: a big high-rate card and a small low-rate loan.
  const r2 = calculateDebtPayoff(
    [
      { name: "Big card", balance: 8_000, rate: 24, minPayment: 200 },
      { name: "Small loan", balance: 900, rate: 6, minPayment: 50 },
    ],
    150,
  );
  assert.equal(r2.avalanche.order[0].name, "Big card");
  assert.equal(r2.snowball.order[0].name, "Small loan");
  assert.ok(r2.avalanche.totalInterest < r2.snowball.totalInterest);
  // Snowball's first win comes sooner.
  assert.ok(r2.snowball.order[0].paidOffMonth! < r2.avalanche.order[1].paidOffMonth!);
});

test("avalanche never costs more interest than snowball", () => {
  const r = calculateDebtPayoff(debts, 200);
  assert.ok(r.avalanche.totalInterest <= r.snowball.totalInterest + 0.01);
});

test("rollover keeps the monthly outlay fixed until the last month", () => {
  const r = calculateDebtPayoff(debts, 200);
  const budget = 165 + 300 + 40 + 200;
  const months = r.avalanche.months!;
  // Everything paid = budget × (months − 1) + a smaller final payment.
  assert.ok(r.avalanche.totalPaid <= budget * months + 0.01);
  assert.ok(r.avalanche.totalPaid > budget * (months - 1));
  near(r.avalanche.totalPaid, r.totalBalance + r.avalanche.totalInterest, 0.05);
});

test("extra payments beat minimums only", () => {
  const r = calculateDebtPayoff(debts, 200);
  assert.ok(r.avalanche.months! < r.minimumsOnly.months!);
  assert.ok(r.avalanche.totalInterest < r.minimumsOnly.totalInterest);
});

test("a minimum below the interest never pays off", () => {
  const r = calculateDebtPayoff([{ name: "Card", balance: 10_000, rate: 24, minPayment: 150 }], 0);
  assert.equal(r.minimumsOnly.months, null);
  assert.equal(r.minimumsOnly.balances.length, MAX_MONTHS + 1);
});

test("balances series starts at today's total and ends at zero", () => {
  const r = calculateDebtPayoff(debts, 200);
  near(r.avalanche.balances[0], 19_700);
  assert.equal(r.avalanche.balances.at(-1), 0);
  assert.equal(r.avalanche.balances.length, r.avalanche.months! + 1);
});

test("encode and decode round-trip, including awkward names", () => {
  const input: Debt[] = [
    { name: "Visa; 50% off, promo", balance: 1_234.5, rate: 19.99, minPayment: 35 },
    { name: "", balance: 500, rate: 0, minPayment: 25 },
  ];
  assert.deepEqual(decodeDebts(encodeDebts(input)), input);
});

test("decode skips garbage and caps the list", () => {
  assert.deepEqual(decodeDebts("x,abc,1,1;ok,100,5,10"), [{ name: "ok", balance: 100, rate: 5, minPayment: 10 }]);
  const many = Array.from({ length: 15 }, (_, i) => `d${i},100,5,10`).join(";");
  assert.equal(decodeDebts(many).length, 10);
});
