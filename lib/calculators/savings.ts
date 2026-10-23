// Pure savings math: a starting balance plus monthly deposits, growing with
// compound interest. Simulated month by month so yearly deposit increases
// and any compounding frequency are handled the same way.

export type Compounding = "daily" | "monthly" | "quarterly" | "annually";

export const COMPOUNDS_PER_YEAR: Record<Compounding, number> = {
  daily: 365,
  monthly: 12,
  quarterly: 4,
  annually: 1,
};

export interface SavingsInputs {
  initialDeposit: number;
  /** Added at the end of every month. */
  monthlyDeposit: number;
  /** Nominal annual interest rate as a percent. */
  rate: number;
  compounding: Compounding;
  years: number;
  /** How much the monthly deposit rises each year, as a percent (e.g. 3). */
  annualIncreasePct: number;
}

export interface SavingsYearRow {
  year: number;
  /** Money you put in during this year. */
  deposits: number;
  /** Interest earned during this year. */
  interest: number;
  /** Running totals, used for the stacked chart. */
  totalDeposits: number;
  totalInterest: number;
  balance: number;
}

export interface SavingsResult {
  finalBalance: number;
  /** Starting balance plus every monthly deposit. */
  totalDeposits: number;
  totalInterest: number;
  /** Effective annual yield after compounding, as a percent. */
  apy: number;
  /** First year in which interest earned beats the money deposited, if any. */
  crossoverYear: number | null;
  schedule: SavingsYearRow[];
}

/** Effective annual yield of a nominal rate compounded n times a year. */
export function annualYield(ratePct: number, compounding: Compounding): number {
  const periods = COMPOUNDS_PER_YEAR[compounding];
  return ((1 + ratePct / 100 / periods) ** periods - 1) * 100;
}

/**
 * The monthly growth factor equivalent to the chosen compounding. For
 * monthly compounding this is exactly rate ÷ 12; for the others it is the
 * monthly rate that gives the same yearly yield.
 */
function monthlyGrowthRate(ratePct: number, compounding: Compounding) {
  const periods = COMPOUNDS_PER_YEAR[compounding];
  return (1 + ratePct / 100 / periods) ** (periods / 12) - 1;
}

export function calculateSavings(input: SavingsInputs): SavingsResult {
  const initialDeposit = Math.max(0, input.initialDeposit);
  const baseMonthlyDeposit = Math.max(0, input.monthlyDeposit);
  const years = Math.max(0, Math.round(input.years));
  const increase = Math.max(0, input.annualIncreasePct) / 100;
  const monthlyRate = monthlyGrowthRate(
    Math.max(0, input.rate),
    input.compounding,
  );

  let balance = initialDeposit;
  let totalDeposits = initialDeposit;
  let totalInterest = 0;
  let crossoverYear: number | null = null;
  const schedule: SavingsYearRow[] = [];

  for (let year = 1; year <= years; year++) {
    const monthlyDeposit = baseMonthlyDeposit * (1 + increase) ** (year - 1);
    let yearInterest = 0;
    for (let month = 0; month < 12; month++) {
      const interest = balance * monthlyRate;
      balance += interest + monthlyDeposit;
      yearInterest += interest;
    }
    const yearDeposits = monthlyDeposit * 12;
    totalDeposits += yearDeposits;
    totalInterest += yearInterest;
    if (
      crossoverYear === null &&
      yearDeposits > 0 &&
      yearInterest > yearDeposits
    ) {
      crossoverYear = year;
    }
    schedule.push({
      year,
      deposits: yearDeposits,
      interest: yearInterest,
      totalDeposits,
      totalInterest,
      balance,
    });
  }

  return {
    finalBalance: balance,
    totalDeposits,
    totalInterest,
    apy: annualYield(Math.max(0, input.rate), input.compounding),
    crossoverYear,
    schedule,
  };
}

/**
 * The fixed monthly deposit needed to reach a target balance, with no yearly
 * increase. Returns 0 when the starting balance alone gets there.
 */
export function monthlyDepositForGoal(
  input: Omit<SavingsInputs, "monthlyDeposit" | "annualIncreasePct">,
  goal: number,
): number {
  const months = Math.max(0, Math.round(input.years)) * 12;
  if (months === 0) return Math.max(0, goal - input.initialDeposit);
  const monthlyRate = monthlyGrowthRate(
    Math.max(0, input.rate),
    input.compounding,
  );
  const growth = (1 + monthlyRate) ** months;
  const fromStart = Math.max(0, input.initialDeposit) * growth;
  const shortfall = goal - fromStart;
  if (shortfall <= 0) return 0;
  const annuityFactor = monthlyRate === 0 ? months : (growth - 1) / monthlyRate;
  return shortfall / annuityFactor;
}
