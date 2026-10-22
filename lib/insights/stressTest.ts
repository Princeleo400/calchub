import {
  CANADA_RULES,
  type StressTestInputs,
  type StressTestResult,
} from "@/lib/calculators/stressTest";
import { formatCurrency, formatPercent } from "@/lib/utils";

const cad = (amount: number) => formatCurrency(amount, "CAD");
const floorK = (amount: number) => cad(Math.floor(amount / 1000) * 1000);

/** Plain-English explanation of a stress test result. */
export function stressTestInsight(
  inputs: StressTestInputs,
  result: StressTestResult,
): string[] {
  if (inputs.price <= 0 || inputs.annualIncome <= 0)
    return [
      "Enter the home price and your household income to run the stress test.",
    ];

  if (result.problem === "downTooLow") {
    return [
      inputs.price >= CANADA_RULES.insuredPriceCap
        ? `Homes priced at ${cad(CANADA_RULES.insuredPriceCap)} or more can't use mortgage insurance, so you need at least 20% down: ${cad(result.minDown)}.`
        : `The minimum down payment on a ${cad(inputs.price)} home is ${cad(result.minDown)}: 5% of the first $500,000 and 10% of any amount above it. Increase your down payment to run the test.`,
    ];
  }

  const lines: string[] = [];
  lines.push(
    `At your ${formatPercent(inputs.contractRate, 2)} rate the payment would be ${cad(result.paymentAtContract)} a month, but lenders check that you could afford ${cad(result.paymentAtQualifying)} at the qualifying rate of ${formatPercent(result.qualifyingRate, 2)}.`,
  );

  if (result.passes) {
    lines.push(
      `At that payment your housing costs take ${formatPercent(result.gds, 1)} of gross income (limit ${CANADA_RULES.maxGds}%) and all debts ${formatPercent(result.tds, 1)} (limit ${CANADA_RULES.maxTds}%), so you pass the stress test.`,
    );
  } else {
    const failed = [
      !result.passesGds &&
        `housing costs reach ${formatPercent(result.gds, 1)} of income, above the ${CANADA_RULES.maxGds}% limit`,
      !result.passesTds &&
        `total debts reach ${formatPercent(result.tds, 1)}, above the ${CANADA_RULES.maxTds}% limit`,
    ].filter(Boolean);
    lines.push(`You would not pass: ${failed.join(", and ")}.`);
  }

  if (result.maxPrice > 0) {
    lines.push(
      `With ${cad(inputs.downPayment)} down, the most you could qualify for is a home of about ${floorK(result.maxPrice)}, with a mortgage of up to about ${floorK(result.maxMortgage)}.`,
    );
  }

  if (result.insured) {
    lines.push(
      `Because you are putting down less than 20%, the mortgage must be insured. The ${formatPercent(result.premiumRatePct, 2)} CMHC premium, ${cad(result.premium)}, is added to the mortgage.${
        inputs.amortizationYears > 25
          ? " Insured 30-year amortizations are only available to first-time buyers and buyers of new builds."
          : ""
      }`,
    );
  }

  return lines;
}
