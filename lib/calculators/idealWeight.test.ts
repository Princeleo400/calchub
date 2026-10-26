import { test } from "node:test";
import assert from "node:assert/strict";
import { CM_PER_IN, KG_PER_LB } from "./bmi.ts";
import {
  calculateIdealWeight,
  IDEAL_WEIGHT_FORMULAS,
  idealWeightKg,
} from "./idealWeight.ts";

const near = (actual: number, expected: number, tolerance = 0.01) =>
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `expected ${expected}, got ${actual}`,
  );

const formula = (id: string) =>
  IDEAL_WEIGHT_FORMULAS.find((candidate) => candidate.id === id)!;
const inchesToCm = (inches: number) => inches * CM_PER_IN;

test("each formula at exactly 5 feet gives its base weight", () => {
  const fiveFeet = inchesToCm(60);
  near(idealWeightKg(formula("devine"), "male", fiveFeet), 50);
  near(idealWeightKg(formula("devine"), "female", fiveFeet), 45.5);
  near(idealWeightKg(formula("robinson"), "female", fiveFeet), 49);
  near(idealWeightKg(formula("miller"), "male", fiveFeet), 56.2);
  near(idealWeightKg(formula("hamwi"), "female", fiveFeet), 100 * KG_PER_LB);
});

test("worked examples per formula", () => {
  // Man, 5 ft 10 in (10 inches over 5 ft)
  const man = inchesToCm(70);
  near(idealWeightKg(formula("devine"), "male", man), 73); // 50 + 23
  near(idealWeightKg(formula("robinson"), "male", man), 71); // 52 + 19
  near(idealWeightKg(formula("miller"), "male", man), 70.3); // 56.2 + 14.1
  near(idealWeightKg(formula("hamwi"), "male", man) / KG_PER_LB, 166); // 106 + 60 lb
  // Woman, 5 ft 5 in (5 inches over 5 ft)
  const woman = inchesToCm(65);
  near(idealWeightKg(formula("devine"), "female", woman), 57); // 45.5 + 11.5
  near(idealWeightKg(formula("robinson"), "female", woman), 57.5); // 49 + 8.5
  near(idealWeightKg(formula("miller"), "female", woman), 59.9); // 53.1 + 6.8
  near(idealWeightKg(formula("hamwi"), "female", woman) / KG_PER_LB, 125); // 100 + 25 lb
});

test("average, lowest and highest across formulas", () => {
  const result = calculateIdealWeight({
    sex: "male",
    heightCm: inchesToCm(70),
  });
  const hamwi = 166 * KG_PER_LB;
  near(result.averageKg, (73 + 71 + 70.3 + hamwi) / 4);
  near(result.lowestKg, 70.3);
  near(result.highestKg, hamwi);
  assert.equal(result.belowFiveFeet, false);
});

test("healthy BMI range comes from height", () => {
  const result = calculateIdealWeight({ sex: "female", heightCm: 165 });
  near(result.healthyMinKg, 18.5 * 1.65 * 1.65);
  near(result.healthyMaxKg, 24.9 * 1.65 * 1.65);
});

test("below 5 feet the per-inch amount is subtracted", () => {
  const result = calculateIdealWeight({
    sex: "female",
    heightCm: inchesToCm(58),
  });
  near(result.estimates[0].weightKg, 45.5 - 2 * 2.3); // Devine
  assert.equal(result.belowFiveFeet, true);
});

test("bad inputs do not break the result", () => {
  const result = calculateIdealWeight({ sex: "male", heightCm: -10 });
  assert.ok(result.estimates.every((estimate) => estimate.weightKg >= 0));
  assert.equal(result.belowFiveFeet, false);
});
