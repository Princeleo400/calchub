// Canadian mortgage stress test: qualifying at the higher of (contract + 2%)
// or 5.25%, against CMHC's GDS/TDS limits. Canadian fixed-rate mortgages
// compound semi-annually (Interest Act s.6), so payments use that convention.
//
// RULES CHANGE. All figures live in CANADA_RULES with the date last checked.

export const CANADA_RULES = {
  lastChecked: "2026-10-22",
  /** OSFI / Department of Finance minimum qualifying rate. */
  qualifyingFloor: 5.25,
  qualifyingBuffer: 2,
  /** CMHC maximum debt service ratios for insured loans (percent of gross income). */
  maxGds: 39,
  maxTds: 44,
  /** Share of condo fees counted in GDS/TDS. */
  condoFeeShare: 0.5,
  /** Insured purchases must be below this price. */
  insuredPriceCap: 1_500_000,
  /** CMHC premiums as a percent of the loan, by loan-to-value (upper bound, inclusive). */
  premiums: [
    { maxLtv: 80, rate: 0 },
    { maxLtv: 85, rate: 2.8 },
    { maxLtv: 90, rate: 3.1 },
    { maxLtv: 95, rate: 4.0 },
  ],
  /** Added to the premium rate for 30-year insured amortizations. */
  thirtyYearSurcharge: 0.2,
} as const;

/** Monthly rate for a nominal annual rate compounded semi-annually. */
export function canadianMonthlyRate(annualPct: number): number {
  return Math.pow(1 + annualPct / 100 / 2, 1 / 6) - 1;
}

/** Monthly payment on a Canadian fixed-rate mortgage. */
export function canadianPayment(
  principal: number,
  annualPct: number,
  years: number,
): number {
  const n = Math.round(years * 12);
  if (principal <= 0 || n <= 0) return 0;
  const r = canadianMonthlyRate(annualPct);
  if (r === 0) return principal / n;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

/** Largest principal a given monthly payment supports. */
export function canadianPrincipalFor(
  payment: number,
  annualPct: number,
  years: number,
): number {
  const n = Math.round(years * 12);
  if (payment <= 0 || n <= 0) return 0;
  const r = canadianMonthlyRate(annualPct);
  if (r === 0) return payment * n;
  return (payment * (1 - Math.pow(1 + r, -n))) / r;
}

export function qualifyingRate(contractRate: number): number {
  return Math.max(
    contractRate + CANADA_RULES.qualifyingBuffer,
    CANADA_RULES.qualifyingFloor,
  );
}

/** Minimum down payment: 5% to $500k, 10% of the rest below $1.5M, 20% at $1.5M or more. */
export function minimumDownPayment(price: number): number {
  if (price <= 0) return 0;
  if (price >= CANADA_RULES.insuredPriceCap) return price * 0.2;
  if (price <= 500_000) return price * 0.05;
  return 25_000 + (price - 500_000) * 0.1;
}

/** CMHC premium rate (percent of loan) for a loan-to-value, or null if not insurable. */
export function premiumRate(
  ltvPct: number,
  thirtyYear: boolean,
): number | null {
  const tier = CANADA_RULES.premiums.find((p) => ltvPct <= p.maxLtv + 1e-9);
  if (!tier) return null;
  if (tier.rate === 0) return 0;
  return tier.rate + (thirtyYear ? CANADA_RULES.thirtyYearSurcharge : 0);
}

export interface StressTestInputs {
  price: number;
  downPayment: number;
  contractRate: number;
  amortizationYears: number;
  annualIncome: number;
  propertyTaxPerYear: number;
  heatingPerMonth: number;
  condoFeesPerMonth: number;
  otherDebtsPerMonth: number;
}

export interface StressTestResult {
  /** Why the purchase can't be assessed as entered, if so. */
  problem: "downTooLow" | null;
  minDown: number;
  insured: boolean;
  premium: number;
  premiumRatePct: number;
  /** Mortgage including any CMHC premium. */
  mortgage: number;
  qualifyingRate: number;
  paymentAtContract: number;
  paymentAtQualifying: number;
  /** Debt service ratios at the qualifying rate, as percents. */
  gds: number;
  tds: number;
  passesGds: boolean;
  passesTds: boolean;
  passes: boolean;
  /** Largest mortgage (incl. premium) that passes both limits at the qualifying rate. */
  maxMortgage: number;
  /**
   * Highest purchase price that passes with this down payment, allowing for
   * CMHC premiums and minimum down payment rules.
   */
  maxPrice: number;
}

export function calculateStressTest(i: StressTestInputs): StressTestResult {
  const r = assess(i);
  return { ...r, maxPrice: maxPurchasePrice(i) };
}

/**
 * Passing is monotonic in price (a higher price only raises the mortgage, the
 * ratios and the minimum down payment), so bisection finds the boundary.
 */
function maxPurchasePrice(i: StressTestInputs): number {
  const down = Math.max(0, i.downPayment);
  const passesAt = (price: number) =>
    assess({ ...i, price, downPayment: down }).passes;
  let low = down;
  let high = down + assess(i).maxMortgage + 1;
  if (!passesAt(low + 1)) return 0;
  for (let k = 0; k < 60; k++) {
    const mid = (low + high) / 2;
    if (passesAt(mid)) low = mid;
    else high = mid;
  }
  return low;
}

function assess(i: StressTestInputs): Omit<StressTestResult, "maxPrice"> {
  const price = Math.max(0, i.price);
  const down = Math.min(price, Math.max(0, i.downPayment));
  const minDown = minimumDownPayment(price);
  const base = price - down;
  const ltv = price > 0 ? (base / price) * 100 : 0;
  const insured = ltv > 80;
  const thirtyYear = i.amortizationYears > 25;
  const rate = insured ? premiumRate(ltv, thirtyYear) : 0;
  const problem = down + 0.005 < minDown || rate === null ? "downTooLow" : null;

  const premiumRatePct = rate ?? 0;
  const premium = (base * premiumRatePct) / 100;
  const mortgage = base + premium;
  const qRate = qualifyingRate(i.contractRate);

  const monthlyIncome = Math.max(0, i.annualIncome) / 12;
  const housingExtras =
    Math.max(0, i.propertyTaxPerYear) / 12 +
    Math.max(0, i.heatingPerMonth) +
    Math.max(0, i.condoFeesPerMonth) * CANADA_RULES.condoFeeShare;
  const paymentAtQualifying = canadianPayment(
    mortgage,
    qRate,
    i.amortizationYears,
  );
  const gds =
    monthlyIncome > 0
      ? ((paymentAtQualifying + housingExtras) / monthlyIncome) * 100
      : 0;
  const tds =
    monthlyIncome > 0
      ? ((paymentAtQualifying +
          housingExtras +
          Math.max(0, i.otherDebtsPerMonth)) /
          monthlyIncome) *
        100
      : 0;

  const budget = Math.min(
    (monthlyIncome * CANADA_RULES.maxGds) / 100 - housingExtras,
    (monthlyIncome * CANADA_RULES.maxTds) / 100 -
      housingExtras -
      Math.max(0, i.otherDebtsPerMonth),
  );
  const maxMortgage = canadianPrincipalFor(
    Math.max(0, budget),
    qRate,
    i.amortizationYears,
  );

  const passesGds = monthlyIncome > 0 && gds <= CANADA_RULES.maxGds + 1e-9;
  const passesTds = monthlyIncome > 0 && tds <= CANADA_RULES.maxTds + 1e-9;

  return {
    problem,
    minDown,
    insured,
    premium,
    premiumRatePct,
    mortgage,
    qualifyingRate: qRate,
    paymentAtContract: canadianPayment(
      mortgage,
      i.contractRate,
      i.amortizationYears,
    ),
    paymentAtQualifying,
    gds,
    tds,
    passesGds,
    passesTds,
    passes: problem === null && passesGds && passesTds,
    maxMortgage,
  };
}
