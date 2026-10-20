import { test } from "node:test";
import assert from "node:assert/strict";
import {
  bmiCategory,
  bmiFromImperial,
  bmiFromMetric,
  calculateBmi,
  healthyWeightRangeKg,
  KG_PER_LB,
  toFeetInches,
} from "./bmi.ts";

const near = (actual: number, expected: number, tolerance = 0.01) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${expected}, got ${actual}`);

test("metric BMI: 70 kg at 175 cm is 22.9", () => {
  near(bmiFromMetric(70, 175), 22.857, 0.001);
});

test("imperial BMI matches the 703 rule of thumb", () => {
  // 5 ft 9 in (69 in), 160 lb: 703 × 160 / 69² = 23.62
  near(bmiFromImperial(160, 69), (703 * 160) / (69 * 69), 0.01);
});

test("CDC category boundaries", () => {
  assert.equal(bmiCategory(18.4).id, "underweight");
  assert.equal(bmiCategory(18.5).id, "healthy");
  assert.equal(bmiCategory(24.9).id, "healthy");
  assert.equal(bmiCategory(25).id, "overweight");
  assert.equal(bmiCategory(29.9).id, "overweight");
  assert.equal(bmiCategory(30).id, "obesity1");
  assert.equal(bmiCategory(35).id, "obesity2");
  assert.equal(bmiCategory(40).id, "obesity3");
  assert.equal(bmiCategory(55).id, "obesity3");
});

test("category follows the displayed value", () => {
  // 24.96 shows as 25.0, so it must read "Overweight", not "Healthy weight".
  assert.equal(bmiCategory(24.96).id, "overweight");
  assert.equal(bmiCategory(24.94).id, "healthy");
});

test("healthy weight range for 175 cm", () => {
  const r = healthyWeightRangeKg(175);
  near(r.min, 56.66, 0.01);
  near(r.max, 76.26, 0.01);
});

test("distance to the healthy range", () => {
  const over = calculateBmi(90, 175);
  near(over.aboveRangeKg, 90 - 76.26, 0.01);
  assert.equal(over.belowRangeKg, 0);
  const inside = calculateBmi(70, 175);
  assert.equal(inside.aboveRangeKg, 0);
  assert.equal(inside.belowRangeKg, 0);
});

test("invalid input gives 0", () => {
  assert.equal(bmiFromMetric(70, 0), 0);
  assert.equal(bmiFromMetric(0, 175), 0);
});

test("feet and inches", () => {
  assert.deepEqual(toFeetInches(69), { feet: 5, inches: 9 });
  assert.deepEqual(toFeetInches(71.98), { feet: 6, inches: 0 });
  near(KG_PER_LB * 2.2046226, 1, 0.000001);
});
