import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calculatePaye,
  NIGERIA_TAX_ACT_2025,
  oldRulesTax,
  taxByBands,
  type PayeInputs,
} from "./nigeriaPaye.ts";

const near = (actual: number, expected: number, tolerance = 0.01) =>
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `expected ${expected}, got ${actual}`,
  );

const noExtras: PayeInputs = {
  monthlyGross: 500_000,
  monthlyBasic: 0,
  monthlyHousing: 0,
  monthlyTransport: 0,
  contributesPension: false,
  contributesNhf: false,
  annualHealthInsurance: 0,
  annualRent: 0,
  annualLifeInsurance: 0,
  annualMortgageInterest: 0,
};

const bandTax = (amount: number) =>
  taxByBands(amount, NIGERIA_TAX_ACT_2025.bands).reduce(
    (total, row) => total + row.tax,
    0,
  );

test("band tax matches published worked examples", () => {
  // Adeola Oyinlade & Co: ₦6m chargeable → ₦870,000; ₦60m → ₦12,930,000.
  near(bandTax(6_000_000), 870_000);
  near(bandTax(60_000_000), 12_930_000);
  near(bandTax(800_000), 0);
  near(bandTax(3_000_000), 330_000);
});

test("full PAYE example with pension and rent relief", () => {
  // AnooreHR: ₦6m gross, ₦5.4m pensionable, ₦1.2m rent → ₦749,040 PAYE.
  const result = calculatePaye({
    ...noExtras,
    monthlyGross: 500_000,
    monthlyBasic: 300_000,
    monthlyHousing: 100_000,
    monthlyTransport: 50_000,
    contributesPension: true,
    annualRent: 1_200_000,
  });
  near(result.pension, 432_000);
  near(result.rentRelief, 240_000);
  near(result.chargeableIncome, 5_328_000);
  near(result.annualTax, 749_040);
  near(result.monthlyTax, 62_420);
  near(result.monthlyTakeHome * 12, 4_818_960);
  assert.equal(result.marginalRate, 18);
});

test("rent relief is capped at ₦500,000", () => {
  const result = calculatePaye({ ...noExtras, annualRent: 3_000_000 });
  near(result.rentRelief, 500_000);
});

test("NHF is 2.5% of basic salary when contributed", () => {
  const result = calculatePaye({
    ...noExtras,
    monthlyBasic: 200_000,
    contributesNhf: true,
  });
  near(result.nhf, 60_000); // 2.5% × ₦2.4m
});

test("minimum wage earners pay no tax", () => {
  // ₦70,000 a month is ₦840,000 a year, above the ₦800,000 0% band,
  // but the Act excludes minimum wage earners.
  const result = calculatePaye({ ...noExtras, monthlyGross: 70_000 });
  assert.equal(result.minimumWageExempt, true);
  assert.equal(result.annualTax, 0);
  const justAbove = calculatePaye({ ...noExtras, monthlyGross: 70_001 });
  assert.equal(justAbove.minimumWageExempt, false);
  assert.ok(justAbove.annualTax > 0);
});

test("old rules match a hand-worked example", () => {
  // ₦6m gross, nothing exempt: CRA = ₦200,000 + ₦1.2m = ₦1.4m; taxable ₦4.6m.
  // 21,000 + 33,000 + 75,000 + 95,000 + 336,000 + 24% × 1.4m (336,000)
  near(oldRulesTax(6_000_000, 0, false), 896_000);
  // 1% of gross beats ₦200,000 above ₦20m gross.
  const highEarner = oldRulesTax(30_000_000, 0, false);
  const taxable = 30_000_000 - (300_000 + 6_000_000);
  const expected = 560_000 + (taxable - 3_200_000) * 0.24;
  near(highEarner, expected);
});

test("comparison is skipped when life insurance or mortgage is claimed", () => {
  assert.notEqual(calculatePaye(noExtras).oldRulesAnnualTax, null);
  assert.equal(
    calculatePaye({ ...noExtras, annualLifeInsurance: 100_000 })
      .oldRulesAnnualTax,
    null,
  );
});

test("salary parts above gross are flagged and capped", () => {
  const result = calculatePaye({
    ...noExtras,
    monthlyGross: 300_000,
    monthlyBasic: 400_000,
    contributesPension: true,
  });
  assert.equal(result.componentsExceedGross, true);
  near(result.pension, 288_000); // 8% of ₦300,000 × 12, not of ₦400,000
});

test("zero and bad inputs do not break the result", () => {
  const result = calculatePaye({ ...noExtras, monthlyGross: -5 });
  assert.equal(result.annualTax, 0);
  assert.equal(result.effectiveRate, 0);
  assert.equal(result.minimumWageExempt, false);
});
