import { roundCalories, type CalorieResult } from "@/lib/calculators/calorie";
import { formatNumber } from "@/lib/utils";

const kcal = (n: number) => `${formatNumber(roundCalories(n))} calories`;

/** Plain-English explanation of a calorie estimate, with a safety note for low targets. */
export function calorieInsight(r: CalorieResult): string[] {
  if (r.bmr <= 0)
    return ["Enter your age, height and weight to see your estimate."];

  const lines: string[] = [
    `Your body uses about ${kcal(r.bmr)} a day at rest. With your activity level (${r.activity.label.toLowerCase()}), eating about ${kcal(r.tdee)} a day should keep your weight roughly stable.`,
  ];

  const g = r.goal;
  if (g.adjustment < 0) {
    lines.push(
      `To ${g.label.charAt(0).toLowerCase()}${g.label.slice(1)}, aim for about ${kcal(g.calories)} a day, ${formatNumber(-g.adjustment)} fewer than maintenance. The CDC notes that people who lose weight gradually, about 1 to 2 pounds a week, are more likely to keep it off.`,
    );
  } else if (g.adjustment > 0) {
    lines.push(
      `To ${g.label.charAt(0).toLowerCase()}${g.label.slice(1)}, aim for about ${kcal(g.calories)} a day, ${formatNumber(g.adjustment)} more than maintenance.`,
    );
  }

  if (g.belowBmr) {
    lines.push(
      "This target is below your estimated resting needs. Talk with a doctor or registered dietitian before eating this little, or choose a slower goal.",
    );
  } else {
    lines.push(
      "This is an estimate. Real needs vary from person to person, so treat it as a starting point: track your weight for a few weeks and adjust if it moves differently than expected.",
    );
  }

  return lines;
}
