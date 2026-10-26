import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calculateMacros,
  DIET_STYLES,
  getDietStyle,
  isWithinAdultRanges,
  type MacroInputs,
} from "./macro.ts";

const near = (actual: number, expected: number, tolerance = 0.01) =>
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `expected ${expected}, got ${actual}`,
  );

const balanced: MacroInputs = {
  calories: 2000,
  split: { protein: 20, carbs: 50, fat: 30 },
  weightKg: 70,
  mealsPerDay: 3,
};

test("grams use 4 calories per gram for protein and carbs, 9 for fat", () => {
  const { amounts } = calculateMacros(balanced);
  near(amounts.protein.grams, 100); // 400 cal ÷ 4
  near(amounts.carbs.grams, 250); // 1,000 cal ÷ 4
  near(amounts.fat.grams, 66.67); // 600 cal ÷ 9
  near(amounts.carbs.gramsPerMeal, 83.33);
});

test("macro calories add back up to the target", () => {
  const { amounts } = calculateMacros({ ...balanced, calories: 2350 });
  near(
    amounts.protein.calories + amounts.carbs.calories + amounts.fat.calories,
    2350,
  );
});

test("protein per kilogram of body weight", () => {
  near(calculateMacros(balanced).proteinPerKg!, 1.43); // 100 g ÷ 70 kg
  assert.equal(
    calculateMacros({ ...balanced, weightKg: 0 }).proteinPerKg,
    null,
  );
});

test("percentages must add up to 100", () => {
  assert.equal(calculateMacros(balanced).valid, true);
  const off = calculateMacros({
    ...balanced,
    split: { protein: 30, carbs: 50, fat: 30 },
  });
  assert.equal(off.valid, false);
  assert.equal(off.percentTotal, 110);
  assert.equal(
    calculateMacros({
      ...balanced,
      split: { protein: 33.3, carbs: 33.3, fat: 33.4 },
    }).valid,
    true,
  );
});

test("flags percentages outside the adult ranges", () => {
  const { amounts } = calculateMacros({
    ...balanced,
    split: getDietStyle("keto")!.split,
  });
  assert.equal(amounts.carbs.range, "below");
  assert.equal(amounts.fat.range, "above");
  assert.equal(amounts.protein.range, "within");
  const ranges = Object.values(calculateMacros(balanced).amounts).map(
    (amount) => amount.range,
  );
  assert.deepEqual(ranges, ["within", "within", "within"]);
});

test("only the lower carb and keto presets leave the adult ranges", () => {
  const outside = DIET_STYLES.filter(
    (style) => !isWithinAdultRanges(style.split),
  ).map((style) => style.id);
  assert.deepEqual(outside, ["low-carb", "keto"]);
});

test("every preset adds up to 100 percent", () => {
  for (const style of DIET_STYLES) {
    const total = style.split.protein + style.split.carbs + style.split.fat;
    assert.equal(total, 100, style.id);
  }
});

test("warns about very low calorie targets", () => {
  assert.equal(calculateMacros(balanced).lowCalories, false);
  assert.equal(
    calculateMacros({ ...balanced, calories: 1100 }).lowCalories,
    true,
  );
  assert.equal(
    calculateMacros({ ...balanced, calories: 0 }).lowCalories,
    false,
  );
});

test("bad inputs do not break the result", () => {
  const result = calculateMacros({
    calories: -100,
    split: { protein: -5, carbs: 50, fat: 50 },
    weightKg: -3,
    mealsPerDay: 0,
  });
  assert.equal(result.amounts.protein.grams, 0);
  assert.equal(result.amounts.carbs.gramsPerMeal, 0);
  assert.equal(result.proteinPerKg, null);
});
