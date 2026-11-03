import type {
  AffordabilityResult,
  AffordabilityStatus,
  FinancialInput,
  HealthScoreResult,
  LoanCalculation,
  LoanOption,
  ScenarioResult,
  Thresholds,
} from './types';
import { DEFAULT_THRESHOLDS } from './types';

/** Standard reducing-balance EMI: P * r * (1+r)^n / ((1+r)^n - 1) */
export function calculateEMI(
  principal: number,
  annualRatePercent: number,
  months: number,
): number {
  if (principal <= 0 || months <= 0) return 0;
  const r = annualRatePercent / 100 / 12;
  if (r === 0) return principal / months;
  const pow = Math.pow(1 + r, months);
  return (principal * r * pow) / (pow - 1);
}

export function calculateLoan(loan: LoanOption): LoanCalculation {
  const monthlyEMI = calculateEMI(
    loan.loanAmount,
    loan.annualInterestRate,
    loan.durationMonths,
  );
  const totalRepayment = monthlyEMI * loan.durationMonths;
  const totalInterest = totalRepayment - loan.loanAmount;
  const totalCost =
    totalRepayment + loan.processingFee + loan.additionalCharges;
  return {
    monthlyEMI,
    totalInterest,
    totalRepayment,
    processingFee: loan.processingFee,
    additionalCharges: loan.additionalCharges,
    totalCost,
  };
}

export function totalObligations(input: FinancialInput): number {
  return (
    input.existingEMI + input.bnplPayments + input.creditCardPayments
  );
}

export function remainingIncome(input: FinancialInput): number {
  return input.monthlyIncome - totalObligations(input);
}

export function getStatus(
  ratio: number,
  thresholds: Thresholds = DEFAULT_THRESHOLDS,
): AffordabilityStatus {
  if (ratio <= thresholds.safeMax) return 'SAFE';
  if (ratio <= thresholds.stretchMax) return 'STRETCH';
  return 'HIGH RISK';
}

export function calculateAffordability(
  input: FinancialInput,
  newEMI: number,
  thresholds: Thresholds = DEFAULT_THRESHOLDS,
): AffordabilityResult {
  const totalExistingObligations = totalObligations(input);
  const existingObligationRatio =
    input.monthlyIncome > 0
      ? (totalExistingObligations / input.monthlyIncome) * 100
      : 0;
  const remaining = input.monthlyIncome - totalExistingObligations;
  const projectedObligations = totalExistingObligations + newEMI;
  const projectedObligationRatio =
    input.monthlyIncome > 0
      ? (projectedObligations / input.monthlyIncome) * 100
      : 0;
  const status = getStatus(projectedObligationRatio, thresholds);
  return {
    totalExistingObligations,
    existingObligationRatio,
    remainingIncome: remaining,
    newEMI,
    projectedObligations,
    projectedObligationRatio,
    status,
    remainingAfterNewEMI: remaining - newEMI,
  };
}

/** Estimate a new EMI for the emergency amount at a representative rate. */
export function estimateNewEMI(
  amount: number,
  months: number,
  rate = 14,
): number {
  return calculateEMI(amount, rate, months);
}

export function calculateHealthScore(
  input: FinancialInput,
  affordability: AffordabilityResult,
): HealthScoreResult {
  let score = 100;
  const factors: HealthScoreResult['factors'] = [];

  // Obligation ratio impact
  const oblRatio = affordability.existingObligationRatio;
  if (oblRatio > 50) {
    score -= 30;
    factors.push({
      label: 'Existing obligations',
      value: `${oblRatio.toFixed(0)}% of income`,
      positive: false,
    });
  } else if (oblRatio > 30) {
    score -= 15;
    factors.push({
      label: 'Existing obligations',
      value: `${oblRatio.toFixed(0)}% of income`,
      positive: false,
    });
  } else {
    factors.push({
      label: 'Existing obligations',
      value: `${oblRatio.toFixed(0)}% of income`,
      positive: true,
    });
  }

  // Savings coverage
  const savingsCoverage =
    input.monthlyIncome > 0
      ? input.availableSavings / input.monthlyIncome
      : 0;
  if (savingsCoverage >= 3) {
    factors.push({
      label: 'Savings buffer',
      value: `${savingsCoverage.toFixed(1)}x monthly income`,
      positive: true,
    });
  } else if (savingsCoverage >= 1) {
    score -= 10;
    factors.push({
      label: 'Savings buffer',
      value: `${savingsCoverage.toFixed(1)}x monthly income`,
      positive: false,
    });
  } else {
    score -= 25;
    factors.push({
      label: 'Savings buffer',
      value: `${savingsCoverage.toFixed(1)}x monthly income`,
      positive: false,
    });
  }

  // Projected ratio
  if (affordability.projectedObligationRatio > 60) {
    score -= 25;
    factors.push({
      label: 'Projected obligations',
      value: `${affordability.projectedObligationRatio.toFixed(0)}% of income`,
      positive: false,
    });
  } else if (affordability.projectedObligationRatio > 40) {
    score -= 12;
    factors.push({
      label: 'Projected obligations',
      value: `${affordability.projectedObligationRatio.toFixed(0)}% of income`,
      positive: false,
    });
  } else {
    factors.push({
      label: 'Projected obligations',
      value: `${affordability.projectedObligationRatio.toFixed(0)}% of income`,
      positive: true,
    });
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  let rating = 'Poor';
  if (score >= 75) rating = 'Excellent';
  else if (score >= 55) rating = 'Good';
  else if (score >= 35) rating = 'Fair';

  return { score, rating, factors };
}

export function generateScenarios(
  input: FinancialInput,
  thresholds: Thresholds = DEFAULT_THRESHOLDS,
): ScenarioResult[] {
  const amount = input.emergencyAmount;
  const months = input.repaymentDuration || 12;
  const baseRate = 14;
  const obl = totalObligations(input);

  const make = (
    label: string,
    borrowAmount: number,
    description: string,
    usesSavings: boolean,
    recommended: boolean,
  ): ScenarioResult => {
    const emi = estimateNewEMI(borrowAmount, months, baseRate);
    const totalRepayment = emi * months;
    const totalInterest = totalRepayment - borrowAmount;
    const projected = obl + emi;
    const ratio =
      input.monthlyIncome > 0
        ? (projected / input.monthlyIncome) * 100
        : 0;
    const remaining = input.monthlyIncome - projected;
    return {
      label,
      borrowAmount,
      monthlyEMI: emi,
      totalInterest,
      totalRepayment,
      remainingIncome: remaining,
      projectedObligationRatio: ratio,
      status: getStatus(ratio, thresholds),
      description,
      usesSavings,
      recommended,
    };
  };

  const scenarios: ScenarioResult[] = [];

  // 1. Use savings
  const savingsCanCover = input.availableSavings >= amount;
  scenarios.push(
    make(
      'Use Available Savings',
      0,
      savingsCanCover
        ? 'Your savings can fully cover this expense with no new debt.'
        : 'Savings cover part of the expense. You would still need to borrow the remainder.',
      true,
      savingsCanCover,
    ),
  );

  // 2. Borrow smaller amount
  const smallerAmount = Math.max(0, amount - input.availableSavings);
  const halfAmount = Math.max(0, Math.round(amount * 0.5));
  const borrowSmaller = smallerAmount > 0 ? smallerAmount : halfAmount;
  scenarios.push(
    make(
      'Borrow a Smaller Amount',
      borrowSmaller,
      'Reduce the borrowing by using savings or cutting the amount needed, lowering total interest.',
      false,
      borrowSmaller > 0 && borrowSmaller < amount,
    ),
  );

  // 3. Borrow full amount
  scenarios.push(
    make(
      'Borrow the Full Amount',
      amount,
      'Take the entire amount as a loan. Highest interest cost and highest monthly burden.',
      false,
      false,
    ),
  );

  // 4. Non-credit alternatives
  scenarios.push(
    make(
      'Explore Non-Credit Alternatives',
      0,
      'Consider employer advances, family support, payment plans, or emergency assistance funds. No interest cost.',
      true,
      true,
    ),
  );

  return scenarios;
}

export function generateExplanation(
  input: FinancialInput,
  affordability: AffordabilityResult,
): string[] {
  const explanations: string[] = [];
  const obl = affordability.existingObligationRatio;
  const proj = affordability.projectedObligationRatio;

  if (obl > 50) {
    explanations.push(
      `Your existing financial commitments already consume ${obl.toFixed(0)}% of your monthly income, which is well above the recommended 40%. Taking another loan will significantly increase repayment pressure.`,
    );
  } else if (obl > 30) {
    explanations.push(
      `Your existing commitments use ${obl.toFixed(0)}% of your income. While manageable, adding a new EMI will push your total obligations higher.`,
    );
  } else {
    explanations.push(
      `Your existing obligations are only ${obl.toFixed(0)}% of your income, giving you healthy room to absorb new credit if needed.`,
    );
  }

  if (affordability.status === 'HIGH RISK') {
    explanations.push(
      `With the new loan, your projected obligations would reach ${proj.toFixed(0)}% of your income. This is classified as HIGH RISK — more than half your income would go toward debt. Consider a smaller borrowing amount or explore non-credit alternatives.`,
    );
  } else if (affordability.status === 'STRETCH') {
    explanations.push(
      `Your projected obligations would be ${proj.toFixed(0)}% of your income. This is a STRETCH — affordable but tight. You would have ₹${affordability.remainingAfterNewEMI.toFixed(0)}/month left after all obligations. Make sure this is enough for your living expenses.`,
    );
  } else {
    explanations.push(
      `Your projected obligations would be ${proj.toFixed(0)}% of your income, which falls in the SAFE zone. You would still have ₹${affordability.remainingAfterNewEMI.toFixed(0)}/month remaining after all commitments.`,
    );
  }

  if (input.availableSavings >= input.emergencyAmount) {
    explanations.push(
      `Your available savings (₹${input.availableSavings.toLocaleString('en-IN')}) can fully cover the emergency amount of ₹${input.emergencyAmount.toLocaleString('en-IN')}. Using savings avoids interest costs entirely.`,
    );
  } else if (input.availableSavings > 0) {
    explanations.push(
      `You have ₹${input.availableSavings.toLocaleString('en-IN')} in savings. Using this would reduce your borrowing need to ₹${Math.max(0, input.emergencyAmount - input.availableSavings).toLocaleString('en-IN')}, saving you significant interest.`,
    );
  } else {
    explanations.push(
      `You have no savings buffer. We strongly recommend building an emergency fund of at least 3 months of expenses to avoid relying on credit during emergencies.`,
    );
  }

  return explanations;
}

export function formatCurrency(n: number): string {
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

export function formatPercent(n: number): string {
  return `${n.toFixed(1)}%`;
}
