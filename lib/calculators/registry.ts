import {
  Calculator,
  CreditCard,
  Flame,
  Gauge,
  House,
  Landmark,
  PieChart,
  PiggyBank,
  Receipt,
  Ruler,
  Scale,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type {
  CalculatorCategory,
  CalculatorRegion,
  CalculatorSlug,
} from "@/lib/types";

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
  /** Page path when it is not "/<slug>", e.g. a country section. */
  path?: string;
  /**
   * Country-specific calculators live in their own section and menu, so the
   * main Finance and Health lists stay relevant to every visitor.
   */
  region?: CalculatorRegion;
  /** Hand-picked related calculators, used instead of the automatic list. */
  related?: CalculatorSlug[];
}

export const calculators: CalculatorMeta[] = [
  {
    slug: "mortgage-calculator",
    name: "Mortgage Calculator",
    description:
      "Monthly payment with taxes, insurance, PMI and HOA, plus a full amortization schedule.",
    category: "finance",
    icon: House,
    live: true,
  },
  {
    slug: "home-affordability-calculator",
    name: "Home Affordability Calculator",
    description:
      "How much house you can afford on your income and debts, using lender guidelines.",
    category: "finance",
    icon: Wallet,
    live: true,
  },
  {
    slug: "stamp-duty-calculator",
    name: "UK Stamp Duty Calculator",
    description:
      "Stamp Duty Land Tax for England and Northern Ireland, including first-time buyer relief.",
    category: "finance",
    icon: Landmark,
    live: true,
  },
  {
    slug: "mortgage-stress-test-calculator",
    name: "Canada Mortgage Stress Test",
    description:
      "Check if you pass Canada's mortgage stress test and the most you can borrow at the qualifying rate.",
    category: "finance",
    icon: Gauge,
    live: true,
  },
  {
    slug: "loan-calculator",
    name: "Loan Calculator",
    description:
      "Payments and total interest for car, personal and student loans.",
    category: "finance",
    icon: Calculator,
    live: true,
  },
  {
    slug: "debt-payoff-calculator",
    name: "Debt Payoff Calculator",
    description:
      "Compare the snowball and avalanche methods and see your debt-free date.",
    category: "finance",
    icon: CreditCard,
    live: true,
  },
  {
    slug: "savings-calculator",
    name: "Savings Calculator",
    description:
      "How a starting balance and monthly deposits grow with compound interest.",
    category: "finance",
    icon: PiggyBank,
    live: true,
  },
  {
    slug: "bmi-calculator",
    name: "BMI Calculator",
    description:
      "Body mass index in metric or imperial, with the healthy weight range for your height.",
    category: "health",
    icon: Scale,
    live: true,
  },
  {
    slug: "calorie-calculator",
    name: "Calorie Calculator",
    description:
      "Daily calorie needs (TDEE) for maintaining, losing or gaining weight.",
    category: "health",
    icon: Flame,
    live: true,
  },
  {
    slug: "macro-calculator",
    name: "Macro Calculator",
    description:
      "Daily protein, carbs and fat for your calorie target and diet style.",
    category: "health",
    icon: PieChart,
    live: true,
  },
  {
    slug: "ideal-weight-calculator",
    name: "Ideal Weight Calculator",
    description: "Ideal body weight from four medical formulas, side by side.",
    category: "health",
    icon: Ruler,
    live: true,
  },
  {
    slug: "nigeria-paye-calculator",
    name: "Nigeria PAYE Tax Calculator",
    description:
      "Monthly PAYE and take-home pay under the Nigeria Tax Act 2025, with rent relief, pension and NHF.",
    category: "finance",
    icon: Receipt,
    live: true,
    path: "/nigeria/paye-calculator",
    region: "nigeria",
    // Useful anywhere, unlike the US, UK and Canada housing tools.
    related: [
      "savings-calculator",
      "loan-calculator",
      "debt-payoff-calculator",
    ],
  },
];

/** The page address for a calculator. */
export function calculatorPath(calculator: CalculatorMeta): string {
  return calculator.path ?? `/${calculator.slug}`;
}

export const liveCalculators = calculators.filter(
  (calculator) => calculator.live,
);

export function getCalculator(slug: CalculatorSlug): CalculatorMeta {
  const found = calculators.find((calculator) => calculator.slug === slug);
  if (!found) throw new Error(`Unknown calculator: ${slug}`);
  return found;
}

export function calculatorsByCategory(
  category: CalculatorCategory,
): CalculatorMeta[] {
  return liveCalculators.filter(
    (calculator) => calculator.category === category && !calculator.region,
  );
}

/** Live calculators for one country section, e.g. /nigeria. */
export function regionalCalculators(
  region: CalculatorRegion,
): CalculatorMeta[] {
  return liveCalculators.filter((calculator) => calculator.region === region);
}

export const regionLabels: Record<
  CalculatorRegion,
  { label: string; path: string }
> = { nigeria: { label: "Nigeria", path: "/nigeria" } };

/** Up to `count` live calculators from the same category, then the other one. */
export function relatedCalculators(
  slug: CalculatorSlug,
  count = 3,
): CalculatorMeta[] {
  const current = getCalculator(slug);
  if (current.related) {
    return current.related
      .map(getCalculator)
      .filter((calculator) => calculator.live)
      .slice(0, count);
  }
  // Main calculators never suggest country-specific ones; a country tool
  // suggests its own section first, then the main calculators.
  const others = liveCalculators.filter(
    (calculator) =>
      calculator.slug !== slug &&
      (!calculator.region || calculator.region === current.region),
  );
  const isCloser = (calculator: CalculatorMeta) =>
    current.region
      ? calculator.region === current.region
      : calculator.category === current.category;
  const same = others.filter(isCloser);
  const rest = others.filter((calculator) => !isCloser(calculator));
  return [...same, ...rest].slice(0, count);
}

export const categoryLabels: Record<CalculatorCategory, string> = {
  finance: "Finance",
  health: "Health",
};
