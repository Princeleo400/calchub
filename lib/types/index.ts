export type CalculatorCategory = "finance" | "health";

export type CalculatorSlug =
  | "mortgage-calculator"
  | "home-affordability-calculator"
  | "loan-calculator"
  | "debt-payoff-calculator"
  | "savings-calculator"
  | "bmi-calculator"
  | "calorie-calculator"
  | "macro-calculator"
  | "ideal-weight-calculator";

/** Values that can round-trip through a URL query string. */
export type InputValue = string | number | boolean;
export type CalculatorInputs = Record<string, InputValue>;

/** One saved calculation in the no-account history (localStorage). */
export interface CalculationRecord {
  id: string;
  calculator: CalculatorSlug;
  /** Headline result, already formatted, e.g. "$2,140/mo" or "BMI 24.1". */
  result: string;
  /** Short input summary, e.g. "$350,000 at 6.5% for 30 years". */
  summary: string;
  inputs: CalculatorInputs;
  timestamp: number;
}
