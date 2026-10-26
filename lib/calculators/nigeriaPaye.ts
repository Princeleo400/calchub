// Pure Nigerian PAYE math under the Nigeria Tax Act 2025 (in force from
// 1 January 2026), plus the old Personal Income Tax Act rules for comparison.
// All amounts are in naira. Update the dated blocks below when the law
// changes, and keep the tests in step.

export interface TaxBand {
  /** Size of the band in naira; Infinity for the top band. */
  width: number;
  /** Percent. */
  rate: number;
}

/**
 * Nigeria Tax Act 2025. Bands: Fourth Schedule (via section 58). Deductions
 * and rent relief: section 30(2). Minimum wage earners excluded: section 58.
 */
export const NIGERIA_TAX_ACT_2025 = {
  effectiveFrom: "2026-01-01",
  bands: [
    { width: 800_000, rate: 0 },
    { width: 2_200_000, rate: 15 },
    { width: 9_000_000, rate: 18 },
    { width: 13_000_000, rate: 21 },
    { width: 25_000_000, rate: 23 },
    { width: Infinity, rate: 25 },
  ] as TaxBand[],
  rentReliefPct: 20,
  rentReliefCap: 500_000,
} as const;

/**
 * Personal Income Tax Act as amended to 2025, for the old-versus-new
 * comparison only. The old minimum tax rule is not modelled.
 */
export const OLD_PITA_RULES = {
  bands: [
    { width: 300_000, rate: 7 },
    { width: 300_000, rate: 11 },
    { width: 500_000, rate: 15 },
    { width: 500_000, rate: 19 },
    { width: 1_600_000, rate: 21 },
    { width: Infinity, rate: 24 },
  ] as TaxBand[],
  /** Consolidated relief: the higher of ₦200,000 or 1% of gross, plus 20%. */
  craFixed: 200_000,
  craFloorPct: 1,
  craPct: 20,
} as const;

/** National minimum wage, monthly (National Minimum Wage Amendment Act 2024). */
export const MINIMUM_WAGE_MONTHLY = 70_000;

/** Employee pension: 8% of basic + housing + transport (Pension Reform Act 2014, s. 4). */
export const EMPLOYEE_PENSION_PCT = 8;

/** National Housing Fund: 2.5% of basic salary (NHF Act, s. 4). */
export const NHF_PCT = 2.5;

export interface PayeInputs {
  /** Total monthly pay before deductions, including all allowances. */
  monthlyGross: number;
  monthlyBasic: number;
  monthlyHousing: number;
  monthlyTransport: number;
  contributesPension: boolean;
  contributesNhf: boolean;
  /** Yearly amounts. */
  annualHealthInsurance: number;
  annualRent: number;
  annualLifeInsurance: number;
  annualMortgageInterest: number;
}

export interface BandRow {
  from: number;
  to: number;
  rate: number;
  /** Income taxed in this band. */
  taxable: number;
  tax: number;
}

export interface PayeResult {
  annualGross: number;
  pension: number;
  nhf: number;
  healthInsurance: number;
  rentRelief: number;
  lifeInsurance: number;
  mortgageInterest: number;
  totalDeductions: number;
  chargeableIncome: number;
  /** Exempt because pay is at or below the national minimum wage. */
  minimumWageExempt: boolean;
  annualTax: number;
  monthlyTax: number;
  /** Pay after tax and payroll deductions (pension, NHF, health insurance). */
  monthlyTakeHome: number;
  /** Tax as a percent of gross pay. */
  effectiveRate: number;
  /** Rate on the next naira of chargeable income. */
  marginalRate: number;
  bands: BandRow[];
  /** True when basic, housing and transport add up to more than gross. */
  componentsExceedGross: boolean;
  /** The same salary under the old rules, when a fair comparison is possible. */
  oldRulesAnnualTax: number | null;
}

/** Tax on an amount, band by band. */
export function taxByBands(amount: number, bands: TaxBand[]): BandRow[] {
  const rows: BandRow[] = [];
  let from = 0;
  for (const band of bands) {
    const to = from + band.width;
    const taxable = Math.max(0, Math.min(amount, to) - from);
    rows.push({
      from,
      to,
      rate: band.rate,
      taxable,
      tax: (taxable * band.rate) / 100,
    });
    from = to;
  }
  return rows;
}

const sum = (values: number[]) =>
  values.reduce((total, value) => total + value, 0);

function marginalRateFor(amount: number, bands: TaxBand[]): number {
  let upper = 0;
  for (const band of bands) {
    upper += band.width;
    if (amount < upper) return band.rate;
  }
  return bands.at(-1)!.rate;
}

/** Old rules: pension, NHF and health insurance out first, then the CRA. */
export function oldRulesTax(
  annualGross: number,
  exemptContributions: number,
  minimumWageExempt: boolean,
): number {
  if (minimumWageExempt) return 0;
  const grossForRelief = Math.max(0, annualGross - exemptContributions);
  const relief =
    Math.max(
      OLD_PITA_RULES.craFixed,
      (grossForRelief * OLD_PITA_RULES.craFloorPct) / 100,
    ) +
    (grossForRelief * OLD_PITA_RULES.craPct) / 100;
  const taxable = Math.max(0, grossForRelief - relief);
  return sum(taxByBands(taxable, OLD_PITA_RULES.bands).map((row) => row.tax));
}

export function calculatePaye(input: PayeInputs): PayeResult {
  const monthlyGross = Math.max(0, input.monthlyGross);
  const basic = Math.max(0, input.monthlyBasic);
  const housing = Math.max(0, input.monthlyHousing);
  const transport = Math.max(0, input.monthlyTransport);
  const annualGross = monthlyGross * 12;
  const componentsExceedGross = basic + housing + transport > monthlyGross;
  // Never base a deduction on more than the person is actually paid.
  const pensionable = Math.min(basic + housing + transport, monthlyGross) * 12;

  const pension = input.contributesPension
    ? (pensionable * EMPLOYEE_PENSION_PCT) / 100
    : 0;
  const nhf = input.contributesNhf
    ? (Math.min(basic, monthlyGross) * 12 * NHF_PCT) / 100
    : 0;
  const healthInsurance = Math.max(0, input.annualHealthInsurance);
  const rentRelief = Math.min(
    (Math.max(0, input.annualRent) * NIGERIA_TAX_ACT_2025.rentReliefPct) / 100,
    NIGERIA_TAX_ACT_2025.rentReliefCap,
  );
  const lifeInsurance = Math.max(0, input.annualLifeInsurance);
  const mortgageInterest = Math.max(0, input.annualMortgageInterest);

  const totalDeductions =
    pension +
    nhf +
    healthInsurance +
    rentRelief +
    lifeInsurance +
    mortgageInterest;
  const chargeableIncome = Math.max(0, annualGross - totalDeductions);
  const minimumWageExempt =
    monthlyGross > 0 && monthlyGross <= MINIMUM_WAGE_MONTHLY;

  const bands = taxByBands(chargeableIncome, NIGERIA_TAX_ACT_2025.bands);
  const annualTax = minimumWageExempt ? 0 : sum(bands.map((row) => row.tax));
  const payrollDeductions = pension + nhf + healthInsurance;

  return {
    annualGross,
    pension,
    nhf,
    healthInsurance,
    rentRelief,
    lifeInsurance,
    mortgageInterest,
    totalDeductions,
    chargeableIncome,
    minimumWageExempt,
    annualTax,
    monthlyTax: annualTax / 12,
    monthlyTakeHome: Math.max(
      0,
      monthlyGross - (payrollDeductions + annualTax) / 12,
    ),
    effectiveRate: annualGross > 0 ? (annualTax / annualGross) * 100 : 0,
    marginalRate: minimumWageExempt
      ? 0
      : marginalRateFor(chargeableIncome, NIGERIA_TAX_ACT_2025.bands),
    bands,
    componentsExceedGross,
    // The old rules treated life insurance and mortgage interest differently,
    // so the comparison is only shown when neither is claimed.
    oldRulesAnnualTax:
      lifeInsurance === 0 && mortgageInterest === 0
        ? oldRulesTax(annualGross, payrollDeductions, minimumWageExempt)
        : null,
  };
}
