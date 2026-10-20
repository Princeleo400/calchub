// Pure calorie math: Mifflin-St Jeor resting needs (BMR) × an activity factor
// gives total daily energy expenditure (TDEE), then a goal adjustment.

export type Sex = "female" | "male";
export type ActivityId = "sedentary" | "light" | "moderate" | "active" | "very";
export type GoalId = "lose1" | "lose05" | "maintain" | "gain05" | "gain1";

export interface ActivityLevel {
  id: ActivityId;
  label: string;
  description: string;
  factor: number;
}

/** Standard activity factors used with Mifflin-St Jeor. */
export const ACTIVITY_LEVELS: ActivityLevel[] = [
  {
    id: "sedentary",
    label: "Sedentary",
    description: "Little or no exercise",
    factor: 1.2,
  },
  {
    id: "light",
    label: "Lightly active",
    description: "Exercise 1 to 3 days a week",
    factor: 1.375,
  },
  {
    id: "moderate",
    label: "Moderately active",
    description: "Exercise 3 to 5 days a week",
    factor: 1.55,
  },
  {
    id: "active",
    label: "Very active",
    description: "Hard exercise 6 to 7 days a week",
    factor: 1.725,
  },
  {
    id: "very",
    label: "Extra active",
    description: "Hard daily exercise or a physical job",
    factor: 1.9,
  },
];

export interface Goal {
  id: GoalId;
  label: string;
  /** Calories per day relative to maintenance. */
  adjustment: number;
  /** Rough weekly change, using the ~3,500 calories per pound rule of thumb. */
  weeklyLb: number;
}

export const GOALS: Goal[] = [
  {
    id: "lose1",
    label: "Lose about 1 lb (0.45 kg) a week",
    adjustment: -500,
    weeklyLb: -1,
  },
  {
    id: "lose05",
    label: "Lose about 0.5 lb (0.23 kg) a week",
    adjustment: -250,
    weeklyLb: -0.5,
  },
  { id: "maintain", label: "Maintain weight", adjustment: 0, weeklyLb: 0 },
  {
    id: "gain05",
    label: "Gain about 0.5 lb (0.23 kg) a week",
    adjustment: 250,
    weeklyLb: 0.5,
  },
  {
    id: "gain1",
    label: "Gain about 1 lb (0.45 kg) a week",
    adjustment: 500,
    weeklyLb: 1,
  },
];

/** Mifflin-St Jeor (1990): 10 × kg + 6.25 × cm − 5 × age, + 5 for men or − 161 for women. */
export function mifflinStJeor(
  sex: Sex,
  weightKg: number,
  heightCm: number,
  age: number,
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return base + (sex === "male" ? 5 : -161);
}

export interface CalorieInputs {
  sex: Sex;
  age: number;
  weightKg: number;
  heightCm: number;
  activity: ActivityId;
  goal: GoalId;
}

export interface GoalRow extends Goal {
  calories: number;
  /** True when the target falls below the estimated resting needs. */
  belowBmr: boolean;
}

export interface CalorieResult {
  bmr: number;
  tdee: number;
  activity: ActivityLevel;
  goal: GoalRow;
  goals: GoalRow[];
}

export function getActivity(id: ActivityId): ActivityLevel {
  return ACTIVITY_LEVELS.find((a) => a.id === id) ?? ACTIVITY_LEVELS[2];
}

export function calculateCalories(input: CalorieInputs): CalorieResult {
  const activity = getActivity(input.activity);
  const bmr = Math.max(
    0,
    mifflinStJeor(input.sex, input.weightKg, input.heightCm, input.age),
  );
  const tdee = bmr * activity.factor;
  const goals: GoalRow[] = GOALS.map((g) => {
    const calories = Math.max(0, tdee + g.adjustment);
    return { ...g, calories, belowBmr: calories < bmr };
  });
  const goal = goals.find((g) => g.id === input.goal) ?? goals[2];
  return { bmr, tdee, activity, goal, goals };
}

/** Round to the nearest 10 calories for display; more precision would be false precision. */
export function roundCalories(value: number): number {
  return Math.round(value / 10) * 10;
}
