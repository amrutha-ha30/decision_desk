import { useState } from 'react';
import { Calculator, ArrowRight, AlertCircle } from 'lucide-react';
import { useFinancial } from '@/context/FinancialContext';
import { Button, GlassCard, NumberInput, SectionHeader, SelectInput } from '@/components/ui';
import type { EmergencyCategory } from '@/lib/types';
import type { PageId } from '@/components/Navbar';

const categories: { label: string; value: EmergencyCategory }[] = [
  { label: 'Medical', value: 'Medical' },
  { label: 'Education', value: 'Education' },
  { label: 'Travel', value: 'Travel' },
  { label: 'Home Repair', value: 'Home Repair' },
  { label: 'Other', value: 'Other' },
];

export function AssessmentPage({
  onNavigate,
}: {
  onNavigate: (page: PageId) => void;
}) {
  const { input, setInput } = useFinancial();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (input.monthlyIncome <= 0) e.monthlyIncome = 'Enter a valid monthly income';
    if (input.emergencyAmount < 0) e.emergencyAmount = 'Cannot be negative';
    if (input.existingEMI < 0) e.existingEMI = 'Cannot be negative';
    if (input.bnplPayments < 0) e.bnplPayments = 'Cannot be negative';
    if (input.creditCardPayments < 0) e.creditCardPayments = 'Cannot be negative';
    if (input.availableSavings < 0) e.availableSavings = 'Cannot be negative';
    if (input.repaymentDuration <= 0) e.repaymentDuration = 'Must be at least 1 month';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      setShowResult(true);
      onNavigate('dashboard');
    }
  };

  const totalObligations =
    input.existingEMI + input.bnplPayments + input.creditCardPayments;
  const remaining = input.monthlyIncome - totalObligations;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <SectionHeader
        icon={<Calculator className="h-5 w-5" />}
        title="Financial Assessment"
        subtitle="Enter your financial details to get a complete picture of your borrowing situation."
      />

      <GlassCard className="p-6 sm:p-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <NumberInput
            label="Monthly Income"
            value={input.monthlyIncome}
            onChange={(v) => setInput({ monthlyIncome: v })}
            prefix="₹"
            min={0}
            step={1000}
            error={errors.monthlyIncome}
          />
          <NumberInput
            label="Emergency Amount Required"
            value={input.emergencyAmount}
            onChange={(v) => setInput({ emergencyAmount: v })}
            prefix="₹"
            min={0}
            step={1000}
            error={errors.emergencyAmount}
          />
          <NumberInput
            label="Existing EMI Payments"
            value={input.existingEMI}
            onChange={(v) => setInput({ existingEMI: v })}
            prefix="₹"
            min={0}
            step={500}
            error={errors.existingEMI}
          />
          <NumberInput
            label="BNPL Payments"
            value={input.bnplPayments}
            onChange={(v) => setInput({ bnplPayments: v })}
            prefix="₹"
            min={0}
            step={500}
            error={errors.bnplPayments}
          />
          <NumberInput
            label="Credit Card Payments"
            value={input.creditCardPayments}
            onChange={(v) => setInput({ creditCardPayments: v })}
            prefix="₹"
            min={0}
            step={500}
            error={errors.creditCardPayments}
          />
          <NumberInput
            label="Available Savings"
            value={input.availableSavings}
            onChange={(v) => setInput({ availableSavings: v })}
            prefix="₹"
            min={0}
            step={1000}
            error={errors.availableSavings}
          />
          <SelectInput
            label="Emergency Category"
            value={input.emergencyCategory}
            onChange={(v) => setInput({ emergencyCategory: v as EmergencyCategory })}
            options={categories}
          />
          <NumberInput
            label="Preferred Repayment Duration"
            value={input.repaymentDuration}
            onChange={(v) => setInput({ repaymentDuration: v })}
            suffix="months"
            min={1}
            max={120}
            step={1}
            error={errors.repaymentDuration}
          />
        </div>

        {Object.keys(errors).length > 0 && (
          <div className="mt-5 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            Please fix the highlighted fields before continuing.
          </div>
        )}

        {/* Live summary */}
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-white/[0.03] p-4">
            <p className="text-xs text-slate-500">Total Monthly Obligations</p>
            <p className="mt-1 text-xl font-bold text-amber-400">
              ₹{totalObligations.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="rounded-xl bg-white/[0.03] p-4">
            <p className="text-xs text-slate-500">Remaining Income</p>
            <p className={remaining >= 0 ? 'mt-1 text-xl font-bold text-emerald-400' : 'mt-1 text-xl font-bold text-red-400'}>
              ₹{remaining.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="rounded-xl bg-white/[0.03] p-4">
            <p className="text-xs text-slate-500">Obligation Ratio</p>
            <p className="mt-1 text-xl font-bold text-cyan-400">
              {input.monthlyIncome > 0
                ? ((totalObligations / input.monthlyIncome) * 100).toFixed(1)
                : '0'}
              %
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button size="lg" onClick={handleSubmit}>
            See My Decision
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button size="lg" variant="ghost" onClick={() => onNavigate('simulator')}>
            Skip to What-If Simulator
          </Button>
        </div>
      </GlassCard>

      {showResult && (
        <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-center text-sm text-emerald-400">
          Assessment saved. View your dashboard to see the full breakdown.
        </div>
      )}

      <p className="mt-6 text-center text-xs text-slate-600">
        All data is stored locally in your browser. Nothing is sent to any server.
      </p>
    </div>
  );
}
