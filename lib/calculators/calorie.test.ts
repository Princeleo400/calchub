import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ACTIVITY_LEVELS,
  calculateCalories,
  mifflinStJeor,
  roundCalories,
} from "./calorie.ts";

const near = (actual: number, expected: number, tolerance = 0.01) =>
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `expected ${expected}, got ${actual}`,
  );

test("Mifflin-St Jeor for a man and a woman", () => {
  // 70 kg, 175 cm, 30 years: 700 + 1093.75 − 150 = 1643.75, then +5 (men) or −161 (women)
  near(mifflinStJeor("male", 70, 175, 30), 1648.75);
  near(mifflinStJeor("female", 70, 175, 30), 1482.75);
});

test("the two equations differ by exactly 166 calories", () => {
  near(
    mifflinStJeor("male", 82, 180, 45) - mifflinStJeor("female", 82, 180, 45),
    166,
  );
});

test("TDEE applies the activity factor", () => {
  const result = calculateCalories({
    sex: "female",
    age: 30,
    weightKg: 70,
    heightCm: 175,
    activity: "moderate",
    goal: "maintain",
  });
  near(result.bmr, 1482.75);
  near(result.tdee, 1482.75 * 1.55);
  near(result.goal.calories, result.tdee);
});

test("activity factors are the standard set, in order", () => {
  assert.deepEqual(
    ACTIVITY_LEVELS.map((level) => level.factor),
    [1.2, 1.375, 1.55, 1.725, 1.9],
  );
});

test("goal rows adjust from maintenance", () => {
  const result = calculateCalories({
    sex: "male",
    age: 40,
    weightKg: 90,
    heightCm: 180,
    activity: "light",
    goal: "lose1",
  });
  near(result.goal.calories, result.tdee - 500);
  near(
    result.goals.find((goal) => goal.id === "gain05")!.calories,
    result.tdee + 250,
  );
  assert.equal(result.goals.length, 5);
});

test("flags targets below resting needs", () => {
  // Sedentary, small person: TDEE − 500 drops below BMR (BMR × 1.2 − 500 < BMR when BMR < 2500).
  const result = calculateCalories({
    sex: "female",
    age: 60,
    weightKg: 50,
    heightCm: 155,
    activity: "sedentary",
    goal: "lose1",
  });
  assert.equal(result.goal.belowBmr, true);
  assert.equal(
    result.goals.find((goal) => goal.id === "maintain")!.belowBmr,
    false,
  );
});

test("rounds to the nearest 10", () => {
  assert.equal(roundCalories(2298.2), 2300);
  assert.equal(roundCalories(2294), 2290);
});
