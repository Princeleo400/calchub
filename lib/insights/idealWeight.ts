import type { IdealWeightResult } from "@/lib/calculators/idealWeight";
import { KG_PER_LB } from "@/lib/calculators/bmi";
import { formatNumber } from "@/lib/utils";

export type WeightUnit = "kg" | "lb";

export function formatWeight(kg: number, unit: WeightUnit): string {
  return unit === "kg"
    ? `${formatNumber(Math.round(kg))} kg`
    : `${formatNumber(Math.round(kg / KG_PER_LB))} lb`;
}

/** Plain-English reading of the four formulas next to the healthy BMI range. */
export function idealWeightInsight(
  result: IdealWeightResult,
  unit: WeightUnit,
): string[] {
  if (result.healthyMaxKg <= 0) {
    return ["Enter your height to see the estimates."];
  }

  const lines = [
    `The four formulas give between ${formatWeight(result.lowestKg, unit)} and ${formatWeight(result.highestKg, unit)} for your height, an average of about ${formatWeight(result.averageKg, unit)}.`,
    `The healthy BMI range for your height is wider: ${formatWeight(result.healthyMinKg, unit)} to ${formatWeight(result.healthyMaxKg, unit)}. Any weight in that range counts as a healthy weight for adults by BMI.`,
    "These formulas were made mainly to work out medicine doses, and none of them accounts for muscle, frame size or age. Treat them as a rough reference rather than a goal.",
  ];

  if (result.belowFiveFeet) {
    lines.push(
      "The formulas start at 5 feet. Below that they are extended by subtracting the amount per inch, so the estimates are less reliable.",
    );
  }

  return lines;
}
