import {
  calculateAffordability,
  type AffordabilityInputs,
} from "@/lib/calculators/affordability";

/** Salaries that get their own "how much house can I afford on $Xk" page. */
export const SALARIES = [
  40_000, 50_000, 60_000, 70_000, 80_000, 90_000, 100_000, 120_000, 150_000,
  200_000,
];

export function salarySlug(income: number): string {
  return `${income / 1000}k`;
}

export function parseSalarySlug(slug: string): number | null {
  const match = /^(\d+)k$/.exec(slug);
  if (!match) return null;
  const income = Number(match[1]) * 1000;
  return SALARIES.includes(income) ? income : null;
}

/** Assumptions behind every salary page's headline figure. */
export const SALARY_BASE: Omit<AffordabilityInputs, "annualIncome"> = {
  monthlyDebts: 0,
  downPaymentPct: 20,
  rate: 7,
  termYears: 30,
  propertyTaxPct: 1.1,
  insurancePerYear: 1_800,
  hoaPerMonth: 0,
  pmiPct: 0.5,
  housingRatioPct: 28,
  totalDtiPct: 36,
};

export function affordFor(
  annualIncome: number,
  overrides: Partial<AffordabilityInputs> = {},
) {
  return calculateAffordability({ ...SALARY_BASE, annualIncome, ...overrides });
}

/** Round down to the nearest $1,000, matching the calculator's headline. */
export function roundPrice(n: number): number {
  return Math.floor(n / 1000) * 1000;
}
