import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateAffordability, type AffordabilityInputs } from "./affordability.ts";
import { calculateMortgage } from "./mortgage.ts";

const near = (actual: number, expected: number, tolerance = 0.01) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${expected}, got ${actual}`);

const base: AffordabilityInputs = {
  annualIncome: 70_000,
  monthlyDebts: 0,
  downPaymentPct: 20,
  rate: 7,
  termYears: 30,
  propertyTaxPct: 1.1,
  insurancePerYear: 1_800,
  hoaPerMonth: 0,
  pmiPct: 0.5,
  housingRatioPct: 28,
  totalDtiPct: 36,
};

test("with no other debts, the 28% housing limit applies", () => {
  const r = calculateAffordability(base);
  assert.equal(r.limitedBy, "housing");
  near(r.housingBudget, (70_000 / 12) * 0.28);
});

test("round trip: the mortgage calculator gives back the same payment", () => {
  for (const downPaymentPct of [20, 10, 3.5]) {
    const r = calculateAffordability({ ...base, downPaymentPct, hoaPerMonth: 75 });
    const m = calculateMortgage({
      homePrice: r.maxHomePrice,
      downPaymentPct,
      rate: base.rate,
      termYears: base.termYears,
      propertyTaxPct: base.propertyTaxPct,
      insurancePerYear: base.insurancePerYear,
      hoaPerMonth: 75,
      pmiPct: base.pmiPct,
      extraPerMonth: 0,
    });
    near(m.totalMonthly, r.housingBudget, 0.01);
    near(r.monthlyPayment, r.housingBudget, 0.01);
  }
});

test("other debts can make the 36% total limit the binding one", () => {
  const r = calculateAffordability({ ...base, monthlyDebts: 600 });
  assert.equal(r.limitedBy, "total");
  near(r.housingBudget, (70_000 / 12) * 0.36 - 600);
  assert.ok(r.maxHomePrice < calculateAffordability(base).maxHomePrice);
});

test("more income buys more house; higher rates buy less", () => {
  const a = calculateAffordability(base).maxHomePrice;
  assert.ok(calculateAffordability({ ...base, annualIncome: 100_000 }).maxHomePrice > a);
  assert.ok(calculateAffordability({ ...base, rate: 8 }).maxHomePrice < a);
});

test("budget below fixed costs means nothing is affordable", () => {
  const r = calculateAffordability({ ...base, monthlyDebts: 5_000 });
  assert.equal(r.maxHomePrice, 0);
  assert.equal(r.monthlyPayment, 0);
});
