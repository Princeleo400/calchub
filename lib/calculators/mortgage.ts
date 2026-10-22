// Pure mortgage math. No React, no imports, so it can be unit-tested directly
// with `node --test` and reused anywhere (long-tail pages, country variants).

export interface MortgageInputs {
  /** Purchase price of the home. */
  homePrice: number;
  /** Down payment as a percent of the price, e.g. 20. */
  downPaymentPct: number;
  /** Annual interest rate as a percent, e.g. 6.5. */
  rate: number;
  termYears: number;
  /** Annual property tax as a percent of the home price. */
  propertyTaxPct: number;
  /** Homeowners insurance per year. */
  insurancePerYear: number;
  /** HOA dues per month. */
  hoaPerMonth: number;
  /** Annual PMI as a percent of the loan amount. Only charged under 20% down. */
  pmiPct: number;
  /** Extra principal paid every month. */
  extraPerMonth: number;
}

export interface YearRow {
  year: number;
  principal: number;
  interest: number;
  /** Balance left at the end of the year. */
  balance: number;
}

export interface MortgageResult {
  loanAmount: number;
  downPayment: number;
  /** Scheduled principal and interest. Excludes the extra payment. */
  monthlyPrincipalInterest: number;
  monthlyTax: number;
  monthlyInsurance: number;
  /** PMI in the first month; 0 when not required. */
  monthlyPmi: number;
  monthlyHoa: number;
  /** Everything paid in month one, including any extra principal. */
  totalMonthly: number;
  totalInterest: number;
  /** Total PMI paid before it drops off. */
  totalPmi: number;
  /** Months until the loan is repaid (shorter than the term with extra payments). */
  payoffMonths: number;
  /**
   * Month PMI stops automatically: when the scheduled balance (ignoring extra
   * payments) reaches 78% of the home price, or at the loan's midpoint.
   * Null if PMI is never charged. Borrowers can usually ask to cancel earlier, at 80%.
   */
  pmiEndsMonth: number | null;
  /** Interest the extra payments save versus the plain schedule. */
  interestSaved: number;
  /** Months the extra payments cut from the term. */
  monthsSaved: number;
  schedule: YearRow[];
}

/** PMI is generally required when the loan is above 80% of the home's value. */
export const PMI_REQUIRED_ABOVE_LTV = 0.8;
/** Federal law ends borrower-paid PMI once the scheduled balance reaches 78% of original value. */
export const PMI_AUTO_ENDS_AT_LTV = 0.78;

/** Standard amortizing payment: P × r(1+r)^n / ((1+r)^n − 1). */
export function monthlyPayment(
  principal: number,
  annualRatePct: number,
  termYears: number,
): number {
  const payments = Math.round(termYears * 12);
  if (principal <= 0 || payments <= 0) return 0;
  const monthlyRate = annualRatePct / 100 / 12;
  if (monthlyRate === 0) return principal / payments;
  const growth = Math.pow(1 + monthlyRate, payments);
  return (principal * monthlyRate * growth) / (growth - 1);
}

interface Amortization {
  months: number;
  totalInterest: number;
  totalPmi: number;
  pmiEndsMonth: number | null;
  schedule: YearRow[];
}

function amortize(
  principal: number,
  annualRatePct: number,
  scheduled: number,
  extra: number,
  maxMonths: number,
  pmi: { monthly: number; endsBelowBalance: number },
): Amortization {
  const monthlyRate = annualRatePct / 100 / 12;
  let balance = principal;
  // PMI's automatic end follows the original schedule, ignoring extra payments.
  let scheduledBalance = principal;
  let month = 0;
  let totalInterest = 0;
  let totalPmi = 0;
  let pmiEndsMonth: number | null = null;
  let pmiActive = pmi.monthly > 0;
  const schedule: YearRow[] = [];
  let yearPrincipal = 0;
  let yearInterest = 0;

  // Safety cap: never loop past the term (plus a little float slack).
  while (balance > 0.005 && month < maxMonths + 1) {
    month += 1;
    const interest = balance * monthlyRate;
    const principalPaid = Math.min(balance, scheduled + extra - interest);
    if (principalPaid <= 0) break; // payment can't cover interest; guarded by callers
    if (pmiActive) totalPmi += pmi.monthly;
    balance -= principalPaid;
    totalInterest += interest;
    yearPrincipal += principalPaid;
    yearInterest += interest;

    scheduledBalance -= Math.min(
      scheduledBalance,
      scheduled - scheduledBalance * monthlyRate,
    );

    // Ends at 78% of original value on schedule, or by the loan's midpoint,
    // whichever comes first (or when the loan is simply paid off).
    if (
      pmiActive &&
      (scheduledBalance <= pmi.endsBelowBalance ||
        month >= maxMonths / 2 ||
        balance <= 0.005)
    ) {
      pmiActive = false;
      pmiEndsMonth = month;
    }

    if (month % 12 === 0 || balance <= 0.005) {
      schedule.push({
        year: Math.ceil(month / 12),
        principal: yearPrincipal,
        interest: yearInterest,
        balance: Math.max(0, balance),
      });
      yearPrincipal = 0;
      yearInterest = 0;
    }
  }

  return { months: month, totalInterest, totalPmi, pmiEndsMonth, schedule };
}

export function calculateMortgage(input: MortgageInputs): MortgageResult {
  const homePrice = Math.max(0, input.homePrice);
  const downPct = Math.min(100, Math.max(0, input.downPaymentPct));
  const downPayment = (homePrice * downPct) / 100;
  const loanAmount = Math.max(0, homePrice - downPayment);
  const termMonths = Math.round(input.termYears * 12);
  const extra = Math.max(0, input.extraPerMonth);

  const principalInterest = monthlyPayment(
    loanAmount,
    input.rate,
    input.termYears,
  );
  const monthlyTax = (homePrice * Math.max(0, input.propertyTaxPct)) / 100 / 12;
  const monthlyInsurance = Math.max(0, input.insurancePerYear) / 12;
  const monthlyHoa = Math.max(0, input.hoaPerMonth);

  const needsPmi =
    homePrice > 0 && loanAmount / homePrice > PMI_REQUIRED_ABOVE_LTV;
  const monthlyPmi = needsPmi
    ? (loanAmount * Math.max(0, input.pmiPct)) / 100 / 12
    : 0;
  const pmi = {
    monthly: monthlyPmi,
    endsBelowBalance: homePrice * PMI_AUTO_ENDS_AT_LTV,
  };

  const withExtra = amortize(
    loanAmount,
    input.rate,
    principalInterest,
    extra,
    termMonths,
    pmi,
  );
  const baseline =
    extra > 0
      ? amortize(loanAmount, input.rate, principalInterest, 0, termMonths, pmi)
      : withExtra;

  return {
    loanAmount,
    downPayment,
    monthlyPrincipalInterest: principalInterest,
    monthlyTax,
    monthlyInsurance,
    monthlyPmi,
    monthlyHoa,
    totalMonthly:
      principalInterest +
      extra +
      monthlyTax +
      monthlyInsurance +
      monthlyPmi +
      monthlyHoa,
    totalInterest: withExtra.totalInterest,
    totalPmi: withExtra.totalPmi,
    payoffMonths: loanAmount > 0 ? withExtra.months : 0,
    pmiEndsMonth: withExtra.pmiEndsMonth,
    interestSaved: Math.max(
      0,
      baseline.totalInterest - withExtra.totalInterest,
    ),
    monthsSaved: Math.max(0, baseline.months - withExtra.months),
    schedule: withExtra.schedule,
  };
}

/** "28 years 4 months", "15 years", "8 months". */
export function formatDuration(months: number): string {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} year${years === 1 ? "" : "s"}`);
  if (rest > 0) parts.push(`${rest} month${rest === 1 ? "" : "s"}`);
  return parts.join(" ") || "0 months";
}
