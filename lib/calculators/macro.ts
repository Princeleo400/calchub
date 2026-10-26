// Pure macro math: split a daily calorie target into protein, carbohydrate
// and fat, in grams, and check the split against official adult ranges.

export const CALORIES_PER_GRAM = { protein: 4, carbs: 4, fat: 9 } as const;

export type Macro = keyof typeof CALORIES_PER_GRAM;

/**
 * Acceptable Macronutrient Distribution Ranges for adults, as a percent of
 * calories (Institute of Medicine, Dietary Reference Intakes, 2005).
 */
export const ADULT_RANGES: Record<Macro, { min: number; max: number }> = {
  protein: { min: 10, max: 35 },
  carbs: { min: 45, max: 65 },
  fat: { min: 20, max: 35 },
};

/** Adult protein RDA, grams per kilogram of body weight per day. */
export const PROTEIN_RDA_G_PER_KG = 0.8;

/** Range the ISSN finds sufficient for most people who exercise regularly. */
export const ACTIVE_PROTEIN_G_PER_KG = { min: 1.4, max: 2 };

/** Below this many calories a day it is hard to meet nutrient needs. */
export const LOW_CALORIE_THRESHOLD = 1200;

export type DietStyleId =
  "balanced" | "high-protein" | "low-carb" | "low-fat" | "keto" | "custom";

export interface DietStyle {
  id: DietStyleId;
  label: string;
  description: string;
  /** Percent of calories from each macro; always adds up to 100. */
  split: Record<Macro, number>;
}

export const DIET_STYLES: DietStyle[] = [
  {
    id: "balanced",
    label: "Balanced",
    description: "Middle of the official ranges for all three",
    split: { protein: 20, carbs: 50, fat: 30 },
  },
  {
    id: "high-protein",
    label: "Higher protein",
    description: "More protein, often used for strength training",
    split: { protein: 30, carbs: 45, fat: 25 },
  },
  {
    id: "low-carb",
    label: "Lower carb",
    description: "Fewer carbs, more fat and protein",
    split: { protein: 30, carbs: 25, fat: 45 },
  },
  {
    id: "low-fat",
    label: "Lower fat",
    description: "Fat at the bottom of its range, more carbs",
    split: { protein: 20, carbs: 60, fat: 20 },
  },
  {
    id: "keto",
    label: "Keto",
    description: "Very low carb, mostly fat",
    split: { protein: 20, carbs: 5, fat: 75 },
  },
];

export interface MacroInputs {
  calories: number;
  /** Percent of calories from each macro. */
  split: Record<Macro, number>;
  /** Used for protein per kilogram; 0 when unknown. */
  weightKg: number;
  mealsPerDay: number;
}

export interface MacroAmount {
  macro: Macro;
  percent: number;
  grams: number;
  calories: number;
  gramsPerMeal: number;
  /** Where the percent sits against the adult range. */
  range: "below" | "within" | "above";
}

export interface MacroResult {
  /** False when the percentages do not add up to 100. */
  valid: boolean;
  percentTotal: number;
  amounts: Record<Macro, MacroAmount>;
  /** Grams of protein per kilogram of body weight, or null without a weight. */
  proteinPerKg: number | null;
  lowCalories: boolean;
}

const MACROS: Macro[] = ["protein", "carbs", "fat"];

/** True when every macro in the split is inside its adult range. */
export function isWithinAdultRanges(split: Record<Macro, number>): boolean {
  return MACROS.every(
    (macro) =>
      split[macro] >= ADULT_RANGES[macro].min &&
      split[macro] <= ADULT_RANGES[macro].max,
  );
}

export function getDietStyle(id: DietStyleId): DietStyle | undefined {
  return DIET_STYLES.find((style) => style.id === id);
}

export function calculateMacros(input: MacroInputs): MacroResult {
  const calories = Math.max(0, input.calories);
  const meals = Math.max(1, Math.round(input.mealsPerDay));
  const percentTotal = MACROS.reduce(
    (sum, macro) => sum + Math.max(0, input.split[macro]),
    0,
  );

  const amounts = {} as Record<Macro, MacroAmount>;
  for (const macro of MACROS) {
    const percent = Math.max(0, input.split[macro]);
    const macroCalories = (calories * percent) / 100;
    const grams = macroCalories / CALORIES_PER_GRAM[macro];
    const { min, max } = ADULT_RANGES[macro];
    amounts[macro] = {
      macro,
      percent,
      grams,
      calories: macroCalories,
      gramsPerMeal: grams / meals,
      range: percent < min ? "below" : percent > max ? "above" : "within",
    };
  }

  return {
    // Allow for rounding in typed percentages, e.g. 33.3 + 33.3 + 33.4.
    valid: Math.abs(percentTotal - 100) < 0.05,
    percentTotal,
    amounts,
    proteinPerKg:
      input.weightKg > 0 ? amounts.protein.grams / input.weightKg : null,
    lowCalories: calories > 0 && calories < LOW_CALORIE_THRESHOLD,
  };
}
