import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calculateDebtPayoff,
  decodeDebts,
  encodeDebts,
  MAX_MONTHS,
  type Debt,
} from "./debtPayoff.ts";
import { monthlyPayment } from "./mortgage.ts";

const near = (actual: number, expected: number, tolerance = 0.01) =>
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `expected ${expected}, got ${actual}`,
  );

const debts: Debt[] = [
  { name: "Credit card", balance: 6_500, rate: 22.9, minPayment: 165 },
  { name: "Car loan", balance: 12_000, rate: 7.5, minPayment: 300 },
  { name: "Store card", balance: 1_200, rate: 26.99, minPayment: 40 },
];

test("one debt paid at its amortized payment matches the loan formula", () => {
  const pay = monthlyPayment(10_000, 12, 5);
  const result = calculateDebtPayoff(
    [{ name: "Loan", balance: 10_000, rate: 12, minPayment: pay }],
    0,
  );
  assert.equal(result.avalanche.months, 60);
  near(result.avalanche.totalInterest, pay * 60 - 10_000, 0.05);
  near(result.avalanche.totalPaid, pay * 60, 0.05);
});

test("zero-interest debts take balance ÷ payment months", () => {
  const result = calculateDebtPayoff(
    [{ name: "A", balance: 1_000, rate: 0, minPayment: 100 }],
    0,
  );
  assert.equal(result.snowball.months, 10);
  assert.equal(result.snowball.totalInterest, 0);
});

test("avalanche targets the highest rate, snowball the smallest balance", () => {
  const result = calculateDebtPayoff(debts, 200);
  assert.deepEqual(
    result.avalanche.order.map((debt) => debt.name),
    ["Store card", "Credit card", "Car loan"],
  );
  assert.deepEqual(
    result.snowball.order.map((debt) => debt.name),
    ["Store card", "Credit card", "Car loan"],
  );
  // A case where they differ: a big high-rate card and a small low-rate loan.
  const differentOrder = calculateDebtPayoff(
    [
      { name: "Big card", balance: 8_000, rate: 24, minPayment: 200 },
      { name: "Small loan", balance: 900, rate: 6, minPayment: 50 },
    ],
    150,
  );
  assert.equal(differentOrder.avalanche.order[0].name, "Big card");
  assert.equal(differentOrder.snowball.order[0].name, "Small loan");
  assert.ok(
    differentOrder.avalanche.totalInterest <
      differentOrder.snowball.totalInterest,
  );
  // Snowball's first win comes sooner.
  assert.ok(
    differentOrder.snowball.order[0].paidOffMonth! <
      differentOrder.avalanche.order[1].paidOffMonth!,
  );
});

test("avalanche never costs more interest than snowball", () => {
  const result = calculateDebtPayoff(debts, 200);
  assert.ok(
    result.avalanche.totalInterest <= result.snowball.totalInterest + 0.01,
  );
});

test("rollover keeps the monthly outlay fixed until the last month", () => {
  const result = calculateDebtPayoff(debts, 200);
  const budget = 165 + 300 + 40 + 200;
  const months = result.avalanche.months!;
  // Everything paid = budget × (months − 1) + a smaller final payment.
  assert.ok(result.avalanche.totalPaid <= budget * months + 0.01);
  assert.ok(result.avalanche.totalPaid > budget * (months - 1));
  near(
    result.avalanche.totalPaid,
    result.totalBalance + result.avalanche.totalInterest,
    0.05,
  );
});

test("extra payments beat minimums only", () => {
  const result = calculateDebtPayoff(debts, 200);
  assert.ok(result.avalanche.months! < result.minimumsOnly.months!);
  assert.ok(result.avalanche.totalInterest < result.minimumsOnly.totalInterest);
});

test("a minimum below the interest never pays off", () => {
  const result = calculateDebtPayoff(
    [{ name: "Card", balance: 10_000, rate: 24, minPayment: 150 }],
    0,
  );
  assert.equal(result.minimumsOnly.months, null);
  assert.equal(result.minimumsOnly.balances.length, MAX_MONTHS + 1);
});

test("balances series starts at today's total and ends at zero", () => {
  const result = calculateDebtPayoff(debts, 200);
  near(result.avalanche.balances[0], 19_700);
  assert.equal(result.avalanche.balances.at(-1), 0);
  assert.equal(result.avalanche.balances.length, result.avalanche.months! + 1);
});

test("encode and decode round-trip, including awkward names", () => {
  const input: Debt[] = [
    {
      name: "Visa; 50% off, promo",
      balance: 1_234.5,
      rate: 19.99,
      minPayment: 35,
    },
    { name: "", balance: 500, rate: 0, minPayment: 25 },
  ];
  assert.deepEqual(decodeDebts(encodeDebts(input)), input);
});

test("decode skips garbage and caps the list", () => {
  assert.deepEqual(decodeDebts("x,abc,1,1;ok,100,5,10"), [
    { name: "ok", balance: 100, rate: 5, minPayment: 10 },
  ]);
  const many = Array.from(
    { length: 15 },
    (_value, index) => `d${index},100,5,10`,
  ).join(";");
  assert.equal(decodeDebts(many).length, 10);
});
