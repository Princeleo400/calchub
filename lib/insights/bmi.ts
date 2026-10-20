import type { BmiResult } from "@/lib/calculators/bmi";
import { formatNumber } from "@/lib/utils";

export type WeightUnit = "kg" | "lb";

function weight(kg: number, unit: WeightUnit): string {
  return unit === "kg"
    ? `${formatNumber(kg, 1)} kg`
    : `${formatNumber(kg / 0.45359237, 0)} lb`;
}

/**
 * Neutral, factual explanation of a BMI result. Deliberately avoids weight-loss
 * targets or diet advice; points to a health professional for decisions.
 */
export function bmiInsight(r: BmiResult, unit: WeightUnit): string[] {
  if (r.bmi <= 0) return ["Enter your height and weight to see your BMI."];

  const lines: string[] = [];
  const shown = formatNumber(r.bmi, 1);
  const range = `${weight(r.healthyMinKg, unit)} to ${weight(r.healthyMaxKg, unit)}`;

  if (r.category.id === "healthy") {
    lines.push(
      `A BMI of ${shown} is in the healthy weight range (18.5 to 24.9) for adults.`,
    );
  } else {
    const bounds =
      r.category.max === Infinity
        ? `${r.category.min} or higher`
        : `${r.category.min} to ${formatNumber(r.category.max - 0.1, 1)}`;
    lines.push(
      `A BMI of ${shown} falls in the ${r.category.label.toLowerCase()} category (${bounds}) for adults.`,
    );
  }

  lines.push(
    `For your height, a BMI of 18.5 to 24.9 corresponds to a weight of about ${range}.`,
  );

  lines.push(
    "BMI is a screening measure, not a diagnosis. It doesn't distinguish muscle from fat, so it can read high for very muscular people. A health care provider can look at it alongside other measures such as waist size, blood pressure and cholesterol.",
  );

  return lines;
}
