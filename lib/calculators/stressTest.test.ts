import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calculateStressTest,
  canadianMonthlyRate,
  canadianPayment,
  canadianPrincipalFor,
  minimumDownPayment,
  premiumRate,
  qualifyingRate,
  type StressTestInputs,
} from "./stressTest.ts";

const near = (actual: number, expected: number, tolerance = 0.01) =>
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `expected ${expected}, got ${actual}`,
  );

test("semi-annual compounding: 5% → (1.025)^(1/6) − 1 a month", () => {
  near(canadianMonthlyRate(5), Math.pow(1.025, 1 / 6) - 1, 1e-12);
  // Lower than the US-style 5% ÷ 12, because interest compounds only twice a year.
  assert.ok(canadianMonthlyRate(5) < 0.05 / 12);
});

test("payment on $100,000 at 5% over 25 years, compounded semi-annually", () => {
  near(canadianPayment(100_000, 5, 25), 581.6, 0.01);
});

test("payment and principal are inverses", () => {
  const pay = canadianPayment(480_000, 4.79, 25);
  near(canadianPrincipalFor(pay, 4.79, 25), 480_000, 0.001);
});

test("qualifying rate is the higher of contract + 2% and 5.25%", () => {
  assert.equal(qualifyingRate(4.5), 6.5);
  assert.equal(qualifyingRate(3), 5.25);
  assert.equal(qualifyingRate(3.25), 5.25);
});

test("minimum down payment tiers", () => {
  assert.equal(minimumDownPayment(400_000), 20_000);
  assert.equal(minimumDownPayment(900_000), 65_000); // 5% of 500k + 10% of 400k
  assert.equal(minimumDownPayment(1_500_000), 300_000);
});

test("CMHC premium tiers and the 30-year surcharge", () => {
  assert.equal(premiumRate(80, false), 0);
  assert.equal(premiumRate(85, false), 2.8);
  assert.equal(premiumRate(90, false), 3.1);
  assert.equal(premiumRate(95, false), 4);
  assert.equal(premiumRate(95, true), 4.2);
  assert.equal(premiumRate(96, false), null);
});

const base: StressTestInputs = {
  price: 600_000,
  downPayment: 120_000,
  contractRate: 4.5,
  amortizationYears: 25,
  annualIncome: 150_000,
  propertyTaxPerYear: 4_800,
  heatingPerMonth: 100,
  condoFeesPerMonth: 0,
  otherDebtsPerMonth: 0,
};

test("ratios use the qualifying rate and CMHC's GDS/TDS formula", () => {
  const result = calculateStressTest(base);
  assert.equal(result.insured, false);
  assert.equal(result.premium, 0);
  near(result.mortgage, 480_000);
  assert.equal(result.qualifyingRate, 6.5);
  const pay = canadianPayment(480_000, 6.5, 25);
  near(result.paymentAtQualifying, pay);
  near(result.gds, ((pay + 400 + 100) / 12_500) * 100, 1e-9);
  assert.ok(result.paymentAtContract < result.paymentAtQualifying);
});

test("condo fees count at 50% and other debts only in TDS", () => {
  const plain = calculateStressTest(base);
  const condo = calculateStressTest({ ...base, condoFeesPerMonth: 600 });
  near(condo.gds - plain.gds, (300 / 12_500) * 100, 1e-9);
  const debts = calculateStressTest({ ...base, otherDebtsPerMonth: 500 });
  near(debts.gds, plain.gds, 1e-9);
  near(debts.tds - plain.tds, (500 / 12_500) * 100, 1e-9);
});

test("insured purchase adds the premium to the mortgage", () => {
  const result = calculateStressTest({
    ...base,
    price: 500_000,
    downPayment: 50_000,
  });
  assert.equal(result.insured, true);
  assert.equal(result.premiumRatePct, 3.1);
  near(result.premium, 450_000 * 0.031);
  near(result.mortgage, 450_000 * 1.031);
});

test("down payment below the minimum is flagged", () => {
  const result = calculateStressTest({
    ...base,
    price: 900_000,
    downPayment: 45_000,
  });
  assert.equal(result.problem, "downTooLow");
  assert.equal(result.passes, false);
});

test("max mortgage sits exactly at the binding limit", () => {
  // A large down payment keeps the purchase uninsured, so no premium is added.
  const big = { ...base, downPayment: 400_000 };
  const result = calculateStressTest(big);
  const atMax = calculateStressTest({
    ...big,
    price: result.maxMortgage + big.downPayment,
  });
  assert.equal(atMax.insured, false);
  // At the maximum, one of the ratios equals its limit and both pass.
  assert.ok(Math.abs(atMax.gds - 39) < 0.01 || Math.abs(atMax.tds - 44) < 0.01);
  assert.ok(atMax.passes);
});

test("not enough income fails", () => {
  const result = calculateStressTest({ ...base, annualIncome: 80_000 });
  assert.equal(result.passes, false);
  assert.equal(result.passesGds, false);
});

test("max price passes, and a little more fails", () => {
  for (const downPayment of [30_000, 120_000, 400_000]) {
    const result = calculateStressTest({ ...base, downPayment });
    assert.ok(result.maxPrice > downPayment);
    assert.ok(
      calculateStressTest({ ...base, downPayment, price: result.maxPrice })
        .passes,
    );
    assert.equal(
      calculateStressTest({
        ...base,
        downPayment,
        price: result.maxPrice + 100,
      }).passes,
      false,
    );
  }
});

test("a small down payment caps the price via the minimum down payment rule", () => {
  // $30,000 down: 5% of the first $500,000 ($25,000) + 10% of the rest,
  // so $30,000 covers up to $550,000 (and this income would allow more).
  const result = calculateStressTest({
    ...base,
    annualIncome: 400_000,
    downPayment: 30_000,
  });
  near(result.maxPrice, 550_000, 1);
});
