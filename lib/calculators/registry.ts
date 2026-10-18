import {
  Calculator,
  CreditCard,
  Flame,
  House,
  PieChart,
  PiggyBank,
  Ruler,
  Scale,
  type LucideIcon,
} from "lucide-react";
import type { CalculatorCategory, CalculatorSlug } from "@/lib/types";

export interface CalculatorMeta {
  slug: CalculatorSlug;
  /** Short name used in nav, cards and breadcrumbs. */
  name: string;
  /** One-line description for cards and meta descriptions. */
  description: string;
  category: CalculatorCategory;
  icon: LucideIcon;
  /** Only live calculators are linked anywhere on the site. */
  live: boolean;
}

export const calculators: CalculatorMeta[] = [
  {
    slug: "mortgage-calculator",
    name: "Mortgage Calculator",
    description: "Monthly payment with taxes, insurance, PMI and HOA, plus a full amortization schedule.",
    category: "finance",
    icon: House,
    live: true,
  },
  {
    slug: "loan-calculator",
    name: "Loan Calculator",
    description: "Payments and total interest for car, personal and student loans.",
    category: "finance",
    icon: Calculator,
    live: true,
  },
  {
    slug: "debt-payoff-calculator",
    name: "Debt Payoff Calculator",
    description: "Compare the snowball and avalanche methods and see your debt-free date.",
    category: "finance",
    icon: CreditCard,
    live: true,
  },
  {
    slug: "savings-calculator",
    name: "Savings Calculator",
    description: "How compound interest and regular deposits grow your savings.",
    category: "finance",
    icon: PiggyBank,
    live: false,
  },
  {
    slug: "bmi-calculator",
    name: "BMI Calculator",
    description: "Body mass index in metric or imperial, with the healthy weight range for your height.",
    category: "health",
    icon: Scale,
    live: true,
  },
  {
    slug: "calorie-calculator",
    name: "Calorie Calculator",
    description: "Daily calorie needs (TDEE) for maintaining, losing or gaining weight.",
    category: "health",
    icon: Flame,
    live: true,
  },
  {
    slug: "macro-calculator",
    name: "Macro Calculator",
    description: "Daily protein, carbs and fat for your calorie target and diet style.",
    category: "health",
    icon: PieChart,
    live: false,
  },
  {
    slug: "ideal-weight-calculator",
    name: "Ideal Weight Calculator",
    description: "Ideal body weight from four medical formulas, side by side.",
    category: "health",
    icon: Ruler,
    live: false,
  },
];

export const liveCalculators = calculators.filter((c) => c.live);

export function getCalculator(slug: CalculatorSlug): CalculatorMeta {
  const found = calculators.find((c) => c.slug === slug);
  if (!found) throw new Error(`Unknown calculator: ${slug}`);
  return found;
}

export function calculatorsByCategory(category: CalculatorCategory): CalculatorMeta[] {
  return liveCalculators.filter((c) => c.category === category);
}

/** Up to `count` live calculators from the same category, then the other one. */
export function relatedCalculators(slug: CalculatorSlug, count = 3): CalculatorMeta[] {
  const current = getCalculator(slug);
  const others = liveCalculators.filter((c) => c.slug !== slug);
  const same = others.filter((c) => c.category === current.category);
  const rest = others.filter((c) => c.category !== current.category);
  return [...same, ...rest].slice(0, count);
}

export const categoryLabels: Record<CalculatorCategory, string> = {
  finance: "Finance",
  health: "Health",
};
