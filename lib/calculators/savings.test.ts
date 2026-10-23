import { test } from "node:test";
import assert from "node:assert/strict";
import {
  annualYield,
  calculateSavings,
  monthlyDepositForGoal,
  type SavingsInputs,
} from "./savings.ts";

const near = (actual: number, expected: number, tolerance = 0.01) =>
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `expected ${expected}, got ${actual}`,
  );

const lumpSum: SavingsInputs = {
  initialDeposit: 10_000,
  monthlyDeposit: 0,
  rate: 5,
  compounding: "monthly",
  years: 10,
  annualIncreasePct: 0,
};

test("a lump sum matches the compound interest formula", () => {
  // 10,000 × (1 + 0.05/12)^120
  near(calculateSavings(lumpSum).finalBalance, 16_470.09);
  // 10,000 × 1.05^10
  near(
    calculateSavings({ ...lumpSum, compounding: "annually" }).finalBalance,
    16_288.95,
  );
  // 10,000 × (1 + 0.05/4)^40
  near(
    calculateSavings({ ...lumpSum, compounding: "quarterly" }).finalBalance,
    16_436.19,
  );
  // 10,000 × (1 + 0.05/365)^3650
  near(
    calculateSavings({ ...lumpSum, compounding: "daily" }).finalBalance,
    16_486.65,
  );
});

test("monthly deposits match the future value of an annuity", () => {
  // 200 × ((1.005^360 − 1) / 0.005), deposits at the end of each month
  const result = calculateSavings({
    ...lumpSum,
    initialDeposit: 0,
    monthlyDeposit: 200,
    rate: 6,
    years: 30,
  });
  near(result.finalBalance, 200_903.01);
  near(result.totalDeposits, 72_000);
  near(result.totalInterest, 128_903.01);
});

test("deposits, interest and balance always add up", () => {
  const result = calculateSavings({
    ...lumpSum,
    monthlyDeposit: 300,
    annualIncreasePct: 3,
    years: 25,
  });
  near(result.totalDeposits + result.totalInterest, result.finalBalance);
  const last = result.schedule.at(-1)!;
  near(last.balance, result.finalBalance);
  near(last.totalDeposits, result.totalDeposits);
  assert.equal(result.schedule.length, 25);
});

test("yearly increases raise each year's deposits", () => {
  const result = calculateSavings({
    ...lumpSum,
    initialDeposit: 0,
    monthlyDeposit: 100,
    annualIncreasePct: 10,
    years: 3,
  });
  near(result.schedule[0].deposits, 1_200);
  near(result.schedule[1].deposits, 1_320);
  near(result.schedule[2].deposits, 1_452);
});

test("zero interest just adds up the deposits", () => {
  const result = calculateSavings({
    ...lumpSum,
    monthlyDeposit: 50,
    rate: 0,
    years: 2,
  });
  near(result.finalBalance, 11_200);
  near(result.totalInterest, 0);
  assert.equal(result.crossoverYear, null);
});

test("finds the year interest first beats deposits", () => {
  const result = calculateSavings({
    ...lumpSum,
    initialDeposit: 0,
    monthlyDeposit: 500,
    rate: 7,
    years: 40,
  });
  const year = result.crossoverYear!;
  assert.ok(year > 1 && year < 40);
  const row = result.schedule[year - 1];
  const before = result.schedule[year - 2];
  assert.ok(row.interest > row.deposits);
  assert.ok(before.interest <= before.deposits);
});

test("annual yield (APY) from a nominal rate", () => {
  near(annualYield(5, "monthly"), 5.1162, 0.0001);
  near(annualYield(5, "annually"), 5, 0.0001);
  near(annualYield(5, "daily"), 5.1267, 0.0001);
});

test("goal deposit reaches the goal exactly", () => {
  const goalInputs = {
    initialDeposit: 5_000,
    rate: 4.5,
    compounding: "monthly" as const,
    years: 8,
  };
  const deposit = monthlyDepositForGoal(goalInputs, 60_000);
  const check = calculateSavings({
    ...goalInputs,
    monthlyDeposit: deposit,
    annualIncreasePct: 0,
  });
  near(check.finalBalance, 60_000);
  assert.equal(monthlyDepositForGoal(goalInputs, 1_000), 0);
  near(
    monthlyDepositForGoal({ ...goalInputs, rate: 0, initialDeposit: 0 }, 9_600),
    100,
  );
});

test("bad inputs do not break the result", () => {
  const result = calculateSavings({
    ...lumpSum,
    initialDeposit: -5,
    monthlyDeposit: -10,
    years: 0,
  });
  assert.equal(result.finalBalance, 0);
  assert.equal(result.schedule.length, 0);
});
