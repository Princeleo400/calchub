// Pure "ideal body weight" math: four published formulas plus the weight
// range that gives a healthy BMI. The formulas were built for medicine
// dosing, so they are shown side by side as estimates, not targets.
import { CM_PER_IN, healthyWeightRangeKg, KG_PER_LB } from "./bmi.ts";

export type IdealWeightSex = "female" | "male";

export type IdealWeightFormulaId = "devine" | "robinson" | "miller" | "hamwi";

export interface IdealWeightFormula {
  id: IdealWeightFormulaId;
  name: string;
  year: number;
  /** Weight at exactly 5 feet, and the amount added per inch above it, in kg. */
  male: { baseKg: number; perInchKg: number };
  female: { baseKg: number; perInchKg: number };
}

export const IDEAL_WEIGHT_FORMULAS: IdealWeightFormula[] = [
  {
    id: "devine",
    name: "Devine",
    year: 1974,
    male: { baseKg: 50, perInchKg: 2.3 },
    female: { baseKg: 45.5, perInchKg: 2.3 },
  },
  {
    id: "robinson",
    name: "Robinson",
    year: 1983,
    male: { baseKg: 52, perInchKg: 1.9 },
    female: { baseKg: 49, perInchKg: 1.7 },
  },
  {
    id: "miller",
    name: "Miller",
    year: 1983,
    male: { baseKg: 56.2, perInchKg: 1.41 },
    female: { baseKg: 53.1, perInchKg: 1.36 },
  },
  {
    // Hamwi published in pounds: 106 lb + 6 lb per inch for men,
    // 100 lb + 5 lb per inch for women. Converted exactly to kg.
    id: "hamwi",
    name: "Hamwi",
    year: 1964,
    male: { baseKg: 106 * KG_PER_LB, perInchKg: 6 * KG_PER_LB },
    female: { baseKg: 100 * KG_PER_LB, perInchKg: 5 * KG_PER_LB },
  },
];

/** Five feet, the height every formula starts from. */
export const BASE_HEIGHT_IN = 60;

export interface IdealWeightInputs {
  sex: IdealWeightSex;
  heightCm: number;
}

export interface FormulaEstimate {
  id: IdealWeightFormulaId;
  name: string;
  year: number;
  weightKg: number;
}

export interface IdealWeightResult {
  estimates: FormulaEstimate[];
  /** Average of the four formulas. */
  averageKg: number;
  /** Lowest and highest of the four formulas. */
  lowestKg: number;
  highestKg: number;
  /** Weights that give a BMI of 18.5 to 24.9 at this height. */
  healthyMinKg: number;
  healthyMaxKg: number;
  /** True under 5 feet, where the formulas are extended below their base. */
  belowFiveFeet: boolean;
}

export function idealWeightKg(
  formula: IdealWeightFormula,
  sex: IdealWeightSex,
  heightCm: number,
): number {
  const { baseKg, perInchKg } = formula[sex];
  const inchesOverFiveFeet = heightCm / CM_PER_IN - BASE_HEIGHT_IN;
  // Below 5 feet the per-inch amount is subtracted, as Robinson et al.
  // suggested for extending the equations to shorter adults.
  return Math.max(0, baseKg + perInchKg * inchesOverFiveFeet);
}

export function calculateIdealWeight(
  input: IdealWeightInputs,
): IdealWeightResult {
  const heightCm = Math.max(0, input.heightCm);
  const estimates = IDEAL_WEIGHT_FORMULAS.map((formula) => ({
    id: formula.id,
    name: formula.name,
    year: formula.year,
    weightKg: idealWeightKg(formula, input.sex, heightCm),
  }));
  const weights = estimates.map((estimate) => estimate.weightKg);
  const healthy = healthyWeightRangeKg(heightCm);

  return {
    estimates,
    averageKg:
      weights.reduce((sum, weight) => sum + weight, 0) / weights.length,
    lowestKg: Math.min(...weights),
    highestKg: Math.max(...weights),
    healthyMinKg: healthy.min,
    healthyMaxKg: healthy.max,
    belowFiveFeet: heightCm > 0 && heightCm / CM_PER_IN < BASE_HEIGHT_IN,
  };
}
