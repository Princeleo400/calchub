// UK Stamp Duty Land Tax (SDLT) on residential property in England and
// Northern Ireland. Scotland (LBTT) and Wales (LTT) have their own taxes.
//
// RATES CHANGE. Every rate lives in SDLT_RATES below, with the date it took
// effect and the date it was last checked. Recheck after every UK Budget.

export interface Band {
  /** Upper limit of the band in pounds; Infinity for the top band. */
  upTo: number;
  /** Rate as a percent. */
  rate: number;
}

export const SDLT_RATES = {
  effectiveFrom: "2025-04-01",
  lastChecked: "2026-10-22",
  standard: [
    { upTo: 125_000, rate: 0 },
    { upTo: 250_000, rate: 2 },
    { upTo: 925_000, rate: 5 },
    { upTo: 1_500_000, rate: 10 },
    { upTo: Infinity, rate: 12 },
  ] as Band[],
  firstTimeBuyer: [
    { upTo: 300_000, rate: 0 },
    { upTo: 500_000, rate: 5 },
  ] as Band[],
  /** First-time buyer relief is withdrawn entirely above this price. */
  firstTimeBuyerMaxPrice: 500_000,
  /** Percentage points added to every band for additional dwellings (from 31 Oct 2024). */
  additionalSurcharge: 5,
  /** Percentage points added to every band for non-UK residents (from 1 Apr 2021). */
  nonResidentSurcharge: 2,
  /** Surcharges don't apply to purchases below this price. */
  surchargeMinPrice: 40_000,
} as const;

export type BuyerType = "mover" | "firstTime" | "additional";

export interface StampDutyInputs {
  price: number;
  buyer: BuyerType;
  nonResident: boolean;
}

export interface BandSlice {
  from: number;
  to: number;
  /** The rate charged on this slice, surcharges included. */
  rate: number;
  taxable: number;
  tax: number;
}

export interface StampDutyResult {
  tax: number;
  /** Tax as a percent of the price. */
  effectiveRate: number;
  slices: BandSlice[];
  /** True when the buyer is a first-time buyer and relief actually applied. */
  firstTimeReliefApplied: boolean;
  /** True when a first-time buyer is over the price cap and pays standard rates. */
  overFirstTimeCap: boolean;
  /** Extra percentage points applied to every band. */
  surchargePoints: number;
}

function sliceTax(price: number, bands: Band[], extra: number): BandSlice[] {
  const slices: BandSlice[] = [];
  let from = 0;
  for (const band of bands) {
    if (price <= from) break;
    const to = Math.min(price, band.upTo);
    const taxable = to - from;
    const rate = band.rate + extra;
    slices.push({ from, to, rate, taxable, tax: (taxable * rate) / 100 });
    from = band.upTo;
  }
  return slices;
}

export function calculateStampDuty(input: StampDutyInputs): StampDutyResult {
  const price = Math.max(0, input.price);
  const r = SDLT_RATES;
  const surchargeApplies = price >= r.surchargeMinPrice;

  const overFirstTimeCap =
    input.buyer === "firstTime" && price > r.firstTimeBuyerMaxPrice;
  const firstTimeReliefApplied =
    input.buyer === "firstTime" && !overFirstTimeCap;
  const bands = firstTimeReliefApplied ? r.firstTimeBuyer : r.standard;

  let surchargePoints = 0;
  if (surchargeApplies && input.buyer === "additional")
    surchargePoints += r.additionalSurcharge;
  if (surchargeApplies && input.nonResident)
    surchargePoints += r.nonResidentSurcharge;

  const slices = sliceTax(price, bands, surchargePoints);
  // Round down to the whole pound, as HMRC does.
  const tax = Math.floor(slices.reduce((sum, s) => sum + s.tax, 0) + 1e-9);

  return {
    tax,
    effectiveRate: price > 0 ? (tax / price) * 100 : 0,
    slices,
    firstTimeReliefApplied,
    overFirstTimeCap,
    surchargePoints,
  };
}
