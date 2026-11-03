export type EmergencyCategory = 'Medical' | 'Education' | 'Travel' | 'Home Repair' | 'Other';

export type AffordabilityStatus = 'SAFE' | 'STRETCH' | 'HIGH RISK';

export type Urgency = 'Immediately' | 'Within a week' | 'Within a month' | 'Flexible';

export interface FinancialInput {
  monthlyIncome: number;
  emergencyAmount: number;
  existingEMI: number;
  bnplPayments: number;
  creditCardPayments: number;
  availableSavings: number;
  emergencyCategory: EmergencyCategory;
  repaymentDuration: number; // months
}

export interface LoanOption {
  id: string;
  name: string;
  lender: string;
  loanAmount: number;
  annualInterestRate: number; // percent
  durationMonths: number;
  processingFee: number; // flat amount
  additionalCharges: number; // flat amount
}

export interface LoanCalculation {
  monthlyEMI: number;
  totalInterest: number;
  totalRepayment: number;
  processingFee: number;
  additionalCharges: number;
  totalCost: number;
}

export interface AffordabilityResult {
  totalExistingObligations: number;
  existingObligationRatio: number;
  remainingIncome: number;
  newEMI: number;
  projectedObligations: number;
  projectedObligationRatio: number;
  status: AffordabilityStatus;
  remainingAfterNewEMI: number;
}

export interface ScenarioResult {
  label: string;
  borrowAmount: number;
  monthlyEMI: number;
  totalInterest: number;
  totalRepayment: number;
  remainingIncome: number;
  projectedObligationRatio: number;
  status: AffordabilityStatus;
  description: string;
  usesSavings: boolean;
  recommended: boolean;
}

export interface HealthScoreResult {
  score: number; // 0-100
  rating: string;
  factors: { label: string; value: string; positive: boolean }[];
}

export interface AssessmentRecord {
  id: string;
  timestamp: number;
  input: FinancialInput;
  affordability: AffordabilityResult;
  healthScore: number;
  status: AffordabilityStatus;
}

export interface Thresholds {
  safeMax: number; // percent — below this is SAFE
  stretchMax: number; // percent — below this is STRETCH, above is HIGH RISK
}

export const DEFAULT_THRESHOLDS: Thresholds = {
  safeMax: 40,
  stretchMax: 60,
};
