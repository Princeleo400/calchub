import {
  ACTIVE_PROTEIN_G_PER_KG,
  ADULT_RANGES,
  LOW_CALORIE_THRESHOLD,
  PROTEIN_RDA_G_PER_KG,
  type Macro,
  type MacroResult,
} from "@/lib/calculators/macro";
import { formatNumber } from "@/lib/utils";

// Subject and verb for each macro, so sentences agree ("carbs are").
const MACRO_SUBJECTS: Record<Macro, string> = {
  protein: "Protein at {percent}% is",
  carbs: "Carbs at {percent}% are",
  fat: "Fat at {percent}% is",
};

const grams = (value: number) => `${formatNumber(Math.round(value))} g`;
const oneDecimal = (value: number) => value.toFixed(1);

const activeRange = `${oneDecimal(ACTIVE_PROTEIN_G_PER_KG.min)} to ${oneDecimal(ACTIVE_PROTEIN_G_PER_KG.max)} g/kg`;

function proteinLine(proteinPerKg: number): string {
  // Decide on the same rounded figure the reader sees, so the wording never
  // contradicts the number (e.g. "1.4 g/kg, below 1.4").
  const shown = Math.round(proteinPerKg * 10) / 10;
  const opening = `That is ${oneDecimal(shown)} g of protein per kilogram of body weight`;
  if (shown < PROTEIN_RDA_G_PER_KG) {
    return `${opening}, below the ${oneDecimal(PROTEIN_RDA_G_PER_KG)} g/kg that adults are advised to get each day. Consider a higher protein share.`;
  }
  if (shown < ACTIVE_PROTEIN_G_PER_KG.min) {
    return `${opening}, which meets the ${oneDecimal(PROTEIN_RDA_G_PER_KG)} g/kg daily recommendation for adults. People who exercise regularly often aim for ${activeRange}.`;
  }
  if (shown <= ACTIVE_PROTEIN_G_PER_KG.max) {
    return `${opening}, within the ${activeRange} that sports nutrition research finds enough for most people who exercise.`;
  }
  return `${opening}, more than the ${activeRange} that research finds enough for most people who exercise. If you have kidney disease, check your protein intake with a doctor.`;
}

/** Plain-English explanation of a macro split, with checks against adult ranges. */
export function macroInsight(
  result: MacroResult,
  calories: number,
  mealsPerDay: number,
): string[] {
  if (calories <= 0) {
    return ["Enter your details or a calorie target to see your macros."];
  }
  if (!result.valid) {
    return [
      `Your percentages add up to ${formatNumber(result.percentTotal, 1)}%. Adjust them so protein, carbs and fat total 100%.`,
    ];
  }

  const { protein, carbs, fat } = result.amounts;
  const meals = Math.max(1, Math.round(mealsPerDay));
  const lines: string[] = [
    `At ${formatNumber(Math.round(calories / 10) * 10)} calories a day, aim for about ${grams(protein.grams)} of protein, ${grams(carbs.grams)} of carbs and ${grams(fat.grams)} of fat.${meals > 1 ? ` Over ${meals} meals that is roughly ${grams(protein.gramsPerMeal)}, ${grams(carbs.gramsPerMeal)} and ${grams(fat.gramsPerMeal)} each.` : ""}`,
  ];

  if (result.lowCalories) {
    lines.push(
      `Below ${formatNumber(LOW_CALORIE_THRESHOLD)} calories a day it is hard to get all the nutrients you need. Check with a doctor or registered dietitian before eating this little.`,
    );
  }

  if (result.proteinPerKg !== null) {
    lines.push(proteinLine(result.proteinPerKg));
  }

  const outside = (["protein", "carbs", "fat"] as Macro[]).filter(
    (macro) => result.amounts[macro].range !== "within",
  );
  if (outside.length === 0) {
    lines.push(
      "All three shares are within the ranges health authorities set for adults.",
    );
  } else {
    const details = outside.map((macro) => {
      const { min, max } = ADULT_RANGES[macro];
      const amount = result.amounts[macro];
      const subject = MACRO_SUBJECTS[macro].replace(
        "{percent}",
        formatNumber(amount.percent),
      );
      return `${subject} ${amount.range} the adult range of ${min} to ${max}%`;
    });
    const sentence =
      details.length > 1
        ? `${details.slice(0, -1).join(", ")} and ${details.at(-1)!.charAt(0).toLowerCase()}${details.at(-1)!.slice(1)}`
        : details[0];
    lines.push(
      `${sentence}. That can be a deliberate choice, but it is worth discussing with a doctor or registered dietitian, especially if you have a health condition.`,
    );
  }

  return lines;
}
