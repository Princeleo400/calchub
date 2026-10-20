// Pure BMI math for adults (20+), using CDC adult categories.

export const KG_PER_LB = 0.45359237;
export const CM_PER_IN = 2.54;

export type BmiCategoryId =
  | "underweight"
  | "healthy"
  | "overweight"
  | "obesity1"
  | "obesity2"
  | "obesity3";

export interface BmiCategory {
  id: BmiCategoryId;
  label: string;
  /** Inclusive lower bound. */
  min: number;
  /** Exclusive upper bound. */
  max: number;
}

/** CDC adult BMI categories (kg/m²). */
export const BMI_CATEGORIES: BmiCategory[] = [
  { id: "underweight", label: "Underweight", min: 0, max: 18.5 },
  { id: "healthy", label: "Healthy weight", min: 18.5, max: 25 },
  { id: "overweight", label: "Overweight", min: 25, max: 30 },
  { id: "obesity1", label: "Obesity, class 1", min: 30, max: 35 },
  { id: "obesity2", label: "Obesity, class 2", min: 35, max: 40 },
  { id: "obesity3", label: "Obesity, class 3", min: 40, max: Infinity },
];

/** Healthy BMI range used for the weight range, as commonly shown: 18.5 to 24.9. */
export const HEALTHY_MIN = 18.5;
export const HEALTHY_MAX = 24.9;

export function bmiFromMetric(weightKg: number, heightCm: number): number {
  const m = heightCm / 100;
  if (weightKg <= 0 || m <= 0) return 0;
  return weightKg / (m * m);
}

export function bmiFromImperial(weightLb: number, heightIn: number): number {
  return bmiFromMetric(weightLb * KG_PER_LB, heightIn * CM_PER_IN);
}

/** Category for a BMI value. Values are rounded to one decimal first, as displayed. */
export function bmiCategory(bmi: number): BmiCategory {
  const shown = Math.round(bmi * 10) / 10;
  return (
    BMI_CATEGORIES.find((c) => shown >= c.min && shown < c.max) ??
    BMI_CATEGORIES[0]
  );
}

/** Weight range (kg) that gives a BMI of 18.5 to 24.9 at this height. */
export function healthyWeightRangeKg(heightCm: number): {
  min: number;
  max: number;
} {
  const m = heightCm / 100;
  return { min: HEALTHY_MIN * m * m, max: HEALTHY_MAX * m * m };
}

export interface BmiResult {
  bmi: number;
  category: BmiCategory;
  healthyMinKg: number;
  healthyMaxKg: number;
  /** kg below the range (positive) or above it (positive), 0 when inside. */
  belowRangeKg: number;
  aboveRangeKg: number;
}

export function calculateBmi(weightKg: number, heightCm: number): BmiResult {
  const bmi = bmiFromMetric(weightKg, heightCm);
  const range = healthyWeightRangeKg(heightCm);
  return {
    bmi,
    category: bmiCategory(bmi),
    healthyMinKg: range.min,
    healthyMaxKg: range.max,
    belowRangeKg: Math.max(0, range.min - weightKg),
    aboveRangeKg: Math.max(0, weightKg - range.max),
  };
}

/** Split total inches into feet and inches, e.g. 69 → { feet: 5, inches: 9 }. */
export function toFeetInches(totalInches: number): {
  feet: number;
  inches: number;
} {
  let feet = Math.floor(totalInches / 12);
  let inches = Math.round((totalInches - feet * 12) * 10) / 10;
  if (inches >= 12) {
    feet += 1;
    inches -= 12;
  }
  return { feet, inches };
}
