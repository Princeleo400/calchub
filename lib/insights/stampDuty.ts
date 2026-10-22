import {
  calculateStampDuty,
  SDLT_RATES,
  type StampDutyInputs,
  type StampDutyResult,
} from "@/lib/calculators/stampDuty";
import { formatCurrency, formatPercent } from "@/lib/utils";

const gbp = (n: number) => formatCurrency(n, "GBP");

/** Plain-English explanation of a stamp duty result. */
export function stampDutyInsight(
  input: StampDutyInputs,
  r: StampDutyResult,
): string[] {
  if (input.price <= 0)
    return [
      "Enter the purchase price to see how much Stamp Duty you would pay.",
    ];

  const lines: string[] = [
    r.tax === 0
      ? `There is no Stamp Duty to pay on a ${gbp(input.price)} purchase.`
      : `Stamp Duty on a ${gbp(input.price)} purchase is ${gbp(r.tax)}, an effective rate of ${formatPercent(r.effectiveRate, 2)} of the price.`,
  ];

  const standard = calculateStampDuty({ ...input, buyer: "mover" }).tax;

  if (r.firstTimeReliefApplied && standard > r.tax) {
    lines.push(
      `First-time buyer relief saves you ${gbp(standard - r.tax)} compared with someone who already owns a home.`,
    );
  } else if (r.overFirstTimeCap) {
    const atCap = calculateStampDuty({
      ...input,
      price: SDLT_RATES.firstTimeBuyerMaxPrice,
    }).tax;
    lines.push(
      `First-time buyer relief only applies up to ${gbp(SDLT_RATES.firstTimeBuyerMaxPrice)}. Above that you pay standard rates on the whole price, so at ${gbp(input.price)} relief is lost entirely. At ${gbp(SDLT_RATES.firstTimeBuyerMaxPrice)} you would pay ${gbp(atCap)}.`,
    );
  } else if (
    input.buyer === "mover" &&
    input.price <= SDLT_RATES.firstTimeBuyerMaxPrice
  ) {
    const ftb = calculateStampDuty({ ...input, buyer: "firstTime" }).tax;
    if (ftb < r.tax)
      lines.push(
        `If every buyer were a first-time buyer, the bill would be ${gbp(ftb)} instead.`,
      );
  } else if (
    input.buyer === "additional" &&
    input.price >= SDLT_RATES.surchargeMinPrice
  ) {
    const withoutSurcharge = calculateStampDuty({
      ...input,
      buyer: "mover",
    }).tax;
    lines.push(
      `The ${SDLT_RATES.additionalSurcharge}% surcharge for additional properties, such as second homes and buy-to-lets, adds ${gbp(r.tax - withoutSurcharge)}.`,
    );
  }

  if (input.nonResident && input.price >= SDLT_RATES.surchargeMinPrice) {
    const resident = calculateStampDuty({ ...input, nonResident: false }).tax;
    lines.push(
      `The ${SDLT_RATES.nonResidentSurcharge}% surcharge for non-UK residents adds ${gbp(r.tax - resident)}.`,
    );
  }

  lines.push(
    "These are the rates for England and Northern Ireland. Your solicitor or conveyancer will confirm the final figure, as other reliefs and rules can apply.",
  );
  return lines;
}
