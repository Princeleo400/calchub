// "How much house can I afford?" — the mortgage calculator run in reverse:
// from a monthly budget set by debt-to-income (DTI) limits back to a price.
import { monthlyPayment, PMI_REQUIRED_ABOVE_LTV } from "./mortgage.ts";

export interface AffordabilityInputs {
  annualIncome: number;
  /** Other monthly debt payments: car, student loans, card minimums. */
  monthlyDebts: number;
  downPaymentPct: number;
  rate: number;
  termYears: number;
  propertyTaxPct: number;
  insurancePerYear: number;
  hoaPerMonth: number;
  pmiPct: number;
  /** Max share of gross income for housing costs, e.g. 28. */
  housingRatioPct: number;
  /** Max share of gross income for housing plus all other debts, e.g. 36. */
  totalDtiPct: number;
}

export interface AffordabilityResult {
  maxHomePrice: number;
  loanAmount: number;
  downPayment: number;
  /** The full monthly housing payment at the max price. */
  monthlyPayment: number;
  monthlyIncome: number;
  /** Which limit set the budget. */
  limitedBy: "housing" | "total";
  housingBudget: number;
}

/**
 * Housing cost is linear in price: P&I and PMI scale with the loan, tax with
 * the price; insurance and HOA are fixed. So price = (budget − fixed) ÷ costPerDollar.
 */
export function calculateAffordability(
  inputs: AffordabilityInputs,
): AffordabilityResult {
  const monthlyIncome = Math.max(0, inputs.annualIncome) / 12;
  const housingCap = (monthlyIncome * inputs.housingRatioPct) / 100;
  const totalCap =
    (monthlyIncome * inputs.totalDtiPct) / 100 -
    Math.max(0, inputs.monthlyDebts);
  const limitedBy = totalCap < housingCap ? "total" : "housing";
  const housingBudget = Math.max(0, Math.min(housingCap, totalCap));

  const loanShare = 1 - Math.min(100, Math.max(0, inputs.downPaymentPct)) / 100;
  const piPerLoanDollar = monthlyPayment(1, inputs.rate, inputs.termYears);
  const needsPmi = loanShare > PMI_REQUIRED_ABOVE_LTV;
  const perPriceDollar =
    loanShare * piPerLoanDollar +
    inputs.propertyTaxPct / 100 / 12 +
    (needsPmi ? (loanShare * inputs.pmiPct) / 100 / 12 : 0);
  const fixed =
    Math.max(0, inputs.insurancePerYear) / 12 + Math.max(0, inputs.hoaPerMonth);

  const maxHomePrice =
    perPriceDollar > 0
      ? Math.max(0, (housingBudget - fixed) / perPriceDollar)
      : 0;
  const loanAmount = maxHomePrice * loanShare;

  return {
    maxHomePrice,
    loanAmount,
    downPayment: maxHomePrice - loanAmount,
    monthlyPayment:
      maxHomePrice > 0 ? maxHomePrice * perPriceDollar + fixed : 0,
    monthlyIncome,
    limitedBy,
    housingBudget,
  };
}
