import {
  CANADA_RULES,
  type StressTestInputs,
  type StressTestResult,
} from "@/lib/calculators/stressTest";
import { formatCurrency, formatPercent } from "@/lib/utils";

const cad = (n: number) => formatCurrency(n, "CAD");
const floorK = (n: number) => cad(Math.floor(n / 1000) * 1000);

/** Plain-English explanation of a stress test result. */
export function stressTestInsight(
  i: StressTestInputs,
  r: StressTestResult,
): string[] {
  if (i.price <= 0 || i.annualIncome <= 0)
    return [
      "Enter the home price and your household income to run the stress test.",
    ];

  if (r.problem === "downTooLow") {
    return [
      i.price >= CANADA_RULES.insuredPriceCap
        ? `Homes priced at ${cad(CANADA_RULES.insuredPriceCap)} or more can't use mortgage insurance, so you need at least 20% down: ${cad(r.minDown)}.`
        : `The minimum down payment on a ${cad(i.price)} home is ${cad(r.minDown)}: 5% of the first $500,000 and 10% of any amount above it. Increase your down payment to run the test.`,
    ];
  }

  const lines: string[] = [];
  lines.push(
    `At your ${formatPercent(i.contractRate, 2)} rate the payment would be ${cad(r.paymentAtContract)} a month, but lenders check that you could afford ${cad(r.paymentAtQualifying)} at the qualifying rate of ${formatPercent(r.qualifyingRate, 2)}.`,
  );

  if (r.passes) {
    lines.push(
      `At that payment your housing costs take ${formatPercent(r.gds, 1)} of gross income (limit ${CANADA_RULES.maxGds}%) and all debts ${formatPercent(r.tds, 1)} (limit ${CANADA_RULES.maxTds}%), so you pass the stress test.`,
    );
  } else {
    const failed = [
      !r.passesGds &&
        `housing costs reach ${formatPercent(r.gds, 1)} of income, above the ${CANADA_RULES.maxGds}% limit`,
      !r.passesTds &&
        `total debts reach ${formatPercent(r.tds, 1)}, above the ${CANADA_RULES.maxTds}% limit`,
    ].filter(Boolean);
    lines.push(`You would not pass: ${failed.join(", and ")}.`);
  }

  if (r.maxPrice > 0) {
    lines.push(
      `With ${cad(i.downPayment)} down, the most you could qualify for is a home of about ${floorK(r.maxPrice)}, with a mortgage of up to about ${floorK(r.maxMortgage)}.`,
    );
  }

  if (r.insured) {
    lines.push(
      `Because you are putting down less than 20%, the mortgage must be insured. The ${formatPercent(r.premiumRatePct, 2)} CMHC premium, ${cad(r.premium)}, is added to the mortgage.${
        i.amortizationYears > 25
          ? " Insured 30-year amortizations are only available to first-time buyers and buyers of new builds."
          : ""
      }`,
    );
  }

  return lines;
}
